from .crud_path import path, points
from .crud_user import user
from .crud_gNB import gnb
from .crud_Cell import cell
from .crud_UE import ue
from .crud_monitoringevent import monitoring

# For a new basic set of CRUD operations you could just do

# from .base import CRUDBase
# from app.models.item import Item
# from app.schemas.item import ItemCreate, ItemUpdate

# item = CRUDBase[Item, ItemCreate, ItemUpdate](Item)
