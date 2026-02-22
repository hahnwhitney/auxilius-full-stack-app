import pg from "pg";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, "../db/migrations");

async function migrate(): Promise<void> {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id         SERIAL PRIMARY KEY,
        name       TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.log("No migration files found.");
      return;
    }

    const { rows } = await client.query<{ name: string }>(
      "SELECT name FROM migrations",
    );
    const applied = new Set(rows.map((r) => r.name));

    let count = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  skipped  ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`  applied  ${file}`);
        count++;
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(
          `Failed on ${file}: ${(err as Error).message}`,
        );
      }
    }

    console.log(
      count === 0 ? "Already up to date." : `\n${count} migration(s) applied.`,
    );
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("Migration error:", err.message);
  process.exit(1);
});
