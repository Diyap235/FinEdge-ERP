import test from 'node:test';
import assert from 'node:assert';
import { PrismaClient } from '@prisma/client';
import { accountingService } from '../src/services/accounting.service.js';

const prisma = new PrismaClient();

test('Accounting Service Tests', async (t) => {
  // Setup: Create test accounts and journal
  let testJournal;
  let purchaseExpenseAccount;
  let creditorsAccount;
  let cashAccount;
  let debtorsAccount;
  let salesIncomeAccount;

  await t.before(async () => {
    // Clean up
    await prisma.journalItem.deleteMany();
    await prisma.journalEntry.deleteMany();
    await prisma.journal.deleteMany();
    await prisma.account.deleteMany();

    // Create test accounts
    purchaseExpenseAccount = await prisma.account.create({
      data: { name: 'Purchase Expense', type: 'expense' },
    });

    creditorsAccount = await prisma.account.create({
      data: { name: 'Creditors', type: 'liability' },
    });

    cashAccount = await prisma.account.create({
      data: { name: 'Cash', type: 'asset' },
    });

    debtorsAccount = await prisma.account.create({
      data: { name: 'Debtors', type: 'asset' },
    });

    salesIncomeAccount = await prisma.account.create({
      data: { name: 'Sales Income', type: 'income' },
    });

    // Create test journal
    testJournal = await prisma.journal.create({
      data: { name: 'Test Journal', type: 'bank' },
    });
  });

  await t.after(async () => {
    await prisma.journalItem.deleteMany();
    await prisma.journalEntry.deleteMany();
    await prisma.journal.deleteMany();
    await prisma.account.deleteMany();
    await prisma.$disconnect();
  });

  await t.test('TEST 1: Balanced journal entry succeeds', async () => {
    const entry = await accountingService.createJournalEntry(testJournal.id, [
      {
        accountId: purchaseExpenseAccount.id,
        debit: 1000,
        credit: 0,
      },
      {
        accountId: creditorsAccount.id,
        debit: 0,
        credit: 1000,
      },
    ]);

    assert.ok(entry.id, 'Entry should be created');
    assert.equal(entry.items.length, 2, 'Entry should have 2 items');
    assert.equal(entry.status, 'POSTED', 'Entry should be POSTED');
  });

  await t.test('TEST 2: Unbalanced journal entry fails', async () => {
    try {
      await accountingService.createJournalEntry(testJournal.id, [
        {
          accountId: purchaseExpenseAccount.id,
          debit: 1000,
          credit: 0,
        },
        {
          accountId: creditorsAccount.id,
          debit: 0,
          credit: 900, // Doesn't balance
        },
      ]);
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.match(error.message, /not balanced/, 'Should indicate balance error');
    }
  });

  await t.test('TEST 3: Vendor Bill creates correct entries', async () => {
    const entry = await accountingService.createJournalEntry(testJournal.id, [
      {
        accountId: purchaseExpenseAccount.id,
        debit: 15000,
        credit: 0,
      },
      {
        accountId: creditorsAccount.id,
        debit: 0,
        credit: 15000,
      },
    ]);

    assert.ok(entry.id, 'Entry created');
    assert.equal(entry.items[0].debit, '15000');
    assert.equal(entry.items[1].credit, '15000');
  });

  await t.test('TEST 4: Vendor Payment creates correct entries', async () => {
    const entry = await accountingService.createJournalEntry(testJournal.id, [
      {
        accountId: creditorsAccount.id,
        debit: 15000,
        credit: 0,
      },
      {
        accountId: cashAccount.id,
        debit: 0,
        credit: 15000,
      },
    ]);

    assert.ok(entry.id, 'Payment entry created');
    assert.equal(entry.items[0].debit, '15000');
    assert.equal(entry.items[1].credit, '15000');
  });

  await t.test('TEST 5: Customer Invoice creates correct entries', async () => {
    const entry = await accountingService.createJournalEntry(testJournal.id, [
      {
        accountId: debtorsAccount.id,
        debit: 29500,
        credit: 0,
      },
      {
        accountId: salesIncomeAccount.id,
        debit: 0,
        credit: 29500,
      },
    ]);

    assert.ok(entry.id, 'Invoice entry created');
    assert.equal(entry.items[0].debit, '29500');
    assert.equal(entry.items[1].credit, '29500');
  });

  await t.test('TEST 6: Customer Payment creates correct entries', async () => {
    const entry = await accountingService.createJournalEntry(testJournal.id, [
      {
        accountId: cashAccount.id,
        debit: 29500,
        credit: 0,
      },
      {
        accountId: debtorsAccount.id,
        debit: 0,
        credit: 29500,
      },
    ]);

    assert.ok(entry.id, 'Customer payment entry created');
    assert.equal(entry.items[0].debit, '29500');
    assert.equal(entry.items[1].credit, '29500');
  });

  await t.test('TEST 7: Cannot have both debit and credit on same item', async () => {
    try {
      await accountingService.createJournalEntry(testJournal.id, [
        {
          accountId: purchaseExpenseAccount.id,
          debit: 1000,
          credit: 500, // Both debit and credit
        },
      ]);
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.match(
        error.message,
        /Cannot have both debit/,
        'Should prevent both debit and credit'
      );
    }
  });

  await t.test('TEST 8: Ledger calculation works correctly', async () => {
    // Create multiple entries
    await accountingService.createJournalEntry(testJournal.id, [
      {
        accountId: cashAccount.id,
        debit: 1000,
        credit: 0,
      },
      {
        accountId: creditorsAccount.id,
        debit: 0,
        credit: 1000,
      },
    ]);

    await accountingService.createJournalEntry(testJournal.id, [
      {
        accountId: cashAccount.id,
        debit: 500,
        credit: 0,
      },
      {
        accountId: creditorsAccount.id,
        debit: 0,
        credit: 500,
      },
    ]);

    const ledger = await accountingService.getLedgerForAccount(cashAccount.id);

    assert.ok(ledger.length >= 2, 'Ledger should have items');
    assert.equal(ledger[0].debit, '1000', 'First entry debit correct');
    assert.equal(ledger[1].debit, '500', 'Second entry debit correct');
  });

  await t.test('TEST 9: Invalid account throws error', async () => {
    try {
      await accountingService.createJournalEntry(testJournal.id, [
        {
          accountId: 99999, // Non-existent account
          debit: 1000,
          credit: 0,
        },
      ]);
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.match(error.message, /Account.*not found/, 'Should indicate account not found');
    }
  });

  await t.test('TEST 10: Invalid journal throws error', async () => {
    try {
      await accountingService.createJournalEntry(99999, [
        {
          accountId: cashAccount.id,
          debit: 1000,
          credit: 0,
        },
      ]);
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.match(error.message, /Journal.*not found/, 'Should indicate journal not found');
    }
  });
});
