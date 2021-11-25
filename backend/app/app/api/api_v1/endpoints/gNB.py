from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.param_functions import Path
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get("", response_model=List[schemas.gNB])
def read_gNBs(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve gNBs.
    """
    if crud.user.is_superuser(current_user):
        gNBs = crud.gnb.get_multi(db, skip=skip, limit=limit)
    else:
        gNBs = crud.gnb.get_multi_by_owner(
            db=db, owner_id=current_user.id, skip=skip, limit=limit
        )
    return gNBs


@router.post("", response_model=schemas.gNB)
def create_gNB(
    *,
    db: Session = Depends(deps.get_db),
    item_in: schemas.gNBCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new gNB.
    """
    try:
        gNB = crud.gnb.get_gNB_id(db=db, id=item_in.gNB_id)
    except:
        pass

    if gNB:
        raise HTTPException(status_code=409, detail="ERROR: gNB with this id already exists")
    elif not gNB:
        gNB = crud.gnb.create_with_owner(db=db, obj_in=item_in, owner_id=current_user.id)
        return gNB
    # else: 
    #     raise HTTPException(status_code=404, detail="ERROR: gNB with this id already exists")

    # if not gNB:
    #     gNB = crud.gnb.create_with_owner(db=db, obj_in=item_in, owner_id=current_user.id)
    #     return gNB
    # else:
    #     return "gNB with that id already exists"


@router.put("/{gNB_id}", response_model=schemas.gNB)
def update_gNB(
    *,
    db: Session = Depends(deps.get_db),
    gNB_id: str = Path(..., description="The gNB id of the gNB you want to update"),
    item_in: schemas.gNBUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a gNB.
    """
    gNB = crud.gnb.get_gNB_id(db=db, id=gNB_id)
    if not gNB:
        raise HTTPException(status_code=404, detail="gNB not found")
    if not crud.user.is_superuser(current_user) and (gNB.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    gNB = crud.gnb.update(db=db, db_obj=gNB, obj_in=item_in)
    return gNB


@router.get("/{gNB_id}", response_model=schemas.gNB)
def read_gNB(
    *,
    db: Session = Depends(deps.get_db),
    gNB_id: str = Path(..., description="The gNB id of the gNB you want to retrieve"),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get gNB by ID.
    """
    gNB = crud.gnb.get_gNB_id(db=db, id=gNB_id)
    if not gNB:
        raise HTTPException(status_code=404, detail="gNB not found")
    if not crud.user.is_superuser(current_user) and (gNB.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return gNB

### Get gNB of specifc Cell

# @router.get("/{gNB_Cell}", response_model=schemas.gNB)
# def read_gNB_Cell(
#     *,
#     db: Session = Depends(deps.get_db),
#     gNB_Cell: int,
#     current_user: models.User = Depends(deps.get_current_active_user),
# ) -> Any:
#     """
#     Get gNB of specifc Cell.
#     """
#     gNB_Cell = crud.gnb.get(db=db, gNB_Cell=gNB_Cell)
#     if not gNB_Cell:
#         raise HTTPException(status_code=404, detail="gNB for specific Cell not found")
#     if not crud.user.is_superuser(current_user) and (gNB_Cell.owner_id != current_user.id):
#         raise HTTPException(status_code=400, detail="Not enough permissions")
#     return gNB_Cell


### Get gNB of specifc UE

# @router.get("/{gNB_UE}", response_model=schemas.gNB)
# def read_gNB_UE(
#     *,
#     db: Session = Depends(deps.get_db),
#     gNB_UE: int,
#     current_user: models.User = Depends(deps.get_current_active_user),
# ) -> Any:
#     """
#     Get gNB of specifc UE.
#     """
#     gNB_UE = crud.gnb.get(db=db, gNB_UE=gNB_UE)
#     if not gNB_UE:
#         raise HTTPException(status_code=404, detail="gNB for specific Cell not found")
#     if not crud.user.is_superuser(current_user) and (gNB_UE.owner_id != current_user.id):
#         raise HTTPException(status_code=400, detail="Not enough permissions")
#     return gNB_UE

@router.delete("/{gNB_id}", response_model=schemas.gNB)
def delete_gNB(
    *,
    db: Session = Depends(deps.get_db),
    gNB_id: str = Path(..., description="The gNB id of the gNB you want to delete"),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a gNB.
    """
    gNB = crud.gnb.get_gNB_id(db=db, id=gNB_id)
    if not gNB:
        raise HTTPException(status_code=404, detail="gNB not found")
    if not crud.user.is_superuser(current_user) and (gNB.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    try:
        gNB = crud.gnb.remove_by_gNB_id(db=db, id=gNB_id)
    except:
        raise HTTPException(status_code=409, detail="Foreign key violation! gNB id is still referenced from another table")

    return gNB
