import { useState, useEffect } from 'react';
import { vendorBillsAPI } from '../services/api';
import { ChevronLeft } from 'lucide-react';

export default function VendorBillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentData, setPaymentData] = useState({ amount: '', paymentType: 'bank' });

  useEffect(() => { loadBills(); }, []);

  const loadBills = async () => {
    try {
      const response = await vendorBillsAPI.getAll();
      setBills(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (billId) => {
    try {
      if (!paymentData.amount) { setError('Amount is required'); return; }
      await vendorBillsAPI.pay(billId, {
        amount: parseFloat(paymentData.amount),
        paymentType: paymentData.paymentType,
      });
      alert('Payment recorded successfully!');
      setPaymentData({ amount: '', paymentType: 'bank' });
      setSelectedBill(null);
      loadBills();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading vendor bills…</div>;

  const billData = bills.find(b => b.id === selectedBill);

  return (
    <div className="page-root">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendor Bills</h1>
          <p className="page-subtitle">{bills.length} bill{bills.length !== 1 ? 's' : ''}</p>
        </div>
        {selectedBill && (
          <button className="action-btn" onClick={() => setSelectedBill(null)}
            style={{ background: 'transparent', color: '#555', border: '1.5px solid #d6d1c9', boxShadow: 'none' }}>
            <ChevronLeft size={14} />
            Back to list
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {/* Detail view */}
      {billData && (
        <>
          <div className="page-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Bill #{billData.id}</h3>
                <p style={{ margin: 0, color: '#888', fontSize: 13 }}>
                  Vendor: <strong style={{ color: '#333' }}>{billData.purchaseOrder.vendor.name}</strong>
                </p>
              </div>
              <span className={`status-badge ${billData.status.toLowerCase()}`}>{billData.status}</span>
            </div>

            <h4 style={{ marginTop: 0 }}>Items</h4>
            <table>
              <thead>
                <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                {billData.purchaseOrder.lines.map(line => {
                  const total = line.qty * parseFloat(line.unitPrice);
                  return (
                    <tr key={line.id}>
                      <td style={{ fontWeight: 500 }}>{line.product.name}</td>
                      <td>{line.qty}</td>
                      <td>₹{parseFloat(line.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style={{ fontWeight: 600 }}>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {billData.journalEntry && (
              <>
                <h4>Journal Entry</h4>
                <table>
                  <thead>
                    <tr><th>Account</th><th>Debit</th><th>Credit</th></tr>
                  </thead>
                  <tbody>
                    {billData.journalEntry.items.map(item => (
                      <tr key={item.id}>
                        <td>{item.account.name}</td>
                        <td style={{ color: item.debit > 0 ? '#0F6A4B' : '#bbb' }}>
                          {item.debit > 0 ? '₹' + parseFloat(item.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—'}
                        </td>
                        <td style={{ color: item.credit > 0 ? '#c0392b' : '#bbb' }}>
                          {item.credit > 0 ? '₹' + parseFloat(item.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>

          {billData.status !== 'PAID' && (
            <div className="page-card">
              <h3 className="card-section-title">Record Payment</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Amount *</label>
                  <input type="number" step="0.01" value={paymentData.amount}
                    onChange={e => setPaymentData({ ...paymentData, amount: e.target.value })} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Payment Type *</label>
                  <select value={paymentData.paymentType}
                    onChange={e => setPaymentData({ ...paymentData, paymentType: e.target.value })}>
                    <option value="bank">Bank</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>
              <div className="button-group">
                <button onClick={() => handlePayment(billData.id)}>Record Payment</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* List */}
      {!selectedBill && (
        <div className="page-card">
          <table>
            <thead>
              <tr>
                <th>Bill #</th>
                <th>Vendor</th>
                <th>Status</th>
                <th>Payments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#bbb', padding: '40px 0' }}>No vendor bills</td></tr>
              ) : bills.map(bill => (
                <tr key={bill.id}>
                  <td style={{ fontWeight: 600, color: '#0F6A4B' }}>#{bill.id}</td>
                  <td style={{ fontWeight: 500 }}>{bill.purchaseOrder.vendor.name}</td>
                  <td><span className={`status-badge ${bill.status.toLowerCase()}`}>{bill.status}</span></td>
                  <td>
                    <span className="status-badge draft">{bill.payments.length} payment{bill.payments.length !== 1 ? 's' : ''}</span>
                  </td>
                  <td>
                    <button onClick={() => setSelectedBill(bill.id)}
                      style={{ padding: '5px 14px', fontSize: '12px' }}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
