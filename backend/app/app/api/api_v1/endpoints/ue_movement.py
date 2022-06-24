import threading, logging, time, requests
from fastapi import APIRouter, Path, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from pymongo import MongoClient
from typing import Any
from app import crud, tools, models
from app.crud import crud_mongo
from app.tools.distance import check_distance
from app.tools import qos_callback
from app.db.session import SessionLocal
from app.api import deps
from app.schemas import Msg
from app.tools import monitoring_callbacks, timer

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
        return

    def run(self):
        
        current_user = self._args[0]
        supi = self._args[1]

        try:
            db = SessionLocal()
            client = MongoClient("mongodb://mongo:27017", username='root', password='pass')
            db_mongo = client.fastapi

            #Initiate UE - if exists
            UE = crud.ue.get_supi(db=db, supi=supi)
            if not UE:
                logging.warning("UE not found")
                threads.pop(f"{supi}")
                return
            if (UE.owner_id != current_user.id):
                logging.warning("Not enough permissions")
                threads.pop(f"{supi}")
                return
            
            #Insert running UE in the dictionary

            global ues
            ues[f"{supi}"] = jsonable_encoder(UE)
            ues[f"{supi}"].pop("id")

            if UE.Cell_id != None:
                ues[f"{supi}"]["cell_id_hex"] = UE.Cell.cell_id
                ues[f"{supi}"]["gnb_id_hex"] = UE.Cell.gNB.gNB_id
            else:
                ues[f"{supi}"]["cell_id_hex"] = None
                ues[f"{supi}"]["gnb_id_hex"] = None


            #Retrieve paths & points
            path = crud.path.get(db=db, id=UE.path_id)
            if not path:
                logging.warning("Path not found")
                threads.pop(f"{supi}")
                return
            if (path.owner_id != current_user.id):
                logging.warning("Not enough permissions")
                threads.pop(f"{supi}")
                return

            points = crud.points.get_points(db=db, path_id=UE.path_id)
            points = jsonable_encoder(points)

            #Retrieve all the cells
            Cells = crud.cell.get_multi_by_owner(db=db, owner_id=current_user.id, skip=0, limit=100)
            json_cells = jsonable_encoder(Cells)

            is_superuser = crud.user.is_superuser(current_user)

            t = timer.Timer()
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

            current_position_index = -1

            # find the index of the point where the UE is located
            for index, point in enumerate(points):
                if (UE.latitude == point["latitude"]) and (UE.longitude == point["longitude"]):
                    current_position_index = index

            # start iterating from this index and keep increasing the moving_position_index...
            moving_position_index = current_position_index

            while True:
                try:
                    # UE = crud.ue.update_coordinates(db=db, lat=points[current_position_index]["latitude"], long=points[current_position_index]["longitude"], db_obj=UE)
                    # cell_now = check_distance(UE.latitude, UE.longitude, json_cells) #calculate the distance from all the cells
                    ues[f"{supi}"]["latitude"] = points[current_position_index]["latitude"]
                    ues[f"{supi}"]["longitude"] = points[current_position_index]["longitude"]
                    cell_now = check_distance(ues[f"{supi}"]["latitude"], ues[f"{supi}"]["longitude"], json_cells) #calculate the distance from all the cells
                except Exception as ex:
                    logging.warning("Failed to update coordinates")
                    logging.warning(ex)
                
                if cell_now != None:
                    try:
                        t.stop()
                    except timer.TimerError as ex:
                        # logging.critical(ex)
                        pass

                    # if UE.Cell_id != cell_now.get('id'): #Cell has changed in the db "handover"
                    if ues[f"{supi}"]["Cell_id"] != cell_now.get('id'): #Cell has changed in the db "handover"
                        # logging.warning(f"UE({UE.supi}) with ipv4 {UE.ip_address_v4} handovers to Cell {cell_now.get('id')}, {cell_now.get('description')}")
                        # crud.ue.update(db=db, db_obj=UE, obj_in={"Cell_id" : cell_now.get('id')})
                        ues[f"{supi}"]["Cell_id"] = cell_now.get('id')
                        ues[f"{supi}"]["cell_id_hex"] = cell_now.get('cell_id')
                        gnb = crud.gnb.get(db=db, id=cell_now.get("gNB_id"))
                        ues[f"{supi}"]["gnb_id_hex"] = gnb.gNB_id

                        #Retrieve the subscription of the UE by external Id | This could be outside while true but then the user cannot subscribe when the loop runs
                        # sub = crud.monitoring.get_sub_externalId(db=db, externalId=UE.external_identifier, owner_id=current_user.id)
                        sub = crud_mongo.read(db_mongo, "MonitoringEvent", "externalId", UE.external_identifier)
                        
                        #Validation of subscription
                        if not sub:
                            # logging.warning("Monitoring Event subscription not found")
                            pass
                        elif not is_superuser and (sub.get("owner_id") != current_user.id):
                            # logging.warning("Not enough permissions")
                            pass
                        else:
                            sub_validate_time = tools.check_expiration_time(expire_time=sub.get("monitorExpireTime"))
                            if sub_validate_time:
                                sub = tools.check_numberOfReports(db_mongo, sub)
                                if sub: #return the callback request only if subscription is valid
                                    try:
                                        response = monitoring_callbacks.location_callback(ues[f"{supi}"], sub.get("notificationDestination"), sub.get("link"))
                                        # logging.info(response.json())
                                    except requests.exceptions.ConnectionError as ex:
                                        logging.warning("Failed to send the callback request")
                                        logging.warning(ex)
                                        crud_mongo.delete_by_uuid(db_mongo, "MonitoringEvent", sub.get("_id"))
                                        continue   
                            else:
                                crud_mongo.delete_by_uuid(db_mongo, "MonitoringEvent", sub.get("_id"))
                                logging.warning("Subscription has expired (expiration date)")

                        #QoS Monitoring Event (handover)
                        # ues_connected = crud.ue.get_by_Cell(db=db, cell_id=UE.Cell_id)
                        ues_connected = 0
                        # temp_ues = ues.copy()
                        # for ue in temp_ues:
                        #     # print(ue)
                        #     if ues[ue]["Cell_id"] == ues[f"{supi}"]["Cell_id"]:
                        #         ues_connected += 1

                        #subtract 1 for the UE that is currently running. We are looking for other ues that are currently connected in the same cell
                        ues_connected -= 1

                        if ues_connected > 1:
                            gbr = 'QOS_NOT_GUARANTEED'
                        else:
                            gbr = 'QOS_GUARANTEED'

                        # logging.warning(gbr)
                        # qos_notification_control(gbr ,current_user, UE.ip_address_v4)
                        qos_callback.qos_notification_control(current_user, ues[f"{supi}"]["ip_address_v4"], ues.copy(),  ues[f"{supi}"])
                    
                else:
                    # crud.ue.update(db=db, db_obj=UE, obj_in={"Cell_id" : None})
                    try:
                        t.start()
                    except timer.TimerError as ex:
                        # logging.critical(ex)
                        pass
                    
                    ues[f"{supi}"]["Cell_id"] = None
                    ues[f"{supi}"]["cell_id_hex"] = None
                    ues[f"{supi}"]["gnb_id_hex"] = None

                # logging.info(f'User: {current_user.id} | UE: {supi} | Current location: latitude ={UE.latitude} | longitude = {UE.longitude} | Speed: {UE.speed}' )
                
                if UE.speed == 'LOW':
                    # don't skip any points, keep default speed 1m /sec
                    moving_position_index += 1
                elif UE.speed == 'HIGH':
                    # skip 10 points --> 10m / sec
                    moving_position_index += 10

                time.sleep(1)

                current_position_index = moving_position_index%(len(points))

                
                if self._stop_threads:
                    logging.critical("Terminating thread...")
                    crud.ue.update_coordinates(db=db, lat=ues[f"{supi}"]["latitude"], long=ues[f"{supi}"]["longitude"], db_obj=UE)
                    crud.ue.update(db=db, db_obj=UE, obj_in={"Cell_id" : ues[f"{supi}"]["Cell_id"]})
                    ues.pop(f"{supi}")
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
                    

            #         try:
            #             UE = crud.ue.update_coordinates(db=db, lat=point["latitude"], long=point["longitude"], db_obj=UE)
            #             cell_now = check_distance(UE.latitude, UE.longitude, json_cells) #calculate the distance from all the cells
            #         except Exception as ex:
            #             logging.warning("Failed to update coordinates")
            #             logging.warning(ex)
                    
            #         if cell_now != None:
            #             if UE.Cell_id != cell_now.get('id'): #Cell has changed in the db "handover"
            #                 logging.warning(f"UE({UE.supi}) with ipv4 {UE.ip_address_v4} handovers to Cell {cell_now.get('id')}, {cell_now.get('description')}")
            #                 crud.ue.update(db=db, db_obj=UE, obj_in={"Cell_id" : cell_now.get('id')})
                            
            #                 #Retrieve the subscription of the UE by external Id | This could be outside while true but then the user cannot subscribe when the loop runs
            #                 # sub = crud.monitoring.get_sub_externalId(db=db, externalId=UE.external_identifier, owner_id=current_user.id)
            #                 sub = crud_mongo.read(db_mongo, "MonitoringEvent", "externalId", UE.external_identifier)
                            
            #                 #Validation of subscription
            #                 if not sub:
            #                     logging.warning("Monitoring Event subscription not found")
            #                 elif not crud.user.is_superuser(current_user) and (sub.get("owner_id") != current_user.id):
            #                     logging.warning("Not enough permissions")
            #                 else:
            #                     sub_validate_time = tools.check_expiration_time(expire_time=sub.get("monitorExpireTime"))
            #                     if sub_validate_time:
            #                         sub = tools.check_numberOfReports(db_mongo, sub)
            #                         if sub: #return the callback request only if subscription is valid
            #                             try:
            #                                 response = location_callback(UE, sub.get("notificationDestination"), sub.get("link"))
            #                                 logging.info(response.json())
            #                             except requests.exceptions.ConnectionError as ex:
            #                                 logging.warning("Failed to send the callback request")
            #                                 logging.warning(ex)
            #                                 crud_mongo.delete_by_uuid(db_mongo, "MonitoringEvent", sub.get("_id"))
            #                                 continue   
            #                     else:
            #                         crud_mongo.delete_by_uuid(db_mongo, "MonitoringEvent", sub.get("_id"))
            #                         logging.warning("Subscription has expired (expiration date)")

            #                 #QoS Monitoring Event (handover)
            #                 ues_connected = crud.ue.get_by_Cell(db=db, cell_id=UE.Cell_id)
            #                 if len(ues_connected) > 1:
            #                     gbr = 'QOS_NOT_GUARANTEED'
            #                 else:
            #                     gbr = 'QOS_GUARANTEED'

            #                 logging.warning(gbr)
            #                 qos_notification_control(gbr ,current_user, UE.ip_address_v4)
            #                 logging.critical("Bypassed qos notification control")
            #         else:
            #                 crud.ue.update(db=db, db_obj=UE, obj_in={"Cell_id" : None})

            #         # logging.info(f'User: {current_user.id} | UE: {supi} | Current location: latitude ={UE.latitude} | longitude = {UE.longitude} | Speed: {UE.speed}' )
                    
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
        finally:
            db.close()
            return

    def stop(self):
        self._stop_threads = True

#API
router = APIRouter()

@router.post("/start-loop", status_code=200)
def initiate_movement(
    *,
    msg: Msg,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Start the loop.
    """
    if msg.supi in threads:
        raise HTTPException(status_code=409, detail=f"There is a thread already running for this supi:{msg.supi}")
    t = BackgroundTasks(args= (current_user, msg.supi, ))
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


