from datetime import datetime
import threading, logging, time, requests, json
from pymongo import MongoClient
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import HTTPException
from sqlalchemy.orm.session import Session
from app.db.session import SessionLocal
from app import models, schemas, crud
from app.api import deps
from app.schemas import monitoringevent, UserPlaneNotificationData
from app.tools.distance import check_distance
from app.tools.send_callback import location_callback, qos_callback
from app import tools
from app.crud import crud_mongo
from .qosInformation import qos_reference_match
from pydantic import BaseModel
from app.api.api_v1.endpoints.paths import get_random_point

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
            
            global ues
            ues[f"{supi}"] = jsonable_encoder(UE)
            ues[f"{supi}"].pop("id")

            if UE.Cell_id != None:
                ues[f"{supi}"]["cell_id_hex"] = UE.Cell.cell_id
            else:
                ues[f"{supi}"]["cell_id_hex"] = None


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
                    # if UE.Cell_id != cell_now.get('id'): #Cell has changed in the db "handover"
                    if ues[f"{supi}"]["Cell_id"] != cell_now.get('id'): #Cell has changed in the db "handover"
                        logging.warning(f"UE({UE.supi}) with ipv4 {UE.ip_address_v4} handovers to Cell {cell_now.get('id')}, {cell_now.get('description')}")
                        # crud.ue.update(db=db, db_obj=UE, obj_in={"Cell_id" : cell_now.get('id')})
                        ues[f"{supi}"]["Cell_id"] = cell_now.get('id')
                        ues[f"{supi}"]["cell_id_hex"] = cell_now.get('cell_id')
                        # ues[f"{supi}"]["gNB_id_hex"] = Cells .gNB.gNB_id

                        #Retrieve the subscription of the UE by external Id | This could be outside while true but then the user cannot subscribe when the loop runs
                        # sub = crud.monitoring.get_sub_externalId(db=db, externalId=UE.external_identifier, owner_id=current_user.id)
                        sub = crud_mongo.read(db_mongo, "MonitoringEvent", "externalId", UE.external_identifier)
                        
                        #Validation of subscription
                        if not sub:
                            logging.warning("Monitoring Event subscription not found")
                        elif not crud.user.is_superuser(current_user) and (sub.get("owner_id") != current_user.id):
                            logging.warning("Not enough permissions")
                        else:
                            sub_validate_time = tools.check_expiration_time(expire_time=sub.get("monitorExpireTime"))
                            if sub_validate_time:
                                sub = tools.check_numberOfReports(db_mongo, sub)
                                if sub: #return the callback request only if subscription is valid
                                    try:
                                        response = location_callback(ues[f"{supi}"], sub.get("notificationDestination"), sub.get("link"))
                                        logging.info(response.json())
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
                        temp_ues = ues.copy()
                        for ue in temp_ues:
                            print(ue)
                            if ues[ue]["Cell_id"] == ues[f"{supi}"]["Cell_id"]:
                                ues_connected += 1

                        #subtract 1 for the UE that is currently running. We are looking for other ues that are currently connected in the same cell
                        ues_connected -= 1

                        if ues_connected > 1:
                            gbr = 'QOS_NOT_GUARANTEED'
                        else:
                            gbr = 'QOS_GUARANTEED'

                        logging.warning(gbr)
                        # qos_notification_control(gbr ,current_user, UE.ip_address_v4)
                        qos_notification_control(gbr ,current_user, ues[f"{supi}"]["ip_address_v4"])
                        logging.critical("Bypassed qos notification control")
                else:
                    # crud.ue.update(db=db, db_obj=UE, obj_in={"Cell_id" : None})
                    ues[f"{supi}"]["Cell_id"] = None
                    ues[f"{supi}"]["cell_id_hex"] = None

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


event_notifications = []
counter = 0

def add_notifications(request: Request, response: JSONResponse, is_notification: bool):

    global counter

    json_data = {}
    json_data.update({"id" : counter})

    #Find the service API 
    #Keep in mind that whether endpoint changes format, the following if statement needs review
    #Since new APIs are added in the emulator, the if statement will expand
    endpoint = request.url.path
    if endpoint.find('monitoring') != -1:
        serviceAPI = "Monitoring Event API"
    elif endpoint.find('session-with-qos') != -1:
        serviceAPI = "AsSession With QoS API"
    elif endpoint.find('qosInfo') != -1:
        serviceAPI = "QoS Information"

    #Request body check and trim
    if(request.method == 'POST') or (request.method == 'PUT'):  
        req_body = request._body.decode("utf-8").replace('\n', '')
        req_body = req_body.replace(' ', '')
        json_data["request_body"] = req_body

    json_data["response_body"] = response.body.decode("utf-8")  
    json_data["endpoint"] = endpoint
    json_data["serviceAPI"] = serviceAPI
    json_data["method"] = request.method    
    json_data["status_code"] = response.status_code
    json_data["isNotification"] = is_notification
    json_data["timestamp"] = datetime.now()

    #Check that event_notifications length does not exceed 100
    event_notifications.append(json_data)
    if len(event_notifications) > 100:
        event_notifications.pop(0)

    counter += 1

    return json_data


def qos_notification_control(gbr_status: str, current_user, ipv4):
    client = MongoClient("mongodb://mongo:27017", username='root', password='pass')
    db = client.fastapi

    doc = crud_mongo.read(db, 'QoSMonitoring', 'ipv4Addr', ipv4)

    #Check if the document exists
    if not doc:
        logging.warning("AsSessionWithQoS subscription not found")
        return
    #If the document exists then validate the owner
    if not crud.user.is_superuser(current_user) and (doc['owner_id'] != current_user.id):
        logging.info("Not enough permissions")
        return
    
    qos_standardized = qos_reference_match(doc.get('qosReference'))

    logging.critical(qos_standardized)
    logging.critical(qos_standardized.get('type'))

    logging.critical(doc.get('notificationDestination'))
    logging.critical(doc.get('link'))

    if qos_standardized.get('type') == 'GBR' or qos_standardized.get('type') == 'DC-GBR':
        try:
            logging.critical("Before response")
            response = qos_callback(doc.get('notificationDestination'), doc.get('link'), gbr_status, ipv4)
            logging.critical(f"Response from {doc.get('notificationDestination')}")
        except requests.exceptions.Timeout as ex:
            logging.critical("Failed to send the callback request")
            logging.critical(ex) 
        except requests.exceptions.TooManyRedirects as ex:
            logging.critical("Failed to send the callback request")
            logging.critical(ex) 
        except requests.exceptions.RequestException as ex:
            logging.critical("Failed to send the callback request")
            logging.critical(ex) 
    else:
        logging.critical('Non-GBR subscription')

    return

    
router = APIRouter()

@router.get("/export/scenario", response_model=schemas.scenario)
def get_scenario(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Export the scenario
    """
    gNBs = crud.gnb.get_multi_by_owner(db=db, owner_id=current_user.id, skip=0, limit=100)
    Cells = crud.cell.get_multi_by_owner(db=db, owner_id=current_user.id, skip=0, limit=100)
    UEs = crud.ue.get_multi_by_owner(db=db, owner_id=current_user.id, skip=0, limit=100)
    paths = crud.path.get_multi_by_owner(db=db, owner_id=current_user.id, skip=0, limit=100)

    
    json_gNBs= jsonable_encoder(gNBs)
    json_Cells= jsonable_encoder(Cells)
    json_UEs= jsonable_encoder(UEs)
    json_path = jsonable_encoder(paths)
    ue_path_association = []

    for item_json in json_path:
        for path in paths:
            if path.id == item_json.get('id'):
                item_json["start_point"] = {}
                item_json["end_point"] = {}
                item_json["start_point"]["latitude"] = path.start_lat
                item_json["start_point"]["longitude"] = path.start_long
                item_json["end_point"]["latitude"] = path.end_lat
                item_json["end_point"]["longitude"] = path.end_long
                item_json["id"] = path.id
                points = crud.points.get_points(db=db, path_id=path.id)
                item_json["points"] = []
                for obj in jsonable_encoder(points):
                    item_json["points"].append({'latitude' : obj.get('latitude'), 'longitude' : obj.get('longitude')})

    for ue in UEs:
        if ue.path_id:
            json_ue_path_association = {}
            json_ue_path_association["supi"] = ue.supi
            json_ue_path_association["path"] = ue.path_id
            ue_path_association.append(json_ue_path_association)
         
    logging.critical(ue_path_association)
    logging.critical(json_UEs)

    export_json = {
        "gNBs" : json_gNBs,
        "cells" : json_Cells,
        "UEs" : json_UEs,
        "paths" : json_path,
        "ue_path_association" : ue_path_association
    }

    return export_json

@router.post("/import/scenario")
def create_scenario(
    scenario_in: schemas.scenario,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user), 
) -> Any:
    """
    Export the scenario
    """
    err = {}
    
    gNBs = scenario_in.gNBs
    cells = scenario_in.cells
    ues = scenario_in.UEs
    paths = scenario_in.paths
    ue_path_association = scenario_in.ue_path_association

    db.execute('TRUNCATE TABLE cell, gnb, monitoring, path, points, ue RESTART IDENTITY')
    
    for gNB_in in gNBs:
        gNB = crud.gnb.get_gNB_id(db=db, id=gNB_in.gNB_id)
        if gNB:
            print(f"ERROR: gNB with id {gNB_in.gNB_id} already exists")
            err.update({f"{gNB_in.name}" : f"ERROR: gNB with id {gNB_in.gNB_id} already exists"})
        else:
            gNB = crud.gnb.create_with_owner(db=db, obj_in=gNB_in, owner_id=current_user.id)

    for cell_in in cells:
        cell = crud.cell.get_Cell_id(db=db, id=cell_in.cell_id)
        if cell:
            print(f"ERROR: Cell with id {cell_in.cell_id} already exists")
            err.update({f"{cell_in.name}" : f"ERROR: Cell with id {cell_in.cell_id} already exists"})
            crud.cell.remove_all_by_owner(db=db, owner_id=current_user.id)
        else:
            cell = crud.cell.create_with_owner(db=db, obj_in=cell_in, owner_id=current_user.id)

    for ue_in in ues:
        ue = crud.ue.get_supi(db=db, supi=ue_in.supi)
        if ue:
            print(f"ERROR: UE with supi {ue_in.supi} already exists")
            err.update({f"{ue.name}" : f"ERROR: UE with supi {ue_in.supi} already exists"})
        else:
            ue = crud.ue.create_with_owner(db=db, obj_in=ue_in, owner_id=current_user.id)

    for path_in in paths:
        path_old_id = path_in.id

        path = crud.path.get_description(db=db, description = path_in.description)
        if path:
            print(f"ERROR: Path with description \'{path_in.description}\' already exists")
            err.update({f"{path_in.description}" : f"ERROR: Path with description \'{path_in.description}\' already exists"})
        else:
            path = crud.path.create_with_owner(db=db, obj_in=path_in, owner_id=current_user.id)
            crud.points.create(db=db, obj_in=path_in, path_id=path.id) 
            
            for ue_path in ue_path_association:
                if retrieve_ue_state(ue_path.supi, current_user.id):
                    err.update(f"UE with SUPI {ue_path.supi} is currently moving. You are not allowed to edit UE's path while it's moving")
                else:
                    #Assign the coordinates
                    UE = crud.ue.get_supi(db=db, supi=ue_path.supi)
                    json_data = jsonable_encoder(UE)
                    
                    #Check if the old path id or the new one is associated with one or more UEs store in ue_path_association dictionary
                    #If not then add path_id 0 on UE's table 
                    print(f'Ue_path_association {ue_path.path}')
                    print(f'Path old id: {path_old_id}')
                    if ue_path.path == path_old_id:
                        print(f'New path id {path.id}')
                        json_data['path_id'] = path.id
                        random_point = get_random_point(db, path.id)
                        json_data['latitude'] = random_point.get('latitude')
                        json_data['longitude'] = random_point.get('longitude')
                    
                    crud.ue.update(db=db, db_obj=UE, obj_in=json_data)
                    
                    

    
    
    if bool(err) == True:
        raise HTTPException(status_code=409, detail=err)
    else:
        return ""

class callback(BaseModel):
    callbackurl: str

@router.post("/test/callback")
def get_test(
    item_in: callback
    ):
    
    callbackurl = item_in.callbackurl
    print(callbackurl)
    payload = json.dumps({
    "externalId" : "10000@domain.com",
    "ipv4Addr" : "10.0.0.0",
    "subscription" : "http://localhost:8888/api/v1/3gpp-monitoring-event/v1/myNetapp/subscriptions/whatever",
    "monitoringType": "LOCATION_REPORTING",
    "locationInfo": {
        "cellId": "AAAAAAAAA",
        "enodeBId": "AAAAAA"
    }
    })

    headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json'
    }

    try:
        response = requests.request("POST", callbackurl, headers=headers, data=payload)
        return response.json()
    except requests.exceptions.ConnectionError as ex:
        logging.warning(ex)
        raise HTTPException(status_code=409, detail=f"Failed to send the callback request. Error: {ex}")

@router.post("/session-with-qos/callback")
def create_item(item: UserPlaneNotificationData, request: Request):

    http_response = JSONResponse(content={'ack' : 'TRUE'}, status_code=200)
    add_notifications(request, http_response, True)
    return http_response 

@router.post("/monitoring/callback")
def create_item(item: monitoringevent.MonitoringNotification, request: Request):

    http_response = JSONResponse(content={'ack' : 'TRUE'}, status_code=200)
    add_notifications(request, http_response, True)
    return http_response 

@router.get("/monitoring/notifications")
def get_notifications(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user)
    ):
    notification = event_notifications[skip:limit]
    return notification

@router.get("/monitoring/last_notifications")
def get_last_notifications(
    id: int = Query(..., description="The id of the last retrieved item"),
    current_user: models.User = Depends(deps.get_current_active_user)
    ):
    updated_notification = []
    event_notifications_snapshot = event_notifications


    if id == -1:
        return event_notifications_snapshot

    if event_notifications_snapshot:
        if event_notifications_snapshot[0].get('id') > id:
            return event_notifications_snapshot
    else:
        raise HTTPException(status_code=409, detail="Event notification list is empty")
            
    skipped_items = 0


    for notification in event_notifications_snapshot:
        if notification.get('id') == id:
            updated_notification = event_notifications_snapshot[(skipped_items+1):]
            break
        skipped_items += 1
    
    return updated_notification

@router.post("/start-loop", status_code=200)
def initiate_movement(
    *,
    msg: schemas.Msg,
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
    print(threads)
    return {"msg": "Loop started"}

@router.post("/stop-loop", status_code=200)
def terminate_movement(
     *,
    msg: schemas.Msg,
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

def retrieve_ue_state(supi: str, user_id: int) -> bool: 
    try:
        return threads[f"{supi}"][f"{user_id}"].is_alive()
    except KeyError as ke:
        print('Key Not Found in Threads Dictionary:', ke)
        return False

@router.get("/state-ues", status_code=200)
def state_ues(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get the state
    """
    return ues