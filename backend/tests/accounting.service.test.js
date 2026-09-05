import test from 'node:test';
import assert from 'node:assert';
import { prisma } from '../src/lib/prisma.js';
import { accountingService } from '../src/services/accounting.service.js';
import { moneyStr } from '../src/lib/money.js';

test('Accounting Service Tests', async (t) => {
  let testJournal;
  let purchaseExpenseAccount;
  let creditorsAccount;
  let cashAccount;
  let debtorsAccount;
  let salesIncomeAccount;
  const suffix = `TEST-${Date.now()}`;

  await t.before(async () => {
    purchaseExpenseAccount = await prisma.account.create({
      data: { name: `Purchase Expense ${suffix}`, type: 'expense' },
    });
    creditorsAccount = await prisma.account.create({
      data: { name: `Creditors ${suffix}`, type: 'liability' },
    });
    cashAccount = await prisma.account.create({
      data: { name: `Cash ${suffix}`, type: 'asset' },
    });
    debtorsAccount = await prisma.account.create({
      data: { name: `Debtors ${suffix}`, type: 'asset' },
    });
    salesIncomeAccount = await prisma.account.create({
      data: { name: `Sales Income ${suffix}`, type: 'income' },
    });
    testJournal = await prisma.journal.create({
      data: { name: `Test Journal ${suffix}`, type: 'bank' },
    });
  });

  await t.after(async () => {
    await prisma.journalItem.deleteMany({
      where: { entry: { journalId: testJournal.id } },
    });
    await prisma.journalEntry.deleteMany({
      where: { journalId: testJournal.id },
    });
    await prisma.journal.delete({ where: { id: testJournal.id } });
    await prisma.account.deleteMany({
      where: {
        id: {
          in: [
            purchaseExpenseAccount.id,
            creditorsAccount.id,
            cashAccount.id,
            debtorsAccount.id,
            salesIncomeAccount.id,
          ],
        },
      },
    });
  });

  await t.test('TEST 1: Balanced journal entry succeeds', async () => {
    const entry = await accountingService.createJournalEntry(
      testJournal.id,
      new Date(),
      'TEST-BALANCED',
      [
        { accountId: purchaseExpenseAccount.id, debit: 1000, credit: 0 },
        { accountId: creditorsAccount.id, debit: 0, credit: 1000 },
      ]
    );

    assert.ok(entry.id, 'Entry should be created');
    assert.equal(entry.items.length, 2, 'Entry should have 2 items');
    assert.equal(entry.status, 'POSTED', 'Entry should be POSTED');
  });

  await t.test('TEST 2: Unbalanced journal entry fails and does not persist', async () => {
    const before = await prisma.journalEntry.count({
      where: { journalId: testJournal.id },
    });

    await assert.rejects(
      () =>
        accountingService.createJournalEntry(
          testJournal.id,
          new Date(),
          'TEST-UNBALANCED',
          [
            { accountId: purchaseExpenseAccount.id, debit: 15000, credit: 0 },
            { accountId: creditorsAccount.id, debit: 0, credit: 14000 },
          ]
        ),
      /Debit and credit totals do not match/
    );

    const after = await prisma.journalEntry.count({
      where: { journalId: testJournal.id },
    });
    const leaked = await prisma.journalEntry.findFirst({
      where: { reference: 'TEST-UNBALANCED' },
    });

    assert.equal(after, before, 'No extra journal entry should remain');
    assert.equal(leaked, null, 'Unbalanced entry must not be saved');
  });

  await t.test('TEST 3: Vendor bill style entries', async () => {
    const entry = await accountingService.createJournalEntry(
      testJournal.id,
      new Date(),
      null,
      [
        { accountId: purchaseExpenseAccount.id, debit: 15000, credit: 0 },
        { accountId: creditorsAccount.id, debit: 0, credit: 15000 },
      ]
    );

    assert.equal(moneyStr(entry.items[0].debit), '15000.00');
    assert.equal(moneyStr(entry.items[1].credit), '15000.00');
  });

  await t.test('TEST 4: Cannot have both debit and credit on same item', async () => {
    await assert.rejects(
      () =>
        accountingService.createJournalEntry(
          testJournal.id,
          new Date(),
          null,
          [
            { accountId: purchaseExpenseAccount.id, debit: 1000, credit: 500 },
            { accountId: creditorsAccount.id, debit: 0, credit: 500 },
          ]
        ),
      /Cannot have both debit/
    );
  });

  await t.test('TEST 5: Invalid account throws error', async () => {
    await assert.rejects(
      () =>
        accountingService.createJournalEntry(
          testJournal.id,
          new Date(),
          null,
          [
            { accountId: 999999, debit: 1000, credit: 0 },
            { accountId: cashAccount.id, debit: 0, credit: 1000 },
          ]
        ),
      /Required account not found/
    );
  });

  await t.test('TEST 6: Invalid journal throws error', async () => {
    await assert.rejects(
      () =>
        accountingService.createJournalEntry(999999, new Date(), null, [
          { accountId: cashAccount.id, debit: 1000, credit: 0 },
          { accountId: creditorsAccount.id, debit: 0, credit: 1000 },
        ]),
      /Required journal not found/
    );
  });

  await t.test('TEST 7: Ledger running balance', async () => {
    await accountingService.createJournalEntry(
      testJournal.id,
      new Date(),
      'LEDGER-1',
      [
        { accountId: cashAccount.id, debit: 1000, credit: 0 },
        { accountId: creditorsAccount.id, debit: 0, credit: 1000 },
      ]
    );
    await accountingService.createJournalEntry(
      testJournal.id,
      new Date(),
      'LEDGER-2',
      [
        { accountId: cashAccount.id, debit: 500, credit: 0 },
        { accountId: creditorsAccount.id, debit: 0, credit: 500 },
      ]
    );

    const ledger = await accountingService.getLedgerForAccount(cashAccount.id);
    assert.ok(ledger.length >= 2);
    assert.equal(ledger[ledger.length - 1].runningBalance, moneyStr(ledger.reduce((s, row) => s + Number(row.debit) - Number(row.credit), 0)));
  });

  await t.test('TEST 8: Requires at least two items', async () => {
    await assert.rejects(
      () =>
        accountingService.createJournalEntry(
          testJournal.id,
          new Date(),
          null,
          [{ accountId: cashAccount.id, debit: 1000, credit: 0 }]
        ),
      /At least two journal items/
    );
  });
});
