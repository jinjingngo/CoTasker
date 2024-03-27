# CoTasker

A to-do app support real-time user collaboration.

## Architecture

## Develop

I'm using [pnpm](https://pnpm.io/) as package manager

1. Copy the `.env.example` to `.env`, and ask other contributors for DB password or setup a new DB, and assign the password `DB_PASSWORD`.
2. If you create a new DB
   1. Change the variables in `.env` accordingly.
   2. Run the `pnpm run db:mu` to migrate the tables.
3. `pnpm run dev` to start the Next.js service
4. `cd co-tasker-stream && pnpm run dev`
