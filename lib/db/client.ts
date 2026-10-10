import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { applySchema } from "./schema-sql.mjs";
import * as schema from "./schema";

export type AppDatabase = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
  db?: AppDatabase;
};

let dbOverride: AppDatabase | undefined;

/** Use a caller-supplied database (for example an in-memory SQLite connection). */
export function setDb(db: AppDatabase | undefined) {
  dbOverride = db;
}

function getDbPath() {
  const url = process.env.DATABASE_URL ?? "file:./data/progress.db";
  const filePath = url.replace(/^file:/, "");
  return path.isAbsolute(filePath)
    ? filePath
    : path.join(/* turbopackIgnore: true */ process.cwd(), filePath);
}

function createDb() {
  const dbPath = getDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  applySchema(sqlite);

  const db = drizzle(sqlite, { schema });
  return { sqlite, db };
}

export function getDb() {
  if (dbOverride) return dbOverride;
  if (!globalForDb.db) {
    const { sqlite, db } = createDb();
    globalForDb.sqlite = sqlite;
    globalForDb.db = db;
  }
  return globalForDb.db;
}

export async function getOrCreateUser() {
  const db = getDb();
  const existing = await db.select().from(schema.userProfile).limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const [user] = await db
    .insert(schema.userProfile)
    .values({})
    .returning();

  await db.insert(schema.userSettings).values({ userId: user.id });
  return user;
}

export async function getUserSettings(userId: number) {
  const db = getDb();
  const settings = await db
    .select()
    .from(schema.userSettings)
    .where(eq(schema.userSettings.userId, userId))
    .limit(1);

  return (
    settings[0] ?? {
      ollamaModel: process.env.OLLAMA_DEFAULT_MODEL ?? "llama3.2:3b",
    }
  );
}
