import logging, json, os

from app.db.init_db import init_db
from app.db.session import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init() -> None:
    db = SessionLocal()
    init_db(db)

def capif_service_description() -> None:

    try:
        ###MonitoringEvent 
        with open('app/core/capif_files/service_monitoring_event.json', 'r') as file:
            json_data = json.load(file)

 
        json_data["aefProfiles"][0]['interfaceDescriptions'][0]["ipv4Addr"] = os.environ.get('NGINX_HOST')
        json_data["aefProfiles"][0]['interfaceDescriptions'][0]["port"] = int(os.environ.get('NGINX_HTTPS'))
        updated_json_str = json.dumps(json_data)

        with open('app/core/capif_files/service_monitoring_event.json', 'w') as file:
            file.write(updated_json_str)

        ###AsSessionWithQoS
        with open('app/core/capif_files/service_as_session_with_qos.json', 'r') as file:
            json_data = json.load(file)

 
        json_data["aefProfiles"][0]['interfaceDescriptions'][0]["ipv4Addr"] = os.environ.get('NGINX_HOST')
        json_data["aefProfiles"][0]['interfaceDescriptions'][0]["port"] = int(os.environ.get('NGINX_HTTPS'))
        updated_json_str = json.dumps(json_data)

        with open('app/core/capif_files/service_as_session_with_qos.json', 'w') as file:
            file.write(updated_json_str)

        print("Service description files successfully updated!!!")

    except FileNotFoundError:
        print("File not found. Please provide the correct JSON file path.")
    except json.JSONDecodeError:
        print("Invalid JSON format. Please ensure the service description file is correctly formatted.")
    except Exception as e:
        print("An error occurred:", str(e))

def main() -> None:
    logger.info("Creating initial data")
    init()
    capif_service_description()
    logger.info("Initial data created")


if __name__ == "__main__":
    main()
