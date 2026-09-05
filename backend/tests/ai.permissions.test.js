import test from 'node:test';
import assert from 'node:assert/strict';
import { getPermissionDenial, canUseTool, normalizeRole } from '../src/ai/permissions.js';

test('contact role maps to user', () => {
  assert.equal(normalizeRole('contact'), 'user');
});

test('user cannot request company revenue', () => {
  assert.equal(
    getPermissionDenial('contact', 'Show me company revenue'),
    "I don't have access to show you this information."
  );
});

test('user cannot request vendor payments', () => {
  assert.equal(
    getPermissionDenial('user', 'Show me all vendor payments'),
    "I don't have access to show you this information."
  );
});

test('user can ask for own orders', () => {
  assert.equal(getPermissionDenial('contact', 'Show me my orders'), null);
});

test('accountant cannot list admin users', () => {
  assert.ok(getPermissionDenial('accountant', 'Show me all admin users'));
});

test('accountant cannot use getUsers tool', () => {
  assert.equal(canUseTool('accountant', 'getUsers'), false);
  assert.equal(canUseTool('admin', 'getUsers'), true);
});

test('user cannot use sales summary tool', () => {
  assert.equal(canUseTool('contact', 'getSalesSummary'), false);
  assert.equal(canUseTool('contact', 'getUserOrders'), true);
});

test('admin has access to dashboard and sales summary', () => {
  assert.equal(canUseTool('admin', 'getDashboardSummary'), true);
  assert.equal(canUseTool('admin', 'getSalesSummary'), true);
  assert.equal(canUseTool('admin', 'getProducts'), true);
  assert.equal(canUseTool('admin', 'getCustomers'), true);
  assert.equal(canUseTool('admin', 'getVendors'), true);
  assert.equal(canUseTool('admin', 'getInvoices'), true);
});

test('accountant has access to accounting tools but not dashboard or users', () => {
  assert.equal(canUseTool('accountant', 'getInvoices'), true);
  assert.equal(canUseTool('accountant', 'getPendingInvoices'), true);
  assert.equal(canUseTool('accountant', 'getVendorBills'), true);
  assert.equal(canUseTool('accountant', 'getPayments'), true);
  assert.equal(canUseTool('accountant', 'getExpenses'), true);
  assert.equal(canUseTool('accountant', 'getTransactions'), true);
  assert.equal(canUseTool('accountant', 'getDashboardSummary'), false);
  assert.equal(canUseTool('accountant', 'getUsers'), false);
});

test('user has access to products and own orders/invoices only', () => {
  assert.equal(canUseTool('user', 'getProducts'), true);
  assert.equal(canUseTool('user', 'getUserOrders'), true);
  assert.equal(canUseTool('user', 'getOrderStatus'), true);
  assert.equal(canUseTool('user', 'getOwnInvoices'), true);
  assert.equal(canUseTool('user', 'getDashboardSummary'), false);
  assert.equal(canUseTool('user', 'getSalesSummary'), false);
  assert.equal(canUseTool('user', 'getInvoices'), false);
  assert.equal(canUseTool('user', 'getVendorBills'), false);
  assert.equal(canUseTool('user', 'getPayments'), false);
  assert.equal(canUseTool('user', 'getTransactions'), false);
});
