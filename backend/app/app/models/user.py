from typing import TYPE_CHECKING

#from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy import *
from sqlalchemy.orm import relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    ## Import class Item from ./item.py file
    from .location_frontend import Path  # noqa: F401
    from .UE import UE  # noqa: F401
    from .gNB import gNB  # noqa: F401
    from .Cell import Cell  # noqa: F401


class User(Base):


    ## User.id: Sets type Integer, primary_key for Database to True, index to True.
    id = Column(Integer, primary_key=True, index=True)

    ## User.full_name: Sets type String, index to True.
    full_name = Column(String, index=True)

    ## User.email: Sets type to String, Allow only one email per user (unique=True), index to True, Cannot be Null.
    email = Column(String, unique=True, index=True, nullable=False)

    ## User.hashed_password: Sets type to String, Cannot be Null.
    hashed_password = Column(String, nullable=False)

    ## User.is_active: Sets type to Boolean, sets default value to True.
    is_active = Column(Boolean(), default=True)

    ## User.is_superuser: Sets type to Boolean, sets default value to False.
    is_superuser = Column(Boolean(), default=False)

    ## Create a relationship with Class 'Item' and variable 'owner'
    Paths = relationship("Path", back_populates="owner")

    UEs = relationship("UE", back_populates="owner")

    Cells = relationship("Cell", back_populates="owner")

    gNBs = relationship("gNB", back_populates="owner")


#list-like