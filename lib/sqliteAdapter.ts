import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";

export function createSqliteAdapter() {
  const localDatabaseUrl = process.env.DATABASE_URL;
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;
  const forceTurso = process.env.PRISMA_USE_TURSO === "true";
  const canUseTurso =
    Boolean(tursoUrl && tursoAuthToken) &&
    (forceTurso ||
      process.env.NODE_ENV === "production" ||
      !localDatabaseUrl ||
      !localDatabaseUrl.startsWith("file:"));

  if (canUseTurso) {
    return new PrismaLibSql({
      url: tursoUrl as string,
      authToken: tursoAuthToken as string,
    });
  }

  return new PrismaBetterSqlite3({
    url: localDatabaseUrl ?? "file:./dev.db",
  });
}
