import requests
import json

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

    response = requests.request("POST", url, headers=headers, data=payload, timeout=5)
    
    return response

def qos_callback(callbackurl, resource, qos_status, ipv4):
    url = callbackurl

    payload = json.dumps({
    "transaction" : resource,
    "ipv4Addr" : ipv4,
    "eventReports": [
    {
      "event": qos_status,
      "accumulatedUsage": {
        "duration": None,
        "totalVolume": None,
        "downlinkVolume": None,
        "uplinkVolume": None
      },
      "appliedQosRef": None,
      "qosMonReports": [
        {
          "ulDelays": [
            0
          ],
          "dlDelays": [
            0
          ],
          "rtDelays": [
            0
          ]
        }
      ]
    }]
    })    
    
    
    headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload, timeout=5)
    
    return response