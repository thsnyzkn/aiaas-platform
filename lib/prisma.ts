import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { createSqliteAdapter } from "./sqliteAdapter";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const adapter = createSqliteAdapter();
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
