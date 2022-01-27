from typing import List
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.UE import UE
from app.schemas.UE import UECreate, UEUpdate


class CRUD_UE(CRUDBase[UE, UECreate, UEUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: UECreate, owner_id: int
    ) -> UE:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data, owner_id=owner_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[UE]:
        return (
            db.query(self.model)
            .filter(UE.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_supi(self, db: Session, supi: str) -> UE:
        return db.query(self.model).filter(self.model.supi == supi).first()

    def get_ipv4(
        self, db: Session, *, ipv4: str, owner_id: int
    ) -> UE:
        return (
            db.query(self.model)
            .filter(UE.ip_address_v4 == ipv4, UE.owner_id == owner_id)
            .first()
        )

    def get_ipv6(
        self, db: Session, *, ipv6: str, owner_id: int
    ) -> UE:
        return (
            db.query(self.model)
            .filter(UE.ip_address_v6 == ipv6, UE.owner_id == owner_id)
            .first()
        )

    def get_mac(
        self, db: Session, *, mac: str, owner_id: int
    ) -> UE:
        return (
            db.query(self.model)
            .filter(UE.mac_address == mac, UE.owner_id == owner_id)
            .first()
        )

    def get_externalId(
        self, db: Session, *, externalId: str, owner_id: int
    ) -> UE:
        return (
            db.query(self.model)
            .filter(UE.external_identifier == externalId, UE.owner_id == owner_id)
            .first()
        )

    def get_by_gNB(
        self, db: Session, *, gNB_id: int
    ) -> List[UE]:
        return (
            db.query(self.model)
            .filter(UE.gNB_id == gNB_id)
            .all()
        )

    def get_by_Cell(
        self, db: Session, *, cell_id: int
    ) -> List[UE]:
        return (
            db.query(self.model)
            .filter(UE.Cell_id == cell_id)
            .all()
        )

    def update_coordinates(
        self, db: Session, *, lat: float, long: float, db_obj: UE
    ) -> UE:
        setattr(db_obj, 'latitude', lat)
        setattr(db_obj, 'longitude', long)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove_supi(self, db: Session, *, supi: str) -> UE:
        print(f'"removing supi"{supi}')
        obj = db.query(self.model).filter(UE.supi == supi).first()
        print("Done")
        print(obj)
        db.delete(obj)
        db.commit()
        return obj


ue = CRUD_UE(UE)
