import logging
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Path, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pymongo.database import Database

from app import models, schemas
from app.api import deps
from app.core.config import qosSettings
from app.crud import crud_mongo, user
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


    
    
    


