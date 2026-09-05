import express from 'express';
import { salesService } from '../services/sales.service.js';

const router = express.Router();

// Get all sales orders
router.get('/', async (req, res) => {
  try {
    const orders = await salesService.getAllSalesOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create sales order
router.post('/', async (req, res) => {
  try {
    const { customerId, lines } = req.body;

    if (!customerId || !lines) {
      return res
        .status(400)
        .json({ error: 'Customer ID and lines are required' });
    }

    const so = await salesService.createSalesOrder(customerId, lines);
    res.status(201).json(so);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get sales order by ID
router.get('/:id', async (req, res) => {
  try {
    const so = await salesService.getSalesOrderById(parseInt(req.params.id));

    if (!so) {
      return res.status(404).json({ error: 'Sales Order not found' });
    }

    res.json(so);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm sales order
router.post('/:id/confirm', async (req, res) => {
  try {
    const so = await salesService.confirmSalesOrder(parseInt(req.params.id));
    res.json(so);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Generate invoice
router.post('/:id/generate-invoice', async (req, res) => {
  try {
    const invoice = await salesService.generateCustomerInvoice(
      parseInt(req.params.id)
    );
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
