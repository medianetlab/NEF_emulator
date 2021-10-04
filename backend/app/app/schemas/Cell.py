from typing import Optional

from pydantic import BaseModel, constr


# Shared properties
class CellBase(BaseModel):
    cell_id: constr(regex=r'^[A-Fa-f0-9]{9}$')
    name: Optional[str] = None
    description: Optional[str] = None
    gNB_id: int = None
    
# Properties to receive on item creation
class CellCreate(CellBase):
    name: str


# Properties to receive on item update
class CellUpdate(CellBase):
    pass


# Properties shared by models stored in DB
class CellInDBBase(CellBase):
    name: Optional[str]
    owner_id: Optional[int]
    gNB_id: Optional[int]

    class Config:
        orm_mode = True


# Properties to return to client
class Cell(CellInDBBase):
    id: Optional[int]


# Properties properties stored in DB
class CellInDB(CellInDBBase):
    pass
