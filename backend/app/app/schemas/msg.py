from pydantic import BaseModel, constr


class Msg(BaseModel):
    supi: constr(regex=r'^[0-9]{15,16}$')