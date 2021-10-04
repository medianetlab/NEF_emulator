from typing import List

from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session # this will allow you to declare the type of the db parameters and have better type checks and completion in your functions.
from sqlalchemy import asc
from app.crud.base import CRUDBase
from app.models.location_frontend import Path, Points
from app.schemas.location_frontend import PathCreate, PathUpdate


class CRUD_Path(CRUDBase[Path, PathCreate, PathUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: PathCreate, owner_id: int
    ) -> Path:
        obj_in_data = jsonable_encoder(obj_in.copy(exclude = {'points'}))
        obj_in_data.update({"start_lat" : obj_in_data["start_point"]["latitude"]})
        obj_in_data.update({"start_long" : obj_in_data["start_point"]["longitude"]})
        obj_in_data.update({"end_lat" : obj_in_data["end_point"]["latitude"]})
        obj_in_data.update({"end_long" : obj_in_data["end_point"]["longitude"]})
        obj_in_data.pop("start_point")
        obj_in_data.pop("end_point")

        print(obj_in_data)
        db_obj = self.model(**obj_in_data, owner_id=owner_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Path]:
        return (
            db.query(self.model)
            .filter(Path.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

class CRUD_Points(CRUDBase[Points, PathCreate, PathUpdate]):
    def create(
        self, db: Session, *, obj_in: PathCreate, path_id: int
    ) -> Points:
        obj_in_data = jsonable_encoder(obj_in.copy(include = {'points'}))
        

        for obj in obj_in_data["points"]:
            db_obj = self.model(**obj, path_id=path_id)
            db.add(db_obj)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_points(
        self, db: Session, *, path_id: int
    ) -> List[Points]:
        return (
            db.query(self.model)
            .filter(Points.path_id == path_id)
            .order_by(asc(Points.id))
            .all()
        )

points = CRUD_Points(Points)
path = CRUD_Path(Path)
