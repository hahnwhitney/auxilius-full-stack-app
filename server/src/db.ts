import pg from "pg";
import type { Task, TaskStatus, User } from "./types.js";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function connectDb(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    console.log("Database connected");
  } finally {
    client.release();
  }
}

export async function getAllTasks(): Promise<Task[]> {
  const { rows } = await pool.query<Task>(
    "SELECT id, title, description, status FROM tasks ORDER BY created_at",
  );
  return rows;
}

export async function insertTask(
  title: string,
  description: string,
  status: TaskStatus,
): Promise<Task> {
  const { rows } = await pool.query<Task>(
    `INSERT INTO tasks (title, description, status)
     VALUES ($1, $2, $3)
     RETURNING id, title, description, status`,
    [title, description, status],
  );
  return rows[0];
}

export async function updateTask(
  id: string,
  fields: Partial<Pick<Task, "title" | "description" | "status">>,
): Promise<Task | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (fields.title !== undefined) {
    sets.push(`title = $${i++}`);
    values.push(fields.title);
  }
  if (fields.description !== undefined) {
    sets.push(`description = $${i++}`);
    values.push(fields.description);
  }
  if (fields.status !== undefined) {
    sets.push(`status = $${i++}`);
    values.push(fields.status);
  }
  if (sets.length === 0) return null;
  values.push(id);
  const { rows } = await pool.query<Task>(
    `UPDATE tasks SET ${sets.join(", ")} WHERE id = $${i}
     RETURNING id, title, description, status`,
    values,
  );
  return rows[0] ?? null;
}

export async function deleteTask(id: string): Promise<boolean> {
  const { rowCount } = await pool.query("DELETE FROM tasks WHERE id = $1", [
    id,
  ]);
  return (rowCount ?? 0) > 0;
}

// ── Users ──────────────────────────────────────────────

export async function insertUser(username: string): Promise<User> {
  const { rows } = await pool.query<User>(
    `INSERT INTO users (username)
     VALUES ($1)
     RETURNING id, username`,
    [username],
  );
  return rows[0];
}

export async function getUserById(id: string): Promise<User | null> {
  const { rows } = await pool.query<User>(
    "SELECT id, username FROM users WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
}

export async function getUserByUsername(
  username: string,
): Promise<User | null> {
  const { rows } = await pool.query<User>(
    "SELECT id, username FROM users WHERE username = $1",
    [username],
  );
  return rows[0] ?? null;
}

export async function deleteUser(id: string): Promise<boolean> {
  const { rowCount } = await pool.query("DELETE FROM users WHERE id = $1", [
    id,
  ]);
  return (rowCount ?? 0) > 0;
}
