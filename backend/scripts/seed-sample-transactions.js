import '../src/loadEnv.js';
import { PrismaClient } from '@prisma/client';
import { salesService } from '../src/services/sales.service.js';
import { purchaseService } from '../src/services/purchase.service.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sample transactions...');

  const customer = await prisma.contact.findFirst({ where: { type: 'customer' } });
  const vendor = await prisma.contact.findFirst({ where: { type: 'vendor' } });
  const product = await prisma.product.findFirst({ where: { name: 'Office Chair' } });

  if (!customer || !vendor || !product) {
    console.error('Missing prerequisite seed data');
    return;
  }

  // Check if transactions already exist
  const existingOrders = await prisma.salesOrder.count();
  if (existingOrders > 0) {
    console.log('Transactions already exist, skipping.');
    return;
  }

  // 1. Create Purchase Order from Azure Furniture
  console.log('Creating Purchase Order...');
  const po = await purchaseService.createPurchaseOrder(vendor.id, [
    { productId: product.id, qty: 10, unitPrice: product.cost },
  ]);
  await purchaseService.confirmPurchaseOrder(po.id);
  const bill = await purchaseService.convertPurchaseOrderToVendorBill(po.id);
  console.log(`✓ Purchase Order #${po.id} & Vendor Bill #${bill.id} created`);

  // 2. Create Sales Order for Nimesh Pathak
  console.log('Creating Sales Order...');
  const so = await salesService.createSalesOrder(customer.id, [
    { productId: product.id, qty: 2, unitPrice: product.salesPrice, tax: 18 },
  ]);
  await salesService.confirmSalesOrder(so.id);
  const invoice = await salesService.generateCustomerInvoice(so.id);
  console.log(`✓ Sales Order #${so.id} & Customer Invoice #${invoice.id} created`);

  console.log('\nSample transactions seeded successfully!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
