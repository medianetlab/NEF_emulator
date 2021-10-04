import threading, logging, time

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Path
from fastapi.encoders import jsonable_encoder
from pydantic.networks import EmailStr
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app import models, schemas, crud
from app.api import deps
from app.core.celery_app import celery_app
from app.utils import send_test_email

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
            
            UE = crud.ue.get_supi(db=db, supi=supi)
            if not UE:
                raise HTTPException(status_code=404, detail="UE not found")
            if not crud.user.is_superuser(current_user) and (UE.owner_id != current_user.id):
                raise HTTPException(status_code=400, detail="Not enough permissions")

            path = crud.path.get(db=db, id=UE.path_id)
            if not path:
                raise HTTPException(status_code=404, detail="Path not found")
            if not crud.user.is_superuser(current_user) and (path.owner_id != current_user.id):
                raise HTTPException(status_code=400, detail="Not enough permissions")

            points = crud.points.get_points(db=db, path_id=UE.path_id)
            points = jsonable_encoder(points)
            
            while True:
                logging.warning(f'Looping... ^_^ User: {supi}')
                logging.warning(f'Looping... ^_^ User: {current_user.id}')
                logging.warning(f'Looping... ^_^ User: {UE.latitude}')
                logging.warning(f'Looping... ^_^ User: {UE.longitude}')

                for point in points:
                    try:
                        UE = crud.ue.update_coordinates(db=db, lat=point["latitude"], long=point["longitude"], db_obj=UE)
                        # logging.warning("We are in...")
                    except Exception as ex:
                        logging.warning("Failed to update coordinates")
                        logging.warning(ex)
                    
                    logging.warning(f'User: {current_user.id} | UE: {supi} | Current location: latitude ={UE.latitude} | longitude = {UE.longitude} | Speed: {UE.speed}' )
                    
                    if UE.speed == 'LOW':
                        time.sleep(1)
                    elif UE.speed == 'HIGH':
                        time.sleep(0.5)
        
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

    