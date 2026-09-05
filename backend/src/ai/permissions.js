export const PERMISSION_DENIED =
  "I don't have access to show you this information.";

/**
 * Schema roles are admin | accountant | contact.
 * Spec "user" maps to the existing contact role.
 */
export function normalizeRole(role) {
  const value = String(role || '')
    .toLowerCase()
    .trim();

  if (value === 'admin') return 'admin';
  if (value === 'accountant') return 'accountant';
  if (value === 'user' || value === 'contact') return 'user';
  return 'user';
}

export const ROLE_TOOLS = {
  admin: [
    'getDashboardSummary',
    'getSalesSummary',
    'getSalesOrders',
    'getProducts',
    'getLowStockProducts',
    'getCustomers',
    'getCustomerDetails',
    'getVendors',
    'getInvoices',
    'getPendingInvoices',
    'getVendorBills',
    'getPayments',
    'getExpenses',
    'getTransactions',
    'getUsers',
  ],
  accountant: [
    'getSalesSummary',
    'getSalesOrders',
    'getInvoices',
    'getPendingInvoices',
    'getVendorBills',
    'getPayments',
    'getExpenses',
    'getTransactions',
    'getProducts',
  ],
  user: [
    'getProducts',
    'getUserOrders',
    'getOrderStatus',
    'getOwnInvoices',
  ],
};

export function getToolsForRole(role) {
  return ROLE_TOOLS[normalizeRole(role)] || ROLE_TOOLS.user;
}

export function canUseTool(role, toolName) {
  return getToolsForRole(role).includes(toolName);
}

function includesAny(text, phrases) {
  return phrases.some((phrase) => text.includes(phrase));
}

/**
 * Backend authorization gate before any database query.
 * Tool lists are the primary control; this catches explicit out-of-scope asks.
 */
export function getPermissionDenial(role, message) {
  const normalized = normalizeRole(role);
  const text = String(message || '').toLowerCase();
  const askingOwnRecords = /\b(my|mine)\b/.test(text);

  if (normalized === 'user') {
    const forbidden = [
      'company revenue',
      'total revenue',
      'this month revenue',
      'monthly revenue',
      'revenue',
      'all vendor',
      'vendor payments',
      'vendor payment',
      'all payments',
      'all users',
      'all admin',
      'admin users',
      'administrator',
      'all employees',
      'employee data',
      'profit and loss',
      'p&l',
      'balance sheet',
      'all invoices',
      'company expenses',
      'dashboard',
      'all customers',
      'all vendors',
      'vendor bills',
      'vendor bill',
      'pending invoices',
      "today's sales",
      'todays sales',
      'low stock',
      'transactions',
      'journal entries',
    ];
    if (!askingOwnRecords && includesAny(text, forbidden)) {
      return PERMISSION_DENIED;
    }
    if (askingOwnRecords && includesAny(text, ['company revenue', 'all users', 'vendor payments'])) {
      return PERMISSION_DENIED;
    }
  }

  if (normalized === 'accountant') {
    const forbidden = [
      'all admin',
      'admin users',
      'all users',
      'all employees',
      'employee data',
    ];
    if (includesAny(text, forbidden)) {
      return PERMISSION_DENIED;
    }
  }

  return null;
}
