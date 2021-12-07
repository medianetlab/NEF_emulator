from typing import TYPE_CHECKING
from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.base_class import Base

if TYPE_CHECKING:
    from .user import User  # noqa: F401
    from .UE import UE


class Monitoring(Base):
#The __tablename__ attribute tells SQLAlchemy the name of the table to use in the database for each of these models.
    id = Column(Integer, primary_key=True, index=True)
    link = Column(String, index=True)
    externalId = Column(String, index=True)
    notificationDestination = Column(String, index=True)
    monitoringType = Column(String, index=True)
    maximumNumberOfReports = Column(Integer, index=True)
    monitorExpireTime = Column(String, index=True)
    
    #Foreign keys
    owner_id = Column(Integer, ForeignKey("user.id"))