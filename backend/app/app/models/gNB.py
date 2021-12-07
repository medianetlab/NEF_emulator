from typing import TYPE_CHECKING
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

if TYPE_CHECKING:
    from .user import User  # noqa: F401
    from .UE import UE  # noqa: F401
    from .Cell import Cell  # noqa: F401


class gNB(Base):
    # id for db/primary key
    id = Column(Integer, primary_key=True, index=True)

    # id for gNB in hexadecimal number
    gNB_id = Column(String, index=True)
    name = Column(String, index=True)
    description = Column(String, index=True)
    location = Column(String, index=True)

    #Foreign Keys
    owner_id = Column(Integer, ForeignKey("user.id"))

    #Relationships
    owner = relationship("User", back_populates="gNBs")
    Cells = relationship("Cell", back_populates="gNB")
