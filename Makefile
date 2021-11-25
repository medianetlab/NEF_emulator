SHELL := /bin/bash

# Prepare DEVELOPMENT environment

prepare-dev-env:
	cp env-file-for-local.dev .env


# docker-compose TASKS

up:
	docker-compose up

upd:
	docker-compose up -d

down:
	docker-compose down

down-v: # also removes volumes
	docker-compose down -v

start:
	docker-compose start

stop:
	docker-compose stop

build:
	docker-compose build

build-no-cache:
	docker-compose build --no-cache

logs:
	docker-compose logs -f

ps:
	docker ps -a



# COMBOS

upl: upd logs



# DATABASE

db-init: #simple scenario with 3 UEs, 3 Cells, 1 gNB
	./backend/app/app/db/init_simple.sh


db-reset:
	docker-compose exec db psql -h localhost -U postgres -d app -c 'TRUNCATE TABLE cell, gnb, monitoring, path, points, ue RESTART IDENTITY;'


db-reinit: db-reset db-init


#Individual logs

logs-location:
	docker-compose logs -f backend 2>&1 | grep -E "(handovers|monitoringType|'ack')"