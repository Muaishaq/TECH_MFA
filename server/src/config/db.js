const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: ['error']
});

// Handle connection issues gracefully
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;