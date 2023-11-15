import logging, json, os, requests
from evolved5g.sdk import CAPIFProviderConnector
from app.db.init_db import init_db
from app.db.session import SessionLocal
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init() -> None:
    db = SessionLocal()
    init_db(db)


def capif_nef_connector():
    """

    """
    try:
        capif_connector = CAPIFProviderConnector(certificates_folder="app/core/certificates",
                                                capif_host=settings.CAPIF_HOST,
                                                capif_http_port=settings.CAPIF_HTTP_PORT,
                                                capif_https_port=settings.CAPIF_HTTPS_PORT,
                                                capif_netapp_username="test_nef01",
                                                capif_netapp_password="test_netapp_password",
                                                description= "test_app_description",
                                                csr_common_name="apfExpapfoser1502", #TODO: ASK STAVROS. THIS SHOULD NOT BE HARDCODED, RIGHT?
                                                csr_organizational_unit="test_app_ou",
                                                csr_organization="test_app_o",
                                                crs_locality="Madrid",
                                                csr_state_or_province_name="Madrid",
                                                csr_country_name="ES",
                                                csr_email_address="test@example.com"
                                             )
                                                

        capif_connector.register_and_onboard_provider()

        capif_connector.publish_services(service_api_description_json_full_path="app/core/capif_files/service_monitoring_event.json")
        capif_connector.publish_services(service_api_description_json_full_path="app/core/capif_files/service_as_session_with_qos.json")
        return True
    except requests.exceptions.HTTPError as err:
        if err.response.status_code == 409:
            logger.error(f'"Http Error:", {err.response.json()}')
        return False
    except requests.exceptions.ConnectionError as err:
        logger.error(f'"Error Connecting:", {err}')    
        return False
    except requests.exceptions.Timeout as err:
        logger.error(f'"Timeout Error:", {err}')
        return False
    except requests.exceptions.RequestException as err:
        logger.error(f'"Error:", {err}')
        return False
    
def capif_service_description() -> None:

    try:
        ###MonitoringEvent 
        with open('app/core/capif_files/service_monitoring_event.json', 'r') as file:
            json_data = json.load(file)

        if os.environ.get("PRODUCTION") == "true":
            json_data["aefProfiles"][0].update({"domainName": os.environ.get("DOMAIN_NAME")})
            json_data["aefProfiles"][0].pop("interfaceDescriptions", None)
            updated_json_str = json.dumps(json_data)
        else:
            json_data["aefProfiles"][0].update({
                                                    "interfaceDescriptions": [{
                                                        "ipv4Addr": os.environ.get('NGINX_HOST'),
                                                        "port": int(os.environ.get('NGINX_HTTPS')),
                                                        "securityMethods": ["OAUTH"]
                                                    }]
                                                })
            json_data["aefProfiles"][0].pop("domainName", None)
            updated_json_str = json.dumps(json_data)

        with open('app/core/capif_files/service_monitoring_event.json', 'w') as file:
            file.write(updated_json_str)

        ###AsSessionWithQoS
        with open('app/core/capif_files/service_as_session_with_qos.json', 'r') as file:
            json_data = json.load(file)

 
        if os.environ.get("PRODUCTION") == "true":
            json_data["aefProfiles"][0].update({"domainName": os.environ.get("DOMAIN_NAME")})
            json_data["aefProfiles"][0].pop("interfaceDescriptions", None)

            updated_json_str = json.dumps(json_data)
        else:
            json_data["aefProfiles"][0].update({
                                                    "interfaceDescriptions": [{
                                                        "ipv4Addr": os.environ.get('NGINX_HOST'),
                                                        "port": int(os.environ.get('NGINX_HTTPS')),
                                                        "securityMethods": ["OAUTH"]
                                                    }]
                                                })
            json_data["aefProfiles"][0].pop("domainName", None)
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
    logger.info("Trying to connect with CAPIF Core Function")
    if capif_nef_connector():
        logger.info("Successfully onboard NEF in the CAPIF Core Function")
    else:
        logger.info("Failed to onboard NEF in the CAPIF Core Function")


if __name__ == "__main__":
    main()
