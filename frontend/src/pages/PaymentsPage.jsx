import { useState, useEffect } from 'react';
import { paymentsAPI } from '../services/api';
import { Calendar } from 'lucide-react';

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

  if (loading) return <div className="loading">Loading payments…</div>;

  const total = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <div className="page-root">

      {/* Header */}
      <div className="page-header">
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ fontSize: 13, color: '#746C62', fontWeight: 500 }}>
            {payments.length} payment{payments.length !== 1 ? 's' : ''} · total ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="page-card">
        <table>
          <thead>
            <tr>
              <th>Payment #</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Linked Bill</th>
              <th>Linked Invoice</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#bbb', padding: '40px 0' }}>No payments recorded</td></tr>
            ) : payments.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600, color: '#0F6A4B' }}>#{p.id}</td>
                <td><span className={`status-badge ${p.type.toLowerCase()}`}>{p.type}</span></td>
                <td style={{ fontWeight: 600 }}>₹{parseFloat(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <Calendar size={12} style={{ color: '#aaa' }} />
                    {new Date(p.date).toLocaleDateString('en-IN')}
                  </span>
                </td>
                <td>{p.linkedBillId ? <span className="status-badge draft">Bill #{p.linkedBillId}</span> : <span style={{ color: '#bbb' }}>—</span>}</td>
                <td>{p.linkedInvoiceId ? <span className="status-badge draft">Inv #{p.linkedInvoiceId}</span> : <span style={{ color: '#bbb' }}>—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
