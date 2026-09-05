import express from 'express';
import { purchaseService } from '../services/purchase.service.js';

const router = express.Router();

// Get all vendor bills
router.get('/', async (req, res) => {
  try {
    const bills = await purchaseService.getAllVendorBills();
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vendor bill by ID
router.get('/:id', async (req, res) => {
  try {
    const bill = await purchaseService.getVendorBillById(parseInt(req.params.id));

    if (!bill) {
      return res.status(404).json({ error: 'Vendor Bill not found' });
    }

    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record payment
router.post('/:id/pay', async (req, res) => {
  try {
    const amount = req.body.amount;
    const paymentType = req.body.type || req.body.paymentType;

    if (!amount || !paymentType) {
      return res
        .status(400)
        .json({ error: 'Amount and payment type are required' });
    }

    const result = await purchaseService.recordVendorPayment(
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
