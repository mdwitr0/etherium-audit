#!make
include .env
export $(shell sed 's/=.*//' .env)

RED='\033[0;31m'        #  ${RED}
GREEN='\033[0;32m'      #  ${GREEN}
BOLD='\033[1;m'			#  ${BOLD}
WARNING=\033[37;1;41m	#  ${WARNING}
END_COLOR='\033[0m'		#  ${END_COLOR}

.PHONY: rebuild up stop restart status console-app console-redis logs logs-app logs-redis help

up:
	@echo "\n\033[1;m Running containers for ${ENVIRONMENT} environment... \033[0m"
	@docker-compose -f ./docker-compouse.yml -p ${PROJECT_NAME} up -d
	@$(MAKE) --no-print-directory status

stop:
	@echo "\n\033[1;m Stopping containers... \033[0m"
	@docker-compose -f ./docker-compouse.yml -p ${PROJECT_NAME} stop

rebuild: stop
	@echo "\n\033[1;m Rebuilding containers... \033[0m"
	@docker-compose -f ./docker-compouse.yml -p ${PROJECT_NAME} build --no-cache

restart: stop up

down:
	@echo "\n\033[1;m Removing containers... \033[0m"
	@docker-compose -f ./docker-compouse.yml -p ${PROJECT_NAME} down

status:
	@echo "\n\033[1;m Containers statuses \033[0m"
	@docker-compose -f ./docker-compouse.yml -p ${PROJECT_NAME} ps

console-app:
	@docker-compose -f ./docker-compouse.yml -p ${PROJECT_NAME} exec app bash
console-redis:
	@docker-compose -f ./docker-compouse.yml -p ${PROJECT_NAME} exec redis bash
logs:
	@docker-compose -f ./docker-compouse.yml -p ${PROJECT_NAME} logs --tail=1000 -f
logs-app:
	@docker-compose -f ./docker-compouse.yml -p ${PROJECT_NAME} logs --tail=100 -f app
logs-redis:
	@docker-compose -f ./docker-compouse.yml -p ${PROJECT_NAME} logs --tail=100 -f redis

help:
	@echo "\n\033[1mContainer management\033[0m"
	@echo "up\t\t\t- start containers"
	@echo "stop\t\t\t- stop containers"
	@echo "rebuild\t\t\t- build containers w/o cache"
	@echo "restart\t\t\t- restart containers"
	@echo "down\t\t\t- remove containers"
	@echo "status\t\t\t- show status of containers"

	@echo "\n\033[1mConnecting to containers\033[0m"
	@echo "console-app\t\t- run bash console for app container"
	@echo "console-redis\t\t- run bash console for redis container"

	@echo "\n\033[1mViewing logs\033[0m"
	@echo "logs\t\t\t- show all logs"
	@echo "logs-app\t\t- show app logs"
	@echo "logs-redis\t\t- show redis logs"
