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


### Drawbacks of the custom runner

- Not ideal as schema migrations become more frequent or the team grows
  - Race condition occurs when multiple server instances start simultaneously
  - Dedicated tool would give us the ability to lock the database during migration so concurrent deploys don't run the same migration 
  - Migrations must be written by hand
  - No support for rollbacks
  - Difficult to run multiple server instances

## Creating a new server migrations

— Create the next file in sequence (i.e., if the current maigration is prefixed with `0001`, the next migration should be prefixed with `0002` -- for example `0002_add_task_priority.sql`)

The runner picks up any files not yet in the migrations table and applies them in order.

Only the first (initial schema) migration needs to be idempotent because it duplicates init.sql, which Docker runs on a fresh database — so the migration runner might encounter tables that Docker has already initialized (i.e., tables that already exist. Future migrations don't need to be idempotent. The migrations table is what prevents double-execution: once a file's name is recorded there, the runner skips it on every subsequent run. A migration like `0002_add_task_priority.sql`priority.sql can simply be:

```
  ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium';
```

If a migration fails partway through, the transaction rolls back and the filename is never written to migrations, so the next run will retry it from scratch.


## When to add a server migration tool

Dedicated tools offer things that are hard to build yourself:

Safety
- Detect destructive changes (dropping columns, renaming) and warn before running
- Lock the database during migration so concurrent deploys don't run the same migration twice (the custom runner has a race condition if two server instances start simultaneously)

Developer experience
- Generate migration files automatically by diffing your schema definition against the live database — you write the schema, the tool figures out the SQL
- Drizzle lets you define your schema in TypeScript, so your DB types and your application types stay in sync without manual work

Down migrations
- Built-in support for rolling back — each migration has an up and a down so you can undo a bad deploy. The custom runner only goes forward.

Dry runs and previews
- See exactly what SQL will run before it touches the database

Edge cases
- Handle things like column renames correctly (which look like a drop + add to a naive differ, causing data loss)

When the custom runner is enough: small team, single server instance, you write migrations by hand, and you don't need rollbacks. That's a reasonable fit for this project today.

When to switch: you're doing frequent schema changes, have multiple developers creating migrations concurrently, run multiple server instances, or want TypeScript-typed query results to stay in sync with the
schema automatically (the main reason to reach for Drizzle specifically).




Zod is a TypeScript-first schema declaration and validation library designed to eliminate duplicative type declarations by inferring static TypeScript types from runtime validation rules. It is used to ensure type safety for data structures ranging from simple strings to complex nested objects. Key features include zero dependencies, an immutable API, a concise chainable interface, and excellent TypeScript integration.


The server validates request bodies with manual if checks. Using something like zod would give you typed validation, clearer error messages, and shared schemas between client and server.



❯ would you recommend using both zod and drizzle simultaneously?

⏺ Yes — they complement each other rather than overlap.

  Drizzle handles the database layer: schema definition, type-safe query building, and migration generation. Zod handles the HTTP boundary: validating and parsing untrusted request bodies before they ever reach the
  database layer.

  The typical pattern is:

  Request body → Zod (parse + validate input) → Drizzle (type-safe DB query) → Response

  Drizzle can even infer TypeScript types from your table definitions that you can reuse in your Zod schemas, so your input validation stays in sync with your database schema:

  // drizzle schema
  const tasks = pgTable("tasks", {
    title: text("title").notNull(),
    status: text("status").$type<TaskStatus>(),
  });

  // inferred insert type from drizzle, used in zod schema
  type NewTask = typeof tasks.$inferInsert;

  The one thing to watch out for is keeping them in sync manually if you don't use the inferred types — if you add a column in Drizzle but forget to update the Zod schema, you'll silently strip that field from
  incoming requests. Using $inferInsert / $inferSelect as the basis for your Zod schemas avoids that drift.