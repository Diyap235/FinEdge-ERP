import '../src/loadEnv.js';
import { PrismaClient } from '@prisma/client';
import { salesService } from '../src/services/sales.service.js';

const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.contact.findFirst({ where: { type: 'customer' } });
  const product = await prisma.product.findFirst({ where: { name: 'Wooden Table' } }) ||
                  await prisma.product.findFirst({ where: { name: 'Sofa' } });

  if (!customer || !product) {
    console.error('Missing customer or product');
    return;
  }

  const existingOrders = await prisma.salesOrder.count();
  if (existingOrders >= 2) {
    console.log(`Already have ${existingOrders} sales orders.`);
    return;
  }

  console.log(`Creating second sales order for ${product.name}...`);
  const so = await salesService.createSalesOrder(customer.id, [
    { productId: product.id, qty: 1, unitPrice: product.salesPrice, tax: 18 },
  ]);
  await salesService.confirmSalesOrder(so.id);
  const invoice = await salesService.generateCustomerInvoice(so.id);
  console.log(`✓ Sales Order #${so.id} & Customer Invoice #${invoice.id} created successfully!`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
