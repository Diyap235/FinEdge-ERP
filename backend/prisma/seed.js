import { prisma } from '../src/lib/prisma.js';
import { accountingService } from '../src/services/accounting.service.js';
import { purchaseService } from '../src/services/purchase.service.js';
import { salesService } from '../src/services/sales.service.js';
import { moneyStr } from '../src/lib/money.js';

async function upsertUser({ name, email, role }) {
  return prisma.user.upsert({
    where: { email },
    update: { name, role },
    create: { name, email, role },
  });
}

async function upsertContact({ name, type, email, mobile }) {
  const existing = await prisma.contact.findFirst({
    where: email ? { email } : { name },
  });

  if (existing) {
    return prisma.contact.update({
      where: { id: existing.id },
      data: { name, type, email, mobile },
    });
  }

  return prisma.contact.create({
    data: { name, type, email, mobile },
  });
}

async function upsertProduct({ name, type, salesPrice, cost, category }) {
  const existing = await prisma.product.findFirst({ where: { name } });

  if (existing) {
    return prisma.product.update({
      where: { id: existing.id },
      data: {
        type,
        salesPrice: moneyStr(salesPrice),
        cost: moneyStr(cost),
        category,
      },
    });
  }

  return prisma.product.create({
    data: {
      name,
      type,
      salesPrice: moneyStr(salesPrice),
      cost: moneyStr(cost),
      category,
    },
  });
}

async function upsertAccount({ name, type }) {
  return prisma.account.upsert({
    where: { name },
    update: { type },
    create: { name, type },
  });
}

async function upsertJournal({ name, type }) {
  return prisma.journal.upsert({
    where: { name },
    update: { type },
    create: { name, type },
  });
}

async function findMatchingOrder({ vendorId, customerId, productId, qty, unitPrice }) {
  const where = vendorId ? { vendorId } : { customerId };
  const orders = vendorId
    ? await prisma.purchaseOrder.findMany({
        where,
        include: { lines: true, vendorBill: { include: { payments: true } } },
      })
    : await prisma.salesOrder.findMany({
        where,
        include: {
          lines: true,
          customerInvoice: { include: { payments: true } },
        },
      });

  return orders.find((order) =>
    order.lines.some(
      (line) =>
        line.productId === productId &&
        line.qty === qty &&
        moneyStr(line.unitPrice) === moneyStr(unitPrice)
    )
  );
}

async function seedOpeningCapital() {
  const existing = await prisma.journalEntry.findFirst({
    where: { reference: 'OPENING-CAPITAL' },
  });
  if (existing) {
    console.log('✓ Opening capital already posted');
    return existing;
  }

  const bankAccount = await prisma.account.findUnique({ where: { name: 'Bank' } });
  const capitalAccount = await prisma.account.findUnique({
    where: { name: 'Owner Capital' },
  });
  const bankJournal = await prisma.journal.findUnique({
    where: { name: 'Bank Journal' },
  });

  if (!bankAccount || !capitalAccount || !bankJournal) {
    throw new Error('Required master data missing for opening capital');
  }

  const entry = await accountingService.createJournalEntry(
    bankJournal.id,
    new Date(),
    'OPENING-CAPITAL',
    [
      { accountId: bankAccount.id, debit: '100000.00', credit: 0 },
      { accountId: capitalAccount.id, debit: 0, credit: '100000.00' },
    ]
  );

  console.log('✓ Opening capital posted (Bank 100000 / Owner Capital 100000)');
  return entry;
}

async function seedDemoPurchase(vendor, officeChair) {
  const existing = await findMatchingOrder({
    vendorId: vendor.id,
    productId: officeChair.id,
    qty: 5,
    unitPrice: '3000.00',
  });

  if (existing?.vendorBill?.payments?.length) {
    console.log(`✓ Demo purchase already exists (PO ${existing.id})`);
    return existing;
  }

  let po = existing;
  if (!po) {
    po = await purchaseService.createPurchaseOrder(vendor.id, [
      { productId: officeChair.id, qty: 5, unitPrice: '3000.00' },
    ]);
  }

  if (po.status === 'DRAFT') {
    po = await purchaseService.confirmPurchaseOrder(po.id);
  }

  let bill = existing?.vendorBill;
  if (!bill) {
    bill = await purchaseService.convertPurchaseOrderToVendorBill(po.id);
  }

  if (!bill.payments || bill.payments.length === 0) {
    const billId = bill.id || existing.vendorBill.id;
    await purchaseService.recordVendorPayment(billId, '15000.00', 'bank');
  }

  console.log('✓ Demo purchase: Azure Furniture / Office Chair x5 @ 3000 → billed and paid (bank)');
  return po;
}

async function seedDemoSale(customer, officeChair) {
  const existing = await findMatchingOrder({
    customerId: customer.id,
    productId: officeChair.id,
    qty: 5,
    unitPrice: '5000.00',
  });

  if (existing?.customerInvoice?.payments?.length) {
    console.log(`✓ Demo sale already exists (SO ${existing.id})`);
    return existing;
  }

  let so = existing;
  if (!so) {
    so = await salesService.createSalesOrder(customer.id, [
      {
        productId: officeChair.id,
        qty: 5,
        unitPrice: '5000.00',
        tax: '0.00',
      },
    ]);
  }

  if (so.status === 'DRAFT') {
    so = await salesService.confirmSalesOrder(so.id);
  }

  let invoice = existing?.customerInvoice;
  if (!invoice) {
    invoice = await salesService.generateCustomerInvoice(so.id);
  }

  if (!invoice.payments || invoice.payments.length === 0) {
    const invoiceId = invoice.id || existing.customerInvoice.id;
    await salesService.recordCustomerPayment(invoiceId, '25000.00', 'cash');
  }

  console.log('✓ Demo sale: Nimesh Pathak / Office Chair x5 @ 5000 → invoiced and paid (cash)');
  return so;
}

async function main() {
  console.log('Seeding database (idempotent)...');

  await upsertUser({
    name: 'Admin User',
    email: 'admin@finedge.com',
    role: 'admin',
  });
  await upsertUser({
    name: 'Accountant User',
    email: 'accountant@finedge.com',
    role: 'accountant',
  });
  console.log('✓ Users upserted');

  const azureFurniture = await upsertContact({
    name: 'Azure Furniture',
    type: 'vendor',
    email: 'vendor@azurefurniture.com',
    mobile: '+91-9000000001',
  });
  const nimeshPathak = await upsertContact({
    name: 'Nimesh Pathak',
    type: 'customer',
    email: 'nimesh@example.com',
    mobile: '+91-9000000002',
  });
  await upsertContact({
    name: 'Hiteshbhai Prajapati',
    type: 'vendor',
    email: 'hitesh@gmail.com',
    mobile: '6354008649',
  });
  console.log('✓ Contacts upserted');

  const officeChair = await upsertProduct({
    name: 'Office Chair',
    type: 'furniture',
    salesPrice: '5000',
    cost: '3000',
    category: 'seating',
  });
  await upsertProduct({
    name: 'Wooden Table',
    type: 'furniture',
    salesPrice: '8000',
    cost: '5000',
    category: 'tables',
  });
  await upsertProduct({
    name: 'Sofa',
    type: 'furniture',
    salesPrice: '15000',
    cost: '9000',
    category: 'seating',
  });
  console.log('✓ Products upserted');

  await upsertAccount({ name: 'Bank', type: 'asset' });
  await upsertAccount({ name: 'Cash', type: 'asset' });
  await upsertAccount({ name: 'Creditors', type: 'liability' });
  await upsertAccount({ name: 'Debtors', type: 'asset' });
  await upsertAccount({ name: 'Owner Capital', type: 'capital' });
  await upsertAccount({ name: 'Purchase Expense', type: 'expense' });
  await upsertAccount({ name: 'Sales Income', type: 'income' });
  console.log('✓ Accounts upserted');

  await upsertJournal({ name: 'Bank Journal', type: 'bank' });
  await upsertJournal({ name: 'Cash Journal', type: 'cash' });
  await upsertJournal({ name: 'Purchase Journal', type: 'purchase' });
  await upsertJournal({ name: 'Sales Journal', type: 'sales' });
  console.log('✓ Journals upserted');

  await seedOpeningCapital();
  await seedDemoPurchase(azureFurniture, officeChair);
  await seedDemoSale(nimeshPathak, officeChair);

  console.log('\n✅ Database seeding complete (safe to run again).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
