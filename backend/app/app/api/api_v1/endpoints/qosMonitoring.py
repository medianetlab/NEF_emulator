import logging
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Path, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pymongo.database import Database

from app import models, schemas
from app.api import deps
from app import tools
from app.core.config import settings
from app.crud import crud_mongo, user
from app.api.api_v1.endpoints.utils import add_notifications

router = APIRouter()
db_collection= 'QoSMonitoring'

@router.post("/{scsAsId}/subscriptions")
def create_subscription(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that creates a subscription", example="myNetapp"),
    db_mongo: Database = Depends(deps.get_mongo_db),
    item_in: schemas.AsSessionWithQoSSubscriptionCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
    http_request: Request
) -> Any:
    

    #Create the document in mongodb
    doc = crud_mongo.read_ipv4(db_mongo, db_collection, str(item_in.ipv4Addr))
    if doc and (doc.get("owner_id") == current_user.id):
        raise HTTPException(status_code=409, detail=f"Subscription for UE with ipv4 ({item_in.ipv4Addr}) already exists")
    
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

@router.get("/{scsAsId}/subscriptions/{subscriptionId}")
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

    except Exception as ex:
        raise HTTPException(status_code=400, detail='Please enter a valid uuid (24-character hex string)')



    


