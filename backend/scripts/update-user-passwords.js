import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import '../src/loadEnv.js';

const prisma = new PrismaClient();

async function updateUserPasswords() {
  try {
    console.log('🔐 Updating user passwords...');

    // Default password for all existing users
    const defaultPassword = 'Password@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Get all users
    const users = await prisma.user.findMany();

    console.log(`Found ${users.length} users to update`);

    // Update each user with hashed password
    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      console.log(`✅ Updated password for user: ${user.email}`);
    }

    console.log('✨ All user passwords updated successfully!');
    console.log(`📝 Default password for all users: ${defaultPassword}`);
    console.log('⚠️  Please ask users to change their password after first login');

  } catch (error) {
    console.error('❌ Error updating passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserPasswords();
