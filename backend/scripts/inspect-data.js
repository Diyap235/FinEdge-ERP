import '../src/loadEnv.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.count();
  const contacts = await prisma.contact.count();
  const products = await prisma.product.count();
  const salesOrders = await prisma.salesOrder.count();
  const customerInvoices = await prisma.customerInvoice.count();
  const purchaseOrders = await prisma.purchaseOrder.count();
  const vendorBills = await prisma.vendorBill.count();
  const payments = await prisma.payment.count();

  console.log({
    users,
    contacts,
    products,
    salesOrders,
    customerInvoices,
    purchaseOrders,
    vendorBills,
    payments,
  });

  await prisma.$disconnect();
}

run();
