from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Path
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.api.api_v1.endpoints.utils import retrieve_ue_state 

router = APIRouter()

def exists(db, gNB_id, cell_id, path_id):
    gnb = crud.gnb.get(db=db, id=gNB_id)
    cell = crud.cell.get(db=db, id=cell_id)
    path = crud.path.get(db=db, id=path_id)

    if not gnb:
        raise HTTPException(status_code=409, detail="ERROR: This gNB_id you specified doesn't exist. Please create a new gNB with this gNB_id or use an existing gNB")
    elif not cell:
        raise HTTPException(status_code=409, detail="ERROR: This Cell_id you specified doesn't exist. Please create a new Cell with this Cell_id or use an existing Cell")
    elif not path:
        raise HTTPException(status_code=409, detail="ERROR: This path_id you specified doesn't exist. Please create a new path with this path_id or use an existing path")
    else:
        return path


@router.get("", response_model=List[schemas.UEs])
def read_UEs(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve UEs.
    """
    if crud.user.is_superuser(current_user):
        UEs = crud.ue.get_multi(db, skip=skip, limit=limit)
    else:
        UEs = crud.ue.get_multi_by_owner(
            db=db, owner_id=current_user.id, skip=skip, limit=limit
        )
    json_UEs = jsonable_encoder(UEs)

    for json_UE in json_UEs:
        for UE in UEs:
            if UE.Cell_id == json_UE.get('Cell_id'):
                json_UE.update({"cell_id_hex": UE.Cell.cell_id})

    return JSONResponse(content=json_UEs, status_code=200)


@router.post("", response_model=schemas.UE)
def create_UE(
    *,
    db: Session = Depends(deps.get_db),
    item_in: schemas.UECreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new UE.
    """
    #Validate Unique ids
    if crud.ue.get_supi(db=db, supi=item_in.supi):
        raise HTTPException(status_code=409, detail=f"UE with supi {item_in.supi} already exists")
    elif crud.ue.get_ipv4(db=db, ipv4=str(item_in.ip_address_v4), owner_id=current_user.id):
        raise HTTPException(status_code=409, detail=f"UE with ipv4 {str(item_in.ip_address_v4)} already exists")
    elif crud.ue.get_ipv6(db=db, ipv6=str(item_in.ip_address_v6.exploded), owner_id=current_user.id):
        raise HTTPException(status_code=409, detail=f"UE with ipv6 {str(item_in.ip_address_v6)} already exists")
    elif crud.ue.get_mac(db=db, mac=str(item_in.mac_address), owner_id=current_user.id):
        raise HTTPException(status_code=409, detail=f"UE with mac {str(item_in.mac_address)} already exists")
    elif crud.ue.get_externalId(db=db, externalId=item_in.external_identifier, owner_id=current_user.id):
        raise HTTPException(status_code=409, detail=f"UE with external id {str(item_in.mac_address)} already exists")
    
    path = exists(db=db, gNB_id = item_in.gNB_id, cell_id = item_in.Cell_id, path_id = item_in.path_id)
    
    json_data = jsonable_encoder(item_in)
    json_data['ip_address_v6'] = item_in.ip_address_v6.exploded 
    
    #Assign the initial coordinates (retrieved from path) to the UE
    json_data['latitude'] = path.start_lat 
    json_data['longitude'] = path.start_long 

    UE = crud.ue.create_with_owner(db=db, obj_in=json_data, owner_id=current_user.id)
    return UE


@router.put("/{supi}", response_model=schemas.UE)
def update_UE(
    *,
    db: Session = Depends(deps.get_db),
    supi: str = Path(..., description="The SUPI of the UE you want to update"),
    item_in: schemas.UEUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a UE.
    """
    UE = crud.ue.get_supi(db=db, supi=supi)
    if not UE:
        raise HTTPException(status_code=404, detail="UE not found")
    if not crud.user.is_superuser(current_user) and (UE.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    ipv4_str = str(item_in.ip_address_v4)
    ipv6_str = item_in.ip_address_v6.exploded

    if (UE.ip_address_v4 != ipv4_str) and crud.ue.get_ipv4(db=db, ipv4=ipv4_str, owner_id=current_user.id):
        raise HTTPException(status_code=409, detail=f"This ipv4 {ipv4_str} already exists")
    elif (UE.ip_address_v6 != ipv6_str) and crud.ue.get_ipv6(db=db, ipv6=ipv6_str, owner_id=current_user.id):
        raise HTTPException(status_code=409, detail=f"This ipv6 {ipv6_str} already exists")
    elif (UE.mac_address != item_in.mac_address) and crud.ue.get_mac(db=db, mac=str(item_in.mac_address), owner_id=current_user.id):
        raise HTTPException(status_code=409, detail=f"This mac {item_in.mac_address} already exists")
    elif (UE.external_identifier != item_in.external_identifier) and crud.ue.get_externalId(db=db, externalId=item_in.external_identifier, owner_id=current_user.id):
        raise HTTPException(status_code=409, detail=f"This external id {item_in.mac_address} already exists")

    path = exists(db=db, gNB_id = item_in.gNB_id, cell_id = item_in.Cell_id, path_id = item_in.path_id)

    #Check if UE is moving and the path is changed
    if retrieve_ue_state(supi, current_user.id) and (UE.path_id != item_in.path_id):
        raise HTTPException(status_code=400, detail=f"UE with SUPI {supi} is currently moving. You are not allowed to edit UE's path while it's moving")
    else:
        json_data = jsonable_encoder(item_in)
        json_data['ip_address_v4'] = str(item_in.ip_address_v4)
        json_data['ip_address_v6'] = str(item_in.ip_address_v6.exploded) 
        
        #Assign the initial coordinates (retrieved from path) to the UE
        json_data['latitude'] = path.start_lat 
        json_data['longitude'] = path.start_long
        UE = crud.ue.update(db=db, db_obj=UE, obj_in=json_data)
        return UE
        

@router.get("/{supi}", response_model=schemas.UE)
def read_UE(
    *,
    db: Session = Depends(deps.get_db),
    supi: str = Path(..., description="The SUPI of the UE you want to retrieve"),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get UE by supi.
    """
    UE = crud.ue.get_supi(db=db, supi=supi)
    if not UE:
        raise HTTPException(status_code=404, detail="UE not found")
    if not crud.user.is_superuser(current_user) and (UE.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return UE

### Get list of UEs of specific gNB

@router.get("/by_gNB/{gNB_id}", response_model=List[schemas.UE])
def read_gNB_id(
    *,
    db: Session = Depends(deps.get_db),
    gNB_id: str = Path(..., description="The gNB id of the gNB in hexadecimal format", example='AAAAA1'),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get gNB of specific UE.
    """
    gNB = crud.gnb.get_gNB_id(db=db, id=gNB_id)
    if not gNB:
        raise HTTPException(status_code=404, detail=f"gNB with id {gNB_id} not found")
    if not crud.user.is_superuser(current_user) and (gNB.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    UE = crud.ue.get_by_gNB(db=db, gNB_id=gNB.id)
    if not UE:
        raise HTTPException(status_code=404, detail="There are no UEs associated with this gNB")
    if not crud.user.is_superuser(current_user) and (UE.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return UE


### Get list of UEs of Specific Cells

@router.get("/by_Cell/{cell_id}", response_model=List[schemas.UE])
def read_UE_Cell(
    *,
    db: Session = Depends(deps.get_db),
    cell_id: str = Path(..., description="The cell id of the cell in hexadecimal format", example='AAAAA1001'),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get Cell of specifc UE.
    """
    cell = crud.cell.get_Cell_id(db=db, id=cell_id)
    if not cell:
        raise HTTPException(status_code=404, detail=f"Cell with id {cell_id} not found")
    if not crud.user.is_superuser(current_user) and (cell.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    UEs = crud.ue.get_by_Cell(db=db, cell_id=cell.id)
    if not UEs:
        raise HTTPException(status_code=404, detail="There are no UEs associated with this cell")
    if not crud.user.is_superuser(current_user) and (UEs.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return UEs

@router.delete("/{supi}", response_model=schemas.UE)
def delete_UE(
    *,
    db: Session = Depends(deps.get_db),
    supi: str = Path(..., description="The SUPI of the UE you want to delete"),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a UE.
    """
    UE = crud.ue.get_supi(db=db, supi=supi)
    if not UE:
        raise HTTPException(status_code=404, detail="UE not found")
    if not crud.user.is_superuser(current_user) and (UE.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    if retrieve_ue_state(supi, current_user.id):
        raise HTTPException(status_code=400, detail=f"UE with SUPI {supi} is currently moving. You are not allowed to remove a UE while it's moving")
    else:
        UE = crud.ue.remove_supi(db=db, supi=supi) 
        return UE
