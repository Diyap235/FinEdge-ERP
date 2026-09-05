import { useState, useEffect } from 'react';
import { paymentsAPI } from '../services/api';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await paymentsAPI.getAll();
        setPayments(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h2>Payments</h2>
      <table>
        <thead>
          <tr><th>Payment #</th><th>Type</th><th>Amount</th><th>Date</th><th>Linked Bill</th><th>Linked Invoice</th></tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>#{p.id}</td>
              <td><span className={`status-badge ${p.type.toLowerCase()}`}>{p.type}</span></td>
              <td>₹{parseFloat(p.amount).toFixed(2)}</td>
              <td>{new Date(p.date).toLocaleDateString()}</td>
              <td>{p.linkedBillId ? `Bill #${p.linkedBillId}` : '-'}</td>
              <td>{p.linkedInvoiceId ? `Invoice #${p.linkedInvoiceId}` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
