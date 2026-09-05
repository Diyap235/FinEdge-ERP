import { useState, useEffect } from 'react';
import { customerInvoicesAPI } from '../services/api';

export default function CustomerInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentData, setPaymentData] = useState({ amount: '', paymentType: 'bank' });

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

  if (loading) return <div className="loading">Loading...</div>;

  const invData = invoices.find((i) => i.id === selectedInvoice);

  return (
    <div>
      <h2>Customer Invoices</h2>
      {error && <div className="error">{error}</div>}

      {invData && (
        <div className="section">
          <h3>Invoice #{invData.id}</h3>
          <p>Customer: <strong>{invData.salesOrder.customer.name}</strong></p>
          <p>Status: <span className={`status-badge ${invData.status.toLowerCase()}`}>{invData.status}</span></p>

          <h4>Items</h4>
          <table>
            <thead>
              <tr><th>Product</th><th>Qty</th><th>Price</th><th>Tax</th><th>Total</th></tr>
            </thead>
            <tbody>
              {invData.salesOrder.lines.map((l) => {
                const subtotal = l.qty * parseFloat(l.unitPrice);
                const tax = subtotal * (parseFloat(l.tax) / 100);
                const total = subtotal + tax;
                return (
                  <tr key={l.id}>
                    <td>{l.product.name}</td>
                    <td>{l.qty}</td>
                    <td>₹{parseFloat(l.unitPrice).toFixed(2)}</td>
                    <td>{l.tax}%</td>
                    <td>₹{total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h4>Journal Entry</h4>
          {invData.journalEntry && (
            <table>
              <thead><tr><th>Account</th><th>Debit</th><th>Credit</th></tr></thead>
              <tbody>
                {invData.journalEntry.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.account.name}</td>
                    <td>{item.debit > 0 ? '₹' + parseFloat(item.debit).toFixed(2) : '-'}</td>
                    <td>{item.credit > 0 ? '₹' + parseFloat(item.credit).toFixed(2) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {invData.status !== 'PAID' && (
            <div className="section" style={{ marginTop: '20px' }}>
              <h4>Record Payment</h4>
              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Payment Type *</label>
                <select
                  value={paymentData.paymentType}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentType: e.target.value })}
                >
                  <option value="bank">Bank</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <button onClick={() => handlePayment(invData.id)}>Record Payment</button>
            </div>
          )}

          <button className="secondary" onClick={() => setSelectedInvoice(null)} style={{ marginTop: '20px' }}>
            Close
          </button>
        </div>
      )}

      {!selectedInvoice && (
        <table>
          <thead>
            <tr><th>Invoice #</th><th>Customer</th><th>Status</th><th>Amount</th><th>Payments</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              let total = 0;
              inv.salesOrder.lines.forEach((l) => {
                total += l.qty * parseFloat(l.unitPrice) * (1 + parseFloat(l.tax) / 100);
              });
              return (
                <tr key={inv.id}>
                  <td>#{inv.id}</td>
                  <td>{inv.salesOrder.customer.name}</td>
                  <td><span className={`status-badge ${inv.status.toLowerCase()}`}>{inv.status}</span></td>
                  <td>₹{total.toFixed(2)}</td>
                  <td>{inv.payments.length}</td>
                  <td><button onClick={() => setSelectedInvoice(inv.id)}>View</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
