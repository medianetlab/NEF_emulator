from typing import TYPE_CHECKING

#from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy import *
from sqlalchemy.orm import relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from .user import User  # noqa: F401
    from .UE import UE  # noqa: F401
    from .gNB import gNB  # noqa: F401




class Cell(Base):
    # id for db/primary key
    id = Column(Integer, primary_key=True, index=True)

    #id of each cell
    cell_id = Column(String, index=True)

    # Name of each UE
    name = Column(String, index=True)

    # Description of each UE
    description = Column(String, index=True)

    owner_id = Column(Integer, ForeignKey("user.id"))

    # Relationship of owner -> 'User' Model
    owner = relationship("User", back_populates="Cells")

    ## Additional Columns
    # For Cell

    latitude = Column(Float, index=True)
    longitude = Column(Float, index=True)
    radius = Column(Float, index=True)
    gNB_id = Column(Integer, ForeignKey("gnb.id"))

    UE = relationship("UE", back_populates="Cell")

