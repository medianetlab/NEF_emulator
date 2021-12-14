from fastapi.encoders import jsonable_encoder
from fastapi.testclient import TestClient
from typing import Dict
from sqlalchemy.orm.session import Session
from app.core.config import settings
from app.schemas.gNB import gNBCreate

from app.tests.utils.utils import random_lower_string
from app import crud


def test_read_gNBs(client: TestClient, superuser_token_headers: Dict[str, str]):
    response = client.get(f'{settings.API_V1_STR}/gNBs',
                          headers=superuser_token_headers)
    assert response.status_code == 200


def test_create_gNB(client: TestClient, superuser_token_headers: Dict[str, str], db: Session):
    data = {"gNB_id": "000000",
            "name": random_lower_string(),
            "description": random_lower_string(),
            "location": random_lower_string()}
    response = client.post(f'{settings.API_V1_STR}/gNBs',
                           headers=superuser_token_headers, json=data)

    gnb_db_id = response.json().get('id')
    existing_gnb = crud.gnb.get(db=db, id=gnb_db_id)

    assert response.status_code == 200 or response.status_code == 409
    assert existing_gnb  # check if gnb created succesfully in the database

    crud.gnb.remove(db=db, id=gnb_db_id)


def test_update_existing_gNB(client: TestClient, superuser_token_headers: Dict[str, str], db: Session):
    gNB_id = "000000"
    name = random_lower_string()
    description = random_lower_string()
    location = random_lower_string()

    gNB_in = gNBCreate(gNB_id=gNB_id,
                       name=name,
                       description=description,
                       location=location)

    gNB = crud.gnb.create(db=db, obj_in=gNB_in)
    gnb_id = gNB.gNB_id

    data = {"gNB_id": "FFFFFF",
            "name": random_lower_string(),
            "description": random_lower_string(),
            "location": random_lower_string()}

    response = client.put(f'{settings.API_V1_STR}/gNBs/{gnb_id}',
                          headers=superuser_token_headers, json=data)

    updated_gnb = response.json()
    first_gnb = jsonable_encoder(gNB_in)

    #Check if the random values updated successfully
    for item1 in updated_gnb:
        for item2 in first_gnb:
            if item1 == item2:
                assert updated_gnb[item1] != first_gnb[item2]

    assert response.status_code == 200 or response.status_code == 404 or response.status_code == 400

    gnb_db_id = response.json().get('id')
    crud.gnb.remove(db=db, id=gnb_db_id)


def test_read_existing_gNB(client: TestClient, superuser_token_headers: Dict[str, str], db: Session):
    gNB_id = "000000"
    name = random_lower_string()
    description = random_lower_string()
    location = random_lower_string()

    gNB_in = gNBCreate(gNB_id=gNB_id,
                       name=name,
                       description=description,
                       location=location)
    gNB = crud.gnb.create(db=db, obj_in=gNB_in)
    gnb_id = gNB.gNB_id

    response = client.get(f'{settings.API_V1_STR}/gNBs/{gnb_id}',
                          headers=superuser_token_headers)
    
    api_gnb = response.json()
    existing_gnb = crud.gnb.get_gNB_id(db=db, id=gNB_id)

    assert response.status_code == 200 or response.status_code == 404 or response.status_code == 400
    assert existing_gnb
    assert existing_gnb.gNB_id == api_gnb['gNB_id']

    crud.gnb.remove(db=db, id=gNB.id)

def test_remove_existing_gNB(client: TestClient, superuser_token_headers: Dict[str, str], db: Session):
    gNB_id = "000000"
    name = random_lower_string()
    description = random_lower_string()
    location = random_lower_string()

    gNB_in = gNBCreate(gNB_id=gNB_id,
                       name=name,
                       description=description,
                       location=location)
    gNB = crud.gnb.create(db=db, obj_in=gNB_in)
    gnb_id = gNB.gNB_id

    response = client.delete(f'{settings.API_V1_STR}/gNBs/{gnb_id}',
                          headers=superuser_token_headers)
    
    api_gnb = response.json()
    existing_gnb = crud.gnb.get_gNB_id(db=db, id=gNB_id)

    assert response.status_code == 200 or response.status_code == 404 or response.status_code == 400 or response.status_code == 409
    assert existing_gnb == None
    assert gNB_id == api_gnb['gNB_id']
