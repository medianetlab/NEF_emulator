from evolved5g.sdk import CAPIFProviderConnector
import configparser
from dotenv import load_dotenv
import os

from CAPIFProvider import CAPIFProviderConnector
from CAPIFInvoker import CAPIFInvokerConnector
def init():
    config = configparser.ConfigParser()
    config.read('credentials.properties')

    username = config.get("credentials", "provider_username")
    password = config.get("credentials", "provider_password")
    description = config.get("credentials", "provider_description")
    cn = config.get("credentials", "provider_cn")

    load_dotenv('.env')
    capif_ip = os.getenv('CAPIF_HOST')
    capif_http_port = os.getenv('CAPIF_HTTP_PORT')
    capif_https_port = os.getenv('CAPIF_HTTPS_PORT')
    register_hostname = os.getenv('REGISTER_HOSTNAME')
    register_port = os.getenv('REGISTER_PORT')

    print(f"username = {username}")
    print(f"password = {password}")
    print(f"description = {description}")
    print(f"cn = {cn}")
    print(f"capif_ip = {capif_ip}")
    print(f"capif_http_port = {capif_http_port}")
    print(f"capif_https_port = {capif_https_port}")

    return username, password, description, cn, capif_ip, capif_http_port, capif_https_port, register_hostname, register_port

if __name__ == "__main__":
    username, password, description, cn, capif_ip, capif_http_port, capif_https_port , register_hostname, register_port= init()

    capif_connector = CAPIFProviderConnector(certificates_folder='certificates/',
                                            capif_host=capif_ip,
                                            capif_http_port=capif_http_port,
                                            capif_https_port=capif_https_port,
                                            capif_username=username,
                                            capif_password=password,
                                            register_hostname = register_hostname,
                                            register_port = register_port,
                                            description= description,
                                            csr_common_name=cn,
                                            csr_organizational_unit="test_app_ou",
                                            csr_organization="test_app_o",
                                            crs_locality="Athens",
                                            csr_state_or_province_name="Athens",
                                            csr_country_name="gr",
                                            csr_email_address="test@example.com"
                                            )

    # Step 1
    # Provider Onboarding
    capif_connector.register_and_onboard_provider()

    # Step 2
    # Service Publication
    capif_connector.publish_services("services/service_as_session_with_qos.json")
    capif_connector.publish_services("services/service_monitoring_event.json")
