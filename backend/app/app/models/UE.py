from typing import TYPE_CHECKING

#from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy import *
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

    # Name of each UE
    name = Column(String, index=True)

    # Description of each UE
    description = Column(String, index=True)

    owner_id = Column(Integer, ForeignKey("user.id"))

    # Relationship of owner -> 'User' Model
    owner = relationship("User", back_populates="UEs")

    ## Additional Columns
    
    # IPv4 Address of the UE
    ip_address_v4 = Column(String, index=True)
    # IPv6 Address of the UE
    ip_address_v6 = Column(String, index=True)
    # MAC Address of the UE
    mac_address = Column(String, index=True)
    # DNN Address of the UE
    dnn = Column(String, index=True)
    mcc = Column(Integer, index=True)
    mnc = Column(Integer, index=True)
    external_identifier = Column(String, index=True)
    speed = Column(String, index=True)
    
    path_id = Column(Integer, ForeignKey("path.id"))
    latitude = Column(Float, index=True)
    longitude = Column(Float, index=True)

    gNB_id = Column(Integer, ForeignKey("gnb.id"))
    Cell_id = Column(Integer, ForeignKey("cell.id"))
