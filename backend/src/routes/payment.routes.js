import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all payments
router.get('/', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        linkedBill: true,
        linkedInvoice: true,
        journalEntry: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        linkedBill: true,
        linkedInvoice: true,
        journalEntry: {
          include: {
            items: {
              include: {
                account: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
