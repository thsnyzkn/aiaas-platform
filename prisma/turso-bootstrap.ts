import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "../app/generated/prisma/client";
import { createSqliteAdapter } from "../lib/sqliteAdapter";

process.env.PRISMA_USE_TURSO = "true";

const prisma = new PrismaClient({ adapter: createSqliteAdapter() });

function splitStatements(sql: string) {
  return sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function ensureMigrationTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "__manual_migrations" (
      "name" TEXT NOT NULL PRIMARY KEY,
      "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getAppliedMigrations() {
  const rows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    `SELECT "name" FROM "__manual_migrations"`
  );
  return new Set(rows.map((row) => row.name));
}

async function applyMigration(name: string, sql: string) {
  const statements = splitStatements(sql);
  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }

  await prisma.$executeRawUnsafe(
    `INSERT INTO "__manual_migrations" ("name") VALUES (?)`,
    name
  );
}

async function cleanupTemporaryMigrationTables() {
  const tempTables = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    `SELECT "name" FROM sqlite_master WHERE "type" = 'table' AND "name" LIKE 'new_%'`
  );

  for (const table of tempTables) {
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table.name}"`);
  }
}

async function main() {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    throw new Error(
      "Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN. Set both before running Turso bootstrap."
    );
  }

  const migrationsPath = path.join(process.cwd(), "prisma", "migrations");
  const entries = await readdir(migrationsPath, { withFileTypes: true });
  const migrationDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  await ensureMigrationTable();
  const applied = await getAppliedMigrations();

  for (const dir of migrationDirs) {
    if (applied.has(dir)) {
      continue;
    }

    const sqlPath = path.join(migrationsPath, dir, "migration.sql");
    const sql = await readFile(sqlPath, "utf8");
    await cleanupTemporaryMigrationTables();
    await applyMigration(dir, sql);
    console.log(`Applied migration: ${dir}`);
  }

  console.log("Turso schema bootstrap complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
