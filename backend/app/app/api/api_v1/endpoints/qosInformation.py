from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Path, Request
from fastapi.responses import JSONResponse
from pymongo.database import Database
from sqlalchemy.orm.session import Session

from app import models
from app.api import deps
from app.core.config import qosSettings
from app.crud import crud_mongo, user, gnb

def qos_reference_match(qos_reference):
    
    qos_standardized = qosSettings.retrieve_settings()
    qos_characteristics = {}
        
    #Load the standardized 5qi values
    qos_5qi = qos_standardized.get('5qi')

    #Find the matched 5qi value
    for q in qos_5qi:
        if q.get('value') == qos_reference:
            qos_characteristics = q.copy()
            # print(f"Inside qos_reference_match at qosInformation.py {qos_characteristics}")
    
    if not qos_characteristics:
        raise HTTPException(status_code=400, detail=f"The 5QI (qosReference) {qos_reference} does not exist")
    else:
        return qos_characteristics

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

    if not json_data:
        raise HTTPException(status_code=404, detail="There are no available QoS Characteristics")
    else:
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



@router.get("/qosRules/{supi}", deprecated=True)
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




    
    
    


