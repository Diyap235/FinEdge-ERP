import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnose() {
  console.log('🔍 QUICK DATABASE DIAGNOSTIC\n');

  const counts = {
    users: await prisma.user.count(),
    contacts: await prisma.contact.count(),
    products: await prisma.product.count(),
    accounts: await prisma.account.count(),
    journals: await prisma.journal.count(),
    purchaseOrders: await prisma.purchaseOrder.count(),
    vendorBills: await prisma.vendorBill.count(),
    salesOrders: await prisma.salesOrder.count(),
    customerInvoices: await prisma.customerInvoice.count(),
    payments: await prisma.payment.count(),
    journalEntries: await prisma.journalEntry.count(),
    journalItems: await prisma.journalItem.count(),
  };

  console.log('📊 DATA COUNTS:');
  Object.entries(counts).forEach(([key, value]) => {
    console.log(`  ${key.padEnd(20)}: ${value}`);
  });

  const accounts = await prisma.account.findMany({ select: { id: true, name: true, type: true } });
  console.log('\n📋 ACCOUNTS:');
  accounts.forEach(a => {
    console.log(`  ${a.name.padEnd(20)} [${a.type}]`);
  });

  const journals = await prisma.journal.findMany({ select: { id: true, name: true, type: true } });
  console.log('\n📓 JOURNALS:');
  journals.forEach(j => {
    console.log(`  ${j.name.padEnd(20)} [${j.type}]`);
  });

  await prisma.$disconnect();
  console.log('\n✅ Diagnostic complete!');
}

diagnose().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
