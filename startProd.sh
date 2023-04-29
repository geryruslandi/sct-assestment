docker-compose --env-file .env -f ./docker/docker-compose.yml -p "assestment-sct" down
docker-compose --env-file .env -f ./docker/docker-compose.yml -p "assestment-sct" build app_db app_service
docker-compose --env-file .env -f ./docker/docker-compose.yml -p "assestment-sct" up -d app_db app_service
