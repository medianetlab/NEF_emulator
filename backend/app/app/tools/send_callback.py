import requests, json, logging
from pymongo import MongoClient
from app.crud import crud_mongo, user
from app.api.api_v1.endpoints.qosInformation import qos_reference_match

def location_callback(ue, callbackurl, subscription):
    url = callbackurl

    payload = json.dumps({
    "externalId" : ue.get("external_identifier"),
    "ipv4Addr" : ue.get("ip_address_v4"),
    "subscription" : subscription,
    "monitoringType": "LOCATION_REPORTING",
    "locationInfo": {
        "cellId": ue.get("cell_id_hex"),
        "enodeBId": ue.get("gnb_id_hex")
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

def qos_notification_control(gbr_status: str, current_user, ipv4):
    client = MongoClient("mongodb://mongo:27017", username='root', password='pass')
    db = client.fastapi

    doc = crud_mongo.read(db, 'QoSMonitoring', 'ipv4Addr', ipv4)

    #Check if the document exists
    if not doc:
        logging.warning("AsSessionWithQoS subscription not found")
        return
    #If the document exists then validate the owner
    if not user.is_superuser(current_user) and (doc['owner_id'] != current_user.id):
        logging.info("Not enough permissions")
        return
    
    qos_standardized = qos_reference_match(doc.get('qosReference'))

    logging.critical(qos_standardized)
    logging.critical(qos_standardized.get('type'))

    logging.critical(doc.get('notificationDestination'))
    logging.critical(doc.get('link'))

    if qos_standardized.get('type') == 'GBR' or qos_standardized.get('type') == 'DC-GBR':
        try:
            logging.critical("Before response")
            response = qos_callback(doc.get('notificationDestination'), doc.get('link'), gbr_status, ipv4)
            logging.critical(f"Response from {doc.get('notificationDestination')}")
        except requests.exceptions.Timeout as ex:
            logging.critical("Failed to send the callback request")
            logging.critical(ex) 
        except requests.exceptions.TooManyRedirects as ex:
            logging.critical("Failed to send the callback request")
            logging.critical(ex) 
        except requests.exceptions.RequestException as ex:
            logging.critical("Failed to send the callback request")
            logging.critical(ex) 
    else:
        logging.critical('Non-GBR subscription')

    return
