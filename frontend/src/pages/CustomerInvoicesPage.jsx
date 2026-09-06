import { useState, useEffect } from 'react';
import { customerInvoicesAPI } from '../services/api';
import { ChevronLeft, ScanLine } from 'lucide-react';

export default function CustomerInvoicesPage({ onNavigate, currentUser }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentData, setPaymentData] = useState({ amount: '', paymentType: 'bank' });

  const rawRole = typeof currentUser === 'object' ? currentUser?.role : currentUser;
  const role = String(rawRole || '').toLowerCase().trim();
  const isAuthorizedRole = role === 'admin' || role === 'accountant';

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const response = await customerInvoicesAPI.getAll();
      setInvoices(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (invoiceId) => {
    try {
      if (!paymentData.amount) {
        setError('Amount required');
        return;
      }
      await customerInvoicesAPI.pay(invoiceId, {
        amount: parseFloat(paymentData.amount),
        paymentType: paymentData.paymentType,
      });
      alert('Payment recorded!');
      setPaymentData({ amount: '', paymentType: 'bank' });
      setSelectedInvoice(null);
      loadInvoices();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading customer invoices…</div>;

  const invData = invoices.find((i) => i.id === selectedInvoice);

  return (
    <div className="page-root">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!selectedInvoice && isAuthorizedRole && (
            <button
              className="action-btn"
              onClick={() => onNavigate?.('ocr-scanner')}
              style={{
                background: 'linear-gradient(135deg, #0F6A4B, #168a62)',
                color: '#fff',
                border: 'none',
                boxShadow: '0 2px 8px rgba(15,106,75,0.25)',
              }}
            >
              <ScanLine size={14} />
              AI Invoice Scanner
            </button>
          )}
          {selectedInvoice && (
            <button
              className="action-btn"
              onClick={() => setSelectedInvoice(null)}
              style={{ background: 'transparent', color: '#555', border: '1.5px solid #d6d1c9', boxShadow: 'none' }}
            >
              <ChevronLeft size={14} />
              Back to list
            </button>
          )}
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {/* ── Detail view ─────────────────────────────────────────── */}
      {invData && (
        <>
          <div className="page-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>
                  Invoice #{invData.id}
                </h3>
                <p style={{ margin: 0, color: '#888', fontSize: 13 }}>
                  Customer: <strong style={{ color: '#333' }}>{invData.salesOrder.customer.name}</strong>
                </p>
              </div>
              <span className={`status-badge ${invData.status.toLowerCase()}`}>{invData.status}</span>
            </div>

            <h4 style={{ marginTop: 0 }}>Items</h4>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Tax</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invData.salesOrder.lines.map((l) => {
                  const subtotal = l.qty * parseFloat(l.unitPrice);
                  const tax = subtotal * (parseFloat(l.tax) / 100);
                  const total = subtotal + tax;
                  return (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 500 }}>{l.product.name}</td>
                      <td>{l.qty}</td>
                      <td>₹{parseFloat(l.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td>{l.tax}%</td>
                      <td style={{ fontWeight: 600 }}>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {invData.journalEntry && (
              <>
                <h4>Journal Entry</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Debit</th>
                      <th>Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invData.journalEntry.items.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 500 }}>{item.account.name}</td>
                        <td style={{ color: item.debit > 0 ? '#0F6A4B' : '#bbb', fontWeight: item.debit > 0 ? 600 : 400 }}>
                          {item.debit > 0
                            ? '₹' + parseFloat(item.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })
                            : '—'}
                        </td>
                        <td style={{ color: item.credit > 0 ? '#c0392b' : '#bbb', fontWeight: item.credit > 0 ? 600 : 400 }}>
                          {item.credit > 0
                            ? '₹' + parseFloat(item.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>

          {/* Record payment card — only when unpaid */}
          {invData.status !== 'PAID' && (
            <div className="page-card">
              <h3 className="card-section-title">Record Payment</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Payment Type *</label>
                  <select
                    value={paymentData.paymentType}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentType: e.target.value })}
                  >
                    <option value="bank">Bank</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>
              <div className="button-group">
                <button onClick={() => handlePayment(invData.id)}>Record Payment</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── List ────────────────────────────────────────────────── */}
      {!selectedInvoice && (
        <div className="page-card">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Payments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#bbb', padding: '40px 0' }}>
                    No customer invoices yet
                  </td>
                </tr>
              ) : invoices.map((inv) => {
                let total = 0;
                inv.salesOrder.lines.forEach((l) => {
                  total += l.qty * parseFloat(l.unitPrice) * (1 + parseFloat(l.tax) / 100);
                });
                return (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600, color: '#0F6A4B' }}>#{inv.id}</td>
                    <td style={{ fontWeight: 500 }}>{inv.salesOrder.customer.name}</td>
                    <td>
                      <span className={`status-badge ${inv.status.toLowerCase()}`}>{inv.status}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className="status-badge draft">
                        {inv.payments.length} payment{inv.payments.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedInvoice(inv.id)}
                        style={{ padding: '5px 14px', fontSize: '12px' }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
