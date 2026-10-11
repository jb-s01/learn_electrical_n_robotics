import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { applySchema } from "@/lib/db/schema-sql.mjs";
import type { AppDatabase } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

/** In-memory database with the same tables scripts/migrate.mjs creates. */
export function openMemoryDatabase(): {
  sqlite: Database.Database;
  db: AppDatabase;
} {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  applySchema(sqlite);
  const db = drizzle(sqlite, { schema });
  return { sqlite, db };
}
