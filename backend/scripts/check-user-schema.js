import '../src/loadEnv.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    const cols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'User'
    `);
    console.log('User table columns:', cols);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
