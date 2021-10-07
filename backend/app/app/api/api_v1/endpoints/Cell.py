from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Path
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.tools.distance import check_distance

router = APIRouter()


@router.get("/", response_model=List[schemas.Cell])
def read_Cells(
    db: Session = Depends(deps.get_db),
    skip: int = 0 ,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve Cells.
    """
    # if crud.user.is_superuser(current_user):
    #     Cells = crud.cell.get_multi(db, skip=skip, limit=limit)
    # else:
    #     Cells = crud.cell.get_multi_by_owner(
    #         db=db, owner_id=current_user.id, skip=skip, limit=limit
    #     )
    Cells = crud.cell.get_multi_by_owner(
        db=db, owner_id=current_user.id, skip=skip, limit=limit
    )
    current_cell = check_distance(37.99849, 23.819539, 2, jsonable_encoder(Cells))
    print(f"Changed cell: {current_cell}")

    return Cells


@router.post("/", response_model=schemas.Cell)
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
    Cell = crud.cell.get_Cell_id(db=db, id=cell_id)
    if not Cell:
        raise HTTPException(status_code=404, detail="Cell not found")
    if not crud.user.is_superuser(current_user) and (Cell.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
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
    gNB_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get Cells of specifc gNB.
    """
    Cell = crud.cell.get_by_gNB_id(db=db, gNB_id=gNB_id, skip=skip, limit=limit)
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
