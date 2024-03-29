# CoTasker

A to-do app support real-time user collaboration.

## Architecture

We have two projects here.

1. A [Next.js](https://nextjs.org/) project for UI and normal todo staff.
2. A Cloudflare Wrangler project for the real-time collaboration logic.

### Structure

```md
.
├── app
├── co-tasker-stream
│   ├── src
│   ├── test
├── migrations
│   ├── 20240327191526-create-todo.js
│   └── sqls
│       ├── 20240327191526-create-todo-down.sql
│       └── 20240327191526-create-todo-up.sql
├── scripts
│   └── run_schemats.sh
└── shared
│   └── schemas.ts
└── database.json
```

1. `app` Next.js app folder.
2. `co-tasker-stream` the Cloudflare Wrangler project contains real-time collaboration logic.
3. `migrations` database migration files goes here, normally 3 files will be generate after running `pnpm run db:mc`, in this case
   1. `20240327191526-create-todo-up.sql` the migration up file, for create or alter tables/indexes/constraints...
   2. `20240327191526-create-todo-down.sql` the migration down file, for revert related up changes.
   3. `20240327191526-create-todo.js` the script runs the up and down SQL file.
   4. filename pattern {data}-{migration-name-you-choose}-{up|down}.{sql|js}
4. `scripts` all the automatic scripts goes here
   1. `run_schemats.sh` construct a Postgres connection string for [schemats](https://github.com/vramework/schemats) and run it to generate TypeScript interfaces from the database schema.
5. `database.json` config file for [db-migrate](https://github.com/db-migrate/node-db-migrate)

## Develop

I'm using [pnpm](https://pnpm.io/) as package manager

1. Copy the `.env.example` to `.env`, and ask other contributors for DB details or setup a new DB, and assign those info accordingly.
2. If you create a new DB
   1. Change the variables in `.env` accordingly.
   2. Run the `pnpm run db:mu` to migrate the tables.
3. `pnpm run dev` to start the Next.js service
4. `cd co-tasker-stream && pnpm run dev`
