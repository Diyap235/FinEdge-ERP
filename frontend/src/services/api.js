import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

export const contactsAPI = {
  getAll: () => api.get('/contacts'),
  create: (data) => api.post('/contacts', data),
  getById: (id) => api.get(`/contacts/${id}`),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
};

export const productsAPI = {
  getAll: () => api.get('/products'),
  create: (data) => api.post('/products', data),
  getById: (id) => api.get(`/products/${id}`),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const accountsAPI = {
  getAll: () => api.get('/accounts'),
  create: (data) => api.post('/accounts', data),
  getById: (id) => api.get(`/accounts/${id}`),
};

export const journalsAPI = {
  getAll: () => api.get('/journals'),
  create: (data) => api.post('/journals', data),
  getById: (id) => api.get(`/journals/${id}`),
};

export const purchaseOrdersAPI = {
  getAll: () => api.get('/purchase-orders'),
  create: (data) => api.post('/purchase-orders', data),
  getById: (id) => api.get(`/purchase-orders/${id}`),
  confirm: (id) => api.post(`/purchase-orders/${id}/confirm`),
  convertToBill: (id) => api.post(`/purchase-orders/${id}/convert-to-bill`),
};

export const vendorBillsAPI = {
  getAll: () => api.get('/vendor-bills'),
  getById: (id) => api.get(`/vendor-bills/${id}`),
  pay: (id, data) => api.post(`/vendor-bills/${id}/pay`, data),
};

export const salesOrdersAPI = {
  getAll: () => api.get('/sales-orders'),
  create: (data) => api.post('/sales-orders', data),
  getById: (id) => api.get(`/sales-orders/${id}`),
  confirm: (id) => api.post(`/sales-orders/${id}/confirm`),
  generateInvoice: (id) => api.post(`/sales-orders/${id}/generate-invoice`),
};

export const customerInvoicesAPI = {
  getAll: () => api.get('/customer-invoices'),
  getById: (id) => api.get(`/customer-invoices/${id}`),
  pay: (id, data) => api.post(`/customer-invoices/${id}/pay`, data),
};

export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
};

export const journalEntriesAPI = {
  getAll: () => api.get('/journal-entries'),
  getById: (id) => api.get(`/journal-entries/${id}`),
};

export const reportsAPI = {
  getDashboardSummary: () => api.get('/reports/dashboard/summary'),
  getProfitAndLoss: () => api.get('/reports/profit-loss'),
  getBalanceSheet: () => api.get('/reports/balance-sheet'),
  getLedger: (accountId) => {
    if (accountId) {
      return api.get(`/reports/ledger?accountId=${accountId}`);
    }
    return api.get('/reports/ledger');
  },
  getAccountBalances: () => api.get('/reports/account-balances'),
};

export const aiAPI = {
  chat: (message, conversation = []) => 
    api.post('/ai/chat', { message, conversation }),
};

export default api;
