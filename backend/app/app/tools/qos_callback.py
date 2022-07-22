import requests, json, logging
from app.crud import ue
from app.api.api_v1.endpoints.qosInformation import qos_reference_match
from app.db.session import SessionLocal
from fastapi.encoders import jsonable_encoder


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

def qos_notification_control(doc, ipv4, ues: dict, current_ue: dict):

    number_of_ues_in_cell = ues_in_cell(ues, current_ue)

    if number_of_ues_in_cell > 1:
      gbr_status = 'QOS_NOT_GUARANTEED' 
    else: 
      gbr_status= 'QOS_GUARANTEED'

    qos_standardized = qos_reference_match(doc.get('qosReference'))

    if qos_standardized.get('type') == 'GBR' or qos_standardized.get('type') == 'DC-GBR':
        try:
            # logging.critical("Before response")
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

def ues_in_cell(ues: dict, current_ue: dict):
  ues_connected = 0
 
  # Find running UEs belong in the same cell
  for single_ue in ues:
      if ues[single_ue]["Cell_id"] == current_ue["Cell_id"]:
          ues_connected += 1

  # Find stationary UEs belong in the same cell
  db = SessionLocal()
  
  ues_list = ue.get_by_Cell(db=db, cell_id=current_ue["Cell_id"])
  
  for ue_in_db in ues_list:
    #This means that we are searching only for ues that are not running
    #In db the last known location (cell_id) is valid only for UEs that are not running
    if jsonable_encoder(ue_in_db).get('supi') not in ues: 
      ues_connected += 1
   
  db.close()
  
  return ues_connected