from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Path, Response, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app import tools
from app.api.api_v1.endpoints.utils import add_notifications

router = APIRouter()

@router.get("/{scsAsId}/subscriptions", response_model=List[schemas.MonitoringEventSubscription], responses={204: {"model" : None}})
def read_active_subscriptions(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that read all the subscriptions", example="myNetapp"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    http_request: Request
) -> Any:
    """
    Read all active subscriptions
    """    
    if crud.user.is_superuser(current_user):
       subs = crud.monitoring.get_multi(db, skip=skip, limit=limit)
    else:
        subs = crud.monitoring.get_multi_by_owner(
            db=db, owner_id=current_user.id, skip=skip, limit=limit
        )

    json_subs = jsonable_encoder(subs)
    temp_json_subs = json_subs.copy() #Create copy of the list (json_subs) -> you cannot remove items from a list while you iterating the list.

    for sub in temp_json_subs:
        sub_validate_time = tools.check_expiration_time(expire_time=sub.get("monitorExpireTime"))
        if not sub_validate_time:
            crud.monitoring.remove(db=db, id=sub.get("id"))
            json_subs.remove(sub)
            
    temp_json_subs.clear()

    if json_subs:
        for data in json_subs:
            data.pop("owner_id")
            data.pop("id")

        http_response = JSONResponse(content=json_subs, status_code=200)
        add_notifications(http_request, http_response, False)
        return http_response
    else:
        return Response(status_code=204)



#Callback 

monitoring_callback_router = APIRouter()

@monitoring_callback_router.post("{$request.body.notificationDestination}", response_model=schemas.MonitoringEventReportReceived, status_code=200, response_class=Response)
def monitoring_notification(body: schemas.MonitoringNotification):
    pass

@router.post("/{scsAsId}/subscriptions", response_model=schemas.MonitoringEventReport, responses={201: {"model" : schemas.MonitoringEventSubscription}}, callbacks=monitoring_callback_router.routes)
def create_subscription(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that creates a subscription", example="myNetapp"),
    db: Session = Depends(deps.get_db),
    item_in: schemas.MonitoringEventSubscriptionCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
    http_request: Request
) -> Any:
    """
    Create new subscription.
    """
    UE = crud.ue.get_externalId(db=db, externalId=str(item_in.externalId), owner_id=current_user.id)
    if not UE: 
        raise HTTPException(status_code=409, detail="UE with this external identifier doesn't exist")
    
    if crud.monitoring.get_sub_externalId(db=db, externalId=item_in.externalId, owner_id=current_user.id):
        raise HTTPException(status_code=409, detail=f"There is already an active subscription for UE with external id {item_in.externalId}")
    
    if item_in.monitoringType == "LOCATION_REPORTING" and item_in.maximumNumberOfReports == 1:
        
        json_compatible_item_data = {}
        json_compatible_item_data["monitoringType"] = item_in.monitoringType
        json_compatible_item_data["locationInfo"] = {'cellId' : UE.Cell.cell_id, 'gNBId' : UE.Cell.gNB.gNB_id}
        json_compatible_item_data["externalId"] = item_in.externalId
        json_compatible_item_data["ipv4Addr"] = UE.ip_address_v4
        
        http_response = JSONResponse(content=json_compatible_item_data, status_code=200)
        add_notifications(http_request, http_response, False)
        
        return http_response 
    elif item_in.monitoringType == "LOCATION_REPORTING" and item_in.maximumNumberOfReports>1:
        
        response = crud.monitoring.create_with_owner(db=db, obj_in=item_in, owner_id=current_user.id)
        
        json_compatible_item_data = jsonable_encoder(response)
        json_compatible_item_data.pop("owner_id")
        json_compatible_item_data.pop("id")
        link = str(http_request.url) + '/' + str(response.id)
        json_compatible_item_data["link"] = link
        json_compatible_item_data["ipv4Addr"] = UE.ip_address_v4
        crud.monitoring.update(db=db, db_obj=response, obj_in={"link" : link})
        
        response_header = {"location" : link}
        http_response = JSONResponse(content=json_compatible_item_data, status_code=201, headers=response_header)
        add_notifications(http_request, http_response, False)
        
        return http_response



@router.put("/{scsAsId}/subscriptions/{subscriptionId}", response_model=schemas.MonitoringEventSubscription)
def update_subscription(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that creates a subscription", example="myNetapp"),
    subscriptionId: str = Path(..., title="Identifier of the subscription resource"),
    db: Session = Depends(deps.get_db),
    item_in: schemas.MonitoringEventSubscription,
    current_user: models.User = Depends(deps.get_current_active_user),
    http_request: Request
) -> Any:
    """
    Update/Replace an existing subscription resource
    """
    id = int(subscriptionId)
    
    sub = crud.monitoring.get(db=db, id=int(subscriptionId))
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if not crud.user.is_superuser(current_user) and (sub.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    sub_validate_time = tools.check_expiration_time(expire_time=sub.monitorExpireTime)
    
    if sub_validate_time:
        sub = crud.monitoring.update(db=db, db_obj=sub, obj_in=item_in)

        json_compatible_item_data = jsonable_encoder(sub)
        json_compatible_item_data.pop("owner_id")
        json_compatible_item_data.pop("id")
        http_response = JSONResponse(content=json_compatible_item_data, status_code=200)

        add_notifications(http_request, http_response, False)
        return http_response
    else:
        crud.monitoring.remove(db=db, id=id)
        raise HTTPException(status_code=403, detail="Subscription has expired")
    

@router.get("/{scsAsId}/subscriptions/{subscriptionId}", response_model=schemas.MonitoringEventSubscription)
def read_subscription(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that creates a subscription", example="myNetapp"),
    subscriptionId: str = Path(..., title="Identifier of the subscription resource"),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    http_request: Request
) -> Any:
    """
    Get subscription by id
    """
    id = int(subscriptionId)
    sub = crud.monitoring.get(db=db, id=id)
    
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if not crud.user.is_superuser(current_user) and (sub.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    sub_validate_time = tools.check_expiration_time(expire_time=sub.monitorExpireTime)
    
    if sub_validate_time:
        json_compatible_item_data = jsonable_encoder(sub)
        json_compatible_item_data.pop("owner_id")
        json_compatible_item_data.pop("id")
        http_response = JSONResponse(content=json_compatible_item_data, status_code=200)

        add_notifications(http_request, http_response, False)
        return http_response
    else:
        crud.monitoring.remove(db=db, id=id)
        raise HTTPException(status_code=403, detail="Subscription has expired")

@router.delete("/{scsAsId}/subscriptions/{subscriptionId}", response_model=schemas.MonitoringEventSubscription)
def delete_subscription(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that creates a subscription", example="myNetapp"),
    subscriptionId: str = Path(..., title="Identifier of the subscription resource"),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    http_request: Request
) -> Any:
    """
    Delete a subscription
    """
    sub = crud.monitoring.get(db=db, id=int(subscriptionId))
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if not crud.user.is_superuser(current_user) and (sub.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    sub_validate_time = tools.check_expiration_time(expire_time=sub.monitorExpireTime)
    
    if sub_validate_time:
        sub = crud.monitoring.remove(db=db, id=int(subscriptionId))
        
        json_compatible_item_data = jsonable_encoder(sub)
        json_compatible_item_data.pop("owner_id")
        json_compatible_item_data.pop("id")
        http_response = JSONResponse(content=json_compatible_item_data, status_code=200)
        
        add_notifications(http_request, http_response, False)
        return http_response
    else:
        crud.monitoring.remove(db=db, id=id)
        raise HTTPException(status_code=403, detail="Subscription has expired")
    
    
