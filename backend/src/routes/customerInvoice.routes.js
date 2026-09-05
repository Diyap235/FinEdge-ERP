import express from 'express';
import { salesService } from '../services/sales.service.js';

const router = express.Router();

// Get all customer invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await salesService.getAllCustomerInvoices();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const invoice = await salesService.getCustomerInvoiceById(
      parseInt(req.params.id)
    );

    if (!invoice) {
      return res.status(404).json({ error: 'Customer Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record payment
router.post('/:id/pay', async (req, res) => {
  try {
    const { amount, paymentType } = req.body;

    if (!amount || !paymentType) {
      return res
        .status(400)
        .json({ error: 'Amount and payment type are required' });
    }

    const result = await salesService.recordCustomerPayment(
      parseInt(req.params.id),
      amount,
      paymentType
    );

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
