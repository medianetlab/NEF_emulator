import requests
import json
import logging

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

    try:
        response = requests.request("POST", url, headers=headers, data=payload)
    except Exception as ex:
        logging.warning("Failed to send the callback request")
        logging.warning(ex)
    finally:
        return response