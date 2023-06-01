from datetime import datetime
import logging, requests, json
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import HTTPException
from sqlalchemy.orm.session import Session
from app import models, schemas, crud
from app.api import deps
from app.schemas import monitoringevent, UserPlaneNotificationData
from pydantic import BaseModel
from app.api.api_v1.endpoints.paths import get_random_point
from app.api.api_v1.endpoints.ue_movement import retrieve_ue_state
from evolved5g.sdk import CAPIFLogger

#Create CAPIF Logger object
def ccf_logs(input_request: Request, output_response: dict, service_api_description: str, invoker_id: str):
    
    try:
        capif_logger = CAPIFLogger(certificates_folder="app/core/certificates",
                                    capif_host="capifcore",
                                    capif_https_port="443"
                                    )

        log_entries = []
        service_description = capif_logger.get_capif_service_description(capif_service_api_description_json_full_path=
                                                                f"app/core/certificates/CAPIF_{service_api_description}")

        api_id = service_description["apiId"]

        endpoint = input_request.url.path
        if endpoint.find('monitoring') != -1:
            resource = "Monitoring_Event_API"
            endpoint = "/nef/api/v1/3gpp-monitoring-event/"
        elif endpoint.find('session-with-qos') != -1:
            resource = "AsSession_With_QoS_API"
            endpoint = "/nef/api/v1/3gpp-as-session-with-qos/"

        #Request body check and trim
        if(input_request.method == 'POST') or (input_request.method == 'PUT'):  
            req_body = input_request._body.decode("utf-8").replace('\n', '')
            req_body = req_body.replace(' ', '')
            req_body = json.loads(req_body)
        else:
            req_body = " "
        
        url_string = "https://" + input_request.url.hostname + ":4443" + endpoint
        
        log_entry = CAPIFLogger.LogEntry(
                                        apiId = api_id,
                                        apiVersion="v1",
                                        apiName=endpoint,
                                        resourceName=resource,
                                        uri=url_string,
                                        protocol="HTTP_1_1",
                                        invocationTime= datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                                        invocationLatency=10,
                                        operation=input_request.method,
                                        result= output_response.get("status_code"),
                                        inputParameters=req_body,
                                        outputParameters=output_response.get("response")
                                        )

        log_entries.append(log_entry)
        api_invoker_id = invoker_id
        capif_logger.save_log(api_invoker_id,log_entries)
    except Exception as ex:
        logging.critical(ex)
        logging.critical("Potential cause of failure: CAPIF Core Function is not deployed or unreachable")
    

#List holding notifications from 
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
    Import the scenario
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