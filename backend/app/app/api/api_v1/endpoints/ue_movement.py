import threading, logging, time, requests
from fastapi import APIRouter, Path, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from typing import Any
from app import crud, tools, models
from app.crud import crud_mongo
from app.tools.distance import check_distance
from app.tools import qos_callback
from app.db.session import SessionLocal, client
from app.api import deps
from app.schemas import Msg
from app.tools import monitoring_callbacks, timer
from sqlalchemy.orm import Session

#Dictionary holding threads that are running per user id.
threads = {}

#Dictionary holding UEs' information
ues = {}

class BackgroundTasks(threading.Thread):

    def __init__(self, group=None, target=None, name=None, args=(), kwargs=None): 
        super().__init__(group=group, target=target,  name=name)
        self._args = args
        self._kwargs = kwargs
        self._stop_threads = False
        self._db = SessionLocal()
        return

    def run(self):
        
        db_mongo = client.fastapi

        current_user = self._args[0]
        supi = self._args[1]
        json_cells = self._args[2]
        points = self._args[3]
        is_superuser = self._args[4]

        active_subscriptions = {
            "location_reporting" : False,
            "ue_reachability" : False,
            "loss_of_connectivity" : False,
            "as_session_with_qos" : False
        }

        try:
            
            t = timer.SequencialTimer(logger=logging.critical)
            rt = None
            # global loss_of_connectivity_ack
            loss_of_connectivity_ack = "FALSE"
            
            '''
            ===================================================================
                               2nd Approach for updating UEs position
            ===================================================================

            Summary: while(TRUE) --> keep increasing the moving index


                points [ 1 2 3 4 5 6 7 8 9 10 ... ] . . . . . . .
                         ^ current index
                         ^  moving index                ^ moving can also reach here
                 
            current: shows where the UE is
            moving : starts within the range of len(points) and keeps increasing.
                     When it goes out of these bounds, the MOD( len(points) ) prevents
                     the "index out of range" exception. It also starts the iteration
                     of points from the begining, letting the UE moving in endless loops.

            Sleep:   in both LOW / HIGH speed cases, the thread sleeps for 1 sec

            Speed:   LOW : (moving_position_index += 1)  no points are skipped, this means 1m/sec
                     HIGH: (moving_position_index += 10) skips 10 points, thus...        ~10m/sec

            Pros:    + the UE position is updated once every sec (not very aggressive)
                     + we can easily set speed this way (by skipping X points --> X m/sec)
            Cons:    - skipping points and updating once every second decreases the event resolution

            -------------------------------------------------------------------
            '''

            # current_position_index = -1

            # # find the index of the point where the UE is located
            # for index, point in enumerate(points):
            #     if (ues[f"{supi}"]["latitude"] == point["latitude"]) and (ues[f"{supi}"]["longitude"] == point["longitude"]):
            #         current_position_index = index

            # # start iterating from this index and keep increasing the moving_position_index...
            # moving_position_index = current_position_index

            while True:
                try:
                    # UE = crud.ue.update_coordinates(db=db, lat=points[current_position_index]["latitude"], long=points[current_position_index]["longitude"], db_obj=UE)
                    # cell_now = check_distance(UE.latitude, UE.longitude, json_cells) #calculate the distance from all the cells
                    # ues[f"{supi}"]["latitude"] = points[current_position_index]["latitude"]
                    # ues[f"{supi}"]["longitude"] = points[current_position_index]["longitude"]
                    UE = crud.ue.get_supi(db=self._db, supi=supi)
                    ues[f"{supi}"]["latitude"] = UE.latitude
                    ues[f"{supi}"]["longitude"] = UE.longitude
                    cell_now = check_distance(ues[f"{supi}"]["latitude"], ues[f"{supi}"]["longitude"], json_cells) #calculate the distance from all the cells
                except Exception as ex:
                    logging.warning("Failed to update coordinates")
                    logging.warning(ex)
                
                
                #MonitoringEvent API - Loss of connectivity
                if not active_subscriptions.get("loss_of_connectivity"):
                    loss_of_connectivity_sub = crud_mongo.read_by_multiple_pairs(db_mongo, "MonitoringEvent", externalId = ues[f"{supi}"]["external_identifier"], monitoringType = "LOSS_OF_CONNECTIVITY")
                    if loss_of_connectivity_sub:
                        active_subscriptions.update({"loss_of_connectivity" : True})
                    

                #Validation of subscription
                if active_subscriptions.get("loss_of_connectivity") and loss_of_connectivity_ack == "FALSE":
                    sub_is_valid = monitoring_event_sub_validation(loss_of_connectivity_sub, is_superuser, current_user.id, loss_of_connectivity_sub.get("owner_id"))    
                    if sub_is_valid:
                        try:
                            try:
                                elapsed_time = t.status()
                                if elapsed_time > loss_of_connectivity_sub.get("maximumDetectionTime"):
                                    response = monitoring_callbacks.loss_of_connectivity_callback(ues[f"{supi}"], loss_of_connectivity_sub.get("notificationDestination"), loss_of_connectivity_sub.get("link"))
                                    
                                    logging.critical(response.json())
                                    #This ack is used to send one time the loss of connectivity callback
                                    loss_of_connectivity_ack = response.json().get("ack")
                                    
                                    loss_of_connectivity_sub.update({"maximumNumberOfReports" : loss_of_connectivity_sub.get("maximumNumberOfReports") - 1})
                                    crud_mongo.update(db_mongo, "MonitoringEvent", loss_of_connectivity_sub.get("_id"), loss_of_connectivity_sub)
                            except timer.TimerError as ex:
                                # logging.critical(ex)
                                pass
                        except requests.exceptions.ConnectionError as ex:
                            logging.warning("Failed to send the callback request")
                            logging.warning(ex)
                            crud_mongo.delete_by_uuid(db_mongo, "MonitoringEvent", loss_of_connectivity_sub.get("_id"))
                            active_subscriptions.update({"loss_of_connectivity" : False})
                            continue
                    else:
                        crud_mongo.delete_by_uuid(db_mongo, "MonitoringEvent", loss_of_connectivity_sub.get("_id"))
                        active_subscriptions.update({"loss_of_connectivity" : False})
                        logging.warning("Subscription has expired")
                #MonitoringEvent API - Loss of connectivity

                #As Session With QoS API - search for active subscription in db
                if not active_subscriptions.get("as_session_with_qos"):
                    qos_sub = crud_mongo.read(db_mongo, 'QoSMonitoring', 'ipv4Addr', ues[f"{supi}"]["ip_address_v4"])
                    if qos_sub:
                        active_subscriptions.update({"as_session_with_qos" : True})
                        reporting_freq = qos_sub["qosMonInfo"]["repFreqs"]
                        
                        if "PERIODIC" in reporting_freq:
                            reporting_period = qos_sub["qosMonInfo"]["repPeriod"]
                            rt = timer.RepeatedTimer(reporting_period, qos_callback.qos_notification_control, qos_sub, ues[f"{supi}"]["ip_address_v4"], ues.copy(),  ues[f"{supi}"])
                            # qos_callback.qos_notification_control(qos_sub, ues[f"{supi}"]["ip_address_v4"], ues.copy(),  ues[f"{supi}"])


                #If the document exists then validate the owner
                if not is_superuser and (qos_sub['owner_id'] != current_user.id):
                    logging.warning("Not enough permissions")
                    active_subscriptions.update({"as_session_with_qos" : False})
                #As Session With QoS API - search for active subscription in db

                if cell_now != None:
                    try:
                        t.stop()
                        loss_of_connectivity_ack = "FALSE"
                        if rt is not None:
                            rt.start()
                    except timer.TimerError as ex:
                        # logging.critical(ex)
                        pass

                    # if UE.Cell_id != cell_now.get('id'): #Cell has changed in the db "handover"
                    if ues[f"{supi}"]["Cell_id"] != cell_now.get('id'): #Cell has changed in the db "handover"
                        
                        #Monitoring Event API - UE reachability 
                        #check if the ue was disconnected before
                        if ues[f"{supi}"]["Cell_id"] == None:
                            
                            if not active_subscriptions.get("ue_reachability"):
                                ue_reachability_sub = crud_mongo.read_by_multiple_pairs(db_mongo, "MonitoringEvent", externalId = ues[f"{supi}"]["external_identifier"], monitoringType = "UE_REACHABILITY")
                                if ue_reachability_sub:
                                    active_subscriptions.update({"ue_reachability" : True})

                            #Validation of subscription    
                             
                            if active_subscriptions.get("ue_reachability"):
                                sub_is_valid = monitoring_event_sub_validation(ue_reachability_sub, is_superuser, current_user.id, ue_reachability_sub.get("owner_id"))   
                                if sub_is_valid:
                                    try:
                                        try:
                                            monitoring_callbacks.ue_reachability_callback(ues[f"{supi}"], ue_reachability_sub.get("notificationDestination"), ue_reachability_sub.get("link"), ue_reachability_sub.get("reachabilityType"))
                                            ue_reachability_sub.update({"maximumNumberOfReports" : ue_reachability_sub.get("maximumNumberOfReports") - 1})
                                            crud_mongo.update(db_mongo, "MonitoringEvent", ue_reachability_sub.get("_id"), ue_reachability_sub)
                                        except timer.TimerError as ex:
                                            # logging.critical(ex)
                                            pass
                                    except requests.exceptions.ConnectionError as ex:
                                        logging.warning("Failed to send the callback request")
                                        logging.warning(ex)
                                        crud_mongo.delete_by_uuid(db_mongo, "MonitoringEvent", ue_reachability_sub.get("_id"))
                                        active_subscriptions.update({"ue_reachability" : False})
                                        continue
                                else:
                                    crud_mongo.delete_by_uuid(db_mongo, "MonitoringEvent", ue_reachability_sub.get("_id"))
                                    active_subscriptions.update({"ue_reachability" : False})
                                    logging.warning("Subscription has expired")
                         #Monitoring Event API - UE reachability
                        
                        
                        # logging.warning(f"UE({UE.supi}) with ipv4 {UE.ip_address_v4} handovers to Cell {cell_now.get('id')}, {cell_now.get('description')}")
                        ues[f"{supi}"]["Cell_id"] = cell_now.get('id')
                        ues[f"{supi}"]["cell_id_hex"] = cell_now.get('cell_id')
                        ues[f"{supi}"]["gnb_id_hex"] = cell_now.get('cell_id')[:6]

                        
                        #Monitoring Event API - Location Reporting
                        #Retrieve the subscription of the UE by external Id | This could be outside while true but then the user cannot subscribe when the loop runs
                        if not active_subscriptions.get("location_reporting"):
                            location_reporting_sub = crud_mongo.read_by_multiple_pairs(db_mongo, "MonitoringEvent", externalId = ues[f"{supi}"]["external_identifier"], monitoringType = "LOCATION_REPORTING")
                            if location_reporting_sub:
                                active_subscriptions.update({"location_reporting" : True})

                        #Validation of subscription    
                        if active_subscriptions.get("location_reporting"): 
                            sub_is_valid = monitoring_event_sub_validation(location_reporting_sub, is_superuser, current_user.id, location_reporting_sub.get("owner_id"))    
                            if sub_is_valid:
                                try:
                                    try:
                                        monitoring_callbacks.location_callback(ues[f"{supi}"], location_reporting_sub.get("notificationDestination"), location_reporting_sub.get("link"))
                                        location_reporting_sub.update({"maximumNumberOfReports" : location_reporting_sub.get("maximumNumberOfReports") - 1})
                                        crud_mongo.update(db_mongo, "MonitoringEvent", location_reporting_sub.get("_id"), location_reporting_sub)
                                    except timer.TimerError as ex:
                                        # logging.critical(ex)
                                        pass
                                except requests.exceptions.ConnectionError as ex:
                                    logging.warning("Failed to send the callback request")
                                    logging.warning(ex)
                                    crud_mongo.delete_by_uuid(db_mongo, "MonitoringEvent", location_reporting_sub.get("_id"))
                                    active_subscriptions.update({"location_reporting" : False})
                                    continue
                            else:
                                crud_mongo.delete_by_uuid(db_mongo, "MonitoringEvent", location_reporting_sub.get("_id"))
                                active_subscriptions.update({"location_reporting" : False})
                                logging.warning("Subscription has expired")
                        #Monitoring Event API - Location Reporting
                        
                        #As Session With QoS API - if EVENT_TRIGGER then send callback on handover
                        if active_subscriptions.get("as_session_with_qos"):
                            reporting_freq = qos_sub["qosMonInfo"]["repFreqs"]
                            if "EVENT_TRIGGERED" in reporting_freq:
                                qos_callback.qos_notification_control(qos_sub, ues[f"{supi}"]["ip_address_v4"], ues.copy(),  ues[f"{supi}"])
                        #As Session With QoS API - if EVENT_TRIGGER then send callback on handover

                else:
                    # crud.ue.update(db=db, db_obj=UE, obj_in={"Cell_id" : None})
                    try:
                        t.start()
                        if rt is not None:
                            rt.stop()
                    except timer.TimerError as ex:
                        # logging.critical(ex)
                        pass

                    ues[f"{supi}"]["Cell_id"] = None
                    ues[f"{supi}"]["cell_id_hex"] = None
                    ues[f"{supi}"]["gnb_id_hex"] = None

                # logging.info(f'User: {current_user.id} | UE: {supi} | Current location: latitude ={UE.latitude} | longitude = {UE.longitude} | Speed: {UE.speed}' )
                
                # if ues[f"{supi}"]["speed"] == 'LOW':
                #     # don't skip any points, keep default speed 1m /sec
                #     moving_position_index += 1
                # elif ues[f"{supi}"]["speed"] == 'HIGH':
                #     # skip 10 points --> 10m / sec
                #     moving_position_index += 10

                time.sleep(5)

                # current_position_index = moving_position_index%(len(points))

                
                if self._stop_threads:
                    '''
                    It's important to close the database connection to avoid consuming too many resources and hitting the limit of simultaneous connections. 
                    If the thread is stopped and the database connection is not closed, the resources used by the database connection will not be released until the connection is closed. 
                    If the thread is started again and a new database connection is created without closing the previous one, the number of connections will increase, which can cause performance issues or even crashes.
                    '''
                    logging.critical("Terminating thread...")
                    logging.critical("Updating UE with the latest coordinates and cell in the database (last known position)...")
                    crud.ue.update_coordinates(db=self._db, lat=ues[f"{supi}"]["latitude"], long=ues[f"{supi}"]["longitude"], db_obj=UE)
                    crud.ue.update(db=self._db, db_obj=UE, obj_in={"Cell_id" : ues[f"{supi}"]["Cell_id"]})
                    ues.pop(f"{supi}")
                    self._db.close()
                    if rt is not None:
                        rt.stop()
                    break
            
            # End of 2nd Approach for updating UEs position



            '''
            ===================================================================
                             1st Approach for updating UEs position
            ===================================================================

            Summary: while(TRUE) --> keep iterating the points list again and again


                points [ 1 2 3 4 5 6 7 8 9 10 ... ] . . . . . . .
                               ^ point
                           ^ flag
                 
            flag:    it is used once to find the current UE position and then is
                     set to False
            
            Sleep/   
            Speed:   LOW : sleeps   1 sec and goes to the next point  (1m/sec)
                     HIGH: sleeps 0.1 sec and goes to the next point (10m/sec)

            Pros:    + the UEs goes over every point and never skips any
            Cons:    - updating the UE position every 0.1 sec is a more aggressive approach

            -------------------------------------------------------------------
            '''

            # flag = True
            
            # while True:
            #     for point in points:

            #         #Iteration to find the last known coordinates of the UE
            #         #Then the movements begins from the last known position (geo coordinates)
            #         if ((UE.latitude != point["latitude"]) or (UE.longitude != point["longitude"])) and flag == True:
            #             continue
            #         elif (UE.latitude == point["latitude"]) and (UE.longitude == point["longitude"]) and flag == True:
            #             flag = False
            #             continue
                    

            #         #-----------------------Code goes here-------------------------#
                    
            #         if UE.speed == 'LOW':
            #             time.sleep(1)
            #         elif UE.speed == 'HIGH':
            #             time.sleep(0.1)
        
            #         if self._stop_threads:
            #             print("Stop moving...")
            #             break       

            #     if self._stop_threads:
            #             print("Terminating thread...")
            #             break       

        except Exception as ex:
            logging.critical(ex)

    def stop(self):
        self._stop_threads = True

#API
router = APIRouter()

@router.post("/start-loop", status_code=200)
def initiate_movement(
    *,
    msg: Msg,
    current_user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Start the loop.
    """
    if msg.supi in threads:
        raise HTTPException(status_code=409, detail=f"There is a thread already running for this supi:{msg.supi}")
    
    #Check if UE 
    UE = crud.ue.get_supi(db=db, supi=msg.supi)
    if not UE:
        logging.warning("UE not found")
        threads.pop(f"{msg.supi}")
        return
    if (UE.owner_id != current_user.id):
        logging.warning("Not enough permissions")
        threads.pop(f"{msg.supi}")
        return
    
    #Insert running UE in the dictionary

    global ues
    ues[f"{msg.supi}"] = jsonable_encoder(UE)
    ues[f"{msg.supi}"].pop("id")

    if UE.Cell_id != None:
        ues[f"{msg.supi}"]["cell_id_hex"] = UE.Cell.cell_id
        ues[f"{msg.supi}"]["gnb_id_hex"] = UE.Cell.gNB.gNB_id
    else:
        ues[f"{msg.supi}"]["cell_id_hex"] = None
        ues[f"{msg.supi}"]["gnb_id_hex"] = None


    #Retrieve paths & points
    path = crud.path.get(db=db, id=UE.path_id)
    if not path:
        logging.warning("Path not found")
        threads.pop(f"{msg.supi}")
        return
    if (path.owner_id != current_user.id):
        logging.warning("Not enough permissions")
        threads.pop(f"{msg.supi}")
        return

    points = crud.points.get_points(db=db, path_id=UE.path_id)
    points = jsonable_encoder(points)

    #Retrieve all the cells
    Cells = crud.cell.get_multi_by_owner(db=db, owner_id=current_user.id, skip=0, limit=100)
    json_cells = jsonable_encoder(Cells)

    is_superuser = crud.user.is_superuser(current_user)

    t = BackgroundTasks(args= (current_user, msg.supi, json_cells, points, is_superuser))
    threads[f"{msg.supi}"] = {}
    threads[f"{msg.supi}"][f"{current_user.id}"] = t
    t.start()
    # print(threads)
    return {"msg": "Loop started"}

@router.post("/stop-loop", status_code=200)
def terminate_movement(
     *,
    msg: Msg,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Stop the loop.
    """
    try:
        threads[f"{msg.supi}"][f"{current_user.id}"].stop() 
        threads[f"{msg.supi}"][f"{current_user.id}"].join()
        threads.pop(f"{msg.supi}")
        return {"msg": "Loop ended"}
    except KeyError as ke:
        print('Key Not Found in Threads Dictionary:', ke)
        raise HTTPException(status_code=409, detail="There is no thread running for this user! Please initiate a new thread")

@router.get("/state-loop/{supi}", status_code=200)
def state_movement(
    *,
    supi: str = Path(...),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get the state
    """
    return {"running": retrieve_ue_state(supi, current_user.id)}

@router.get("/state-ues", status_code=200)
def state_ues(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get the state
    """
    return ues

#Functions
def retrieve_ue_state(supi: str, user_id: int) -> bool: 
    try:
        return threads[f"{supi}"][f"{user_id}"].is_alive()
    except KeyError as ke:
        print('Key Not Found in Threads Dictionary:', ke)
        return False

def retrieve_ues() -> dict:
    return ues

def retrieve_ue(supi: str) -> dict:
    return ues.get(supi)


def monitoring_event_sub_validation(sub: dict, is_superuser: bool, current_user_id: int, owner_id) -> bool:
    
    if not is_superuser and (owner_id != current_user_id):
        # logging.warning("Not enough permissions")
        return False
    else:
        sub_validate_time = tools.check_expiration_time(expire_time=sub.get("monitorExpireTime"))
        sub_validate_number_of_reports = tools.check_numberOfReports(sub.get("maximumNumberOfReports"))
        if sub_validate_time and sub_validate_number_of_reports:
            return True
        else:
            return False