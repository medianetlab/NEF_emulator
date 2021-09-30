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
