import requests
import json
import logging

def location_callback(externaId, cellid, gnbid, callbackurl, subscription):
    url = callbackurl

    payload = json.dumps({
    "externalId" : externaId,
    "subscription" : subscription,
    "monitoringType": "LOCATION_REPORTING",
    "locationInfo": {
        "cellId": str(cellid),
        "enodeBId": str(gnbid)
    }
    })
    headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    
    return response