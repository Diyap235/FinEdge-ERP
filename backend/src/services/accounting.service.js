import { PrismaClient } from '@prisma/client';
import Decimal from 'decimal.js';

const prisma = new PrismaClient();

/**
 * CRITICAL SERVICE: Accounting Service
 * 
 * This is the ONLY place responsible for creating journal entries and journal items.
 * Every accounting-producing module (invoices, bills, payments) MUST call this service.
 * 
 * Guarantees:
 * - All entries are balanced (TOTAL DEBIT === TOTAL CREDIT)
 * - Database transaction with rollback on validation failure
 * - No partial writes
 */

export const accountingService = {
  /**
   * Create a balanced journal entry with items
   * 
   * @param {number} journalId - The journal to post to
   * @param {Array} items - Array of {accountId, debit, credit}
   * @param {string} reference - Optional reference (e.g., "INV-001")
   * @returns {Object} Created JournalEntry with items
   * @throws {Error} If entry is not balanced or validation fails
   */
  async createJournalEntry(journalId, items, reference = null) {
    // Start database transaction
    return await prisma.$transaction(
      async (tx) => {
        // Validate inputs
        if (!journalId) {
          throw new Error('Journal ID is required');
        }

        if (!Array.isArray(items) || items.length === 0) {
          throw new Error('At least one journal item is required');
        }

        // Verify journal exists
        const journal = await tx.journal.findUnique({
          where: { id: journalId },
        });

        if (!journal) {
          throw new Error(`Journal with ID ${journalId} not found`);
        }

        // Validate each item and calculate totals
        let totalDebit = new Decimal(0);
        let totalCredit = new Decimal(0);

        const validatedItems = [];

        for (const item of items) {
          if (!item.accountId) {
            throw new Error('Account ID is required for each item');
          }

          // Verify account exists
          const account = await tx.account.findUnique({
            where: { id: item.accountId },
          });

          if (!account) {
            throw new Error(`Account with ID ${item.accountId} not found`);
          }

          const debit = new Decimal(item.debit || 0);
          const credit = new Decimal(item.credit || 0);

          // Validate debit/credit
          if (debit < 0) {
            throw new Error('Debit cannot be negative');
          }
          if (credit < 0) {
            throw new Error('Credit cannot be negative');
          }

          // Cannot have both debit and credit
          if (debit > 0 && credit > 0) {
            throw new Error(
              `Account ${account.name}: Cannot have both debit (${debit}) and credit (${credit})`
            );
          }

          validatedItems.push({
            accountId: item.accountId,
            debit: debit.toFixed(2),
            credit: credit.toFixed(2),
          });

          totalDebit = totalDebit.plus(debit);
          totalCredit = totalCredit.plus(credit);
        }

        // CRITICAL CHECK: Entry must balance
        if (totalDebit.toFixed(2) !== totalCredit.toFixed(2)) {
          throw new Error(
            `Journal entry is not balanced. Total Debit: ${totalDebit.toFixed(2)}, Total Credit: ${totalCredit.toFixed(2)}`
          );
        }

        // Create JournalEntry
        const entry = await tx.journalEntry.create({
          data: {
            journalId,
            date: new Date(),
            reference,
            status: 'POSTED',
          },
        });

        // Create JournalItems
        const createdItems = await Promise.all(
          validatedItems.map((item) =>
            tx.journalItem.create({
              data: {
                entryId: entry.id,
                accountId: item.accountId,
                debit: item.debit,
                credit: item.credit,
              },
            })
          )
        );

        // Return entry with items
        return {
          ...entry,
          items: createdItems,
        };
      },
      {
        timeout: 10000, // 10 second timeout
      }
    );
  },

  /**
   * Get all journal entries with their items
   */
  async getAllJournalEntries() {
    return await prisma.journalEntry.findMany({
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
  },

  /**
   * Get a specific journal entry
   */
  async getJournalEntryById(id) {
    return await prisma.journalEntry.findUnique({
      where: { id },
      include: {
        journal: true,
        items: {
          include: {
            account: true,
          },
        },
      },
    });
  },

  /**
   * Get ledger for a specific account
   */
  async getLedgerForAccount(accountId) {
    const items = await prisma.journalItem.findMany({
      where: { accountId },
      include: {
        entry: {
          include: {
            journal: true,
          },
        },
        account: true,
      },
      orderBy: {
        entry: {
          date: 'asc',
        },
      },
    });

    // Calculate running balance
    let balance = new Decimal(0);
    const ledger = items.map((item) => {
      const debit = new Decimal(item.debit);
      const credit = new Decimal(item.credit);

      // For assets and expenses: debit increases, credit decreases
      // For liabilities, income, capital: credit increases, debit decreases
      const isAsset = ['asset', 'expense'].includes(item.account.type);
      
      if (isAsset) {
        balance = balance.plus(debit).minus(credit);
      } else {
        balance = balance.minus(debit).plus(credit);
      }

      return {
        date: item.entry.date,
        reference: item.entry.reference,
        journal: item.entry.journal.name,
        debit: item.debit,
        credit: item.credit,
        balance: balance.toFixed(2),
        accountType: item.account.type,
      };
    });

    return ledger;
  },

  /**
   * Get complete ledger (all accounts)
   */
  async getCompleteLedger() {
    const items = await prisma.journalItem.findMany({
      include: {
        entry: {
          include: {
            journal: true,
          },
        },
        account: true,
      },
      orderBy: [
        {
          entry: {
            date: 'asc',
          },
        },
        {
          account: {
            name: 'asc',
          },
        },
      ],
    });

    return items.map((item) => ({
      date: item.entry.date,
      reference: item.entry.reference,
      account: item.account.name,
      accountType: item.account.type,
      journal: item.entry.journal.name,
      debit: item.debit,
      credit: item.credit,
    }));
  },
};

export default accountingService;
