import csv
from sqlalchemy.orm import Session

from app import crud, schemas
from app.core.config import settings
from app.db import base  # noqa: F401
from app.db.base_class import Base  # noqa
from app.db.session import *
from fastapi.encoders import jsonable_encoder
# make sure all SQL Alchemy models are imported (app.db.base) before initializing DB
# otherwise, SQL Alchemy might fail to initialize relationships properly
# for more details: https://github.com/tiangolo/full-stack-fastapi-postgresql/issues/28


def init_db(db: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next line
    Base.metadata.create_all(bind=engine)

    user = crud.user.get_by_email(db, email=settings.FIRST_SUPERUSER)
    if not user:
        user_in = schemas.UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = crud.user.create(db, obj_in=user_in)  # noqa: F841

    #If you don't want to initialize the db, every time the backend container starts, comment the code below
    """ UE = crud.ue.get_multi_by_owner(db=db, owner_id=1, skip=0, limit= 1)
    Cell = crud.cell.get_multi_by_owner(db=db, owner_id=1, skip=0, limit= 1)
    gNB = crud.gnb.get_multi_by_owner(db=db, owner_id=1, skip=0, limit= 1)
    
    if not UE and not Cell and not gNB:
        crud.ue.remove_all_by_owner(db=db, owner_id=1)
        crud.cell.remove_all_by_owner(db=db, owner_id=1)
        crud.gnb.remove_all_by_owner(db=db, owner_id=1)
    
        with open('app/db/input_data.csv') as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')
            line_count = 0
            for row in csv_reader:
                if line_count == 0:
                    print("Initializing gNBs in db...")
                    line_count += 1
                elif 0 < line_count < 7:
    #               print(f'\t{row[0]}{row[1]}{row[2]}{row[3]}')
                    gNB_in = schemas.gNBCreate(
                        gNB_id=row[0].strip(),
                        name=row[1].strip(),
                        description=row[2].strip(),
                        location=row[3].strip(),
                    )
                    crud.gnb.create_with_owner(db=db, obj_in=gNB_in, owner_id=1)
                    line_count += 1
                elif line_count == 7:
                    print("Initializing Cells in db...")
                    line_count += 1
                elif 7 < line_count < 26:
    #               print(f'\t{row[0]}{row[1]}{row[2]}{row[3]}')
                    cell_in = schemas.CellCreate(
                        cell_id=row[0].strip(),
                        name=row[1].strip(),
                        description=row[2].strip(),
                        gNB_id=int(row[3]),
                    )
                    crud.cell.create_with_owner(db=db, obj_in=cell_in, owner_id=1)
                    line_count += 1
                elif line_count == 26:
                    print("Initializing UEs in db...")
                    line_count += 1
                else:
    #               print(f'\t{row[0]}{row[1]}{row[2]}{row[3]}{row[4]}{row[5]}{row[6]}{row[7]}{row[8]}{row[9]}{row[10]}')
                    line_count += 1
                    UE_in=schemas.UECreate(
                        supi=row[0].strip(),
                        name=row[1].strip(),
                        description=row[2].strip(),
                        ip_address_v4=row[3].strip(),
                        ip_address_v6=row[4].strip(),
                        mac_address=row[5].strip(),
                        dnn=row[6].strip(),
                        mcc=int(row[7]),
                        mnc=int(row[8]),
                        external_identifier=row[9].strip(),
                        gNB_id=int(row[10]),
                        Cell_id=int(row[11]),
                        speed=row[12].strip(),
                        path_id = int(row[13]),
                        latitude = float(row[14]),
                        longitude = float(row[15]),
                    )
                    crud.ue.create_with_owner(db=db, obj_in=UE_in, owner_id=1)
            print(f'Processed {line_count} lines.') """
