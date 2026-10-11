import type Database from "better-sqlite3";

export const SCHEMA_SQL: string;

export function applySchema(sqlite: Database.Database): void;
