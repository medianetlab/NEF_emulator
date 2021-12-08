from datetime import datetime
import threading, logging, time, requests, json
from pymongo import MongoClient
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import HTTPException
from sqlalchemy.util.langhelpers import counter
from app.db.session import SessionLocal
from app import models, schemas, crud
from app.api import deps
from app.schemas import monitoringevent, UserPlaneNotificationData
from app.tools.distance import check_distance
from app.tools.send_callback import location_callback, qos_callback
from app import tools
from app.crud import crud_mongo
from .qosInformation import qos_reference_match

#Dictionary holding threads that are running per user id.
threads = {}


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
            
            
            flag = True

            while True:
                for point in points:

                    #Iteration to find the last known coordinates of the UE
                    #Then the movements begins from the last known position (geo coordinates)
                    if ((UE.latitude != point["latitude"]) or (UE.longitude != point["longitude"])) and flag == True:
                        continue
                    elif (UE.latitude == point["latitude"]) and (UE.longitude == point["longitude"]) and flag == True:
                        flag = False
                        continue
                    

                    try:
                        UE = crud.ue.update_coordinates(db=db, lat=point["latitude"], long=point["longitude"], db_obj=UE)
                        cell_now = check_distance(UE.latitude, UE.longitude, jsonable_encoder(UE.Cell), json_cells) #calculate the distance from all the cells
                    except Exception as ex:
                        logging.warning("Failed to update coordinates")
                        logging.warning(ex)
                    
                    if UE.Cell_id != cell_now.get('id'): #Cell has changed in the db "handover"
                        logging.info(f"UE({UE.supi}) with ipv4 {UE.ip_address_v4} handovers to Cell {cell_now.get('id')}, {cell_now.get('description')}")
                        crud.ue.update(db=db, db_obj=UE, obj_in={"Cell_id" : cell_now.get('id')})
                        
                        #Retrieve the subscription of the UE by external Id | This could be outside while true but then the user cannot subscribe when the loop runs
                        sub = crud.monitoring.get_sub_externalId(db=db, externalId=UE.external_identifier)

                        #Validation of subscription
                        if not sub:
                            logging.warning("Subscription not found")
                        elif not crud.user.is_superuser(current_user) and (sub.owner_id != current_user.id):
                            logging.warning("Not enough permissions")
                        else:
                            sub_validate_time = tools.check_expiration_time(expire_time=sub.monitorExpireTime)
                            if sub_validate_time:
                                sub = tools.check_numberOfReports(db=db, item_in=sub)
                                if sub: #return the callback request only if subscription is valid
                                    try:
                                        response = location_callback(UE, sub.notificationDestination, sub.link)
                                        logging.info(response.json())
                                    except requests.exceptions.ConnectionError as ex:
                                        logging.warning("Failed to send the callback request")
                                        logging.warning(ex)
                                        crud.monitoring.remove(db=db, id=sub.id)
                                        continue   
                            else:
                                crud.monitoring.remove(db=db, id=sub.id)
                                logging.warning("Subscription has expired (expiration date)")

                        #QoS Monitoring Event (handover)
                        ues_connected = crud.ue.get_by_Cell(db=db, cell_id=UE.Cell_id)
                        if len(ues_connected) > 1:
                            gbr = 'QOS_NOT_GUARANTEED'
                        else:
                            gbr = 'QOS_GUARANTEED'

                        logging.critical(gbr)
                        qos_notification_control(gbr ,current_user, UE.ip_address_v4)
                        
                    # logging.info(f'User: {current_user.id} | UE: {supi} | Current location: latitude ={UE.latitude} | longitude = {UE.longitude} | Speed: {UE.speed}' )
                    
                    if UE.speed == 'LOW':
                        time.sleep(1)
                    elif UE.speed == 'HIGH':
                        time.sleep(0.1)
        
                    if self._stop_threads:
                        print("Stop moving...")
                        break       

                if self._stop_threads:
                        print("Terminating thread...")
                        break       
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
        logging.info("Subscription not found")
        return
    #If the document exists then validate the owner
    if not crud.user.is_superuser(current_user) and (doc['owner_id'] != current_user.id):
        logging.info("Not enough permissions")
        return
    
    qos_standardized = qos_reference_match(doc.get('qosReference'))

    logging.critical(qos_standardized)
    logging.critical(qos_standardized.get('type'))

    if qos_standardized.get('type') == 'GBR' or qos_standardized.get('type') == 'DC-GBR':
        try:
            response = qos_callback(doc.get('notificationDestination'), doc.get('link'), gbr_status, ipv4)
            logging.critical(response.json())
        except requests.exceptions.ConnectionError as ex:
            logging.critical("Failed to send the callback request")
            logging.critical(ex) 
    else:
        logging.critical('Non-GBR subscription')

    return

    
router = APIRouter()

# class callback(BaseModel):
#     callbackurl: str

# @router.post("/test/callback")
# def get_test(
#     item_in: callback
#     ):
    
#     callbackurl = item_in.callbackurl
#     print(callbackurl)
#     payload = json.dumps({
#     "externalId" : "10003@domain.com",
#     "ipv4Addr" : "10.0.0.3",
#     "subscription" : "http://localhost:8888/api/v1/3gpp-monitoring-event/v1/myNetapp/subscriptions/3",
#     "monitoringType": "LOCATION_REPORTING",
#     "locationInfo": {
#         "cellId": "AAAAA1002",
#         "enodeBId": "AAAAA1"
#     }
#     })

#     headers = {
#     'accept': 'application/json',
#     'Content-Type': 'application/json'
#     }

#     try:
#         response = requests.request("POST", callbackurl, headers=headers, data=payload)
#         return response.json()
#     except requests.exceptions.ConnectionError as ex:
#         logging.warning(ex)
#         raise HTTPException(status_code=409, detail="Failed to send the callback request")

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