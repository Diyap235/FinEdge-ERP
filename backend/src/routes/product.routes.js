import express from 'express';
import { PrismaClient } from '@prisma/client';
import Decimal from 'decimal.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const { name, type, salesPrice, cost, category } = req.body;

    if (!name || !salesPrice || !cost) {
      return res
        .status(400)
        .json({ error: 'Name, salesPrice, and cost are required' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        type: type || 'furniture',
        salesPrice: new Decimal(salesPrice).toFixed(2),
        cost: new Decimal(cost).toFixed(2),
        category,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, type, salesPrice, cost, category } = req.body;

    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(salesPrice && { salesPrice: new Decimal(salesPrice).toFixed(2) }),
        ...(cost && { cost: new Decimal(cost).toFixed(2) }),
        ...(category && { category }),
      },
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
