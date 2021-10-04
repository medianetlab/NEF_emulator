from typing import List

from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session # this will allow you to declare the type of the db parameters and have better type checks and completion in your functions.

from app.crud.base import CRUDBase
from app.models.monitoringevent import Monitoring
from app.schemas.monitoringevent import subCreate, subUpdate
from app.schemas.UE import UECreate, UEUpdate


class CRUD_Monitoring(CRUDBase[Monitoring, subCreate, subUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: subCreate, owner_id: int
    ) -> Monitoring:
        obj_in_data = jsonable_encoder(obj_in.copy(exclude = {'monitoringEventReport'})) #exclude monitoringEventReport because model (table) Monitoring has not a column locationInfo
        db_obj = self.model(**obj_in_data, owner_id=owner_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Monitoring]:
        return (
            db.query(self.model)
            .filter(Monitoring.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
'''
class CRUD_LocationInfo(CRUDBase[LocationInfo, UECreate, UEUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: UECreate, owner_id: int
    ) -> LocationInfo:
        obj_in_data = jsonable_encoder(obj_in.copy(include = {'gNB_id', 'Cell_id'}))
        db_obj = self.model(**obj_in_data, owner_id=owner_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

   def get_multi_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Monitoring]:
        return (
            db.query(self.model)
            .filter(Monitoring.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

locationinfo = CRUD_LocationInfo(LocationInfo) #create objects to call in /endpoints
'''


monitoring = CRUD_Monitoring(Monitoring)
