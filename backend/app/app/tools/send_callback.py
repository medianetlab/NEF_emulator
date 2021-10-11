import requests
import json

def location_callback(cellid, gnbid, callbackurl):
    url = callbackurl

    payload = json.dumps({
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