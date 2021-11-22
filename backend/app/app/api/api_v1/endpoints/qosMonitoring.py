import logging
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Path, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pymongo.database import Database
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
from app import tools
from app.core.config import settings, qosSettings
from app.crud import crud_mongo, user, ue
from app.api.api_v1.endpoints.utils import add_notifications

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

@router.post("/{scsAsId}/subscriptions", responses={201: {"model" : schemas.AsSessionWithQoSSubscription}})
def create_subscription(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that creates a subscription", example="myNetapp"),
    db_mongo: Database = Depends(deps.get_mongo_db),
    db: Session = Depends(deps.get_db),
    item_in: schemas.AsSessionWithQoSSubscriptionCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
    http_request: Request
) -> Any:
    
    #Check if UE with this ipv4 exists
    UE = ue.get_ipv4(db = db, ipv4 = str(item_in.ipv4Addr), owner_id = current_user.id)
    if not UE: 
        raise HTTPException(status_code=409, detail="UE with this ipv4 doesn't exist")

    #Create the document in mongodb
    doc = crud_mongo.read_ipv4(db_mongo, db_collection, str(item_in.ipv4Addr))
    if doc and (doc.get("owner_id") == current_user.id):
        raise HTTPException(status_code=409, detail=f"Subscription for UE with ipv4 ({item_in.ipv4Addr}) already exists")
    
    ##Validate if qos reference chosen matches the 5qi values 
    ##and create/send the QoS Profile to NG-RAN
    send_qos_gnb(item_in.qosReference, qosSettings.retrieve_settings(), db_mongo, UE)

    json_data = jsonable_encoder(item_in)
    json_data.update({'owner_id' : current_user.id})
    inserted_doc = crud_mongo.create(db_mongo, db_collection, json_data)

    #Create the reference resource and location header
    link = str(http_request.url) + '/' + str(inserted_doc.inserted_id)
    response_header = {"location" : link}

    #Update the subscription with the new resource (link) and return the response (+response header)

    crud_mongo.update_new_field(db_mongo, db_collection, inserted_doc.inserted_id, {"link" : link})
    updated_doc = crud_mongo.read(db_mongo, db_collection, inserted_doc.inserted_id)

    #Remove owner_id from the response
    updated_doc.pop("owner_id")
    
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
        retrieved_doc = crud_mongo.read(db_mongo, db_collection, subscriptionId)
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
        retrieved_doc = crud_mongo.read(db_mongo, db_collection, subscriptionId)
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

    #Retrieve the updated document
    retrieved_doc = crud_mongo.read(db_mongo, db_collection, subscriptionId)
    retrieved_doc.pop("owner_id")
    http_response = JSONResponse(content=retrieved_doc, status_code=200)
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
        retrieved_doc = crud_mongo.read(db_mongo, db_collection, subscriptionId)
    except Exception as ex:
        raise HTTPException(status_code=400, detail='Please enter a valid uuid (24-character hex string)')


    #Check if the document exists
    if not retrieved_doc:
        raise HTTPException(status_code=404, detail="Subscription not found")
    #If the document exists then validate the owner
    if not user.is_superuser(current_user) and (retrieved_doc['owner_id'] != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    crud_mongo.delete(db_mongo, db_collection, subscriptionId)
    http_response = JSONResponse(content=retrieved_doc, status_code=200)
    add_notifications(http_request, http_response, False)
    return http_response

    
#Function that creates the QoS Profile in gNB
#           3GPP terminology: 
#The Session Management Function (SMF) sends the QoS Profile to NG-RAN (gNB) 
#after the PDU Session Establishment request from the UE 
    
def send_qos_gnb(qos_reference, qos_characteristics, db, ue):
    
    qos_profile = {}
        
    #Load the standardized 5qi values
    qos_5qi = qos_characteristics.get('5qi')

    #Find the matched 5qi value
    for q in qos_5qi:
        if q.get('value') == qos_reference:
            qos_profile = q.copy()
            print(qos_profile)

    if not qos_profile:
        raise HTTPException(status_code=400, detail=f"The 5QI (qosReference) {qos_reference} does not exist")
    
    #Check if the QoS profile already exists in gNB

    retrieved_doc = crud_mongo.read_gNB_qosprofile(db, 'QoSProfile', ue.Cell.gNB.gNB_id, qos_reference)
    if retrieved_doc:
        logging.critical(f'This QoS Profile already exists for {ue.Cell.gNB.gNB_id}')
        return

    #Create a new QoS Profile in NG_RAN
    qos_profile.update({"gNB_id" : ue.Cell.gNB.gNB_id})
    crud_mongo.create(db, 'QoSProfile', qos_profile)
    return
        
    