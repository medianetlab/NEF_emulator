from typing import TYPE_CHECKING

#from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from .user import User  # noqa: F401
    from .gNB import gNB  # noqa: F401
    from .Cell import Cell  # noqa: F401


class UE(Base):
    # id for db/primary key
    id = Column(Integer, primary_key=True, index=True)

    #id for UE (representing IMSI)
    supi = Column(String, index=True)
    name = Column(String, index=True)
    description = Column(String, index=True)
    ip_address_v4 = Column(String, index=True)
    ip_address_v6 = Column(String, index=True)
    mac_address = Column(String, index=True)
    dnn = Column(String, index=True)
    mcc = Column(Integer, index=True)
    mnc = Column(Integer, index=True)
    external_identifier = Column(String, index=True)
    speed = Column(String, index=True)
    latitude = Column(Float, index=True)
    longitude = Column(Float, index=True)
    path_id = Column(Integer, index=True)
    state = Column(Boolean, index= True)

    #Foreign Keys
    owner_id = Column(Integer, ForeignKey("user.id"))
    gNB_id = Column(Integer, ForeignKey("gnb.id"))
    Cell_id = Column(Integer, ForeignKey("cell.id"))
    

    #Relationships
    owner = relationship("User", back_populates="UEs")
    Cell = relationship("Cell", back_populates="UE")
