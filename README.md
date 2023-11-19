# Vending machine server

This nodejs server is used by a demo vending machine project. Client code repo is: nepali-prabhat/vm-client.

## Technologies used

- Typescript(v5.1.3), nodejs(v20.8.1) application running a http server using the nestjs framework.
- Database used is postgresql(v15.4).
- Docker-compose in order to run the database and prisma is used for db migration, seeding and as an orm.
- pnpm used for node package management.

## Assumptions made for the server

- vending machine's cash will always be Rs. 10 bills. You can change this from constants.ts file (variable name: CASH_UNIT).

- vending machine's cash and cutomer's cash have separate stock. We don't return user's cash as change.
- Similarly, vending machine's coin and customer's coins have same stock. We can return user's coins as change

- The vending machine doesn't connect to the internet.
- Conversely, any updates to the vending machine software needs to be done manually. So, there are no admin pages or end points to add new drinks or change price and so on.

## How to run?

### Running the server in development stage

```bash
# runs the database containers (dev-db and test-db)
docker compose up -d
# One time thing. This deploys prisma migrations and seeds dev-db database
pnpm run db:migrate
# runs the server
pnpm run start:dev
```

And done! The server should be up.

You can run the following command to reset the database to its original state.

```bash
# resets(deploys and seeds) the dev-db database to initial state
pnpm run db:reset
```

### Running tests

```bash
# runs unit tests
pnpm run test:unit
# runs integration tests.
pnpm run test:int
# runs e2e tests.
pnpm run test:e2e
```

Note, running integration and e2e tests does `docker compose up` by default.

## Footnotes

- You can look at the `/prisma/seed.ts` file to add new drinks or update stock during the database seeding.
- Images for the drinks are served from the `/public` folder.
- There is no 100% test coverage. Only the purchase module is tested.
- As of right now, docker compose doesn't read env variables and postgres environment variables are hard coded.
