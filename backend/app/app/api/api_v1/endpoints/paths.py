import random
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

def get_random_point(db: Session, path_id: int):

    points = crud.points.get_points(db=db, path_id=path_id)
    points_json = jsonable_encoder(points)

    #Get the random index (this index should be within the range of points' list)
    random_index = random.randrange(0, len(points_json))

    return points_json[random_index]

@router.get("", response_model=List[schemas.Paths])
def read_paths(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve paths.
    """
    if crud.user.is_superuser(current_user):
        paths = crud.path.get_multi(db, skip=skip, limit=limit)
    else:
        paths = crud.path.get_multi_by_owner(
            db=db, owner_id=current_user.id, skip=skip, limit=limit
        )

    item_json = jsonable_encoder(paths)
    
    for json_path in item_json:
        for path in paths:
            if path.id == json_path.get('id'):
                json_path["start_point"] = {}
                json_path["end_point"] = {}
                json_path["start_point"]["latitude"] = path.start_lat
                json_path["start_point"]["longitude"] = path.start_long
                json_path["end_point"]["latitude"] = path.end_lat
                json_path["end_point"]["longitude"] = path.end_long

    return item_json


@router.post("", response_model=schemas.Path)
def create_path(
    *,
    db: Session = Depends(deps.get_db),
    path_in: schemas.PathCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new path.
    """
    path = crud.path.get_description(db=db, description= path_in.description)
    
    if path:
        raise HTTPException(status_code=400, detail=f"Path with description \'{path_in.description}\' already exists")
    
    path = crud.path.create_with_owner(db=db, obj_in=path_in, owner_id=current_user.id)
    crud.points.create(db=db, obj_in=path_in, path_id=path.id) 
    return path


@router.put("/{id}", response_model=schemas.Path)
def update_path(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    path_in: schemas.PathUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update an path.
    """
    path = crud.path.get(db=db, id=id)
    if not path:
        raise HTTPException(status_code=404, detail="Path not found")
    if not crud.user.is_superuser(current_user) and (path.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    path = crud.path.update(db=db, db_obj=path, obj_in=path_in)

    item_json = jsonable_encoder(path)
    item_json["start_point"] = {}
    item_json["end_point"] = {}
    item_json["start_point"]["latitude"] = path.start_lat
    item_json["start_point"]["longitude"] = path.start_long
    item_json["end_point"]["latitude"] = path.end_lat
    item_json["end_point"]["longitude"] = path.end_long

    return item_json


@router.get("/{id}", response_model=schemas.Path)
def read_path(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get path by ID.
    """
    path = crud.path.get(db=db, id=id)
    
    if not path:
        raise HTTPException(status_code=404, detail="Path not found")
    if not crud.user.is_superuser(current_user) and (path.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    item_json = jsonable_encoder(path)
    item_json["start_point"] = {}
    item_json["end_point"] = {}
    item_json["start_point"]["latitude"] = path.start_lat
    item_json["start_point"]["longitude"] = path.start_long
    item_json["end_point"]["latitude"] = path.end_lat
    item_json["end_point"]["longitude"] = path.end_long

    points = crud.points.get_points(db=db, path_id=path.id)
    item_json["points"] = []

    for obj in jsonable_encoder(points):
        item_json["points"].append({'latitude' : obj.get('latitude'), 'longitude' : obj.get('longitude')})
   
    return item_json


@router.delete("/{id}", response_model=schemas.Path)
def delete_path(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete an path.
    """
    path = crud.path.get(db=db, id=id)
    if not path:
        raise HTTPException(status_code=404, detail="Path not found")
    if not crud.user.is_superuser(current_user) and (path.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    crud.points.delete_points(db=db, path_id=id)    
    path = crud.path.remove(db=db, id=id)
    return path
