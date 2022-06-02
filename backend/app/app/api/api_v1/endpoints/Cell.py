from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps
from app.api.api_v1.endpoints.utils import retrieve_ue_state

router = APIRouter()


@router.get("", response_model=List[schemas.Cell])
def read_Cells(
    db: Session = Depends(deps.get_db),
    skip: int = 0 ,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve Cells.
    """
    if crud.user.is_superuser(current_user):
        Cells = crud.cell.get_multi(db, skip=skip, limit=limit)
    else:
        Cells = crud.cell.get_multi_by_owner(
            db=db, owner_id=current_user.id, skip=skip, limit=limit
        )
    return Cells


@router.post("", response_model=schemas.Cell)
def create_Cell(
    *,
    db: Session = Depends(deps.get_db),
    item_in: schemas.CellCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new cell.
    """
    try:
        Cell = crud.cell.get_Cell_id(db=db, id=item_in.cell_id)
    except:
        pass
    
    try:
        gNB = crud.gnb.get(db=db, id=item_in.gNB_id)
    except:
        pass

    if Cell:
        raise HTTPException(status_code=409, detail="ERROR: Cell with this id already exists")
    elif not gNB:
        raise HTTPException(status_code=409, detail="ERROR: This gNB_id you specified doesn't exist. Please create a new gNB with this gNB_id or use an existing gNB")
    elif not Cell:
        Cell = crud.cell.create_with_owner(db=db, obj_in=item_in, owner_id=current_user.id)
        return Cell

@router.put("/{cell_id}", response_model=schemas.Cell)
def update_Cell(
    *,
    db: Session = Depends(deps.get_db),
    cell_id: str = Path(..., description="The cell id of the cell you want to update"),
    item_in: schemas.CellUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a cell.
    """
    UEs = crud.ue.get_multi_by_owner(db=db, owner_id=current_user.id, skip=0, limit=1000)

    for ue in UEs:
        if retrieve_ue_state(ue.supi, current_user.id):
            raise HTTPException(status_code=400, detail="You are not allowed to edit cells while UEs are moving")

    Cell = crud.cell.get_Cell_id(db=db, id=cell_id)
    if not Cell:
        raise HTTPException(status_code=404, detail="Cell not found")
    if not crud.user.is_superuser(current_user) and (Cell.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    
    #check if the requested cell_id (hex) exists in db
    if item_in.cell_id != cell_id:
        cells = crud.cell.get_multi_by_owner(db=db, owner_id=current_user.id, skip=0, limit=100)
        for cell_in in cells:
            if item_in.cell_id == cell_in.cell_id:
                raise HTTPException(status_code=409, detail=f"Cell with id {item_in.cell_id} already exists")
        
    Cell = crud.cell.update(db=db, db_obj=Cell, obj_in=item_in)
    return Cell


@router.get("/{cell_id}", response_model=schemas.Cell)
def read_Cell(
    *,
    db: Session = Depends(deps.get_db),
    cell_id: str = Path(..., description="The cell id of the cell you want to retrieve"),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get Cell by ID.
    """
    Cell = crud.cell.get_Cell_id(db=db, id=cell_id)
    if not Cell:
        raise HTTPException(status_code=404, detail="Cell not found")
    if not crud.user.is_superuser(current_user) and (Cell.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return Cell

### Get Cells of specifc gNB

@router.get("/by_gNB/{gNB_id}", response_model=List[schemas.Cell])
def get_by_gNB_id(
    *,
    db: Session = Depends(deps.get_db),
    gNB_id: str = Path(..., description="The gNB id of the gNB in hexadecimal format", example='AAAAA1'),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get Cells of specifc gNB.
    """
    gNB = crud.gnb.get_gNB_id(db=db, id=gNB_id)
    if not gNB:
        raise HTTPException(status_code=404, detail=f"gNB with id {gNB_id} not found")
    if not crud.user.is_superuser(current_user) and (gNB.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    Cell = crud.cell.get_by_gNB_id(db=db, gNB_id=gNB.id)
    if not Cell:
        raise HTTPException(status_code=404, detail="Cell for specific gNB not found")
    if not crud.user.is_superuser(current_user) and (Cell.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return Cell


### Get Cell of specifc UE

# @router.get("/{Cell_UE}", response_model=schemas.Cell)
# def read_Cell_UE(
#     *,
#     db: Session = Depends(deps.get_db),
#     Cell_UE: int,
#     current_user: models.User = Depends(deps.get_current_active_user),
# ) -> Any:
#     """
#     Get Cell of specifc UE.
#     """
#     Cell_UE = crud.cell.get(db=db, Cell_UE=Cell_UE)
#     if not Cell_UE:
#         raise HTTPException(status_code=404, detail="Cell for specific UE not found")
#     if not crud.user.is_superuser(current_user) and (Cell_UE.owner_id != current_user.id):
#         raise HTTPException(status_code=400, detail="Not enough permissions")
#     return Cell_UE

@router.delete("/{cell_id}", response_model=schemas.Cell)
def delete_Cell(
    *,
    db: Session = Depends(deps.get_db),
    cell_id: str = Path(..., description="The cell id of the cell you want to delete"),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a cell.
    """
    Cell = crud.cell.get_Cell_id(db=db, id=cell_id)
    if not Cell:
        raise HTTPException(status_code=404, detail="Cell not found")
    if not crud.user.is_superuser(current_user) and (Cell.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    try:
        Cell = crud.cell.remove_by_cell_id(db=db, cell_id=cell_id)
    except:
        raise HTTPException(status_code=409, detail="Foreign key violation! Cell id is still referenced from another table")
    
    
    return Cell
