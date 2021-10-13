from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Path, Response, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app import tools
from app.core.config import settings

location_header = settings.BACKEND_CORS_ORIGINS[1] + settings.API_V1_STR + "/3gpp-monitoring-event/v1/" 


def location_reporting(db: Session,  item_in_json: Any, user: models.User):
    UE = crud.ue.get_ipv4(db=db, ipv4=item_in_json["ipv4Addr"], owner_id=user.id)
    if not UE: 
        raise HTTPException(status_code=409, detail="UE with this ipv4 doesn't exist")    
    
    if item_in_json["monitoringType"] == "LOCATION_REPORTING" and item_in_json["maximumNumberOfReports"]>0:
        item_in_json["monitoringEventReport"] = {}
        item_in_json["monitoringEventReport"]["locationInfo"] = {}
        item_in_json["monitoringEventReport"]["monitoringType"] = {}
        item_in_json["monitoringEventReport"]["locationInfo"]["cellId"] = {}
        item_in_json["monitoringEventReport"]["locationInfo"]["enodeBId"] = {}        
        item_in_json["monitoringEventReport"]["monitoringType"] = item_in_json["monitoringType"]
        item_in_json["monitoringEventReport"]["locationInfo"]["cellId"] = UE.Cell_id
        item_in_json["monitoringEventReport"]["locationInfo"]["enodeBId"] = UE.gNB_id
        return item_in_json

router = APIRouter()


@router.get("/{scsAsId}/subscriptions", response_model=List[schemas.MonitoringEventSubscription])
def read_active_subscriptions(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that read all the subscriptions", example="myNetapp"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
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

    for sub in subs:
        sub_validate_time = tools.check_expiration_time(expire_time=sub.monitorExpireTime)
        print(sub.id)
        if not sub_validate_time:
            crud.monitoring.remove(db=db, id=sub.id)
            subs.remove(sub)
    
    return subs



#Callback 

monitoring_callback_router = APIRouter()

@monitoring_callback_router.post("{$request.body.notificationDestination}", response_model=schemas.MonitoringEventReportReceived, status_code=200, response_class=Response)
def monitoring_notification(body: schemas.MonitoringEventReport):
    pass

@router.post("/{scsAsId}/subscriptions", response_model=schemas.MonitoringEventReport, responses={201: {"model" : schemas.MonitoringEventSubscription}}, callbacks=monitoring_callback_router.routes)
def create_item(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that creates a subscription", example="myNetapp"),
    db: Session = Depends(deps.get_db),
    item_in: schemas.MonitoringEventSubscription,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new subscription.
    """
    UE = crud.ue.get_ipv4(db=db, ipv4=str(item_in.ipv4Addr), owner_id=current_user.id)
    if not UE: 
        raise HTTPException(status_code=409, detail="UE with this ipv4 doesn't exist")
    
    if item_in.monitoringType == "LOCATION_REPORTING" and item_in.maximumNumberOfReports == 1:
        json_compatible_item_data = {}
        json_compatible_item_data["monitoringType"] = item_in.monitoringType
        json_compatible_item_data["locationInfo"] = {'cellId' : UE.Cell.cell_id, 'gNBId' : UE.Cell.gNB.gNB_id}
        return JSONResponse(content=json_compatible_item_data, status_code=200)
    elif item_in.monitoringType == "LOCATION_REPORTING" and item_in.maximumNumberOfReports>1:    
        response = crud.monitoring.create_with_owner(db=db, obj_in=item_in, owner_id=current_user.id)
        json_compatible_item_data = jsonable_encoder(response)
        json_compatible_item_data.pop("owner_id")
        json_compatible_item_data.pop("id")
        link = location_header + scsAsId + "/subscriptions/" + str(response.id)
        json_compatible_item_data["link"] = link                      
        crud.monitoring.update(db=db, db_obj=response, obj_in={"link" : link})
        response_header = {"location" : link}
        return JSONResponse(content=json_compatible_item_data, status_code=201, headers=response_header)



@router.put("/{scsAsId}/subscriptions/{subscriptionId}", response_model=schemas.MonitoringEventSubscription)
def update_item(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that creates a subscription", example="myNetapp"),
    subscriptionId: str = Path(..., title="Identifier of the subscription resource"),
    db: Session = Depends(deps.get_db),
    item_in: schemas.MonitoringEventSubscription,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update/Replace an existing subscription resource
    """
    sub = crud.monitoring.get(db=db, id=int(subscriptionId))
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    if not crud.user.is_superuser(current_user) and (sub.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    sub_validate_time = tools.check_expiration_time(expire_time=sub.monitorExpireTime)
    
    if sub_validate_time:
        sub = crud.monitoring.update(db=db, db_obj=sub, obj_in=item_in)
        return sub
    else:
        raise HTTPException(status_code=403, detail="Subscription has expired")
    

@router.get("/{scsAsId}/subscriptions/{subscriptionId}", response_model=schemas.MonitoringEventSubscription)
def read_item(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that creates a subscription", example="myNetapp"),
    subscriptionId: str = Path(..., title="Identifier of the subscription resource"),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
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
        return sub
    else:
        crud.monitoring.remove(db=db, id=id)
        raise HTTPException(status_code=403, detail="Subscription has expired")

@router.delete("/{scsAsId}/subscriptions/{subscriptionId}", response_model=schemas.MonitoringEventSubscription)
def delete_item(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that creates a subscription", example="myNetapp"),
    subscriptionId: str = Path(..., title="Identifier of the subscription resource"),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
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
        return sub
    else:
        crud.monitoring.remove(db=db, id=id)
        raise HTTPException(status_code=403, detail="Subscription has expired")
    
    
