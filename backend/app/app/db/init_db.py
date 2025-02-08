import logging
import json
import requests
from sqlalchemy.orm import Session
from app import crud, schemas
from app.core.config import settings
from app.db import base  # noqa: F401
from app.db.base_class import Base  # noqa
from app.db.session import *
from fastapi.encoders import jsonable_encoder
from app.api.api_v1.endpoints.paths import get_random_point

def init_db(db: Session) -> None:
    # Tables should be created with Alembic migrations
    Base.metadata.create_all(bind=engine)

    # Create the superuser if it doesn't exist
    user = crud.user.get_by_email(db, email=settings.FIRST_SUPERUSER)
    if not user:
        user_in = schemas.UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = crud.user.create(db, obj_in=user_in)

    # Fetch API data
    url = 'http://10.220.2.106:5000/001010123456789/device-location'
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for bad status codes
        api_data = response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching API data: {e}")
        api_data = {}  # Use an empty dictionary in case of failure

    # Load the local scenario data
    try:
        with open('/app/app/db/real.json', 'r') as file:
            scenario_in = json.load(file)
            gNBs = scenario_in.get("gNBs", [])
            cells = scenario_in.get("cells", [])
            ues = scenario_in.get("UEs", [])
            paths = scenario_in.get("paths", [])
            ue_path_association = scenario_in.get("ue_path_association", [])
    except FileNotFoundError:
        logging.debug("File not found. Please make sure the file exists and check the file path.")
        gNBs, cells, ues, paths, ue_path_association = [], [], [], [], []

    # Truncate tables before inserting new data
    db.execute('TRUNCATE TABLE cell, gnb, path, points, ue RESTART IDENTITY')

    # Insert gNB data
    for gNB_in in gNBs:
        gnb_data = {**gNB_in, "description" : "Amarisoft gNB", "location": "Institute of Informatics and Telecommunications"}
        crud.gnb.create_with_owner(db=db, obj_in=gNB_in, owner_id=user.id)

    # Insert cell data
    for cell_in in cells:
        cell_data = {**cell_in, "cell_id": api_data.get("ncgi", {}).get("nrCellId","cell_id"), "name": "Amarisoft Cell"}
        if api_data.get("latlong", {}).get("latlong"):
            cell_data["latitude"] = api_data["latlong"]["latlong"][0]
            cell_data["longitude"] = api_data["latlong"]["latlong"][1]
        crud.cell.create_with_owner(db=db, obj_in=cell_data, owner_id=user.id)

    # Insert UE data and merge API data
    for ue_in in ues:
        # Add API data to each UE (or merge in a custom way)
        ue_data = {**ue_in, "supi": api_data.get("ueId", "default_supi"), "name": "Huawei P40" 
        ,"external_identifier": '001010123456789@domain.com', 
        "mcc": api_data.get("ncgi", {}).get("plmnId", {}).get("mcc", "mcc"),
        "mnc": api_data.get("ncgi", {}).get("plmnId", {}).get("mnc", "mnc")}
        crud.ue.create_with_owner(db=db, obj_in=ue_data, owner_id=user.id)

    # Insert path data and assign coordinates
    for path_in in paths:
        path = crud.path.create_with_owner(db=db, obj_in=path_in, owner_id=user.id)
        crud.points.create(db=db, obj_in=path_in, path_id=path.id)

        for ue_path in ue_path_association:
            # Assign coordinates to the UE based on the path
            UE = crud.ue.get_supi(db=db, supi=ue_path.get("supi"))
            if UE:
                json_data = jsonable_encoder(UE)
                json_data['path_id'] = path.id
                random_point = get_random_point(db, path.id)
                json_data['latitude'] = random_point.get('latitude')
                json_data['longitude'] = random_point.get('longitude')
                crud.ue.update(db=db, db_obj=UE, obj_in=json_data)
            else:
                logging.warning(f"UE with SUPI {ue_path.get('supi')} not found. Skipping.")

    return