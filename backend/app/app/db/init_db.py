import logging, json
from sqlalchemy.orm import Session
from app import crud, schemas
from app.core.config import settings
from app.db import base  # noqa: F401
from app.db.base_class import Base  # noqa
from app.db.session import *
from fastapi.encoders import jsonable_encoder
from app.api.simulation.paths import get_random_point
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

    # user = crud.user.get_by_email(db, email='user@my-email.com')
    # if not user:
    #     user_in = schemas.UserCreate(
    #         email='user@my-email.com',
    #         password='pass',
    #         is_superuser=False,
    #     )
    #     user = crud.user.create(db, obj_in=user_in) 

    try:
        with open('/app/app/db/basic_scenario.json', 'r') as file:
            scenario_in = json.load(file)
            gNBs = scenario_in.get("gNBs")
            cells = scenario_in.get("cells")
            ues = scenario_in.get("UEs")
            paths = scenario_in.get("paths")
            ue_path_association = scenario_in.get("ue_path_association")
    except FileNotFoundError:
        logging.debug("File not found. Please make sure the file exists and check the file path.")
   
    db.execute('TRUNCATE TABLE cell, gnb, path, points, ue RESTART IDENTITY')
    
    for gNB_in in gNBs:
        gNB = crud.gnb.create_with_owner(db=db, obj_in=gNB_in, owner_id=user.id)

    for cell_in in cells:
        cell = crud.cell.create_with_owner(db=db, obj_in=cell_in, owner_id=user.id)

    for ue_in in ues:
        ue = crud.ue.create_with_owner(db=db, obj_in=ue_in, owner_id=user.id)

    for path_in in paths:
        path = crud.path.create_with_owner(db=db, obj_in=path_in, owner_id=user.id)
        crud.points.create(db=db, obj_in=path_in, path_id=path.id) 
        
        for ue_path in ue_path_association:
            #Assign the coordinates
            UE = crud.ue.get_supi(db=db, supi=ue_path.get("supi"))
            json_data = jsonable_encoder(UE)
            
            json_data['path_id'] = path.id
            random_point = get_random_point(db, path.id)
            json_data['latitude'] = random_point.get('latitude')
            json_data['longitude'] = random_point.get('longitude')
            
            crud.ue.update(db=db, db_obj=UE, obj_in=json_data)
    
    return