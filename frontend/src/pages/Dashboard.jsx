import { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getDashboardSummary();
      setSummary(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  if (!summary) return <div className="error">Failed to load dashboard</div>;

  return (
    <div>
      <h2>Dashboard</h2>

      {error && <div className="error">{error}</div>}

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-title">Total Revenue</div>
          <div className="card-value">₹{parseFloat(summary.revenue).toFixed(2)}</div>
        </div>

        <div className="card">
          <div className="card-title">Total Expenses</div>
          <div className="card-value">₹{parseFloat(summary.expenses).toFixed(2)}</div>
        </div>

        <div className="card">
          <div className="card-title">Net Profit</div>
          <div className="card-value">₹{parseFloat(summary.netProfit).toFixed(2)}</div>
        </div>

        <div className="card">
          <div className="card-title">Cash Balance</div>
          <div className="card-value">₹{parseFloat(summary.cashBalance).toFixed(2)}</div>
        </div>

        <div className="card">
          <div className="card-title">Bank Balance</div>
          <div className="card-value">₹{parseFloat(summary.bankBalance).toFixed(2)}</div>
        </div>

        <div className="card">
          <div className="card-title">Receivables</div>
          <div className="card-value">₹{parseFloat(summary.receivables).toFixed(2)}</div>
        </div>

        <div className="card">
          <div className="card-title">Payables</div>
          <div className="card-value">₹{parseFloat(summary.payables).toFixed(2)}</div>
        </div>
      </div>

      <h3>Recent Transactions</h3>
      {summary.recentTransactions && summary.recentTransactions.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Journal</th>
              <th>Reference</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {summary.recentTransactions.map((txn) => (
              <tr key={txn.id}>
                <td>{new Date(txn.date).toLocaleDateString()}</td>
                <td>{txn.journal}</td>
                <td>{txn.reference || '-'}</td>
                <td>{txn.items.length} items</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No transactions yet</p>
      )}
    </div>
  );
}
