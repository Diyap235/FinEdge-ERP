import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all journals
router.get('/', async (req, res) => {
  try {
    const journals = await prisma.journal.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(journals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create journal
router.post('/', async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const journal = await prisma.journal.create({
      data: { name, type },
    });

    res.status(201).json(journal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get journal by ID
router.get('/:id', async (req, res) => {
  try {
    const journal = await prisma.journal.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!journal) {
      return res.status(404).json({ error: 'Journal not found' });
    }

    res.json(journal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
