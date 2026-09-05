import '../src/loadEnv.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const users = await prisma.user.findMany({
  select: { id: true, email: true, role: true, name: true },
});
console.log(JSON.stringify(users));

const contact = users.find((user) => user.email === 'nimesh@example.com');
if (!contact) {
  const created = await prisma.user.create({
    data: {
      name: 'Nimesh Pathak',
      email: 'nimesh@example.com',
      role: 'contact',
    },
    select: { id: true, email: true, role: true },
  });
  console.log('created', JSON.stringify(created));
}

await prisma.$disconnect();
