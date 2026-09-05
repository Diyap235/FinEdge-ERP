import { PrismaClient } from '@prisma/client';
import Decimal from 'decimal.js';
import { accountingService } from './accounting.service.js';

const prisma = new PrismaClient();

export const reportService = {
  /**
   * Get Profit & Loss statement
   * Income - Expenses = Net Profit
   */
  async getProfitAndLoss() {
    const items = await prisma.journalItem.findMany({
      include: {
        account: true,
      },
    });

    let totalIncome = new Decimal(0);
    let totalExpense = new Decimal(0);

    for (const item of items) {
      const debit = new Decimal(item.debit);
      const credit = new Decimal(item.credit);

      if (item.account.type === 'income') {
        // For income: credit increases
        totalIncome = totalIncome.plus(credit).minus(debit);
      } else if (item.account.type === 'expense') {
        // For expense: debit increases
        totalExpense = totalExpense.plus(debit).minus(credit);
      }
    }

    const netProfit = totalIncome.minus(totalExpense);

    return {
      totalIncome: totalIncome.toFixed(2),
      totalExpense: totalExpense.toFixed(2),
      netProfit: netProfit.toFixed(2),
    };
  },

  /**
   * Get Balance Sheet
   * Assets = Liabilities + Capital
   */
  async getBalanceSheet() {
    const items = await prisma.journalItem.findMany({
      include: {
        account: true,
      },
    });

    let totalAssets = new Decimal(0);
    let totalLiabilities = new Decimal(0);
    let totalCapital = new Decimal(0);

    const accountBalances = {};

    // Group items by account
    for (const item of items) {
      if (!accountBalances[item.accountId]) {
        accountBalances[item.accountId] = {
          account: item.account,
          debit: new Decimal(0),
          credit: new Decimal(0),
        };
      }

      accountBalances[item.accountId].debit = accountBalances[
        item.accountId
      ].debit.plus(new Decimal(item.debit));
      accountBalances[item.accountId].credit = accountBalances[
        item.accountId
      ].credit.plus(new Decimal(item.credit));
    }

    // Calculate balances and totals
    const assets = [];
    const liabilities = [];
    const capital = [];

    for (const accountId in accountBalances) {
      const { account, debit, credit } = accountBalances[accountId];

      let balance;
      if (['asset', 'expense'].includes(account.type)) {
        balance = debit.minus(credit);
      } else {
        balance = credit.minus(debit);
      }

      const accountData = {
        name: account.name,
        type: account.type,
        balance: balance.toFixed(2),
      };

      if (account.type === 'asset') {
        assets.push(accountData);
        totalAssets = totalAssets.plus(balance);
      } else if (account.type === 'liability') {
        liabilities.push(accountData);
        totalLiabilities = totalLiabilities.plus(balance);
      } else if (account.type === 'capital') {
        capital.push(accountData);
        totalCapital = totalCapital.plus(balance);
      }
    }

    // Include profit/loss in capital
    const pl = await this.getProfitAndLoss();
    const totalCapitalWithPL = new Decimal(totalCapital).plus(
      new Decimal(pl.netProfit)
    );

    return {
      assets: {
        items: assets,
        total: totalAssets.toFixed(2),
      },
      liabilities: {
        items: liabilities,
        total: totalLiabilities.toFixed(2),
      },
      capital: {
        items: capital,
        total: totalCapital.toFixed(2),
      },
      netProfit: pl.netProfit,
      totalCapitalWithPL: totalCapitalWithPL.toFixed(2),
      totalLiabilitiesAndCapital: new Decimal(totalLiabilities)
        .plus(totalCapitalWithPL)
        .toFixed(2),
      isBalanced:
        totalAssets.toFixed(2) ===
        new Decimal(totalLiabilities)
          .plus(totalCapitalWithPL)
          .toFixed(2),
    };
  },

  /**
   * Get Dashboard Summary
   */
  async getDashboardSummary() {
    // Get P&L
    const pl = await this.getProfitAndLoss();

    // Get account balances
    const items = await prisma.journalItem.findMany({
      include: {
        account: true,
      },
    });

    const accountBalances = {};

    for (const item of items) {
      if (!accountBalances[item.accountId]) {
        accountBalances[item.accountId] = {
          account: item.account,
          debit: new Decimal(0),
          credit: new Decimal(0),
        };
      }

      accountBalances[item.accountId].debit = accountBalances[
        item.accountId
      ].debit.plus(new Decimal(item.debit));
      accountBalances[item.accountId].credit = accountBalances[
        item.accountId
      ].credit.plus(new Decimal(item.credit));
    }

    // Find specific balances
    let cashBalance = new Decimal(0);
    let bankBalance = new Decimal(0);
    let receivables = new Decimal(0);
    let payables = new Decimal(0);

    for (const accountId in accountBalances) {
      const { account, debit, credit } = accountBalances[accountId];

      let balance;
      if (['asset', 'expense'].includes(account.type)) {
        balance = debit.minus(credit);
      } else {
        balance = credit.minus(debit);
      }

      if (account.name === 'Cash') cashBalance = balance;
      if (account.name === 'Bank') bankBalance = balance;
      if (account.name === 'Debtors') receivables = balance;
      if (account.name === 'Creditors') payables = balance;
    }

    // Get recent transactions
    const recentJournalEntries = await prisma.journalEntry.findMany({
      take: 10,
      include: {
        journal: true,
        items: {
          include: {
            account: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return {
      revenue: pl.totalIncome,
      expenses: pl.totalExpense,
      netProfit: pl.netProfit,
      cashBalance: cashBalance.toFixed(2),
      bankBalance: bankBalance.toFixed(2),
      receivables: receivables.toFixed(2),
      payables: payables.toFixed(2),
      recentTransactions: recentJournalEntries.map((entry) => ({
        id: entry.id,
        date: entry.date,
        journal: entry.journal.name,
        reference: entry.reference,
        items: entry.items,
      })),
    };
  },

  /**
   * Get complete ledger
   */
  async getLedger(accountId = null) {
    if (accountId) {
      return await accountingService.getLedgerForAccount(accountId);
    } else {
      return await accountingService.getCompleteLedger();
    }
  },

  /**
   * Get all accounts with balances
   */
  async getAccountBalances() {
    const items = await prisma.journalItem.findMany({
      include: {
        account: true,
      },
    });

    const accountBalances = {};

    for (const item of items) {
      if (!accountBalances[item.accountId]) {
        accountBalances[item.accountId] = {
          id: item.accountId,
          name: item.account.name,
          type: item.account.type,
          debit: new Decimal(0),
          credit: new Decimal(0),
        };
      }

      accountBalances[item.accountId].debit = accountBalances[
        item.accountId
      ].debit.plus(new Decimal(item.debit));
      accountBalances[item.accountId].credit = accountBalances[
        item.accountId
      ].credit.plus(new Decimal(item.credit));
    }

    // Calculate balances
    const results = [];
    for (const accountId in accountBalances) {
      const { id, name, type, debit, credit } = accountBalances[accountId];

      let balance;
      if (['asset', 'expense'].includes(type)) {
        balance = debit.minus(credit);
      } else {
        balance = credit.minus(debit);
      }

      results.push({
        id,
        name,
        type,
        balance: balance.toFixed(2),
        debit: debit.toFixed(2),
        credit: credit.toFixed(2),
      });
    }

    return results;
  },
};

export default reportService;
