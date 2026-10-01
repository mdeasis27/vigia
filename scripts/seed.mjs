// scripts/seed.mjs
// Creates the vigia schema + table and seeds realistic scan results.
// Run: node scripts/seed.mjs  (requires DATABASE_URL in env or .env.local)

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadEnv() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {
    /* no .env.local */
  }
}

loadEnv();

const sql = neon(process.env.DATABASE_URL);

const SCANS = [
  [3, 1, 1],
  [2, 0, 0],
  [4, 2, 2],
  [1, 0, 0],
];

async function main() {
  await sql`CREATE SCHEMA IF NOT EXISTS vigia`;
  await sql`DROP TABLE IF EXISTS vigia.scans`;

  await sql`
    CREATE TABLE vigia.scans (
      id serial PRIMARY KEY,
      symbols integer NOT NULL,
      stale_docs integer NOT NULL,
      auto_corrected integer NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;

  for (const [symbols, staleDocs, autoCorrected] of SCANS) {
    await sql`INSERT INTO vigia.scans (symbols, stale_docs, auto_corrected) VALUES (${symbols}, ${staleDocs}, ${autoCorrected})`;
  }

  const [{ c }] = await sql`SELECT count(*)::int AS c FROM vigia.scans`;
  console.log(`Seeded vigia schema: ${c} scans`);
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
