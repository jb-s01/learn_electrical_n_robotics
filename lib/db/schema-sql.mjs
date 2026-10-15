// Shared with scripts/migrate.mjs and the in-memory test database.
export const SCHEMA_SQL = `
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
`;

export function applySchema(sqlite) {
  sqlite.exec(SCHEMA_SQL);
}
