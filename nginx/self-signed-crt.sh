#!/bin/bash

# Generate a self-signed SSL certificate with OpenSSL


# Check if OpenSSL is installed
if ! [ -x "$(command -v openssl)" ]; then
  echo 'Error: OpenSSL is not installed.' >&2
  exit 1
fi

# Generate a Private Key
openssl genrsa -out /etc/nginx/certs/private_nef.pem 2048

# Generate a CSR (Certificate Signing Request)
openssl req -new -key /etc/nginx/certs/private_nef.pem -out /etc/nginx/certs/server_nef.csr  -subj "/C=GR/ST=Athens/L=Earth/O=NCSRD/OU=IT/CN=www.o-nef.gr/emailAddress=o-nef@iit.demokritos.gr"

# Generate a Self Signed Certificate
openssl x509 -req -days 365 -in /etc/nginx/certs/server_nef.csr -signkey /etc/nginx/certs/private_nef.pem -out /etc/nginx/certs/self_signed_nef.pem

#Export pkcs12 for mozilla with admin password
openssl pkcs12 -export -in /etc/nginx/certs/self_signed_nef.pem -inkey /etc/nginx/certs/private_nef.pem -out /etc/nginx/certs/o-nef.p12 -passout pass:admin
chmod 644 /etc/nginx/certs/o-nef.p12 
