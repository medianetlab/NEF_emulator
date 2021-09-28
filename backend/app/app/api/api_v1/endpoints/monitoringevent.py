import time
import datetime

from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Path, Response
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

from app.core.config import settings

location_header = settings.BACKEND_CORS_ORIGINS[1] + settings.API_V1_STR + "/3gpp-monitoring-event/v1/" 

def check_expiration_time(expire_time):
    year = int(expire_time[0:4])
    month = int(expire_time[5:7])
    day = int(expire_time[8:10])
    hour = int(expire_time[11:13])
    minute = int(expire_time[14:16])
    sec = int(expire_time[17:19])

    time_now = time.localtime()
    print(time.asctime(time_now))
    
    if year>=time_now[0] and month>=time_now[1]: 
        print(year, time_now[0])
        print(month, time_now[1])
        if(day>time_now[2]):
            print(day, time_now[2])
            return True
        elif(day==time_now[2]):
            print("Day == day now", day, time_now[2])
            if(hour>time_now[3]+3):     #+3 is for timeZone (GMT+3)
                print(hour, time_now[3])
                return True
            elif(hour==time_now[3]+3):
                print("Time == time now", hour, time_now[3])
                if(minute>time_now[4]):
                    print(minute, time_now[4])
                    return True
                elif(minute==time_now[4]):
                    print("Minute == minute now", minute, time_now[4])
                    if(sec>=time_now[5]):
                        print(sec, time_now[5])
                        return True
                else:
                    return False
            else:
                return False
        else:
            return False
    else:
        return False

def check_numberOfReports(db: Session, item_in: models.Monitoring)-> models.Monitoring:
    if item_in.maximumNumberOfReports>1:
        item_in.maximumNumberOfReports -= 1
        db.add(item_in)
        db.commit()
        db.refresh(item_in)
        return item_in
    elif item_in.maximumNumberOfReports==1:
        crud.monitoring.remove(db=db, id=item_in.id)
        return item_in
    else:
        raise HTTPException(status_code=403, detail="Subscription has expired")
        

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
        sub_validate_time = check_expiration_time(expire_time=sub.monitorExpireTime)
        print(sub.id)
        if not sub_validate_time:
            crud.monitoring.remove(db=db, id=sub.id)
            subs.remove(sub)
    
    return subs



#Callback 
'''
monitoring_callback_router = APIRouter()

@monitoring_callback_router.post( "{$request.body.notificationDestination}/", response_model=schemas.MonitoringEventReport)
def monitoring_notification(body: schemas.MonitoringEventSubscription):
    pass
'''


@router.post("/{scsAsId}/subscriptions", response_model=schemas.MonitoringEventReport)
def create_item(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that creates a subscription", example="myNetapp"),
    db: Session = Depends(deps.get_db),
    item_in: schemas.subCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
#    response_header: Response
) -> Any:
    """
    Create new subscription.
    """
    UE = crud.ue.get_ipv4(db=db, ipv4=str(item_in.ipv4Addr), owner_id=current_user.id)
    if not UE: 
        raise HTTPException(status_code=409, detail="UE with this ipv4 doesn't exist")
    
    response = crud.monitoring.create_with_owner(db=db, obj_in=item_in, owner_id=current_user.id)
    
    
    if item_in.monitoringType == "LOCATION_REPORTING" and item_in.maximumNumberOfReports == 1:
        json_compatible_item_data = jsonable_encoder(item_in.copy(include = {'monitoringEventReport'}))
        json_compatible_item_data["monitoringEventReport"]["monitoringType"] = item_in.monitoringType
        json_compatible_item_data["monitoringEventReport"]["locationInfo"]["cellId"] = UE.Cell_id
        json_compatible_item_data["monitoringEventReport"]["locationInfo"]["enodeBId"] = UE.gNB_id
        return JSONResponse(content=json_compatible_item_data, status_code=200)
    elif item_in.monitoringType == "LOCATION_REPORTING" and item_in.maximumNumberOfReports>1:    
        json_compatible_item_data = jsonable_encoder(response)
        json_compatible_item_data.pop("owner_id")
        json_compatible_item_data.pop("id")
        link = location_header + scsAsId + "/subscriptions/" + str(response.id)
        json_compatible_item_data["link"] = link    #not saved in db                                    
    #    crud.monitoring.update(db=db, db_obj=models.Monitoring, obj_in={"link" : link}) |||||only one session per request
        response_header = {"location" : link}
        return JSONResponse(content=json_compatible_item_data, status_code=201, headers=response_header)



@router.put("/{scsAsId}/subscriptions/{subscriptionId}", response_model=schemas.MonitoringEventSubscription)
def update_item(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that creates a subscription", example="myNetapp"),
    subscriptionId: str = Path(..., title="Identifier of the subscription resource"),
    db: Session = Depends(deps.get_db),
    item_in: schemas.subUpdate,
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
    
    sub_validate_time = check_expiration_time(expire_time=sub.monitorExpireTime)
    
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
    
    sub_validate_time = check_expiration_time(expire_time=sub.monitorExpireTime)
    if sub_validate_time:
        sub = check_numberOfReports(db=db, item_in=sub)
        json_input = jsonable_encoder(sub)
        return location_reporting(db=db, item_in_json=json_input, user=current_user)
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
    
    sub_validate_time = check_expiration_time(expire_time=sub.monitorExpireTime)
    
    if sub_validate_time:
        sub = crud.monitoring.remove(db=db, id=int(subscriptionId))
        return sub
    else:
        crud.monitoring.remove(db=db, id=id)
        raise HTTPException(status_code=403, detail="Subscription has expired")
    
    
