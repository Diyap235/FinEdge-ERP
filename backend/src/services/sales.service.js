import { PrismaClient } from '@prisma/client';
import Decimal from 'decimal.js';
import { accountingService } from './accounting.service.js';

const prisma = new PrismaClient();

export const salesService = {
  /**
   * Create sales order
   */
  async createSalesOrder(customerId, lines) {
    if (!customerId) {
      throw new Error('Customer ID is required');
    }

    if (!Array.isArray(lines) || lines.length === 0) {
      throw new Error('At least one line item is required');
    }

    const customer = await prisma.contact.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Verify all products exist
    for (const line of lines) {
      const product = await prisma.product.findUnique({
        where: { id: line.productId },
      });

      if (!product) {
        throw new Error(`Product ${line.productId} not found`);
      }
    }

    const so = await prisma.salesOrder.create({
      data: {
        customerId,
        status: 'DRAFT',
        lines: {
          create: lines.map((line) => ({
            productId: line.productId,
            qty: line.qty,
            unitPrice: new Decimal(line.unitPrice).toFixed(2),
            tax: new Decimal(line.tax || 0).toFixed(2),
          })),
        },
      },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    return so;
  },

  /**
   * Confirm sales order
   */
  async confirmSalesOrder(soId) {
    const so = await prisma.salesOrder.findUnique({
      where: { id: soId },
    });

    if (!so) {
      throw new Error('Sales Order not found');
    }

    if (so.status !== 'DRAFT') {
      throw new Error(`Cannot confirm Sales Order with status ${so.status}`);
    }

    return await prisma.salesOrder.update({
      where: { id: soId },
      data: { status: 'CONFIRMED' },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });
  },

  /**
   * Generate customer invoice from sales order
   * Creates accounting entry: DEBIT Debtors, CREDIT Sales Income
   * For MVP: Keep tax visible but accounting is simple
   */
  async generateCustomerInvoice(salesOrderId) {
    const so = await prisma.salesOrder.findUnique({
      where: { id: salesOrderId },
      include: {
        lines: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });

    if (!so) {
      throw new Error(`Sales Order ${salesOrderId} not found`);
    }

    if (so.status !== 'DRAFT' && so.status !== 'CONFIRMED') {
      throw new Error(
        `Cannot generate invoice for Sales Order with status ${so.status}`
      );
    }

    if (so.lines.length === 0) {
      throw new Error('Sales Order must have at least one line item');
    }

    // Calculate total invoice amount (subtotal + tax)
    let subtotal = new Decimal(0);
    let totalTax = new Decimal(0);

    for (const line of so.lines) {
      const lineTotal = new Decimal(line.qty).times(
        new Decimal(line.unitPrice)
      );
      const lineTax = lineTotal.times(new Decimal(line.tax || 0).div(100));

      subtotal = subtotal.plus(lineTotal);
      totalTax = totalTax.plus(lineTax);
    }

    const invoiceTotal = subtotal.plus(totalTax);

    // Get accounts
    const debtorsAccount = await prisma.account.findUnique({
      where: { name: 'Debtors' },
    });

    const salesIncomeAccount = await prisma.account.findUnique({
      where: { name: 'Sales Income' },
    });

    if (!debtorsAccount) {
      throw new Error('Debtors account not found');
    }

    if (!salesIncomeAccount) {
      throw new Error('Sales Income account not found');
    }

    // Get Sales Journal
    const journal = await prisma.journal.findUnique({
      where: { name: 'Sales Journal' },
    });

    if (!journal) {
      throw new Error('Sales Journal not found');
    }

    // Create Journal Entry
    const journalEntry = await accountingService.createJournalEntry(
      journal.id,
      [
        {
          accountId: debtorsAccount.id,
          debit: invoiceTotal.toFixed(2),
          credit: 0,
        },
        {
          accountId: salesIncomeAccount.id,
          debit: 0,
          credit: invoiceTotal.toFixed(2),
        },
      ],
      `SO-${salesOrderId}`
    );

    // Create Customer Invoice
    const invoice = await prisma.customerInvoice.create({
      data: {
        salesOrderId,
        invoiceDate: new Date(),
        journalEntryId: journalEntry.id,
        status: 'UNPAID',
      },
      include: {
        salesOrder: {
          include: {
            customer: true,
            lines: {
              include: {
                product: true,
              },
            },
          },
        },
        journalEntry: {
          include: {
            items: {
              include: {
                account: true,
              },
            },
          },
        },
      },
    });

    // Update Sales Order status
    await prisma.salesOrder.update({
      where: { id: salesOrderId },
      data: { status: 'INVOICED' },
    });

    return invoice;
  },

  /**
   * Record payment for customer invoice
   * Creates accounting entry: DEBIT Cash/Bank, CREDIT Debtors
   */
  async recordCustomerPayment(invoiceId, amount, paymentType) {
    if (!['cash', 'bank'].includes(paymentType)) {
      throw new Error('Payment type must be cash or bank');
    }

    const invoice = await prisma.customerInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        salesOrder: true,
        journalEntry: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new Error(`Customer Invoice ${invoiceId} not found`);
    }

    if (invoice.status === 'PAID') {
      throw new Error('Invoice is already paid');
    }

    // Calculate invoice total
    let invoiceTotal = new Decimal(0);
    for (const item of invoice.journalEntry.items) {
      if (item.debit > 0) {
        invoiceTotal = invoiceTotal.plus(new Decimal(item.debit));
      }
    }

    const paymentAmount = new Decimal(amount);

    if (paymentAmount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    if (paymentAmount > invoiceTotal) {
      throw new Error(
        `Payment amount (${paymentAmount}) exceeds invoice total (${invoiceTotal})`
      );
    }

    // Get accounts
    const debtorsAccount = await prisma.account.findUnique({
      where: { name: 'Debtors' },
    });

    let paymentAccount;
    if (paymentType === 'cash') {
      paymentAccount = await prisma.account.findUnique({
        where: { name: 'Cash' },
      });
    } else {
      paymentAccount = await prisma.account.findUnique({
        where: { name: 'Bank' },
      });
    }

    if (!debtorsAccount || !paymentAccount) {
      throw new Error('Required accounts not found');
    }

    // Get appropriate journal
    const journal = await prisma.journal.findUnique({
      where: {
        name: paymentType === 'cash' ? 'Cash Journal' : 'Bank Journal',
      },
    });

    if (!journal) {
      throw new Error(
        `${paymentType === 'cash' ? 'Cash' : 'Bank'} Journal not found`
      );
    }

    // Create payment journal entry
    const journalEntry = await accountingService.createJournalEntry(
      journal.id,
      [
        {
          accountId: paymentAccount.id,
          debit: paymentAmount.toFixed(2),
          credit: 0,
        },
        {
          accountId: debtorsAccount.id,
          debit: 0,
          credit: paymentAmount.toFixed(2),
        },
      ],
      `PAYMENT-${invoiceId}`
    );

    // Create Payment record
    const payment = await prisma.payment.create({
      data: {
        type: paymentType,
        amount: paymentAmount.toFixed(2),
        linkedInvoiceId: invoiceId,
        journalEntryId: journalEntry.id,
        status: 'RECORDED',
      },
    });

    // Check if invoice is fully paid
    const totalPaid = await prisma.payment.aggregate({
      where: { linkedInvoiceId: invoiceId },
      _sum: { amount: true },
    });

    if (new Decimal(totalPaid._sum.amount || 0).equals(invoiceTotal)) {
      await prisma.customerInvoice.update({
        where: { id: invoiceId },
        data: { status: 'PAID' },
      });
    }

    return {
      payment,
      journalEntry,
      invoiceStatus: new Decimal(totalPaid._sum.amount || 0).equals(
        invoiceTotal
      )
        ? 'PAID'
        : 'UNPAID',
    };
  },

  /**
   * Get all sales orders
   */
  async getAllSalesOrders() {
    return await prisma.salesOrder.findMany({
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
          },
        },
        customerInvoice: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  /**
   * Get sales order by ID
   */
  async getSalesOrderById(soId) {
    return await prisma.salesOrder.findUnique({
      where: { id: soId },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
          },
        },
        customerInvoice: true,
      },
    });
  },

  /**
   * Get all customer invoices
   */
  async getAllCustomerInvoices() {
    return await prisma.customerInvoice.findMany({
      include: {
        salesOrder: {
          include: {
            customer: true,
            lines: {
              include: {
                product: true,
              },
            },
          },
        },
        journalEntry: {
          include: {
            items: {
              include: {
                account: true,
              },
            },
          },
        },
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  /**
   * Get customer invoice by ID
   */
  async getCustomerInvoiceById(invoiceId) {
    return await prisma.customerInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        salesOrder: {
          include: {
            customer: true,
            lines: {
              include: {
                product: true,
              },
            },
          },
        },
        journalEntry: {
          include: {
            items: {
              include: {
                account: true,
              },
            },
          },
        },
        payments: true,
      },
    });
  },
};

export default salesService;
