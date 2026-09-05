import express from 'express';
import { reportService } from '../services/report.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const summary = await reportService.getDashboardSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
