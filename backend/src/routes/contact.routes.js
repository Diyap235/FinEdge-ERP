import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all contacts
router.get('/', async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany(
      {
        orderBy: { createdAt: 'desc' },
      }
    );
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create contact
router.post('/', async (req, res) => {
  try {
    const { name, type, email, mobile } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const contact = await prisma.contact.create({
      data: { name, type, email, mobile },
    });

    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contact by ID
router.get('/:id', async (req, res) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update contact
router.put('/:id', async (req, res) => {
  try {
    const { name, type, email, mobile } = req.body;

    const contact = await prisma.contact.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(email && { email }),
        ...(mobile && { mobile }),
      },
    });

    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete contact
router.delete('/:id', async (req, res) => {
  try {
    await prisma.contact.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
