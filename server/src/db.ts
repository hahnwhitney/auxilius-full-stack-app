import bcrypt from "bcryptjs";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq, sql } from "drizzle-orm";
import { tasks, users } from "./schema.js";
import type { Task, TaskStatus, User } from "./types.js";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool);

export async function connectDb(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    console.log("Database connected");
  } finally {
    client.release();
  }
}

export async function getAllTasks(
  status?: TaskStatus,
  page = 1,
  limit = 20,
  userId?: string,
): Promise<{ data: Task[]; total: number }> {
  const offset = (page - 1) * limit;
  const fields = {
    id: tasks.id,
    title: tasks.title,
    description: tasks.description,
    status: tasks.status,
    userId: tasks.userId,
  };

  const where = and(
    status ? eq(tasks.status, status) : undefined,
    userId ? eq(tasks.userId, userId) : undefined,
  );

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(tasks)
    .where(where);
  const data = await db
    .select(fields)
    .from(tasks)
    .where(where)
    .orderBy(tasks.createdAt)
    .limit(limit)
    .offset(offset);
  return { data, total: Number(count) };
}

export async function insertTask(
  title: string,
  description: string,
  status: TaskStatus,
  userId?: string,
): Promise<Task> {
  const [task] = await db
    .insert(tasks)
    .values({ title, description, status, userId: userId ?? null })
    .returning({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      userId: tasks.userId,
    });
  return task;
}

export async function updateTask(
  id: string,
  fields: Partial<Pick<Task, "title" | "description" | "status">>,
): Promise<Task | null> {
  if (Object.keys(fields).length === 0) return null;
  const [task] = await db
    .update(tasks)
    .set(fields)
    .where(eq(tasks.id, id))
    .returning({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      userId: tasks.userId,
    });
  return task ?? null;
}

export async function deleteTask(id: string): Promise<boolean> {
  const result = await db
    .delete(tasks)
    .where(eq(tasks.id, id))
    .returning({ id: tasks.id });
  return result.length > 0;
}

// ── Users ───────────────────────────────────────────────

export async function insertUser(
  username: string,
  password: string,
): Promise<User> {
  const passwordHash = bcrypt.hashSync(password, 10);
  const [user] = await db
    .insert(users)
    .values({ username, passwordHash })
    .returning({ id: users.id, username: users.username });
  return user;
}

export async function authenticateUser(
  username: string,
  password: string,
): Promise<User | null> {
  const [row] = await db
    .select({
      id: users.id,
      username: users.username,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.username, username));
  if (!row || !row.passwordHash) return null;
  try {
    const match = bcrypt.compareSync(password, row.passwordHash);
    if (!match) return null;
  } catch {
    return null;
  }
  return { id: row.id, username: row.username };
}

export async function getUserById(id: string): Promise<User | null> {
  const [user] = await db
    .select({ id: users.id, username: users.username })
    .from(users)
    .where(eq(users.id, id));
  return user ?? null;
}

export async function getUserByUsername(
  username: string,
): Promise<User | null> {
  const [user] = await db
    .select({ id: users.id, username: users.username })
    .from(users)
    .where(eq(users.username, username));
  return user ?? null;
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id });
  return result.length > 0;
}
