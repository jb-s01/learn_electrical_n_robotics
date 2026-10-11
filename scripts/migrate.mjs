import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { applySchema } from "../lib/db/schema-sql.mjs";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

const url = process.env.DATABASE_URL ?? "file:./data/progress.db";
const filePath = url.replace(/^file:/, "");
const dbPath = path.isAbsolute(filePath)
  ? filePath
  : path.join(process.cwd(), filePath);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
applySchema(sqlite);
sqlite.close();

console.log(`Database ready at ${dbPath}`);
