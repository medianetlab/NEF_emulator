from typing import List

from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy.sql import text

from app.crud.base import CRUDBase
from app.models.Cell import Cell
from app.schemas.Cell import CellCreate, CellUpdate


class CRUD_Cell(CRUDBase[Cell, CellCreate, CellUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: CellCreate, owner_id: int
    ) -> Cell:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data, owner_id=owner_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Cell]:
        return (
            db.query(self.model)
            .filter(Cell.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_Cell_id(self, db: Session, id: str) -> Cell:
        return db.query(self.model).filter(self.model.cell_id == id).first()

    def get_by_gNB_id(
        self, db: Session, *, gNB_id: int
    ) -> List[Cell]:
        return (
            db.query(Cell)
            .filter(Cell.gNB_id == gNB_id)
            .all()
        )
    
    def remove_by_cell_id(self, db: Session, *, cell_id: str) -> Cell:
        obj = db.query(self.model).filter(Cell.cell_id == cell_id).first()
        db.delete(obj)
        db.commit()
        return obj

    # def get_by_UE(
    #     self, db: Session, *, Cell_UEs: int, skip: int = 0, limit: int = 100
    # ) -> List[Cell]:
    #     return (
    #         db.query(self.model)
    #         .filter(Cell.Cell_UEs == Cell_UEs)
    #         .offset(skip)
    #         .limit(limit)
    #         .all()
    #     )

cell = CRUD_Cell(Cell)
