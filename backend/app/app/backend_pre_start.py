import logging, requests
from evolved5g.sdk import CAPIFProviderConnector
from tenacity import after_log, before_log, retry, stop_after_attempt, wait_fixed
from app.db.session import SessionLocal
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

max_tries = 60
wait_seconds = 1


@retry(
    stop=stop_after_attempt(max_tries),
    wait=wait_fixed(wait_seconds),
    before=before_log(logger, logging.INFO),
    after=after_log(logger, logging.WARN),
)
def init() -> None:
    try:
        db = SessionLocal()
        # Try to create session to check if DB is awake
        db.execute("SELECT 1")
    except Exception as e:
        logger.error(e)
        raise e

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
    except requests.exceptions.HTTPError as err:
        if err.response.status_code == 409:
            logger.error(f'"Http Error:", {err.response.json()}')
    except requests.exceptions.ConnectionError as err:
        logger.error(f'"Error Connecting:", {err}')    
    except requests.exceptions.Timeout as err:
        logger.error(f'"Timeout Error:", {err}')
    except requests.exceptions.RequestException as err:
        logger.error(f'"Error:", {err}')
    
        
def main() -> None:
    logger.info("Initializing service")
    init()
    logger.info("Service finished initializing")
    logger.info("Trying to connect with CAPIF Core Function")
    capif_nef_connector()
    logger.info("Successfully onboard to CAPIF Core Function")


if __name__ == "__main__":
    main()
