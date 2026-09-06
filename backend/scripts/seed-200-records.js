import '../src/loadEnv.js';
import { PrismaClient } from '@prisma/client';
import { money, moneyStr } from '../src/lib/money.js';

const prisma = new PrismaClient();

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[random(0, arr.length - 1)];

// Generate a random date in the last 12 months
function getRandomPastDate(daysAgoMin = 1, daysAgoMax = 360) {
  const days = random(daysAgoMin, daysAgoMax);
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(random(9, 18), random(0, 59), random(0, 59), 0);
  return d;
}

async function main() {
  console.log('🚀 Starting fast bulk seeder for 200+ POs, Vendor Bills, and Sales Orders...\n');

  // 1. Fetch Accounts and Journals
  const accounts = await prisma.account.findMany();
  const journals = await prisma.journal.findMany();

  const getAccount = (name) => {
    const a = accounts.find((x) => x.name === name);
    if (!a) throw new Error(`Missing account: ${name}`);
    return a;
  };
  const getJournal = (name) => {
    const j = journals.find((x) => x.name === name);
    if (!j) throw new Error(`Missing journal: ${name}`);
    return j;
  };

  const purchaseExpenseAcc = getAccount('Purchase Expense');
  const creditorsAcc = getAccount('Creditors');
  const debtorsAcc = getAccount('Debtors');
  const salesIncomeAcc = getAccount('Sales Income');
  const bankAcc = getAccount('Bank');
  const cashAcc = getAccount('Cash');

  const purchaseJournal = getJournal('Purchase Journal');
  const salesJournal = getJournal('Sales Journal');
  const bankJournal = getJournal('Bank Journal');
  const cashJournal = getJournal('Cash Journal');

  // 2. Fetch Contacts and Products
  const vendors = await prisma.contact.findMany({
    where: { type: { in: ['vendor', 'both'] } },
  });
  const customers = await prisma.contact.findMany({
    where: { type: { in: ['customer', 'both'] } },
  });
  const products = await prisma.product.findMany();

  if (vendors.length === 0 || customers.length === 0 || products.length === 0) {
    throw new Error('Contacts or products not found. Run base seed first.');
  }

  console.log(`Found ${vendors.length} vendors, ${customers.length} customers, ${products.length} products.`);

  // -------------------------------------------------------------
  // STEP 1: CONVERT EXISTING CONFIRMED POs WITHOUT BILLS
  // -------------------------------------------------------------
  const existingBillsCount = await prisma.vendorBill.count();
  console.log(`Current Vendor Bills count: ${existingBillsCount}`);

  const confirmedPOs = await prisma.purchaseOrder.findMany({
    where: {
      status: 'CONFIRMED',
      vendorBill: null,
    },
    include: { lines: true },
  });

  console.log(`Found ${confirmedPOs.length} existing CONFIRMED POs without bills.`);

  for (const po of confirmedPOs) {
    if (po.lines.length === 0) continue;
    const poTotal = po.lines.reduce(
      (sum, l) => sum.plus(money(l.qty).times(money(l.unitPrice))),
      money(0)
    );
    const date = po.createdAt || getRandomPastDate(30, 180);
    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + 30);

    const jEntry = await prisma.journalEntry.create({
      data: {
        journalId: purchaseJournal.id,
        date,
        reference: `PO-${po.id}`,
        status: 'POSTED',
        items: {
          create: [
            { accountId: purchaseExpenseAcc.id, debit: moneyStr(poTotal), credit: 0 },
            { accountId: creditorsAcc.id, debit: 0, credit: moneyStr(poTotal) },
          ],
        },
      },
    });

    await prisma.vendorBill.create({
      data: {
        purchaseOrderId: po.id,
        invoiceDate: date,
        dueDate,
        status: 'POSTED',
        journalEntryId: jEntry.id,
      },
    });

    await prisma.purchaseOrder.update({
      where: { id: po.id },
      data: { status: 'BILLED' },
    });
  }

  const billsAfterExisting = await prisma.vendorBill.count();
  console.log(`Vendor Bills after converting existing POs: ${billsAfterExisting}`);

  // -------------------------------------------------------------
  // STEP 2: CREATE MORE PURCHASE ORDERS & VENDOR BILLS TO REACH 200+
  // -------------------------------------------------------------
  const neededBills = Math.max(0, 200 - billsAfterExisting);
  console.log(`Creating ${neededBills} more BILLED Purchase Orders + Vendor Bills...`);

  if (neededBills > 0) {
    // Generate PO data
    const poCreateData = [];
    const poLineSpecs = [];

    for (let i = 0; i < neededBills; i++) {
      const vendor = randomChoice(vendors);
      const date = getRandomPastDate(15, 300);
      poCreateData.push({
        vendorId: vendor.id,
        status: 'BILLED',
        createdAt: date,
        updatedAt: date,
      });

      // 1 to 4 lines
      const numLines = random(1, 4);
      const lines = [];
      for (let j = 0; j < numLines; j++) {
        const product = randomChoice(products);
        const cost = parseFloat(product.cost) || 1000;
        const qty = random(1, 15);
        const unitPrice = (cost * (0.9 + Math.random() * 0.2)).toFixed(2);
        lines.push({ productId: product.id, qty, unitPrice });
      }
      poLineSpecs.push(lines);
    }

    const createdPOs = await prisma.purchaseOrder.createManyAndReturn({
      data: poCreateData,
    });

    // Create lines and compute totals
    const allLinesToInsert = [];
    const poTotals = [];

    for (let i = 0; i < createdPOs.length; i++) {
      const po = createdPOs[i];
      const lines = poLineSpecs[i];
      let total = money(0);

      for (const line of lines) {
        allLinesToInsert.push({
          purchaseOrderId: po.id,
          productId: line.productId,
          qty: line.qty,
          unitPrice: line.unitPrice,
          createdAt: po.createdAt,
          updatedAt: po.createdAt,
        });
        total = total.plus(money(line.qty).times(money(line.unitPrice)));
      }
      poTotals.push({ po, total });
    }

    await prisma.purchaseOrderLine.createMany({
      data: allLinesToInsert,
    });

    // Create Journal Entries for each
    const jEntriesToCreate = poTotals.map(({ po }) => ({
      journalId: purchaseJournal.id,
      date: po.createdAt,
      reference: `PO-${po.id}`,
      status: 'POSTED',
      createdAt: po.createdAt,
      updatedAt: po.createdAt,
    }));

    const createdJEntries = await prisma.journalEntry.createManyAndReturn({
      data: jEntriesToCreate,
    });

    const jItemsToInsert = [];
    const billsToCreate = [];

    for (let i = 0; i < createdPOs.length; i++) {
      const { po, total } = poTotals[i];
      const jEntry = createdJEntries[i];
      const dueDate = new Date(po.createdAt);
      dueDate.setDate(dueDate.getDate() + 30);

      jItemsToInsert.push({
        entryId: jEntry.id,
        accountId: purchaseExpenseAcc.id,
        debit: moneyStr(total),
        credit: 0,
        createdAt: po.createdAt,
        updatedAt: po.createdAt,
      });
      jItemsToInsert.push({
        entryId: jEntry.id,
        accountId: creditorsAcc.id,
        debit: 0,
        credit: moneyStr(total),
        createdAt: po.createdAt,
        updatedAt: po.createdAt,
      });

      billsToCreate.push({
        purchaseOrderId: po.id,
        invoiceDate: po.createdAt,
        dueDate,
        status: 'POSTED',
        journalEntryId: jEntry.id,
        createdAt: po.createdAt,
        updatedAt: po.createdAt,
      });
    }

    await prisma.journalItem.createMany({
      data: jItemsToInsert,
    });

    await prisma.vendorBill.createMany({
      data: billsToCreate,
    });

    console.log(`✅ Created ${createdPOs.length} BILLED POs, lines, journal entries, and vendor bills.`);
  }

  // Also add some CONFIRMED and DRAFT POs to ensure rich variety
  const extraPOsToCreate = [];
  const extraLinesSpecs = [];
  for (let i = 0; i < 30; i++) {
    const status = i < 15 ? 'CONFIRMED' : 'DRAFT';
    const vendor = randomChoice(vendors);
    const date = getRandomPastDate(1, 90);
    extraPOsToCreate.push({
      vendorId: vendor.id,
      status,
      createdAt: date,
      updatedAt: date,
    });
    const lines = [];
    for (let j = 0; j < random(1, 3); j++) {
      const product = randomChoice(products);
      lines.push({
        productId: product.id,
        qty: random(1, 10),
        unitPrice: (parseFloat(product.cost) || 1000).toFixed(2),
      });
    }
    extraLinesSpecs.push(lines);
  }

  const extraPOs = await prisma.purchaseOrder.createManyAndReturn({
    data: extraPOsToCreate,
  });
  const extraLines = [];
  for (let i = 0; i < extraPOs.length; i++) {
    for (const l of extraLinesSpecs[i]) {
      extraLines.push({
        purchaseOrderId: extraPOs[i].id,
        productId: l.productId,
        qty: l.qty,
        unitPrice: l.unitPrice,
        createdAt: extraPOs[i].createdAt,
        updatedAt: extraPOs[i].createdAt,
      });
    }
  }
  await prisma.purchaseOrderLine.createMany({ data: extraLines });
  console.log(`✅ Added 30 additional unbilled POs (CONFIRMED/DRAFT).`);

  // -------------------------------------------------------------
  // STEP 3: CREATE SALES ORDERS & CUSTOMER INVOICES (TARGET 200+)
  // -------------------------------------------------------------
  const existingInvoicesCount = await prisma.customerInvoice.count();
  console.log(`Current Customer Invoices count: ${existingInvoicesCount}`);

  const neededInvoices = Math.max(0, 200 - existingInvoicesCount);
  console.log(`Creating ${neededInvoices} more INVOICED Sales Orders + Customer Invoices...`);

  if (neededInvoices > 0) {
    const soCreateData = [];
    const soLineSpecs = [];

    for (let i = 0; i < neededInvoices; i++) {
      const customer = randomChoice(customers);
      const date = getRandomPastDate(10, 300);
      soCreateData.push({
        customerId: customer.id,
        status: 'INVOICED',
        createdAt: date,
        updatedAt: date,
      });

      const numLines = random(1, 4);
      const lines = [];
      for (let j = 0; j < numLines; j++) {
        const product = randomChoice(products);
        const salesPrice = parseFloat(product.salesPrice) || 2000;
        const qty = random(1, 12);
        const unitPrice = (salesPrice * (0.95 + Math.random() * 0.1)).toFixed(2);
        const tax = randomChoice([0, 5, 12, 18]);
        lines.push({ productId: product.id, qty, unitPrice, tax });
      }
      soLineSpecs.push(lines);
    }

    const createdSOs = await prisma.salesOrder.createManyAndReturn({
      data: soCreateData,
    });

    const allSoLinesToInsert = [];
    const soTotals = [];

    for (let i = 0; i < createdSOs.length; i++) {
      const so = createdSOs[i];
      const lines = soLineSpecs[i];
      let total = money(0);

      for (const line of lines) {
        allSoLinesToInsert.push({
          salesOrderId: so.id,
          productId: line.productId,
          qty: line.qty,
          unitPrice: line.unitPrice,
          tax: line.tax,
          createdAt: so.createdAt,
          updatedAt: so.createdAt,
        });
        const subtotal = money(line.qty).times(money(line.unitPrice));
        const taxAmount = subtotal.times(money(line.tax).dividedBy(100));
        total = total.plus(subtotal).plus(taxAmount);
      }
      soTotals.push({ so, total });
    }

    await prisma.salesOrderLine.createMany({
      data: allSoLinesToInsert,
    });

    // Journal Entries for Sales
    const jEntriesToCreate = soTotals.map(({ so }) => ({
      journalId: salesJournal.id,
      date: so.createdAt,
      reference: `SO-${so.id}`,
      status: 'POSTED',
      createdAt: so.createdAt,
      updatedAt: so.createdAt,
    }));

    const createdJEntries = await prisma.journalEntry.createManyAndReturn({
      data: jEntriesToCreate,
    });

    const jItemsToInsert = [];
    const invoicesToCreate = [];

    for (let i = 0; i < createdSOs.length; i++) {
      const { so, total } = soTotals[i];
      const jEntry = createdJEntries[i];
      const dueDate = new Date(so.createdAt);
      dueDate.setDate(dueDate.getDate() + 30);

      jItemsToInsert.push({
        entryId: jEntry.id,
        accountId: debtorsAcc.id,
        debit: moneyStr(total),
        credit: 0,
        createdAt: so.createdAt,
        updatedAt: so.createdAt,
      });
      jItemsToInsert.push({
        entryId: jEntry.id,
        accountId: salesIncomeAcc.id,
        debit: 0,
        credit: moneyStr(total),
        createdAt: so.createdAt,
        updatedAt: so.createdAt,
      });

      invoicesToCreate.push({
        salesOrderId: so.id,
        invoiceDate: so.createdAt,
        dueDate,
        status: 'POSTED',
        journalEntryId: jEntry.id,
        createdAt: so.createdAt,
        updatedAt: so.createdAt,
      });
    }

    await prisma.journalItem.createMany({
      data: jItemsToInsert,
    });

    await prisma.customerInvoice.createMany({
      data: invoicesToCreate,
    });

    console.log(`✅ Created ${createdSOs.length} INVOICED SOs, lines, journal entries, and customer invoices.`);
  }

  // Also add some CONFIRMED and DRAFT Sales Orders
  const extraSOsToCreate = [];
  const extraSoLinesSpecs = [];
  for (let i = 0; i < 30; i++) {
    const status = i < 15 ? 'CONFIRMED' : 'DRAFT';
    const customer = randomChoice(customers);
    const date = getRandomPastDate(1, 90);
    extraSOsToCreate.push({
      customerId: customer.id,
      status,
      createdAt: date,
      updatedAt: date,
    });
    const lines = [];
    for (let j = 0; j < random(1, 3); j++) {
      const product = randomChoice(products);
      lines.push({
        productId: product.id,
        qty: random(1, 10),
        unitPrice: (parseFloat(product.salesPrice) || 2000).toFixed(2),
        tax: 18,
      });
    }
    extraSoLinesSpecs.push(lines);
  }

  const extraSOs = await prisma.salesOrder.createManyAndReturn({
    data: extraSOsToCreate,
  });
  const extraSoLines = [];
  for (let i = 0; i < extraSOs.length; i++) {
    for (const l of extraSoLinesSpecs[i]) {
      extraSoLines.push({
        salesOrderId: extraSOs[i].id,
        productId: l.productId,
        qty: l.qty,
        unitPrice: l.unitPrice,
        tax: l.tax,
        createdAt: extraSOs[i].createdAt,
        updatedAt: extraSOs[i].createdAt,
      });
    }
  }
  await prisma.salesOrderLine.createMany({ data: extraSoLines });
  console.log(`✅ Added 30 additional un-invoiced SOs (CONFIRMED/DRAFT).`);

  // -------------------------------------------------------------
  // STEP 4: PAYMENTS FOR A REALISTIC ERP (50% of Bills and Invoices)
  // -------------------------------------------------------------
  console.log('💳 Seeding realistic payments for bills and invoices...');

  // Bills to pay
  const unpaidBills = await prisma.vendorBill.findMany({
    where: { status: 'POSTED', payments: { none: {} } },
    include: {
      purchaseOrder: { include: { lines: true } },
    },
    take: 100,
  });

  const billPaymentsToCreate = [];
  const billJEntriesToCreate = [];
  const billJItemsToCreate = [];
  const billStatusUpdates = [];

  for (const bill of unpaidBills) {
    const total = bill.purchaseOrder.lines.reduce(
      (sum, l) => sum.plus(money(l.qty).times(money(l.unitPrice))),
      money(0)
    );
    if (total.lessThanOrEqualTo(0)) continue;

    const isFull = Math.random() > 0.4;
    const paymentAmount = isFull ? total : total.times(0.5);
    const payType = randomChoice(['bank', 'cash']);
    const payJournal = payType === 'cash' ? cashJournal : bankJournal;
    const payAccount = payType === 'cash' ? cashAcc : bankAcc;
    const payDate = new Date(bill.invoiceDate);
    payDate.setDate(payDate.getDate() + random(2, 15));

    billJEntriesToCreate.push({
      journalId: payJournal.id,
      date: payDate,
      reference: `VENDOR-PAYMENT-${bill.id}`,
      status: 'POSTED',
      createdAt: payDate,
      updatedAt: payDate,
      // Metadata for subsequent steps
      _billId: bill.id,
      _payType: payType,
      _amount: moneyStr(paymentAmount),
      _payAccount: payAccount,
      _isFull: isFull,
    });
  }

  if (billJEntriesToCreate.length > 0) {
    const createdPayJEntries = await prisma.journalEntry.createManyAndReturn({
      data: billJEntriesToCreate.map(({ journalId, date, reference, status, createdAt, updatedAt }) => ({
        journalId,
        date,
        reference,
        status,
        createdAt,
        updatedAt,
      })),
    });

    for (let i = 0; i < createdPayJEntries.length; i++) {
      const meta = billJEntriesToCreate[i];
      const jEntry = createdPayJEntries[i];

      // Debit: Creditors, Credit: Bank/Cash
      billJItemsToCreate.push({
        entryId: jEntry.id,
        accountId: creditorsAcc.id,
        debit: meta._amount,
        credit: 0,
        createdAt: jEntry.date,
        updatedAt: jEntry.date,
      });
      billJItemsToCreate.push({
        entryId: jEntry.id,
        accountId: meta._payAccount.id,
        debit: 0,
        credit: meta._amount,
        createdAt: jEntry.date,
        updatedAt: jEntry.date,
      });

      billPaymentsToCreate.push({
        type: meta._payType,
        amount: meta._amount,
        date: jEntry.date,
        linkedBillId: meta._billId,
        journalEntryId: jEntry.id,
        status: 'RECORDED',
        createdAt: jEntry.date,
        updatedAt: jEntry.date,
      });

      if (meta._isFull) {
        billStatusUpdates.push(meta._billId);
      }
    }

    await prisma.journalItem.createMany({ data: billJItemsToCreate });
    await prisma.payment.createMany({ data: billPaymentsToCreate });
    if (billStatusUpdates.length > 0) {
      await prisma.vendorBill.updateMany({
        where: { id: { in: billStatusUpdates } },
        data: { status: 'PAID' },
      });
    }
    console.log(`✅ Recorded ${billPaymentsToCreate.length} vendor bill payments.`);
  }

  // Invoices to pay
  const unpaidInvoices = await prisma.customerInvoice.findMany({
    where: { status: 'POSTED', payments: { none: {} } },
    include: {
      salesOrder: { include: { lines: true } },
    },
    take: 100,
  });

  const invPaymentsToCreate = [];
  const invJEntriesToCreate = [];
  const invJItemsToCreate = [];
  const invStatusUpdates = [];

  for (const inv of unpaidInvoices) {
    const total = inv.salesOrder.lines.reduce((sum, l) => {
      const sub = money(l.qty).times(money(l.unitPrice));
      const tax = sub.times(money(l.tax).dividedBy(100));
      return sum.plus(sub).plus(tax);
    }, money(0));

    if (total.lessThanOrEqualTo(0)) continue;

    const isFull = Math.random() > 0.4;
    const paymentAmount = isFull ? total : total.times(0.5);
    const payType = randomChoice(['bank', 'cash']);
    const payJournal = payType === 'cash' ? cashJournal : bankJournal;
    const payAccount = payType === 'cash' ? cashAcc : bankAcc;
    const payDate = new Date(inv.invoiceDate);
    payDate.setDate(payDate.getDate() + random(2, 15));

    invJEntriesToCreate.push({
      journalId: payJournal.id,
      date: payDate,
      reference: `CUSTOMER-PAYMENT-${inv.id}`,
      status: 'POSTED',
      createdAt: payDate,
      updatedAt: payDate,
      _invId: inv.id,
      _payType: payType,
      _amount: moneyStr(paymentAmount),
      _payAccount: payAccount,
      _isFull: isFull,
    });
  }

  if (invJEntriesToCreate.length > 0) {
    const createdPayJEntries = await prisma.journalEntry.createManyAndReturn({
      data: invJEntriesToCreate.map(({ journalId, date, reference, status, createdAt, updatedAt }) => ({
        journalId,
        date,
        reference,
        status,
        createdAt,
        updatedAt,
      })),
    });

    for (let i = 0; i < createdPayJEntries.length; i++) {
      const meta = invJEntriesToCreate[i];
      const jEntry = createdPayJEntries[i];

      // Debit: Bank/Cash, Credit: Debtors
      invJItemsToCreate.push({
        entryId: jEntry.id,
        accountId: meta._payAccount.id,
        debit: meta._amount,
        credit: 0,
        createdAt: jEntry.date,
        updatedAt: jEntry.date,
      });
      invJItemsToCreate.push({
        entryId: jEntry.id,
        accountId: debtorsAcc.id,
        debit: 0,
        credit: meta._amount,
        createdAt: jEntry.date,
        updatedAt: jEntry.date,
      });

      invPaymentsToCreate.push({
        type: meta._payType,
        amount: meta._amount,
        date: jEntry.date,
        linkedInvoiceId: meta._invId,
        journalEntryId: jEntry.id,
        status: 'RECORDED',
        createdAt: jEntry.date,
        updatedAt: jEntry.date,
      });

      if (meta._isFull) {
        invStatusUpdates.push(meta._invId);
      }
    }

    await prisma.journalItem.createMany({ data: invJItemsToCreate });
    await prisma.payment.createMany({ data: invPaymentsToCreate });
    if (invStatusUpdates.length > 0) {
      await prisma.customerInvoice.updateMany({
        where: { id: { in: invStatusUpdates } },
        data: { status: 'PAID' },
      });
    }
    console.log(`✅ Recorded ${invPaymentsToCreate.length} customer invoice payments.`);
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL DATABASE RECORD COUNTS');
  console.log('='.repeat(60));
  console.log({
    users: await prisma.user.count(),
    contacts: await prisma.contact.count(),
    products: await prisma.product.count(),
    purchaseOrders: await prisma.purchaseOrder.count(),
    vendorBills: await prisma.vendorBill.count(),
    salesOrders: await prisma.salesOrder.count(),
    customerInvoices: await prisma.customerInvoice.count(),
    payments: await prisma.payment.count(),
    journalEntries: await prisma.journalEntry.count(),
    journalItems: await prisma.journalItem.count(),
  });
  console.log('='.repeat(60) + '\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
