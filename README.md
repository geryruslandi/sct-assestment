## Instalation Steps
- Install Docker
- install docker-compose
- create .env for local development and prod env referrence .env.example
- create .env.test for unit test env referrence .env.test.example
- Run the app
  - run command `./startProd.sh` for prod env
  - run command `./startLocal.sh` for local development
  - run command `./startTest.sh` for executing test

## note
- for db and app integration on docker, db host for prod and jest test should be db's service name (app_db)
- to run apps locally, you should use node v18.14.2
- when running app on local development(`./startLocal.sh`), dont forget to migrate your db first by using `yarn migrate:up` (handled automatically for `./startTest.sh` and `./startProd.sh`)
