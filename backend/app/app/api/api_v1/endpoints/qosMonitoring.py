from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Path
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app import tools
from app.core.config import settings

location_header = settings.BACKEND_CORS_ORIGINS[1] + settings.API_V1_STR + "/3gpp-as-session-with-qos/v1/" 

router = APIRouter()

@router.get("/{scsAsId}/subscriptions")
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
    return {"msg" : "test"}


@router.post("/{scsAsId}/subscriptions")
def create_item(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that creates a subscription", example="myNetapp"),
    db: Session = Depends(deps.get_db),
    item_in: schemas.AsSessionWithQoSSubscription,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new subscription.
    """
    return {"msg" : "test"}

@router.put("/{scsAsId}/subscriptions/{subscriptionId}")
def update_item(
    *,
    scsAsId: str = Path(..., title="The ID of the Netapp that creates a subscription", example="myNetapp"),
    subscriptionId: str = Path(..., title="Identifier of the subscription resource"),
    db: Session = Depends(deps.get_db),
    item_in: schemas.AsSessionWithQoSSubscription,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update/Replace an existing subscription resource
    """
    return {"msg" : "test"}
    

@router.get("/{scsAsId}/subscriptions/{subscriptionId}")
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
    return {"msg" : "test"}



@router.delete("/{scsAsId}/subscriptions/{subscriptionId}")
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
    return {"msg" : "test"}
    
    
