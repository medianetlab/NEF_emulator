from typing import Optional
from enum import Enum
from pydantic import BaseModel, constr, confloat, IPvAnyAddress
from pydantic.fields import Field

class Speed(str, Enum):
    stationary = "STATIONARY"
    low = "LOW"
    high = "HIGH"

# Shared properties
class UEBase(BaseModel):
    supi: constr(regex=r'^[0-9]{15,16}$')
    name: Optional[str] = None
    description: Optional[str] = None
    gNB_id: int
    Cell_id: int
    ip_address_v4: Optional[IPvAnyAddress] = "169.254.46.5" #When a model attribute has a default value, it is not required. Otherwise, it is required. Use None to make it optional
    ip_address_v6: Optional[IPvAnyAddress] = "fe80::349d:33ff:fe76:2cee"
    mac_address: Optional[str] = None
    dnn: Optional[str] = None
    mcc: Optional[int] = None
    mnc: Optional[int] = None
    external_identifier: Optional[str] = None
    latitude: confloat(ge=-90, le=90)
    longitude: confloat(ge=-180, le=180)
    speed: Speed = Field("LOW", description="This value decribes UE's speed. Possible values are \"STATIONARY\" (e.g, IoT device), \"LOW(e.g, pedestrian)\" and \"HIGH (e.g., vehicle)\"")
    path_id: Optional[int] = None

# Properties to receive on item creation
class UECreate(UEBase):
#    name: str
    pass


# Properties to receive on item update
class UEUpdate(UEBase):
    pass


# Properties shared by models stored in DB
class UEInDBBase(UEBase):
    name: str
    owner_id: int

    class Config:
        orm_mode = True


# Properties to return to client
class UE(UEInDBBase):
    id: Optional[int]


# Properties to return to client for all UEs
class UEs(UEBase):
    cell_id_hex: str
