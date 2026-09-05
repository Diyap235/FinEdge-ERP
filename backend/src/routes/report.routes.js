import express from 'express';
import { reportService } from '../services/report.service.js';

const router = express.Router();

// Get dashboard summary
router.get('/dashboard/summary', async (req, res) => {
  try {
    const summary = await reportService.getDashboardSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const summary = await reportService.getDashboardSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get P&L
router.get('/profit-loss', async (req, res) => {
  try {
    const pl = await reportService.getProfitAndLoss(req.query.period || 'all');
    res.json(pl);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Balance Sheet
router.get('/balance-sheet', async (req, res) => {
  try {
    const bs = await reportService.getBalanceSheet();
    res.json(bs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Ledger
router.get('/ledger', async (req, res) => {
  try {
    const { accountId } = req.query;
    const ledger = await reportService.getLedger(
      accountId ? parseInt(accountId) : null
    );
    res.json(ledger);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get account balances
router.get('/account-balances', async (req, res) => {
  try {
    const balances = await reportService.getAccountBalances();
    res.json(balances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
