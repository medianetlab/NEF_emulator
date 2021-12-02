from typing import TYPE_CHECKING

#from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy import *
from sqlalchemy.orm import relationship
from app.db.base_class import Base

if TYPE_CHECKING:
    from .user import User  # noqa: F401


class Path(Base):
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, index=True)
    start_lat = Column(Float, index=True)
    start_long = Column(Float, index=True)
    end_lat= Column(Float, index=True)
    end_long = Column(Float, index=True)
    color = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("user.id"))
    owner = relationship("User", back_populates="Paths")

class Points(Base):
    id = Column(Integer, primary_key=True, index=True)    
    path_id = Column(Integer, ForeignKey("path.id"))
    latitude = Column(Float, index=True)
    longitude = Column(Float, index=True)
