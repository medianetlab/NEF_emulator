import threading, logging, time

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Path
from fastapi.encoders import jsonable_encoder
from pydantic.networks import EmailStr
from sqlalchemy.orm import Session

from app import models, schemas, crud
from app.api import deps
from app.core.celery_app import celery_app
from app.utils import send_test_email


class BackgroundTasks(threading.Thread):

    def __init__(self, group=None, target=None, name=None, args=(), kwargs=None): 
        super().__init__(group=group, target=target,  name=name)
        self._args = args
        self._kwargs = kwargs
        self._stop_threads = False
        return

    def run(self):
        logging.warning(f'Looping... ^_^ User: {jsonable_encoder(self._args[1])}')
        while True:
            logging.warning(f'Looping... ^_^ User: {self._args[0]}')
            logging.warning(f'Looping... ^_^ User: {self._args[2]}')
            time.sleep(2)
            if self._stop_threads:
                print("Stopping the thread...")
                break   
        return

    def stop(self):
        self._stop_threads = True

#Dictionary holding threads that are running per user id.
threads = {}

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

@router.post("/start-loop/{path_id}", status_code=201)
def initiate_movement(
    *,
    msg: schemas.Msg,
    db: Session = Depends(deps.get_db),
    path_id: int = Path(..., title="The ID of the pre-defined path"),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Start the loop.
    """
    UE = crud.ue.get_supi(db=db, supi=msg.supi)
    if not UE:
        raise HTTPException(status_code=404, detail="UE not found")
    if not crud.user.is_superuser(current_user) and (UE.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    path = crud.path.get(db=db, id=path_id)
    if not path:
        raise HTTPException(status_code=404, detail="Path not found")
    if not crud.user.is_superuser(current_user) and (path.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    points = crud.points.get_points(db=db, path_id=path_id)
    
    t = BackgroundTasks(args= (current_user.id, points, UE.supi))
    t.user = current_user.id
    threads[f"{current_user.id}"] = {}
    threads[f"{current_user.id}"]["thread"] = t
    t.start()
    print(threads)
    return {"msg": "Loop started"}

@router.post("/stop-loop/", status_code=201)
def terminate_movement(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Stop the loop.
    """
    try:
        threads[f"{current_user.id}"]["thread"].stop() 
        threads[f"{current_user.id}"]["thread"].join()
        return {"msg": "Loop ended"}
    except KeyError as ke:
        print('Key Not Found in Threads Dictionary:', ke)
        raise HTTPException(status_code=409, detail="There is no thread running for this user! Please initiate a new thread")

@router.get("/state-loop/", status_code=200)
def state_movement(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get the state
    """
    print(threads)
    try:
        return {"msg": threads[f"{current_user.id}"]["thread"].is_alive()}
    except KeyError as ke:
        print('Key Not Found in Threads Dictionary:', ke)
        raise HTTPException(status_code=409, detail="There is no thread running for this user! Please initiate a new thread")

    