SHELL := /bin/bash

# Prepare DEVELOPMENT environment

prepare-dev-env:
	cp env-file-for-local.dev .env
	docker network create services_default


# docker compose TASKS

up:
	docker compose --profile dev up

upd:
	docker compose --profile dev up -d

debug-up:
	docker compose --profile debug up

debug-upd:
	docker compose --profile debug up -d

down:
	docker compose --profile debug down

down-v: # also removes volumes
	docker compose --profile debug down -v

stop:
	docker compose --profile debug stop

build:
	docker compose --profile debug build

build-no-cache:
	docker compose --profile debug build --no-cache --pull

logs-dev:
	docker compose --profile dev logs -f

logs-debug:
	docker compose --profile debug logs -f

logs-backend:
	docker compose logs -f backend

logs-mongo:
	docker compose logs -f mongo

ps:
	docker ps -a



# COMBOS

upl: upd logs



# DATABASE

db-init: #simple scenario with 3 UEs, 3 Cells, 1 gNB
	./backend/app/app/db/init_simple.sh


db-reset:
	docker compose exec db psql -h localhost -U postgres -d app -c 'TRUNCATE TABLE cell, gnb, monitoring, path, points, ue RESTART IDENTITY;'
	docker compose exec mongo_nef /bin/bash -c 'mongo fastapi -u $$MONGO_USER -p $$MONGO_PASSWORD --authenticationDatabase admin --eval "db.dropDatabase();"'


db-reinit: db-reset db-init


#Individual logs

logs-location:
	docker compose logs -f backend 2>&1 | grep -E "(handovers|monitoringType|'ack')"