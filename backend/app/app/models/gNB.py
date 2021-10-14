from typing import TYPE_CHECKING

#from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy import *
from sqlalchemy.orm import relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from .user import User  # noqa: F401
    from .UE import UE  # noqa: F401
    from .Cell import Cell  # noqa: F401



class gNB(Base):
    # id for db/primary key
    id = Column(Integer, primary_key=True, index=True)

    # id for gNB
    gNB_id = Column(String, index=True)

    # Name of each UE (for the emulator)
    name = Column(String, index=True)

    # Description of each UE (for the emulator)
    description = Column(String, index=True)

    owner_id = Column(Integer, ForeignKey("user.id"))

    # Relationship of owner -> 'User' Model 
    owner = relationship("User", back_populates="gNBs")

    ## Additional Columns
    # For gNB

    location = Column(String, index=True)
    Cells = relationship("Cell", back_populates="gNB")
    
