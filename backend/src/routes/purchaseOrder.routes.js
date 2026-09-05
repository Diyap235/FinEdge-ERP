import express from 'express';
import { purchaseService } from '../services/purchase.service.js';

const router = express.Router();

// Get all purchase orders
router.get('/', async (req, res) => {
  try {
    const orders = await purchaseService.getAllPurchaseOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create purchase order
router.post('/', async (req, res) => {
  try {
    const { vendorId, lines } = req.body;

    if (!vendorId || !lines) {
      return res
        .status(400)
        .json({ error: 'Vendor ID and lines are required' });
    }

    const po = await purchaseService.createPurchaseOrder(vendorId, lines);
    res.status(201).json(po);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get purchase order by ID
router.get('/:id', async (req, res) => {
  try {
    const po = await purchaseService.getPurchaseOrderById(parseInt(req.params.id));

    if (!po) {
      return res.status(404).json({ error: 'Purchase Order not found' });
    }

    res.json(po);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm purchase order
router.post('/:id/confirm', async (req, res) => {
  try {
    const po = await purchaseService.confirmPurchaseOrder(
      parseInt(req.params.id)
    );
    res.json(po);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Convert to vendor bill
router.post('/:id/convert-to-bill', async (req, res) => {
  try {
    const bill = await purchaseService.convertPurchaseOrderToVendorBill(
      parseInt(req.params.id)
    );
    res.status(201).json(bill);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
