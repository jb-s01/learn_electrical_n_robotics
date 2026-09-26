#!/usr/bin/env node
// Downloads the compiled CircuitJS1 (GWT) build that public/circuitjs/circuitjs.html loads.
// The build is ~12 MB of third-party output, so it is fetched on install rather than committed.
//
// Usage: node scripts/fetch-circuitjs.mjs [--force] [--optional]
//   --force     re-download even if the build is already present
//   --optional  warn instead of failing (used by postinstall so offline installs still work)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dest = path.join(root, "public/circuitjs/circuitjs1");
const baseUrl = (process.env.CIRCUITJS_BASE_URL ?? "https://www.falstad.com/circuit/circuitjs110").replace(/\/$/, "");
const force = process.argv.includes("--force");
const optional = process.argv.includes("--optional");
const CONCURRENCY = 8;

async function download(relPath, { text = false } = {}) {
  const res = await fetch(`${baseUrl}/${relPath}`);
  if (!res.ok) throw new Error(`${relPath}: HTTP ${res.status}`);
  const body = text ? await res.text() : Buffer.from(await res.arrayBuffer());
  const file = path.join(dest, relPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
  return body;
}

async function downloadAll(relPaths) {
  const queue = [...relPaths];
  const failures = [];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let rel = queue.shift(); rel; rel = queue.shift()) {
        await download(rel).catch((e) => failures.push(e.message));
      }
    })
  );
  return failures;
}

function permutationFiles(nocache) {
  return [...new Set(nocache.match(/[0-9A-F]{32}/g) ?? [])].map((hash) => `${hash}.cache.js`);
}

function exampleCircuits(setupList) {
  const files = new Set(["blank.txt"]);
  for (const raw of setupList.split("\n")) {
    const line = raw.trim().replace(/^>/, "");
    if (!line || line.startsWith("#") || line.startsWith("+") || line.startsWith("-")) continue;
    const [file] = line.split(/\s+/);
    if (file.endsWith(".txt")) files.add(file);
  }
  return [...files].map((f) => `circuits/${f}`);
}

function isInstalled() {
  const loader = path.join(dest, "circuitjs1.nocache.js");
  if (!fs.existsSync(loader)) return false;
  return permutationFiles(fs.readFileSync(loader, "utf-8")).every((f) => fs.existsSync(path.join(dest, f)));
}

async function main() {
  if (!force && isInstalled()) {
    console.log(`CircuitJS already installed at ${path.relative(root, dest)}`);
    return;
  }
  console.log(`Fetching CircuitJS from ${baseUrl} ...`);
  fs.mkdirSync(dest, { recursive: true });

  const nocache = await download("circuitjs1.nocache.js", { text: true });
  const setupList = await download("setuplist.txt", { text: true });
  const required = [...permutationFiles(nocache), "clear.cache.gif"];
  if (required.length < 2) throw new Error("No GWT permutations found in circuitjs1.nocache.js");

  const requiredFailures = await downloadAll(required);
  if (requiredFailures.length) throw new Error(`Missing core files:\n  ${requiredFailures.join("\n  ")}`);

  const circuits = exampleCircuits(setupList);
  const exampleFailures = await downloadAll(circuits);
  if (exampleFailures.length) {
    console.warn(`Warning: ${exampleFailures.length} example circuits could not be downloaded`);
  }
  console.log(`CircuitJS installed: ${required.length} core files, ${circuits.length - exampleFailures.length} example circuits`);
}

main().catch((error) => {
  console.error(`CircuitJS download failed: ${error.message}`);
  if (optional) {
    console.warn("Continuing without the circuit simulator. Run `npm run setup:circuitjs` later to retry.");
    return;
  }
  process.exit(1);
});
