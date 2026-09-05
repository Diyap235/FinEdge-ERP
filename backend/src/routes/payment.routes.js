import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

const paymentInclude = {
  linkedBill: {
    include: {
      purchaseOrder: {
        include: {
          vendor: true,
        },
      },
    },
  },
  linkedInvoice: {
    include: {
      salesOrder: {
        include: {
          customer: true,
        },
      },
    },
  },
  journalEntry: {
    include: {
      journal: true,
      items: {
        include: {
          account: true,
        },
      },
    },
  },
};

router.get('/', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: paymentInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(req.params.id) },
      include: paymentInclude,
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
