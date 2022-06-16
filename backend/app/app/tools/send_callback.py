import requests
import json

def location_callback(ue, callbackurl, subscription):
    url = callbackurl

    payload = json.dumps({
    "externalId" : ue.get("external_identifier"),
    "ipv4Addr" : ue.get("ip_address_v4"),
    "subscription" : subscription,
    "monitoringType": "LOCATION_REPORTING",
    "locationInfo": {
        "cellId": ue.get("cell_id_hex"),
        "enodeBId": ue.get("gNB_id_hex")
    }
    })
    headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json'
    }

    #Timeout values according to https://docs.python-requests.org/en/master/user/advanced/#timeouts 
    #First value of the tuple "3.05" corresponds to connect and second "27" to read timeouts 
    #(i.e., connect timeout means that the server is unreachable and read that the server is reachable but the client does not receive a response within 27 seconds)
    
    response = requests.request("POST", url, headers=headers, data=payload, timeout=(3.05, 27))
    
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

    #Timeout values according to https://docs.python-requests.org/en/master/user/advanced/#timeouts 
    #First value of the tuple "3.05" corresponds to connect and second "27" to read timeouts 
    #(i.e., connect timeout means that the server is unreachable and read that the server is reachable but the client does not receive a response within 27 seconds)
    
    response = requests.request("POST", url, headers=headers, data=payload, timeout=(3.05, 27))
    
    return response