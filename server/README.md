# Server Migrations

Server maigrations ensure that database schema changes are trackable, reversible, and safe to run in production.

## Running an existing server migration

- From inside the server directory (with DATABASE_URL set), run `npm run migrate`

- From docker exec, run `docker compose exec server npm run migrate`

### The migration runner:

1. Creates a migrations table (if it doesn't exist) to track what's been applied
2. Reads all .sql files from server/db/migrations/ in sorted order
3. Skips files already recorded in migrations
4. Runs each new file inside a transaction — if anything fails it rolls back and exits with an error
5. Records the filename in migrations on success


## Creating a new server migrations

— Create the next file in sequence (i.e., if the current maigration is prefixed with `0001`, the next migration should be prefixed with `0002` -- for example `0002_add_task_priority.sql`)

The runner picks up any files not yet in the migrations table and applies them in order.

Only the first (initial schema) migration needs to be idempotent because it duplicates init.sql, which Docker runs on a fresh database — so the migration runner might encounter tables that Docker has already initialized (i.e., tables that already exist. Future migrations don't need to be idempotent. The migrations table is what prevents double-execution: once a file's name is recorded there, the runner skips it on every subsequent run. A migration like `0002_add_task_priority.sql`priority.sql can simply be:

```
  ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium';
```

If a migration fails partway through, the transaction rolls back and the filename is never written to migrations, so the next run will retry it from scratch.
