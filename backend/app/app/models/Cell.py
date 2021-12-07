from typing import TYPE_CHECKING
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base_class import Base

if TYPE_CHECKING:
    from .user import User  # noqa: F401
    from .UE import UE  # noqa: F401
    from .gNB import gNB  # noqa: F401


class Cell(Base):
    # id for db/primary key
    id = Column(Integer, primary_key=True, index=True)

    #id of each cell in hexadecimal number
    cell_id = Column(String, index=True)
    name = Column(String, index=True)
    description = Column(String, index=True)
    latitude = Column(Float, index=True)
    longitude = Column(Float, index=True)
    radius = Column(Float, index=True)

    #Foreign Keys
    owner_id = Column(Integer, ForeignKey("user.id"))
    gNB_id = Column(Integer, ForeignKey("gnb.id"))

    # Relationships
    owner = relationship("User", back_populates="Cells")
    UE = relationship("UE", back_populates="Cell")
    gNB = relationship("gNB", back_populates="Cells")

