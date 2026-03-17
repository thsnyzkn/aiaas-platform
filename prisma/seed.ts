import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
   await prisma.usageLog.deleteMany()
  await prisma.apiKey.deleteMany()
  await prisma.user.deleteMany()

  const hash = await 'password123'

  const admin = await prisma.user.create({
    data: { email: 'admin@aiaas.dev', passwordHash: hash, role: 'ADMIN' }
  })

  const user = await prisma.user.create({
    data: { email: 'user@aiaas.dev', passwordHash: hash, role: 'USER' }
  })

  const keys = await Promise.all([
    prisma.apiKey.create({
      data: { key: 'sk_ai_demo1_xk29fj92kd92', name: 'Production Key', userId: user.id }
    }),
    prisma.apiKey.create({
      data: { key: 'sk_ai_demo2_pq83ms01ld73', name: 'Dev Key', userId: admin.id, requestLimitPerMin: 10 }
    })
  ])

  // Seed usage logs so the dashboard has data to show
  const now = Date.now()
  await prisma.usageLog.createMany({
    data: Array.from({ length: 40 }, (_, i) => ({
      apiKeyId: keys[i % 2].id,
      endpoint: i % 3 === 0 ? '/api/completions' : '/api/chat/completions',
      statusCode: i % 8 === 0 ? 429 : 200,
      latencyMs: Math.floor(Math.random() * 600) + 100,
      createdAt: new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000)
    }))
  })
  console.log('Database has been seeded. 🌱')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
