import test from 'node:test';
import assert from 'node:assert';
import { prisma } from '../src/lib/prisma.js';
import { purchaseService } from '../src/services/purchase.service.js';
import { salesService } from '../src/services/sales.service.js';
import { reportService } from '../src/services/report.service.js';
import { money, moneyStr } from '../src/lib/money.js';

test('Purchase/Sales flow, duplicates, overpayment, reports', async (t) => {
  const vendor = await prisma.contact.findFirst({
    where: { type: { in: ['vendor', 'both'] } },
  });
  const customer = await prisma.contact.findFirst({
    where: { type: { in: ['customer', 'both'] } },
  });
  const product = await prisma.product.findFirst();

  if (!vendor || !customer || !product) {
    throw new Error('Master data missing. Run: npm run seed');
  }

  let extraPo;
  let extraSo;

  await t.test('Live PO → bill → pay is atomic and balanced', async () => {
    extraPo = await purchaseService.createPurchaseOrder(vendor.id, [
      { productId: product.id, qty: 1, unitPrice: '100.00' },
    ]);
    extraPo = await purchaseService.confirmPurchaseOrder(extraPo.id);
    const bill = await purchaseService.convertPurchaseOrderToVendorBill(
      extraPo.id
    );

    assert.ok(bill.id);
    assert.equal(bill.status, 'POSTED');
    assert.ok(bill.journalEntryId);
    assert.equal(bill.journalEntry.items.length, 2);

    const dr = bill.journalEntry.items.reduce(
      (s, i) => s.plus(money(i.debit)),
      money(0)
    );
    const cr = bill.journalEntry.items.reduce(
      (s, i) => s.plus(money(i.credit)),
      money(0)
    );
    assert.equal(moneyStr(dr), moneyStr(cr));

    await assert.rejects(
      () => purchaseService.convertPurchaseOrderToVendorBill(extraPo.id),
      /already converted/
    );

    await assert.rejects(
      () => purchaseService.recordVendorPayment(bill.id, '1000.00', 'bank'),
      /exceeds outstanding/
    );

    const paid = await purchaseService.recordVendorPayment(
      bill.id,
      '100.00',
      'bank'
    );
    assert.equal(paid.billStatus, 'PAID');
    assert.ok(paid.payment.id);
    assert.ok(paid.journalEntry.id);
  });

  await t.test('Live SO → invoice → pay, duplicate invoice blocked', async () => {
    extraSo = await salesService.createSalesOrder(customer.id, [
      { productId: product.id, qty: 1, unitPrice: '200.00', tax: '0' },
    ]);
    extraSo = await salesService.confirmSalesOrder(extraSo.id);
    const invoice = await salesService.generateCustomerInvoice(extraSo.id);

    assert.ok(invoice.id);
    assert.equal(invoice.status, 'POSTED');
    assert.ok(invoice.journalEntryId);

    await assert.rejects(
      () => salesService.generateCustomerInvoice(extraSo.id),
      /already invoiced/
    );

    await assert.rejects(
      () => salesService.recordCustomerPayment(invoice.id, '999.00', 'cash'),
      /exceeds outstanding/
    );

    const paid = await salesService.recordCustomerPayment(
      invoice.id,
      '200.00',
      'cash'
    );
    assert.equal(paid.invoiceStatus, 'PAID');
  });

  await t.test('Reports are calculated from journal items', async () => {
    const pl = await reportService.getProfitAndLoss();
    const bs = await reportService.getBalanceSheet();
    const dash = await reportService.getDashboardSummary();
    const ledger = await reportService.getLedger();

    assert.ok(pl.totalRevenue);
    assert.ok(pl.totalExpenses);
    assert.ok(pl.netProfit);
    assert.equal(typeof bs.balanced, 'boolean');
    assert.equal(bs.balanced, bs.isBalanced);
    assert.ok(ledger.length > 0);
    assert.equal(dash.totalRevenue, pl.totalRevenue);
    assert.equal(
      moneyStr(money(pl.totalRevenue).minus(pl.totalExpenses)),
      pl.netProfit
    );
  });

  await t.test('Every journal entry is balanced', async () => {
    const entries = await prisma.journalEntry.findMany({
      include: { items: true, journal: true },
    });
    assert.ok(entries.length > 0);
    for (const entry of entries) {
      const dr = entry.items.reduce((s, i) => s.plus(money(i.debit)), money(0));
      const cr = entry.items.reduce((s, i) => s.plus(money(i.credit)), money(0));
      assert.equal(
        moneyStr(dr),
        moneyStr(cr),
        `Entry ${entry.id} (${entry.reference}) is not balanced`
      );
      assert.ok(entry.journalId);
      for (const item of entry.items) {
        assert.ok(item.accountId);
        assert.ok(item.entryId);
      }
    }
  });
});
