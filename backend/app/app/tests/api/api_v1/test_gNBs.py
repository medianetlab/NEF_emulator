import json
from fastapi.testclient import TestClient
from typing import Dict
from app.core.config import settings
from app.schemas.gNB import gNBCreate
from fastapi.encoders import jsonable_encoder


def test_read_gNBs(client: TestClient, normal_user_token_headers: Dict[str, str]):
    response = client.get(f'{settings.API_V1_STR}/gNBs',
                          headers=normal_user_token_headers)
    assert response.status_code == 200


def test_create_gNB(client: TestClient, normal_user_token_headers: Dict[str, str]):
    data = gNBCreate(gNB_id="AAAAAA",
                     name="string",
                     description="string",
                     location="string")
    response = client.post(f'{settings.API_V1_STR}/gNBs',
                           headers=normal_user_token_headers, json=jsonable_encoder(data))
    assert response.status_code == 200 or response.status_code == 409

def test_update_gNB(client: TestClient, normal_user_token_headers: Dict[str, str]):
    data = gNBCreate(gNB_id="AAAAAA",
                     name="updatedgNB",
                     description="string",
                     location="string")
    response = client.post(f'{settings.API_V1_STR}/gNBs',
                           headers=normal_user_token_headers, json=jsonable_encoder(data))
    assert response.status_code == 200 or response.status_code == 409

