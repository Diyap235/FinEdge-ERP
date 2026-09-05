import { PrismaClient } from '@prisma/client';
import Decimal from 'decimal.js';
import { accountingService } from './accounting.service.js';

const prisma = new PrismaClient();

export const purchaseService = {
  /**
   * Convert Purchase Order to Vendor Bill
   * Creates the accounting entry: DEBIT Purchase Expense, CREDIT Creditors
   */
  async convertPurchaseOrderToVendorBill(purchaseOrderId) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: {
        lines: {
          include: {
            product: true,
          },
        },
        vendor: true,
      },
    });

    if (!po) {
      throw new Error(`Purchase Order ${purchaseOrderId} not found`);
    }

    if (po.status !== 'DRAFT' && po.status !== 'CONFIRMED') {
      throw new Error(
        `Cannot convert Purchase Order with status ${po.status}`
      );
    }

    if (po.lines.length === 0) {
      throw new Error('Purchase Order must have at least one line item');
    }

    // Calculate total bill amount
    let totalAmount = new Decimal(0);
    for (const line of po.lines) {
      const lineTotal = new Decimal(line.qty).times(
        new Decimal(line.unitPrice)
      );
      totalAmount = totalAmount.plus(lineTotal);
    }

    // Get accounts
    const purchaseExpenseAccount = await prisma.account.findUnique({
      where: { name: 'Purchase Expense' },
    });

    const creditorsAccount = await prisma.account.findUnique({
      where: { name: 'Creditors' },
    });

    if (!purchaseExpenseAccount) {
      throw new Error('Purchase Expense account not found');
    }

    if (!creditorsAccount) {
      throw new Error('Creditors account not found');
    }

    // Get Purchase Journal
    const journal = await prisma.journal.findUnique({
      where: { name: 'Purchase Journal' },
    });

    if (!journal) {
      throw new Error('Purchase Journal not found');
    }

    // Create Journal Entry
    const journalEntry = await accountingService.createJournalEntry(
      journal.id,
      [
        {
          accountId: purchaseExpenseAccount.id,
          debit: totalAmount.toFixed(2),
          credit: 0,
        },
        {
          accountId: creditorsAccount.id,
          debit: 0,
          credit: totalAmount.toFixed(2),
        },
      ],
      `PO-${purchaseOrderId}`
    );

    // Create Vendor Bill
    const vendorBill = await prisma.vendorBill.create({
      data: {
        purchaseOrderId,
        invoiceDate: new Date(),
        journalEntryId: journalEntry.id,
        status: 'UNPAID',
      },
      include: {
        purchaseOrder: true,
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

    // Update Purchase Order status
    await prisma.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: { status: 'BILLED' },
    });

    return vendorBill;
  },

  /**
   * Record payment for a vendor bill
   * Creates accounting entry: DEBIT Creditors, CREDIT Cash/Bank
   */
  async recordVendorPayment(billId, amount, paymentType) {
    if (!['cash', 'bank'].includes(paymentType)) {
      throw new Error('Payment type must be cash or bank');
    }

    const bill = await prisma.vendorBill.findUnique({
      where: { id: billId },
      include: {
        purchaseOrder: true,
        journalEntry: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!bill) {
      throw new Error(`Vendor Bill ${billId} not found`);
    }

    if (bill.status === 'PAID') {
      throw new Error('Bill is already paid');
    }

    // Calculate bill total
    let billTotal = new Decimal(0);
    for (const item of bill.journalEntry.items) {
      if (item.debit > 0) {
        billTotal = billTotal.plus(new Decimal(item.debit));
      }
    }

    const paymentAmount = new Decimal(amount);

    if (paymentAmount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    if (paymentAmount > billTotal) {
      throw new Error(
        `Payment amount (${paymentAmount}) exceeds bill total (${billTotal})`
      );
    }

    // Get accounts
    const creditorsAccount = await prisma.account.findUnique({
      where: { name: 'Creditors' },
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

    if (!creditorsAccount || !paymentAccount) {
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
          accountId: creditorsAccount.id,
          debit: paymentAmount.toFixed(2),
          credit: 0,
        },
        {
          accountId: paymentAccount.id,
          debit: 0,
          credit: paymentAmount.toFixed(2),
        },
      ],
      `PAYMENT-${billId}`
    );

    // Create Payment record
    const payment = await prisma.payment.create({
      data: {
        type: paymentType,
        amount: paymentAmount.toFixed(2),
        linkedBillId: billId,
        journalEntryId: journalEntry.id,
        status: 'RECORDED',
      },
    });

    // Check if bill is fully paid
    const totalPaid = await prisma.payment.aggregate({
      where: { linkedBillId: billId },
      _sum: { amount: true },
    });

    if (new Decimal(totalPaid._sum.amount || 0).equals(billTotal)) {
      await prisma.vendorBill.update({
        where: { id: billId },
        data: { status: 'PAID' },
      });
    }

    return {
      payment,
      journalEntry,
      billStatus: new Decimal(totalPaid._sum.amount || 0).equals(billTotal)
        ? 'PAID'
        : 'UNPAID',
    };
  },

  /**
   * Get all purchase orders
   */
  async getAllPurchaseOrders() {
    return await prisma.purchaseOrder.findMany({
      include: {
        vendor: true,
        lines: {
          include: {
            product: true,
          },
        },
        vendorBill: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  /**
   * Get all vendor bills
   */
  async getAllVendorBills() {
    return await prisma.vendorBill.findMany({
      include: {
        purchaseOrder: {
          include: {
            vendor: true,
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
   * Get vendor bill by ID
   */
  async getVendorBillById(billId) {
    return await prisma.vendorBill.findUnique({
      where: { id: billId },
      include: {
        purchaseOrder: {
          include: {
            vendor: true,
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

  /**
   * Get purchase order by ID
   */
  async getPurchaseOrderById(poId) {
    return await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: {
        vendor: true,
        lines: {
          include: {
            product: true,
          },
        },
        vendorBill: true,
      },
    });
  },

  /**
   * Create purchase order
   */
  async createPurchaseOrder(vendorId, lines) {
    if (!vendorId) {
      throw new Error('Vendor ID is required');
    }

    if (!Array.isArray(lines) || lines.length === 0) {
      throw new Error('At least one line item is required');
    }

    const vendor = await prisma.contact.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new Error('Vendor not found');
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

    const po = await prisma.purchaseOrder.create({
      data: {
        vendorId,
        status: 'DRAFT',
        lines: {
          create: lines.map((line) => ({
            productId: line.productId,
            qty: line.qty,
            unitPrice: new Decimal(line.unitPrice).toFixed(2),
          })),
        },
      },
      include: {
        vendor: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    return po;
  },

  /**
   * Confirm purchase order
   */
  async confirmPurchaseOrder(poId) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
    });

    if (!po) {
      throw new Error('Purchase Order not found');
    }

    if (po.status !== 'DRAFT') {
      throw new Error(
        `Cannot confirm Purchase Order with status ${po.status}`
      );
    }

    return await prisma.purchaseOrder.update({
      where: { id: poId },
      data: { status: 'CONFIRMED' },
      include: {
        vendor: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });
  },
};

export default purchaseService;
