import { PrismaClient } from '@prisma/client';
import { accountingService } from '../src/services/accounting.service.js';
import { purchaseService } from '../src/services/purchase.service.js';
import { salesService } from '../src/services/sales.service.js';
import { moneyStr } from '../src/lib/money.js';

const prisma = new PrismaClient();

// Helper to generate random data
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[random(0, arr.length - 1)];
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Sample data pools
const firstNames = ['Arjun', 'Priya', 'Rahul', 'Sneha', 'Amit', 'Kavya', 'Rohan', 'Ananya', 'Vikram', 'Meera', 
  'Aditya', 'Diya', 'Karan', 'Ishita', 'Siddharth', 'Neha', 'Harsh', 'Pooja', 'Nikhil', 'Riya',
  'Akash', 'Shreya', 'Varun', 'Tanvi', 'Dev', 'Aisha', 'Ayush', 'Sakshi', 'Yash', 'Simran'];

const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Reddy', 'Verma', 'Joshi', 'Mehta', 'Nair',
  'Rao', 'Desai', 'Agarwal', 'Kapoor', 'Kulkarni', 'Iyer', 'Malhotra', 'Saxena', 'Pandey', 'Trivedi'];

const companyTypes = ['Furniture', 'Interiors', 'Decor', 'Designs', 'Solutions', 'Industries', 'Enterprises', 'Traders'];
const companyNames = ['Azure', 'Royal', 'Golden', 'Silver', 'Premium', 'Elite', 'Modern', 'Classic', 'Urban', 'Metro'];

const furnitureTypes = [
  'Office Chair', 'Executive Chair', 'Ergonomic Chair', 'Gaming Chair', 'Dining Chair',
  'Coffee Table', 'Dining Table', 'Office Desk', 'Study Table', 'Console Table',
  'Sofa Set', 'L-Shape Sofa', 'Recliner Sofa', 'Sectional Sofa', 'Loveseat',
  'King Size Bed', 'Queen Size Bed', 'Single Bed', 'Bunk Bed', 'Storage Bed',
  'Wardrobe', 'Bookshelf', 'TV Unit', 'Shoe Rack', 'Filing Cabinet',
  'Bar Stool', 'Bean Bag', 'Ottoman', 'Bench', 'Accent Chair'
];

const categories = ['Seating', 'Tables', 'Storage', 'Beds', 'Office Furniture', 'Living Room', 'Dining Room'];

console.log('🚀 Starting bulk seed for 200+ entries per entity...\n');

async function setupMasterData() {
  console.log('📋 Setting up master data (accounts, journals, users)...');
  
  // Users
  const users = [
    { name: 'Admin User', email: 'admin@finedge.com', role: 'admin' },
    { name: 'Accountant User', email: 'accountant@finedge.com', role: 'accountant' },
    { name: 'Sales User', email: 'sales@finedge.com', role: 'accountant' },
    { name: 'Purchase User', email: 'purchase@finedge.com', role: 'accountant' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }

  // Accounts
  const accounts = [
    { name: 'Bank', type: 'asset' },
    { name: 'Cash', type: 'asset' },
    { name: 'Creditors', type: 'liability' },
    { name: 'Debtors', type: 'asset' },
    { name: 'Owner Capital', type: 'capital' },
    { name: 'Purchase Expense', type: 'expense' },
    { name: 'Sales Income', type: 'income' },
  ];

  for (const account of accounts) {
    await prisma.account.upsert({
      where: { name: account.name },
      update: account,
      create: account,
    });
  }

  // Journals
  const journals = [
    { name: 'Bank Journal', type: 'bank' },
    { name: 'Cash Journal', type: 'cash' },
    { name: 'Purchase Journal', type: 'purchase' },
    { name: 'Sales Journal', type: 'sales' },
  ];

  for (const journal of journals) {
    await prisma.journal.upsert({
      where: { name: journal.name },
      update: journal,
      create: journal,
    });
  }

  // Opening Capital
  const existingCapital = await prisma.journalEntry.findFirst({
    where: { reference: 'OPENING-CAPITAL' },
  });

  if (!existingCapital) {
    const bankAccount = await prisma.account.findUnique({ where: { name: 'Bank' } });
    const capitalAccount = await prisma.account.findUnique({ where: { name: 'Owner Capital' } });
    const bankJournal = await prisma.journal.findUnique({ where: { name: 'Bank Journal' } });

    await accountingService.createJournalEntry(
      bankJournal.id,
      new Date(),
      'OPENING-CAPITAL',
      [
        { accountId: bankAccount.id, debit: '500000.00', credit: 0 },
        { accountId: capitalAccount.id, debit: 0, credit: '500000.00' },
      ]
    );
  }

  console.log('✅ Master data setup complete\n');
}

async function seedContacts() {
  console.log('👥 Seeding 200 Contacts (100 customers, 100 vendors)...');
  
  const existingCount = await prisma.contact.count();
  if (existingCount >= 200) {
    console.log(`✅ Already have ${existingCount} contacts, skipping...\n`);
    return;
  }

  const contacts = [];
  
  // 100 Customers
  for (let i = 0; i < 100; i++) {
    const firstName = randomChoice(firstNames);
    const lastName = randomChoice(lastNames);
    contacts.push({
      name: `${firstName} ${lastName}`,
      type: 'customer',
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      mobile: `+91-${9000000000 + i}`,
    });
  }

  // 100 Vendors
  for (let i = 0; i < 100; i++) {
    const companyName = randomChoice(companyNames);
    const companyType = randomChoice(companyTypes);
    contacts.push({
      name: `${companyName} ${companyType}`,
      type: 'vendor',
      email: `info${i}@${companyName.toLowerCase()}${companyType.toLowerCase()}.com`,
      mobile: `+91-${8000000000 + i}`,
    });
  }

  await prisma.contact.createMany({
    data: contacts,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${contacts.length} contacts\n`);
}

async function seedProducts() {
  console.log('📦 Seeding 200 Products...');
  
  const existingCount = await prisma.product.count();
  if (existingCount >= 200) {
    console.log(`✅ Already have ${existingCount} products, skipping...\n`);
    return;
  }

  const products = [];
  
  for (let i = 0; i < 200; i++) {
    const baseProduct = randomChoice(furnitureTypes);
    const variant = i > 30 ? ` - Variant ${i}` : '';
    const cost = random(1000, 50000);
    const salesPrice = Math.round(cost * (1.3 + Math.random() * 0.7)); // 30-100% markup
    
    products.push({
      name: `${baseProduct}${variant}`,
      type: 'furniture',
      salesPrice: moneyStr(salesPrice),
      cost: moneyStr(cost),
      category: randomChoice(categories),
    });
  }

  await prisma.product.createMany({
    data: products,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${products.length} products\n`);
}

async function seedPurchaseOrders() {
  console.log('🛒 Seeding 200 Purchase Orders...');
  
  const existingCount = await prisma.purchaseOrder.count();
  if (existingCount >= 200) {
    console.log(`✅ Already have ${existingCount} purchase orders, skipping...\n`);
    return;
  }

  const vendors = await prisma.contact.findMany({ where: { type: 'vendor' }, take: 100 });
  const products = await prisma.product.findMany({ take: 200 });

  if (vendors.length === 0 || products.length === 0) {
    console.log('⚠️ Need contacts and products first\n');
    return;
  }

  let created = 0;
  const startDate = new Date('2024-01-01');
  const endDate = new Date();

  for (let i = 0; i < 200; i++) {
    try {
      const vendor = randomChoice(vendors);
      const numLines = random(1, 5);
      const lines = [];

      for (let j = 0; j < numLines; j++) {
        const product = randomChoice(products);
        const cost = parseFloat(product.cost);
        const qty = random(1, 20);
        const unitPrice = cost * (0.9 + Math.random() * 0.2); // ±10% variance

        lines.push({
          productId: product.id,
          qty,
          unitPrice: moneyStr(unitPrice),
        });
      }

      const po = await purchaseService.createPurchaseOrder(vendor.id, lines);
      
      // Randomly confirm some orders
      if (Math.random() > 0.3) {
        await purchaseService.confirmPurchaseOrder(po.id);
      }

      created++;
      if (created % 50 === 0) {
        console.log(`   Created ${created} purchase orders...`);
      }
    } catch (err) {
      console.error(`   Error creating PO ${i}:`, err.message);
    }
  }

  console.log(`✅ Created ${created} purchase orders\n`);
}

async function seedVendorBills() {
  console.log('💰 Converting Purchase Orders to Vendor Bills...');
  
  const confirmedPOs = await prisma.purchaseOrder.findMany({
    where: {
      status: 'CONFIRMED',
      vendorBill: null,
    },
    take: 150,
  });

  let converted = 0;

  for (const po of confirmedPOs) {
    try {
      const bill = await purchaseService.convertPurchaseOrderToVendorBill(po.id);
      
      // Randomly pay some bills
      if (Math.random() > 0.5) {
        const total = parseFloat(bill.total);
        const paymentAmount = Math.random() > 0.7 
          ? total // Full payment
          : Math.round(total * (0.3 + Math.random() * 0.5)); // Partial payment
        
        await purchaseService.recordVendorPayment(
          bill.id,
          moneyStr(paymentAmount),
          randomChoice(['bank', 'cash'])
        );
      }

      converted++;
      if (converted % 25 === 0) {
        console.log(`   Converted ${converted} bills...`);
      }
    } catch (err) {
      console.error(`   Error converting PO ${po.id}:`, err.message);
    }
  }

  console.log(`✅ Created ${converted} vendor bills with payments\n`);
}

async function seedSalesOrders() {
  console.log('🛍️ Seeding 200 Sales Orders...');
  
  const existingCount = await prisma.salesOrder.count();
  if (existingCount >= 200) {
    console.log(`✅ Already have ${existingCount} sales orders, skipping...\n`);
    return;
  }

  const customers = await prisma.contact.findMany({ where: { type: 'customer' }, take: 100 });
  const products = await prisma.product.findMany({ take: 200 });

  if (customers.length === 0 || products.length === 0) {
    console.log('⚠️ Need contacts and products first\n');
    return;
  }

  let created = 0;

  for (let i = 0; i < 200; i++) {
    try {
      const customer = randomChoice(customers);
      const numLines = random(1, 5);
      const lines = [];

      for (let j = 0; j < numLines; j++) {
        const product = randomChoice(products);
        const salesPrice = parseFloat(product.salesPrice);
        const qty = random(1, 15);
        const unitPrice = salesPrice * (0.95 + Math.random() * 0.1); // ±5% variance
        const tax = randomChoice([0, 5, 12, 18]); // GST rates

        lines.push({
          productId: product.id,
          qty,
          unitPrice: moneyStr(unitPrice),
          tax: moneyStr(tax),
        });
      }

      const so = await salesService.createSalesOrder(customer.id, lines);
      
      // Randomly confirm some orders
      if (Math.random() > 0.3) {
        await salesService.confirmSalesOrder(so.id);
      }

      created++;
      if (created % 50 === 0) {
        console.log(`   Created ${created} sales orders...`);
      }
    } catch (err) {
      console.error(`   Error creating SO ${i}:`, err.message);
    }
  }

  console.log(`✅ Created ${created} sales orders\n`);
}

async function seedCustomerInvoices() {
  console.log('📄 Generating Customer Invoices...');
  
  const confirmedSOs = await prisma.salesOrder.findMany({
    where: {
      status: 'CONFIRMED',
      customerInvoice: null,
    },
    take: 150,
  });

  let generated = 0;

  for (const so of confirmedSOs) {
    try {
      const invoice = await salesService.generateCustomerInvoice(so.id);
      
      // Randomly receive payments
      if (Math.random() > 0.5) {
        const total = parseFloat(invoice.total);
        const paymentAmount = Math.random() > 0.7 
          ? total // Full payment
          : Math.round(total * (0.4 + Math.random() * 0.5)); // Partial payment
        
        await salesService.recordCustomerPayment(
          invoice.id,
          moneyStr(paymentAmount),
          randomChoice(['bank', 'cash'])
        );
      }

      generated++;
      if (generated % 25 === 0) {
        console.log(`   Generated ${generated} invoices...`);
      }
    } catch (err) {
      console.error(`   Error generating invoice for SO ${so.id}:`, err.message);
    }
  }

  console.log(`✅ Created ${generated} customer invoices with payments\n`);
}

async function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 DATABASE SUMMARY');
  console.log('='.repeat(60));
  
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
  };

  console.log(`👤 Users:              ${counts.users}`);
  console.log(`👥 Contacts:           ${counts.contacts}`);
  console.log(`📦 Products:           ${counts.products}`);
  console.log(`💼 Accounts:           ${counts.accounts}`);
  console.log(`📖 Journals:           ${counts.journals}`);
  console.log(`🛒 Purchase Orders:    ${counts.purchaseOrders}`);
  console.log(`💰 Vendor Bills:       ${counts.vendorBills}`);
  console.log(`🛍️  Sales Orders:       ${counts.salesOrders}`);
  console.log(`📄 Customer Invoices:  ${counts.customerInvoices}`);
  console.log(`💳 Payments:           ${counts.payments}`);
  console.log(`📝 Journal Entries:    ${counts.journalEntries}`);
  console.log('='.repeat(60));
  console.log('✅ BULK SEED COMPLETE!');
  console.log('='.repeat(60) + '\n');
}

async function main() {
  try {
    await setupMasterData();
    await seedContacts();
    await seedProducts();
    await seedPurchaseOrders();
    await seedVendorBills();
    await seedSalesOrders();
    await seedCustomerInvoices();
    await printSummary();
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
