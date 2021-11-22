import logging
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Path, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pymongo.database import Database
from sqlalchemy.orm.session import Session

from app import models, schemas
from app.api import deps
from app.core.config import qosSettings
from app.crud import crud_mongo, user, gnb
from app.api.api_v1.endpoints.utils import add_notifications

router = APIRouter()

@router.get("/qosCharacteristics")
def read_qos_characteristics(
    *,
    current_user: models.User = Depends(deps.get_current_active_user),
    http_request: Request
) -> Any:
    """
    Get the available QoS Characteristics
    """
    json_data = qosSettings.retrieve_settings()
    return json_data

@router.get("/qosProfiles/{gNB_id}")
def read_qos_active_profiles(
    *,
    gNB_id: str = Path(..., title="The ID of the gNB", example="AAAAA1"),
    current_user: models.User = Depends(deps.get_current_active_user),
    http_request: Request,
    db_mongo: Database = Depends(deps.get_mongo_db),
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Get the available QoS Characteristics
    """
    gNB = gnb.get_gNB_id(db=db, id=gNB_id)
    if not gNB:
        raise HTTPException(status_code=404, detail="gNB not found")
    if not user.is_superuser(current_user) and (gNB.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    retrieved_doc = crud_mongo.read_all_gNB_profiles(db_mongo, 'QoSProfile', gNB.gNB_id)

    if not retrieved_doc:
        raise HTTPException(status_code=404, detail=f"No QoS profiles for gNB {gNB.gNB_id}")
    else:
        return retrieved_doc



@router.get("/qosRules/{supi}")
def read_qos_active_rules(
    *,
    supi: str = Path(..., title="The subscription unique permanent identifier (SUPI) of the UE", example="202010000000001"),
    current_user: models.User = Depends(deps.get_current_active_user),
    http_request: Request
) -> Any:
    """
    Get the available QoS Characteristics
    """
    pass




    
    
    


