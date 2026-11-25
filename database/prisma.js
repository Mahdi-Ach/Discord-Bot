const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log: ['warn', 'error'],
});

console.log('🔎 Modèles Prisma :', Object.keys(prisma).filter(k => !k.startsWith('_')));

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;