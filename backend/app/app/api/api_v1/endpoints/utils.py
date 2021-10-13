import threading, logging, time, requests, json
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Path, responses
from fastapi.encoders import jsonable_encoder
from pydantic.networks import EmailStr
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app import models, schemas, crud
from app.api import deps
from app.core.celery_app import celery_app
from app.schemas import monitoringevent 
from app.utils import send_test_email
from app.tools.distance import check_distance
from app.tools.send_callback import location_callback
from app import tools

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
        
        # logging.warning(f'Looping... ^_^ User: {path}')
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
            
            
            
            while True:

                for point in points:
                    try:
                        UE = crud.ue.update_coordinates(db=db, lat=point["latitude"], long=point["longitude"], db_obj=UE)
                        cell_now = check_distance(UE.latitude, UE.longitude, jsonable_encoder(UE.Cell), json_cells) #calculate the distance from all the cells
                    except Exception as ex:
                        logging.warning("Failed to update coordinates")
                        logging.warning(ex)
                    
                    if UE.Cell_id != cell_now.get('id'): #Cell has changed in the db "handover"
                        logging.info(f"UE({UE.supi}) handovers to Cell {cell_now.get('id')}, {cell_now.get('description')}")
                        crud.ue.update(db=db, db_obj=UE, obj_in={"Cell_id" : cell_now.get('id')})
                        
                        #Retrieve the subscription of the UE by ipv4 | This could be outside while true but then the user cannot subscribe when the loop runs
                        sub = crud.monitoring.get_sub_ipv4(db=db, ipv4=UE.ip_address_v4)

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
                                        response = location_callback(cell_now.get('id'), UE.gNB_id, sub.notificationDestination)
                                        logging.debug(response)
                                    except requests.exceptions.ConnectionError as ex:
                                        logging.warning("Failed to send the callback request")
                                        logging.warning(ex)
                                        crud.monitoring.remove(db=db, id=sub.id)
                                        continue   
                            else:
                                crud.monitoring.remove(db=db, id=sub.id)
                                logging.warning("Subscription has expired (expiration date)")

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



router = APIRouter()


@router.post("/monitoring/callback")
def create_item(item: monitoringevent.MonitoringEventReport):
    logging.info(item)
    return {'ack' : 'TRUE'}

@router.post("/test-celery/", response_model=schemas.Msg, status_code=201)
def test_celery(
    msg: schemas.Msg,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Test Celery worker.
    """
    celery_app.send_task("app.worker.test_celery", args=[msg.msg])
    return {"msg": "Word received"}


@router.post("/test-email/", response_model=schemas.Msg, status_code=201)
def test_email(
    email_to: EmailStr,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Test emails.
    """
    send_test_email(email_to=email_to)
    return {"msg": "Test email sent"}

@router.post("/start-loop/", status_code=200)
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

@router.post("/stop-loop/", status_code=200)
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
    print(threads)
    try:
        return {"msg": threads[f"{supi}"][f"{current_user.id}"].is_alive()}
    except KeyError as ke:
        print('Key Not Found in Threads Dictionary:', ke)
        raise HTTPException(status_code=409, detail="There is no thread running for this UE! Please initiate a new thread")

    