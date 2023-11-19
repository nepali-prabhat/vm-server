import { PrismaClient } from '@prisma/client';
import { seed } from './seedFn';

const prisma = new PrismaClient();
seed(prisma)
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
