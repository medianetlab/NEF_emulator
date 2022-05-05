from pydantic import BaseModel, EmailStr
from app import schemas
from typing import List, Optional

class scenario(BaseModel):
    gNBs: List[schemas.gNBCreate]
    cells: List[schemas.CellCreate]
    UEs: List[schemas.UECreate]
    paths: List[schemas.Path]
    ue_path_association: List[schemas.ue_path]