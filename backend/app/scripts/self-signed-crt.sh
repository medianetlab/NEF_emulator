#!/bin/bash

# Generate a self-signed SSL certificate with OpenSSL


# Check if OpenSSL is installed
if ! [ -x "$(command -v openssl)" ]; then
  echo 'Error: OpenSSL is not installed.' >&2
  exit 1
fi

# Generate a Private Key
openssl genrsa -out /app/app/core/certificates/server_nef.pem 2048

# Generate a CSR (Certificate Signing Request)
openssl req -new -key /app/app/core/certificates/server_nef.pem -out /app/app/core/certificates/server_nef.csr

# Generate a Self Signed Certificate
openssl x509 -req -days 365 -in /app/app/core/certificates/server_nef.csr -signkey /app/app/core/certificates/server_nef.pem -out /app/app/core/certificates/self_signed_nef.pem

