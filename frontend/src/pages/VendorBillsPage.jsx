import { useState, useEffect } from 'react';
import { vendorBillsAPI } from '../services/api';

export default function VendorBillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentData, setPaymentData] = useState({ amount: '', paymentType: 'bank' });

  useEffect(() => {
    loadBills();
  }, []);

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
      if (!paymentData.amount) {
        setError('Amount is required');
        return;
      }
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

  if (loading) return <div className="loading">Loading vendor bills...</div>;

  const billData = bills.find((b) => b.id === selectedBill);

  return (
    <div>
      <h2>Vendor Bills</h2>

      {error && <div className="error">{error}</div>}

      {billData && (
        <div className="section">
          <h3>Bill #{billData.id}</h3>
          <p>Vendor: <strong>{billData.purchaseOrder.vendor.name}</strong></p>
          <p>Status: <span className={`status-badge ${billData.status.toLowerCase()}`}>{billData.status}</span></p>

          <h4>Items</h4>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {billData.purchaseOrder.lines.map((line) => {
                const total = line.qty * parseFloat(line.unitPrice);
                return (
                  <tr key={line.id}>
                    <td>{line.product.name}</td>
                    <td>{line.qty}</td>
                    <td>₹{parseFloat(line.unitPrice).toFixed(2)}</td>
                    <td>₹{total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h4>Journal Entry</h4>
          {billData.journalEntry && (
            <table>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Debit</th>
                  <th>Credit</th>
                </tr>
              </thead>
              <tbody>
                {billData.journalEntry.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.account.name}</td>
                    <td>{item.debit > 0 ? '₹' + parseFloat(item.debit).toFixed(2) : '-'}</td>
                    <td>{item.credit > 0 ? '₹' + parseFloat(item.credit).toFixed(2) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {billData.status !== 'PAID' && (
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
              <button onClick={() => handlePayment(billData.id)}>Record Payment</button>
            </div>
          )}

          <button className="secondary" onClick={() => setSelectedBill(null)} style={{ marginTop: '20px' }}>
            Close
          </button>
        </div>
      )}

      {!selectedBill && (
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
            {bills.map((bill) => (
              <tr key={bill.id}>
                <td>#{bill.id}</td>
                <td>{bill.purchaseOrder.vendor.name}</td>
                <td>
                  <span className={`status-badge ${bill.status.toLowerCase()}`}>{bill.status}</span>
                </td>
                <td>{bill.payments.length}</td>
                <td>
                  <button onClick={() => setSelectedBill(bill.id)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
