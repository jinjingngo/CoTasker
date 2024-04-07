# CoTasker

A to-do app supports real-time user collaboration among users. The app includes the following built-in features:

1. I as a user can create to-do items, such as a grocery list.
2. I as another user can collaborate in real-time with user - so that we can (for example) edit our family shopping-list together.
3. I as a user can mark to-do items as “done” - so that I can avoid clutter and focus on things that are still pending.
4. I as a user can filter the to-do list and view items that were marked as done - so that I can retrospect on my prior progress.
5. I as a user can add sub-tasks to my to-do items - so that I could make logical groups of tasks and see their overall progress.
6. I as a user can make infinite nested levels of subtasks.

## Usage

![v0.1.0 Recording](./public/v0.1.0_recording.gif)

## Architecture

We have two projects here.

1. A [Next.js](https://nextjs.org/) project for UI and normal todo staff.
2. A Cloudflare Wrangler project `co-tasker-stream` for the real-time collaboration logic.

The Next.js application, hosted on Vercel, serves as both frontend interface and backend service. The Cloud Wrangler project `co-tasker-stream`, deployed on Cloudflare as a Serverless Worker, facilitates real-time collaboration through WebSocket broadcasting functionality. Even without the `co-tasker-stream`, the Next.js application operates effectively due to its backend's traditional RESTFull architecture.

### Structure

```md
.
├── app
│   ├── api
│   ├── page.tsx
│   └── task
├── co-tasker-stream
│ ├── src
│ ├── test
├── migrations
│ ├── 20240327191526-create-todo.js
│ └── sqls
│ ├── 20240327191526-create-todo-down.sql
│ └── 20240327191526-create-todo-up.sql
├── scripts
│ └── run_schemats.sh
└── shared
│ └── schemas.ts
└── database.json
```

1. `app/` the Next.js app features several serverless API functions and two pages: a todo list page and a task list page.
   1. `api/` contains the serverless functions.
   2. `page.tsx` is the todo list page.
   3. `task/` contains the task list page.
2. `co-tasker-stream` the Cloudflare Wrangler project, include logic for real-time collaboration.
3. `migrations` database migration files located in here. Typically, running `pnpm run db:mc` generate 3 files:
   1. `20240327191526-create-todo-up.sql` This file handles table creation or modifications including indexes and constraints (the "up" migration).
   2. `20240327191526-create-todo-down.sql` This file reverts changes made by the "up" migration (the "down" migration).
   3. `20240327191526-create-todo.js` This scripts executes both the up and down SQL files.
   4. Using this filename pattern {data}-{migration-name-you-choose}-{up|down}.{sql|js}.
4. `scripts` directory houses all the automatic scripts
   1. `run_schemats.sh` Generates TypeScript interfaces from the database schema using [schemats](https://github.com/vramework/schemats) after constructing a Postgres connection string.
5. `database.json` A configuration file for [db-migrate](https://github.com/db-migrate/node-db-migrate)

## Develop

I'm using [pnpm](https://pnpm.io/) for package management, but feel free to use whatever you prefer.

1. Duplicate the `.env.example` file as `.env`, then either obtain the database detail from other contributors or setup a new database and update the information accordingly.
2. To create a new database:
   1. Update the variables in `.env` as needed.
   2. Execute `pnpm run db:mu` to migrate the tables.
3. Use `pnpm run dev` to launch the Next.js service.
4. Run `pnpm run test` to continuous tests monitoring.
5. Navigate to `co-tasker-stream`
   1. Start the WebSocket Worker with `pnpm run dev`.
   2. Initiate continuous testing for the Worker with `pnpm run test`.
