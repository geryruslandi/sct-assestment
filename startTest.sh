docker-compose --env-file .env.test -f ./docker/docker-compose.yml -p "assestment-sct" down
docker-compose --env-file .env.test -f ./docker/docker-compose.yml -p "assestment-sct" build app_db app_service_jest
docker-compose --env-file .env.test -f ./docker/docker-compose.yml -p "assestment-sct" up app_db app_service_jest --abort-on-container-exit
