from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, pool_pre_ping=True, pool_size=150, max_overflow=20) #Create a db URL for SQLAlchemy in core/config.py/ Settings class 
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) #Each instance is a db session
