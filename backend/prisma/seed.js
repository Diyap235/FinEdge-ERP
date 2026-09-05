import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.customerInvoice.deleteMany();
  await prisma.salesOrderLine.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.vendorBill.deleteMany();
  await prisma.purchaseOrderLine.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.journalItem.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.journal.deleteMany();
  await prisma.product.deleteMany();
  await prisma.account.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@finedge.com',
      role: 'admin',
    },
  });

  const accountantUser = await prisma.user.create({
    data: {
      name: 'Accountant User',
      email: 'accountant@finedge.com',
      role: 'accountant',
    },
  });

  console.log('✓ Users created');

  // Create Contacts
  const azureFurniture = await prisma.contact.create({
    data: {
      name: 'Azure Furniture',
      type: 'vendor',
      email: 'vendor@azurefurniture.com',
      mobile: '+91-9000000001',
    },
  });

  const nimeshPathak = await prisma.contact.create({
    data: {
      name: 'Nimesh Pathak',
      type: 'customer',
      email: 'nimesh@example.com',
      mobile: '+91-9000000002',
    },
  });

  console.log('✓ Contacts created');

  // Create Products
  const officeChair = await prisma.product.create({
    data: {
      name: 'Office Chair',
      type: 'furniture',
      salesPrice: '5000',
      cost: '3000',
      category: 'seating',
    },
  });

  const woodenTable = await prisma.product.create({
    data: {
      name: 'Wooden Table',
      type: 'furniture',
      salesPrice: '8000',
      cost: '5000',
      category: 'tables',
    },
  });

  const sofa = await prisma.product.create({
    data: {
      name: 'Sofa',
      type: 'furniture',
      salesPrice: '15000',
      cost: '9000',
      category: 'seating',
    },
  });

  console.log('✓ Products created');

  // Create Accounts
  const cashAccount = await prisma.account.create({
    data: {
      name: 'Cash',
      type: 'asset',
    },
  });

  const bankAccount = await prisma.account.create({
    data: {
      name: 'Bank',
      type: 'asset',
    },
  });

  const debtorsAccount = await prisma.account.create({
    data: {
      name: 'Debtors',
      type: 'asset',
    },
  });

  const creditorsAccount = await prisma.account.create({
    data: {
      name: 'Creditors',
      type: 'liability',
    },
  });

  const salesIncomeAccount = await prisma.account.create({
    data: {
      name: 'Sales Income',
      type: 'income',
    },
  });

  const purchaseExpenseAccount = await prisma.account.create({
    data: {
      name: 'Purchase Expense',
      type: 'expense',
    },
  });

  const ownerCapitalAccount = await prisma.account.create({
    data: {
      name: 'Owner Capital',
      type: 'capital',
    },
  });

  console.log('✓ Accounts created');

  // Create Journals
  const salesJournal = await prisma.journal.create({
    data: {
      name: 'Sales Journal',
      type: 'sales',
    },
  });

  const purchaseJournal = await prisma.journal.create({
    data: {
      name: 'Purchase Journal',
      type: 'purchase',
    },
  });

  const cashJournal = await prisma.journal.create({
    data: {
      name: 'Cash Journal',
      type: 'cash',
    },
  });

  const bankJournal = await prisma.journal.create({
    data: {
      name: 'Bank Journal',
      type: 'bank',
    },
  });

  console.log('✓ Journals created');
  console.log('\n✅ Database seeding complete!');
  console.log('\nTest User: admin@finedge.com (admin)');
  console.log('Test Vendor: Azure Furniture');
  console.log('Test Customer: Nimesh Pathak');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
