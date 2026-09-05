import { PrismaClient } from '@prisma/client';
import Decimal from 'decimal.js';
import { reportService } from '../services/report.service.js';
import { salesService } from '../services/sales.service.js';
import { purchaseService } from '../services/purchase.service.js';
import { accountingService } from '../services/accounting.service.js';
import { PERMISSION_DENIED, canUseTool, normalizeRole } from './permissions.js';

const prisma = new PrismaClient();
const MAX_ROWS = 25;

export class PermissionError extends Error {
  constructor(message = PERMISSION_DENIED) {
    super(message);
    this.name = 'PermissionError';
    this.statusCode = 403;
  }
}

function jsonSafe(value) {
  return JSON.parse(
    JSON.stringify(value, (_, current) => {
      if (current instanceof Decimal) return current.toFixed(2);
      if (typeof current === 'bigint') return current.toString();
      return current;
    })
  );
}

function startOfDay(date = new Date()) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function invoiceTotal(invoice) {
  const lines = invoice.salesOrder?.lines || [];
  return lines.reduce((sum, line) => {
    const qty = new Decimal(line.qty || 0);
    const price = new Decimal(line.unitPrice || 0);
    const tax = new Decimal(line.tax || 0);
    return sum.plus(qty.times(price).plus(tax));
  }, new Decimal(0));
}

function billTotal(bill) {
  const lines = bill.purchaseOrder?.lines || [];
  return lines.reduce((sum, line) => {
    const qty = new Decimal(line.qty || 0);
    const price = new Decimal(line.unitPrice || 0);
    return sum.plus(qty.times(price));
  }, new Decimal(0));
}

async function findLinkedContact(user) {
  if (!user?.email) return null;
  return prisma.contact.findFirst({
    where: {
      email: {
        equals: user.email,
        mode: 'insensitive',
      },
    },
  });
}

async function getDashboardSummary() {
  const summary = await reportService.getDashboardSummary();
  return jsonSafe({
    revenue: summary.revenue,
    expenses: summary.expenses,
    netProfit: summary.netProfit,
    cashBalance: summary.cashBalance,
    bankBalance: summary.bankBalance,
    receivables: summary.receivables,
    payables: summary.payables,
    recentTransactions: (summary.recentTransactions || []).slice(0, 10).map((entry) => ({
      id: entry.id,
      date: entry.date,
      journal: entry.journal,
      reference: entry.reference,
    })),
  });
}

async function getSalesSummary() {
  const invoices = await salesService.getAllCustomerInvoices();
  const today = startOfDay();
  const monthStart = startOfMonth();

  let todayTotal = new Decimal(0);
  let monthTotal = new Decimal(0);
  let allTime = new Decimal(0);
  let todayCount = 0;
  let monthCount = 0;

  for (const invoice of invoices) {
    const total = invoiceTotal(invoice);
    allTime = allTime.plus(total);
    const invoiceDate = new Date(invoice.invoiceDate);
    if (invoiceDate >= today) {
      todayTotal = todayTotal.plus(total);
      todayCount += 1;
    }
    if (invoiceDate >= monthStart) {
      monthTotal = monthTotal.plus(total);
      monthCount += 1;
    }
  }

  const pl = await reportService.getProfitAndLoss();

  return {
    todaySales: todayTotal.toFixed(2),
    todayInvoiceCount: todayCount,
    monthSales: monthTotal.toFixed(2),
    monthInvoiceCount: monthCount,
    invoicedSalesAllTime: allTime.toFixed(2),
    postedRevenueFromAccounts: pl.totalIncome,
    note: 'todaySales/monthSales are customer invoice line totals. postedRevenueFromAccounts comes from income journal items.',
  };
}

async function getProducts() {
  const products = await prisma.product.findMany({
    take: MAX_ROWS,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      type: true,
      salesPrice: true,
      cost: true,
      category: true,
    },
  });
  return jsonSafe(products);
}

async function getLowStockProducts({ threshold = 5 } = {}) {
  const products = await prisma.product.findMany({
    include: {
      purchaseOrderLines: {
        include: { purchaseOrder: { select: { status: true } } },
      },
      salesOrderLines: {
        include: { salesOrder: { select: { status: true } } },
      },
    },
  });

  const stock = products.map((product) => {
    const purchased = product.purchaseOrderLines.reduce((sum, line) => {
      if (!['CONFIRMED', 'BILLED'].includes(line.purchaseOrder.status)) return sum;
      return sum + line.qty;
    }, 0);
    const sold = product.salesOrderLines.reduce((sum, line) => {
      if (!['CONFIRMED', 'INVOICED'].includes(line.salesOrder.status)) return sum;
      return sum + line.qty;
    }, 0);
    const onHand = purchased - sold;
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      onHand,
      purchased,
      sold,
    };
  });

  const low = stock
    .filter((item) => item.onHand <= Number(threshold))
    .sort((a, b) => a.onHand - b.onHand)
    .slice(0, MAX_ROWS);

  return {
    threshold: Number(threshold),
    note: 'Product has no stock field. onHand is confirmed/billed purchase qty minus confirmed/invoiced sales qty.',
    products: low,
  };
}

async function getCustomers() {
  const customers = await prisma.contact.findMany({
    where: { type: { in: ['customer', 'both'] } },
    take: MAX_ROWS,
    orderBy: { name: 'asc' },
    select: { id: true, name: true, type: true, email: true, mobile: true },
  });
  return customers;
}

async function getCustomerDetails({ customerId, name } = {}) {
  const where = customerId
    ? { id: Number(customerId) }
    : name
      ? { name: { contains: String(name), mode: 'insensitive' } }
      : null;

  if (!where) {
    return { error: 'Provide customerId or name' };
  }

  const customer = await prisma.contact.findFirst({
    where,
    include: {
      salesOrders: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          lines: { include: { product: { select: { name: true } } } },
          customerInvoice: { select: { id: true, status: true, invoiceDate: true } },
        },
      },
    },
  });

  if (!customer) return { error: 'Customer not found' };
  return jsonSafe(customer);
}

async function getVendors() {
  return prisma.contact.findMany({
    where: { type: { in: ['vendor', 'both'] } },
    take: MAX_ROWS,
    orderBy: { name: 'asc' },
    select: { id: true, name: true, type: true, email: true, mobile: true },
  });
}

function mapInvoice(invoice) {
  return {
    id: invoice.id,
    status: invoice.status,
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    customer: invoice.salesOrder?.customer?.name,
    customerId: invoice.salesOrder?.customerId,
    total: invoiceTotal(invoice).toFixed(2),
    salesOrderId: invoice.salesOrderId,
  };
}

async function getSalesOrders({ status } = {}) {
  const orders = await prisma.salesOrder.findMany({
    where: status ? { status: String(status).toUpperCase() } : undefined,
    take: MAX_ROWS,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { id: true, name: true } },
      lines: {
        include: {
          product: { select: { name: true } },
        },
      },
      customerInvoice: { select: { id: true, status: true, invoiceDate: true } },
    },
  });

  return jsonSafe(
    orders.map((o) => {
      const total = o.lines.reduce((sum, line) => {
        const qty = new Decimal(line.qty || 0);
        const price = new Decimal(line.unitPrice || 0);
        const tax = new Decimal(line.tax || 0);
        return sum.plus(qty.times(price).plus(tax));
      }, new Decimal(0));

      return {
        id: o.id,
        customer: o.customer?.name || 'Unknown',
        status: o.status,
        createdAt: o.createdAt,
        total: total.toFixed(2),
        items: o.lines.map((l) => `${l.product?.name} x${l.qty}`).join(', '),
        invoiceStatus: o.customerInvoice?.status || 'None',
      };
    })
  );
}

async function getInvoices({ status } = {}) {
  const invoices = await salesService.getAllCustomerInvoices();
  const filtered = status
    ? invoices.filter((invoice) => invoice.status === String(status).toUpperCase())
    : invoices;
  return filtered.slice(0, MAX_ROWS).map(mapInvoice);
}

async function getPendingInvoices() {
  return getInvoices({ status: 'UNPAID' });
}

async function getVendorBills({ status } = {}) {
  const bills = await purchaseService.getAllVendorBills();
  const filtered = status
    ? bills.filter((bill) => bill.status === String(status).toUpperCase())
    : bills;

  return jsonSafe(
    filtered.slice(0, MAX_ROWS).map((bill) => ({
      id: bill.id,
      status: bill.status,
      invoiceDate: bill.invoiceDate,
      dueDate: bill.dueDate,
      vendor: bill.purchaseOrder?.vendor?.name,
      total: billTotal(bill).toFixed(2),
      purchaseOrderId: bill.purchaseOrderId,
    }))
  );
}

async function getPayments({ type } = {}) {
  const payments = await prisma.payment.findMany({
    take: MAX_ROWS,
    orderBy: { date: 'desc' },
    include: {
      linkedBill: {
        include: { purchaseOrder: { include: { vendor: { select: { name: true } } } } },
      },
      linkedInvoice: {
        include: { salesOrder: { include: { customer: { select: { name: true } } } } },
      },
    },
  });

  let rows = payments;
  if (type === 'vendor') rows = payments.filter((payment) => payment.linkedBillId);
  if (type === 'customer') rows = payments.filter((payment) => payment.linkedInvoiceId);

  return jsonSafe(
    rows.map((payment) => ({
      id: payment.id,
      type: payment.type,
      amount: payment.amount,
      date: payment.date,
      status: payment.status,
      vendorBillId: payment.linkedBillId,
      vendor: payment.linkedBill?.purchaseOrder?.vendor?.name || null,
      customerInvoiceId: payment.linkedInvoiceId,
      customer: payment.linkedInvoice?.salesOrder?.customer?.name || null,
    }))
  );
}

async function getExpenses() {
  const pl = await reportService.getProfitAndLoss();
  const balances = await reportService.getAccountBalances();
  const expenseAccounts = balances.filter((account) => account.type === 'expense');
  return {
    totalExpense: pl.totalExpense,
    accounts: expenseAccounts,
  };
}

async function getTransactions() {
  const entries = await accountingService.getAllJournalEntries();
  return jsonSafe(
    entries.slice(0, MAX_ROWS).map((entry) => ({
      id: entry.id,
      date: entry.date,
      reference: entry.reference,
      status: entry.status,
      journal: entry.journal?.name,
      items: (entry.items || []).map((item) => ({
        account: item.account?.name,
        debit: item.debit,
        credit: item.credit,
      })),
    }))
  );
}

async function getUsers() {
  return prisma.user.findMany({
    take: MAX_ROWS,
    orderBy: { id: 'asc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}

async function getUserOrders(user) {
  const contact = await findLinkedContact(user);
  if (!contact) {
    return {
      orders: [],
      note: 'No Contact record matches this user email, so no personal orders were found.',
    };
  }

  const orders = await prisma.salesOrder.findMany({
    where: { customerId: contact.id },
    take: MAX_ROWS,
    orderBy: { createdAt: 'desc' },
    include: {
      lines: { include: { product: { select: { name: true, salesPrice: true } } } },
      customerInvoice: { select: { id: true, status: true, invoiceDate: true } },
    },
  });

  return jsonSafe({
    customer: { id: contact.id, name: contact.name },
    orders: orders.map((order) => ({
      id: order.id,
      status: order.status,
      createdAt: order.createdAt,
      invoice: order.customerInvoice,
      lines: order.lines.map((line) => ({
        product: line.product.name,
        qty: line.qty,
        unitPrice: line.unitPrice,
      })),
    })),
  });
}

async function getOrderStatus(user, { orderId } = {}) {
  if (!orderId) return { error: 'orderId is required' };

  const contact = await findLinkedContact(user);
  const order = await prisma.salesOrder.findUnique({
    where: { id: Number(orderId) },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      customerInvoice: { select: { id: true, status: true } },
      lines: { include: { product: { select: { name: true } } } },
    },
  });

  if (!order) return { error: 'Order not found' };
  if (!contact || order.customerId !== contact.id) {
    throw new PermissionError();
  }

  return jsonSafe({
    id: order.id,
    status: order.status,
    invoiceStatus: order.customerInvoice?.status || null,
    customer: order.customer.name,
    lines: order.lines,
  });
}

async function getOwnInvoices(user) {
  const contact = await findLinkedContact(user);
  if (!contact) {
    return { invoices: [], note: 'No Contact record matches this user email.' };
  }

  const invoices = await prisma.customerInvoice.findMany({
    where: { salesOrder: { customerId: contact.id } },
    take: MAX_ROWS,
    orderBy: { invoiceDate: 'desc' },
    include: {
      salesOrder: {
        include: {
          customer: { select: { name: true } },
          lines: true,
        },
      },
    },
  });

  return {
    customer: { id: contact.id, name: contact.name },
    invoices: invoices.map(mapInvoice),
  };
}

const TOOL_HANDLERS = {
  getDashboardSummary: (_args, _user) => getDashboardSummary(),
  getSalesSummary: (_args, _user) => getSalesSummary(),
  getSalesOrders: (args, _user) => getSalesOrders(args),
  getProducts: (_args, _user) => getProducts(),
  getLowStockProducts: (args, _user) => getLowStockProducts(args),
  getCustomers: (_args, _user) => getCustomers(),
  getCustomerDetails: (args, _user) => getCustomerDetails(args),
  getVendors: (_args, _user) => getVendors(),
  getInvoices: (args, _user) => getInvoices(args),
  getPendingInvoices: (_args, _user) => getPendingInvoices(),
  getVendorBills: (args, _user) => getVendorBills(args),
  getPayments: (args, _user) => getPayments(args),
  getExpenses: (_args, _user) => getExpenses(),
  getTransactions: (_args, _user) => getTransactions(),
  getUsers: (_args, _user) => getUsers(),
  getUserOrders: (_args, user) => getUserOrders(user),
  getOrderStatus: (args, user) => getOrderStatus(user, args),
  getOwnInvoices: (_args, user) => getOwnInvoices(user),
};

export async function executeAuthorizedTool(role, toolName, args, user) {
  if (!canUseTool(role, toolName) || !TOOL_HANDLERS[toolName]) {
    throw new PermissionError();
  }
  const result = await TOOL_HANDLERS[toolName](args || {}, user);
  if (normalizeRole(role) === 'user' && toolName === 'getProducts' && Array.isArray(result)) {
    return result.map(({ cost, ...rest }) => rest);
  }
  return result;
}

export function getOpenAiToolsForRole(role) {
  const allowed = new Set(
    Object.keys(TOOL_HANDLERS).filter((name) => canUseTool(role, name))
  );

  const definitions = [
    {
      name: 'getDashboardSummary',
      description: 'Company dashboard: revenue, expenses, profit, cash, bank, receivables, payables.',
      parameters: { type: 'object', properties: {} },
    },
    {
      name: 'getSalesSummary',
      description: "Sales and revenue totals for today, this month, and posted income accounts.",
      parameters: { type: 'object', properties: {} },
    },
    {
      name: 'getSalesOrders',
      description: 'List sales orders with customer, total, status, line items, and date.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: ['string', 'null'], enum: ['DRAFT', 'CONFIRMED', 'INVOICED', 'CANCELLED', null] },
        },
      },
    },
    {
      name: 'getProducts',
      description: 'List furniture products with prices. Does not include cost for end-customer context beyond listed salesPrice.',
      parameters: { type: 'object', properties: {} },
    },
    {
      name: 'getLowStockProducts',
      description: 'Products with low derived on-hand quantity from purchase minus sales lines.',
      parameters: {
        type: 'object',
        properties: {
          threshold: { type: ['number', 'null'], description: 'Treat on-hand at or below this as low. Default 5.' },
        },
      },
    },
    {
      name: 'getCustomers',
      description: 'List customer contacts.',
      parameters: { type: 'object', properties: {} },
    },
    {
      name: 'getCustomerDetails',
      description: 'Get one customer and recent sales orders by id or name.',
      parameters: {
        type: 'object',
        properties: {
          customerId: { type: ['number', 'null'] },
          name: { type: ['string', 'null'] },
        },
      },
    },
    {
      name: 'getVendors',
      description: 'List vendor contacts.',
      parameters: { type: 'object', properties: {} },
    },
    {
      name: 'getInvoices',
      description: 'Customer invoices. Optionally filter by status UNPAID or PAID.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: ['string', 'null'], enum: ['UNPAID', 'PAID', null] },
        },
      },
    },
    {
      name: 'getPendingInvoices',
      description: 'Unpaid customer invoices.',
      parameters: { type: 'object', properties: {} },
    },
    {
      name: 'getVendorBills',
      description: 'Vendor bills. Optionally filter by status.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: ['string', 'null'], enum: ['UNPAID', 'PAID', null] },
        },
      },
    },
    {
      name: 'getPayments',
      description: 'Recorded payments. type=vendor for vendor bill payments, type=customer for invoice receipts.',
      parameters: {
        type: 'object',
        properties: {
          type: { type: ['string', 'null'], enum: ['vendor', 'customer', null] },
        },
      },
    },
    {
      name: 'getExpenses',
      description: 'Expense totals from accounting reports.',
      parameters: { type: 'object', properties: {} },
    },
    {
      name: 'getTransactions',
      description: 'Recent posted journal entries.',
      parameters: { type: 'object', properties: {} },
    },
    {
      name: 'getUsers',
      description: 'Application users and roles. No secrets.',
      parameters: { type: 'object', properties: {} },
    },
    {
      name: 'getUserOrders',
      description: "The authenticated contact user's own sales orders only.",
      parameters: { type: 'object', properties: {} },
    },
    {
      name: 'getOrderStatus',
      description: "Status of one of the authenticated contact user's sales orders.",
      parameters: {
        type: 'object',
        properties: {
          orderId: { type: 'number' },
        },
        required: ['orderId'],
      },
    },
    {
      name: 'getOwnInvoices',
      description: "The authenticated contact user's own customer invoices.",
      parameters: { type: 'object', properties: {} },
    },
  ];

  return definitions
    .filter((definition) => allowed.has(definition.name))
    .map((definition) => ({
      type: 'function',
      function: definition,
    }));
}

export { normalizeRole };
