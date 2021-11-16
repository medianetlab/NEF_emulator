import requests
import json
import logging

def location_callback(UE_model, callbackurl, subscription):
    url = callbackurl

    payload = json.dumps({
    "externalId" : UE_model.external_identifier,
    "ipv4Addr" : UE_model.ip_address_v4,
    "subscription" : subscription,
    "monitoringType": "LOCATION_REPORTING",
    "locationInfo": {
        "cellId": str(UE_model.Cell.cell_id),
        "enodeBId": str(UE_model.Cell.gNB.gNB_id)
    }
    })
    headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    
    return response