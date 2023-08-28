#! /usr/bin/env bash

# Create initial data in DB
python /app/app/initial_data.py

# Let the DB start
python /app/app/backend_pre_start.py

# Run migrations
#alembic upgrade head
