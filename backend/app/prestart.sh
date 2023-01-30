#! /usr/bin/env bash

# Let the DB start
python /app/app/backend_pre_start.py

# Run migrations
#alembic upgrade head

# Create initial data in DB
python /app/app/initial_data.py

# Create private/public keys using Openssl
# using . instead of source becaus source is a Bash built-in function and this script is not executed with /bin/bash
. /app/scripts/self-signed-crt.sh
