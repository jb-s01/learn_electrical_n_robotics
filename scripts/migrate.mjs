import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });
console.log("Database directory ready at data/");
