import './loadEnv.js';
import express from 'express';
import cors from 'cors';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import contactRoutes from './routes/contact.routes.js';
import productRoutes from './routes/product.routes.js';
import accountRoutes from './routes/account.routes.js';
import journalRoutes from './routes/journal.routes.js';
import purchaseOrderRoutes from './routes/purchaseOrder.routes.js';
import vendorBillRoutes from './routes/vendorBill.routes.js';
import salesOrderRoutes from './routes/salesOrder.routes.js';
import customerInvoiceRoutes from './routes/customerInvoice.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import journalEntryRoutes from './routes/journalEntry.routes.js';
import reportRoutes from './routes/report.routes.js';

import aiRoutes from './routes/ai.routes.js';
import ocrRoutes from './routes/ocr.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/products', productRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/vendor-bills', vendorBillRoutes);
app.use('/api/sales-orders', salesOrderRoutes);
app.use('/api/customer-invoices', customerInvoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/journal-entries', journalEntryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ocr', ocrRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`FinEdge-ERP Backend running on port ${PORT}`);
});

export default app;
