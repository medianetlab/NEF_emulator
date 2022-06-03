import logging
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Path, Request, Response
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pymongo.database import Database
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
from app.crud import crud_mongo, user, ue
from .utils import add_notifications
from .qosInformation import qos_reference_match

router = APIRouter()
db_collection= 'QoSMonitoring'

@router.get("/{scsAsId}/subscriptions", response_model=List[schemas.AsSessionWithQoSSubscription])
def read_active_subscriptions(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that creates a subscription", example="myNetapp"),
    db_mongo: Database = Depends(deps.get_mongo_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    http_request: Request
) -> Any:
    """
    Get subscription by id
    """
    retrieved_docs = crud_mongo.read_all(db_mongo, db_collection, current_user.id)

    #Check if there are any active subscriptions
    if not retrieved_docs:
        raise HTTPException(status_code=404, detail="There are no active subscriptions")
    
    http_response = JSONResponse(content=retrieved_docs, status_code=200)
    add_notifications(http_request, http_response, False)
    return http_response

#Callback 

qos_callback_router = APIRouter()

@qos_callback_router.post("{$request.body.notificationDestination}", response_class=Response)
def monitoring_notification(body: schemas.UserPlaneNotificationData):
    pass

@router.post("/{scsAsId}/subscriptions", responses={201: {"model" : schemas.AsSessionWithQoSSubscription}}, callbacks=qos_callback_router.routes)
def create_subscription(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that creates a subscription", example="myNetapp"),
    db_mongo: Database = Depends(deps.get_mongo_db),
    db: Session = Depends(deps.get_db),
    item_in: schemas.AsSessionWithQoSSubscriptionCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
    http_request: Request
) -> Any:
    
    json_request = jsonable_encoder(item_in)
    #Currently only EVENT_TRIGGERED is supported
    fiveG_qi = qos_reference_match(item_in.qosReference)
    if fiveG_qi.get('type') == 'GBR' or fiveG_qi.get('type') == 'DC-GBR':
        if (json_request['qosMonInfo'] == None) or (json_request['qosMonInfo']['repFreqs'] == None):
            raise HTTPException(status_code=400, detail="Please enter a value in repFreqs field")
        else:
            if 'EVENT_TRIGGERED' not in json_request['qosMonInfo']['repFreqs']:
                raise HTTPException(status_code=400, detail="Only 'EVENT_TRIGGERED' reporting frequency is supported at the current version. Please enter 'EVENT_TRIGGERED' in repFreqs field")
        
    
    #Ensure that the user sends only one of the ipv4, ipv6, macAddr fields
    validate_ids(item_in.dict(exclude_unset=True))

    #Check if both UE and subscription exist
    if 'ipv4Addr' in item_in.dict(exclude_unset=True):    
        UE = ue.get_ipv4(db = db, ipv4 = str(item_in.ipv4Addr), owner_id = current_user.id)
        doc = crud_mongo.read(db_mongo, db_collection, 'ipv4Addr', str(item_in.ipv4Addr))
        error_var = str(item_in.ipv4Addr) #display ipv4 in HTTP Exception if subscription exists
        selected_id = 'ipv4Addr'
    elif 'ipv6Addr' in item_in.dict(exclude_unset=True):
        item_in.ipv6Addr = item_in.ipv6Addr.exploded
        UE = ue.get_ipv6(db = db, ipv6 = str(item_in.ipv6Addr), owner_id = current_user.id)
        doc = crud_mongo.read(db_mongo, db_collection, 'ipv6Addr', str(item_in.ipv6Addr))
        error_var = str(item_in.ipv6Addr) #display ipv6 in HTTP Exception if subscription exists
        selected_id = 'ipv6Addr'
    elif 'macAddr' in item_in.dict(exclude_unset=True):
        UE = ue.get_mac(db = db, mac = str(item_in.macAddr), owner_id = current_user.id)
        doc = crud_mongo.read(db_mongo, db_collection, 'macAddr', item_in.macAddr)
        error_var = item_in.macAddr #display macAddr in HTTP Exception if subscription exists
        selected_id = 'macAddr'
    
    if not UE: 
        raise HTTPException(status_code=409, detail="UE not found")

    if doc and (doc.get("owner_id") == current_user.id):
        raise HTTPException(status_code=409, detail=f"Subscription for UE with {selected_id} ({error_var}) already exists")
    
    #Create the document in mongodb

    # send_qos_gnb(item_in.qosReference, db_mongo, UE) ##Validate if qos reference matches any of the standardized 5qi values and create/send the QoS Profile to NG-RAN

    json_data = jsonable_encoder(item_in.dict(exclude_unset=True))
    json_data.update({'owner_id' : current_user.id})

    #Add all UE ids in the subscription to help in validation, even if the user selects one id.
    #For example, lets assume that a user makes a subscription for a UE with ipv4 10.0.0.1.
    #Subsequently a subscription for the same UE with ipv6 ::1 should not be permitted 
    if selected_id == 'ipv4Addr':
        json_data.update({'ipv6Addr' : UE.ip_address_v6, 'macAddr' : UE.mac_address})
    elif selected_id == 'ipv6Addr':
        json_data.update({'ipv4Addr' : UE.ip_address_v4, 'macAddr' : UE.mac_address})
    elif selected_id == 'macAddr':
        json_data.update({'ipv4Addr' : UE.ip_address_v4, 'ipv6Addr' : UE.ip_address_v6})

    inserted_doc = crud_mongo.create(db_mongo, db_collection, json_data)

    #Create the reference resource and location header
    link = str(http_request.url) + '/' + str(inserted_doc.inserted_id)
    response_header = {"location" : link}

    #Update the subscription with the new resource (link) and return the response (+response header)
    crud_mongo.update_new_field(db_mongo, db_collection, inserted_doc.inserted_id, {"link" : link})
    
    #Retrieve the updated document | UpdateResult is not a dict
    updated_doc = crud_mongo.read_uuid(db_mongo, db_collection, inserted_doc.inserted_id)

    updated_doc.pop("owner_id") #Remove owner_id from the response
    
    http_response = JSONResponse(content=updated_doc, status_code=201, headers=response_header)
    add_notifications(http_request, http_response, False)


    return http_response

@router.get("/{scsAsId}/subscriptions/{subscriptionId}", response_model=schemas.AsSessionWithQoSSubscription)
def read_subscription(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that creates a subscription", example="myNetapp"),
    subscriptionId: str = Path(..., title="Identifier of the subscription resource"),
    db_mongo: Database = Depends(deps.get_mongo_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    http_request: Request
) -> Any:
    """
    Get subscription by id
    """

    try:
        retrieved_doc = crud_mongo.read_uuid(db_mongo, db_collection, subscriptionId)
    except Exception as ex:
        raise HTTPException(status_code=400, detail='Please enter a valid uuid (24-character hex string)')
    
    #Check if the document exists
    if not retrieved_doc:
        raise HTTPException(status_code=404, detail="Subscription not found")
    #If the document exists then validate the owner
    if not user.is_superuser(current_user) and (retrieved_doc['owner_id'] != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    retrieved_doc.pop("owner_id")
    http_response = JSONResponse(content=retrieved_doc, status_code=200)
    add_notifications(http_request, http_response, False)
    return http_response

@router.put("/{scsAsId}/subscriptions/{subscriptionId}", response_model=schemas.AsSessionWithQoSSubscription)
def update_subscription(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that creates a subscription", example="myNetapp"),
    subscriptionId: str = Path(..., title="Identifier of the subscription resource"),
    item_in: schemas.AsSessionWithQoSSubscriptionCreate,
    db_mongo: Database = Depends(deps.get_mongo_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    http_request: Request
) -> Any:
    """
    Update subscription by id
    """

    try:
        retrieved_doc = crud_mongo.read_uuid(db_mongo, db_collection, subscriptionId)
    except Exception as ex:
        raise HTTPException(status_code=400, detail='Please enter a valid uuid (24-character hex string)')
    
    #Check if the document exists
    if not retrieved_doc:
        raise HTTPException(status_code=404, detail="Subscription not found")
    #If the document exists then validate the owner
    if not user.is_superuser(current_user) and (retrieved_doc['owner_id'] != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    #Update the document
    json_data = jsonable_encoder(item_in)
    crud_mongo.update_new_field(db_mongo, db_collection, subscriptionId, json_data)

    #Retrieve the updated document | UpdateResult is not a dict
    updated_doc = crud_mongo.read_uuid(db_mongo, db_collection, subscriptionId)
    updated_doc.pop("owner_id")
    http_response = JSONResponse(content=updated_doc, status_code=200)
    add_notifications(http_request, http_response, False)
    return http_response

@router.delete("/{scsAsId}/subscriptions/{subscriptionId}", response_model=schemas.AsSessionWithQoSSubscription)
def delete_subscription(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that creates a subscription", example="myNetapp"),
    subscriptionId: str = Path(..., title="Identifier of the subscription resource"),
    db_mongo: Database = Depends(deps.get_mongo_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    http_request: Request
) -> Any:
    """
    Delete a subscription
    """
    try:
        retrieved_doc = crud_mongo.read_uuid(db_mongo, db_collection, subscriptionId)
    except Exception as ex:
        raise HTTPException(status_code=400, detail='Please enter a valid uuid (24-character hex string)')


    #Check if the document exists
    if not retrieved_doc:
        raise HTTPException(status_code=404, detail="Subscription not found")
    #If the document exists then validate the owner
    if not user.is_superuser(current_user) and (retrieved_doc['owner_id'] != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    crud_mongo.delete_by_uuid(db_mongo, db_collection, subscriptionId)
    http_response = JSONResponse(content=retrieved_doc, status_code=200)
    add_notifications(http_request, http_response, False)
    return http_response

    
#Function that creates the QoS Profile in gNB
#3GPP terminology: 
#The Session Management Function (SMF) sends the QoS Profile to NG-RAN (gNB) 
#after the PDU Session Establishment request from the UE 

def send_qos_gnb(qos_reference, db, ue):
    
    qos_profile = qos_reference_match(qos_reference)

    #Check if the QoS profile already exists in gNB

    retrieved_doc = crud_mongo.read_gNB_qosprofile(db, 'QoSProfile', ue.Cell.gNB.gNB_id, qos_reference)
    if retrieved_doc:
        logging.critical(f'This QoS Profile already exists for {ue.Cell.gNB.gNB_id}')
        return

    #Create a new QoS Profile in NG_RAN
    qos_profile.update({"gNB_id" : ue.Cell.gNB.gNB_id})
    crud_mongo.create(db, 'QoSProfile', qos_profile)
    return 
        

def validate_ids(item_request: dict):
    
    if 'ipv4Addr' in item_request and ('ipv6Addr' in item_request or 'macAddr' in item_request):
        raise HTTPException(status_code=400, detail='Please enter only one of the ipv4Addr, ipv6Addr, macAddr fields in the request')
    elif 'ipv6Addr' in item_request and ('ipv4Addr' in item_request or 'macAddr' in item_request):
        raise HTTPException(status_code=400, detail='Please enter only one of the ipv4Addr, ipv6Addr, macAddr fields in the request')
    elif 'macAddr' in item_request and ('ipv4Addr' in item_request or 'ipv6Addr' in item_request):
        raise HTTPException(status_code=400, detail='Please enter only one of the ipv4Addr, ipv6Addr, macAddr fields in the request')
    else:
        return
        