import json
import os
import requests

from OpenSSL.SSL import FILETYPE_PEM
from OpenSSL.crypto import (
    dump_certificate_request,
    dump_privatekey,
    load_publickey,
    PKey,
    TYPE_RSA,
    X509Req,
    dump_publickey,
)

class CAPIFInvokerConnector:
    """
    This class is responsible for onboarding an exposer (eg. NEF emulator) to CAPIF
    """

    def __init__(
            self,
            certificates_folder: str,
            description: str,
            capif_host: str,
            capif_http_port: str,
            capif_https_port: str,
            capif_username,
            capif_password: str,
            register_hostname: str,
            register_port: str,
            csr_common_name: str,
            csr_organizational_unit: str,
            csr_organization: str,
            crs_locality: str,
            csr_state_or_province_name: str,
            csr_country_name: str,
            csr_email_address: str,
    ):
        """
        :param certificates_folder: The folder where certificates will be created and stored.
        :param description: A short description of the Provider
        :param capif_host:
        :param capif_http_port:
        :param capif_https_port:
        :param capif_username: The CAPIF username of your netapp
        :param capif_password: The CAPIF password  of your netapp
        :param csr_common_name: The CommonName that will be used in the generated X.509 certificate
        :param csr_organizational_unit:The OrganizationalUnit that will be used in the generated X.509 certificate
        :param csr_organization: The Organization that will be used in the generated X.509 certificate
        :param crs_locality: The Locality that will be used in the generated X.509 certificate
        :param csr_state_or_province_name: The StateOrProvinceName that will be used in the generated X.509 certificate
        :param csr_country_name: The CountryName that will be used in the generated X.509 certificate
        :param csr_email_address: The email that will be used in the generated X.509 certificate

        """
        # add the trailing slash if it is not already there using os.path.join
        self.certificates_folder = os.path.join(certificates_folder.strip(), "")
        self.description = description
        self.csr_common_name = capif_username
        # make sure the parameters are str
        capif_http_port = str(capif_http_port)
        self.capif_https_port = str(capif_https_port)

        self.register_port = str(register_port)
        if len(capif_http_port) == 0 or int(capif_http_port) == 80:
            self.capif_http_url = "http://" + capif_host.strip() + "/"
        else:
            self.capif_http_url = (
                    "http://" + capif_host.strip() + ":" + capif_http_port.strip() + "/"
            )

        if len(self.capif_https_port ) == 0 or int(self.capif_https_port ) == 443:
            self.capif_https_url = "https://" + capif_host.strip() + "/"
        else:
            self.capif_https_url = (
                    "https://" + capif_host.strip() + ":" + self.capif_https_port .strip() + "/"
            )

        register_hostname = (
            "http://" + register_hostname.strip() + ":" + self.register_port .strip() + "/"
        )

        self.capif_host = capif_host.strip()
        self.capif_username = capif_username
        self.capif_password = capif_password

        self.register_hostname = register_hostname.strip()
        self.register_port = register_port

        print(self.register_hostname)
        
        self.csr_common_name = csr_common_name
        self.csr_organizational_unit = csr_organizational_unit
        self.csr_organization = csr_organization
        self.crs_locality = crs_locality
        self.csr_state_or_province_name = csr_state_or_province_name
        self.csr_country_name = csr_country_name
        self.csr_email_address = csr_email_address

    def __create_private_and_public_keys(self, api_prov_func_role) -> bytes:
            """
            Creates 2 keys in folder folder_to_store_certificates. An api_prov_func_role_private.key and a api_prov_func_role_private.public.csr key"
            :return: The contents of the public key
            """
            private_key_path = (
                    self.certificates_folder + api_prov_func_role + "_private_key.key"
            )
            csr_file_path = self.certificates_folder + api_prov_func_role + "_public.csr"

            # create public/private key
            key = PKey()
            key.generate_key(TYPE_RSA, 2048)

            # Generate CSR
            req = X509Req()

            # The role should always be put in the certificate .lower() by convention
            req.get_subject().CN = api_prov_func_role.lower()
            req.get_subject().O = self.csr_organization
            req.get_subject().OU = self.csr_organizational_unit
            req.get_subject().L = self.crs_locality
            req.get_subject().ST = self.csr_state_or_province_name
            req.get_subject().C = self.csr_country_name
            req.get_subject().emailAddress = self.csr_email_address
            req.set_pubkey(key)
            req.sign(key, "sha256")

            with open(csr_file_path, "wb+") as f:
                f.write(dump_certificate_request(FILETYPE_PEM, req))
                public_key = dump_certificate_request(FILETYPE_PEM, req)
            with open(private_key_path, "wb+") as f:
                f.write(dump_privatekey(FILETYPE_PEM, key))

            print("Public and privates keys created!")
            
            return public_key
    
    def __write_to_file(self, onboarding_response, capif_registration_id, publish_url):

        for func_provile in onboarding_response["apiProvFuncs"]:
            with open(
                    self.certificates_folder
                    + "dummy_"
                    + func_provile["apiProvFuncRole"].lower()
                    + ".crt",
                    "wb",
            ) as certification_file:
                certification_file.write(
                    bytes(func_provile["regInfo"]["apiProvCert"], "utf-8")
                )

        with open(
                self.certificates_folder + "capif_provider_details.json", "w"
        ) as outfile:
            data = {
                "capif_registration_id": capif_registration_id,
                "publish_url": publish_url,
            }
            for api_prov_func in onboarding_response["apiProvFuncs"]:
                key = api_prov_func["apiProvFuncRole"] + "_api_prov_func_id"
                value = api_prov_func["apiProvFuncId"]
                data[key] = value

            json.dump(data, outfile)

    def __perform_authorization(self) -> str:
        """
        :return: the access_token from CAPIF
        """

        #url = self.register_hostname + "getauth"
        url = "https://register:8084/getauth"
        payload = dict()
        payload["username"] = self.capif_username
        payload["password"] = self.capif_password

        response = requests.request(
            "POST",
            url,
            headers={"Content-Type": "application/json"},
            data=json.dumps(payload),
            verify=False
        )
        response.raise_for_status()
        response_payload = json.loads(response.text)
        print(response_payload["message"])
        print(response_payload)
        return response_payload["ca_root"],response_payload["access_token"]

    def __onboard_invoker_to_capif(self, access_token):
        url = self.capif_https_url + "api-invoker-management/v1/onboardedInvokers"
        payload = {
            "regSec": access_token,
            "suppFeat": "fff",
            "failReason": "string"
        }

        headers = {
            "Authorization": "Bearer {}".format(access_token),
            "Content-Type": "application/json",
        }

        response = requests.request(
            "POST",
            url,
            headers=headers,
            data=json.dumps(payload),
            verify=self.certificates_folder + "ca.crt",
        )
        print(response.text)
        response.raise_for_status()
        response_payload = json.loads(response.text)
        return response_payload
    
    def __register_invoker(self):
        url = "https://register:8084/register"
        payload = {
            "username": self.capif_username,
            "password": self.capif_password,
            "cn": 'Invoker',
            "description": 'Invoker',
            "role": 'invoker'
        }

        response = requests.request(
            "POST",
            url,
            headers={"Content-Type": "application/json"},
            data=json.dumps(payload),
            verify=False
        )
        response.raise_for_status()
        response_payload = json.loads(response.text)
        return response_payload

    def register_and_onboard_invoker(self) -> None:
        role = "invoker"
        # 1. Create public and private key at invoker
        #public_key = self.__create_private_and_public_keys(api_prov_func_role=role)
 
        # 2. Register invoker
        #register_response = self.__register_invoker()
        #print(register_response)
        #ccf_api_onboarding_url = register_response["ccf_onboarding_url"]
        #ccf_discover_url = register_response["ccf_discover_url"]
        #invoker_id = register_response["id"]
        #print(register_response["message"])

        # 3. Obtain Access Token
        ca_root_string, auth_token = self.__perform_authorization()

        with open(self.certificates_folder + "ca.crt", "wb+") as ca_root:
            ca_root.write(bytes(ca_root_string, "utf-8"))

        onboarding_response = self.__onboard_invoker_to_capif(
            auth_token
        )
        #self.__write_to_file(
        #    onboarding_response, register_response, ccf_discover_url
        #)

        apiInvokerId = onboarding_response["apiProvDomId"]
        regSec = onboarding_response["regSec"]
        print(f"apiProvDomId = {apiInvokerId}")
        print(f"regSec={regSec}")

        return
    
    def discover_service(self, service_api_description_json_full_path) -> None:
        with open(
                self.certificates_folder + "capif_provider_details.json", "r"
        ) as openfile:
            file = json.load(openfile)
            publish_url = file["publish_url"]
            AEF_api_prov_func_id = file["AEF_api_prov_func_id"]
            APF_api_prov_func_id = file["APF_api_prov_func_id"]

        url = self.capif_https_url + publish_url.replace(
            "<apfId>", APF_api_prov_func_id
        )
        print(f"URL: {url}")

        with open(service_api_description_json_full_path, "rb") as service_file:
            data = json.load(service_file)
            for profile in data["aefProfiles"]:
                profile["aefId"] = AEF_api_prov_func_id

        response = requests.request(
            "GET",
            url,
            headers={"Content-Type": "application/json"},
            data=json.dumps(data),
            cert=(
                self.certificates_folder + "dummy_apf.crt",
                self.certificates_folder + "APF_private_key.key",
            ),
            verify=self.certificates_folder + "ca.crt",
        )

        return
    