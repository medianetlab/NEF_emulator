import configparser
from dotenv import load_dotenv
import os
from CAPIFProvider import CAPIFProviderConnector


def load_credentials(config_path='credentials.properties'):
    config = configparser.ConfigParser()
    config.read(config_path)
    
    return {
        'username': config.get("credentials", "provider_username"),
        'password': config.get("credentials", "provider_password"),
        'description': config.get("credentials", "provider_description"),
        'cn': config.get("credentials", "provider_cn")
    }


def load_env_vars(env_path='.env'):
    load_dotenv(env_path)
    
    return {
        'capif_ip': os.getenv('CAPIF_HOST'),
        'capif_http_port': os.getenv('CAPIF_HTTP_PORT'),
        'capif_https_port': os.getenv('CAPIF_HTTPS_PORT'),
        'register_hostname': os.getenv('REGISTER_HOSTNAME'),
        'register_port': os.getenv('REGISTER_PORT')
    }


def init():
    credentials = load_credentials()
    env_vars = load_env_vars()

    for key, value in {**credentials, **env_vars}.items():
        print(f"{key} = {value}")

    return credentials, env_vars


def main():
    credentials, env_vars = init()

    capif_connector = CAPIFProviderConnector(
        certificates_folder='/capif-provider/certificates/',
        capif_host=env_vars['capif_ip'],
        capif_http_port=env_vars['capif_http_port'],
        capif_https_port=env_vars['capif_https_port'],
        capif_username=credentials['username'],
        capif_password=credentials['password'],
        register_hostname=env_vars['register_hostname'],
        register_port=env_vars['register_port'],
        description=credentials['description'],
        csr_common_name=credentials['cn'],
        csr_organizational_unit="test_app_ou",
        csr_organization="test_app_o",
        crs_locality="Athens",
        csr_state_or_province_name="Athens",
        csr_country_name="gr",
        csr_email_address="test@example.com"
    )

    # Step 1: Provider Onboarding
    capif_connector.register_and_onboard_provider()

    # Step 2: Service Publication
    service_files = [
        "services/service_as_session_with_qos.json",
        "services/service_monitoring_event.json"
    ]
    
    for service_file in service_files:
        capif_connector.publish_services(service_file)


if __name__ == "__main__":
    main()
