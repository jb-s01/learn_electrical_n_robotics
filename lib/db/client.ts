import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
  db?: ReturnType<typeof drizzle<typeof schema>>;
};

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

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS lesson_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES user_profile(id),
      lesson_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'locked',
      quiz_score INTEGER,
      lab_complete INTEGER DEFAULT 0,
      read_sections INTEGER DEFAULT 0,
      completed_at INTEGER,
      UNIQUE(user_id, lesson_id)
    );
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES user_profile(id),
      lesson_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      attempted_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS track_enrollment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES user_profile(id),
      track_id TEXT NOT NULL,
      enrolled INTEGER NOT NULL DEFAULT 0,
      enrolled_at INTEGER,
      UNIQUE(user_id, track_id)
    );
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE REFERENCES user_profile(id),
      ollama_model TEXT DEFAULT 'llama3.2:3b'
    );
  `);

  const db = drizzle(sqlite, { schema });
  return { sqlite, db };
}

export function getDb() {
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
