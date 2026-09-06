import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import '../src/loadEnv.js';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');

    const adminEmail = 'admin@finedge.com';
    const adminPassword = 'Password@123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`📧 Email: ${adminEmail}`);
      
      // Update password
      await prisma.user.update({
        where: { email: adminEmail },
        data: { password: hashedPassword }
      });
      console.log('✅ Admin password updated!');
    } else {
      // Create new admin
      const admin = await prisma.user.create({
        data: {
          name: 'Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin'
        }
      });

      console.log('✅ Admin user created successfully!');
      console.log(`📧 Email: ${admin.email}`);
    }

    console.log(`🔑 Password: ${adminPassword}`);
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
