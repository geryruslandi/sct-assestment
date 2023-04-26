#!/bin/bash
node_version="$(node -v)"

if [[ ! $node_version =~ v18.* ]];
then
  echo "Required Node version is >= 18, current node version is $node_version. exiting..."
  exit 1
fi

docker-compose --env-file .env -f ./docker/docker-compose.yml -p "assestment-sct" down
docker-compose --env-file .env -f ./docker/docker-compose.yml -p "assestment-sct" build app_db
docker-compose --env-file .env -f ./docker/docker-compose.yml -p "assestment-sct" up -d app_db

yarn install
yarn start:dev
