import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const checkPrismaConnection = async ()=> {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected successfully');
  } catch (error) {
    if (error instanceof Error) {
      console.error('⚠️ Prisma connection failed (but app will continue):', error.message);
    } else {
      console.error('⚠️ Prisma connection failed (but app will continue):', error);
    }
  }
}

export default prisma;