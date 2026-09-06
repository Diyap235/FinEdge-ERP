import { useState, useEffect } from 'react';
import { accountsAPI } from '../services/api';
import { Plus } from 'lucide-react';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'asset' });

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    try {
      const response = await accountsAPI.getAll();
      setAccounts(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await accountsAPI.create(formData);
      setFormData({ name: '', type: 'asset' });
      setShowForm(false);
      fetchAccounts();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <div className="loading">Loading accounts…</div>;

  return (
    <div className="page-root">

      {/* Action buttons */}
      <div className="page-header">
        <div>{/* spacer */}</div>
        {!showForm && (
          <button className="action-btn" onClick={() => setShowForm(true)}>
            <Plus size={14} />
            New Account
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="page-card">
          <h3 className="card-section-title">New Account</h3>
          <form onSubmit={handleSubmit} style={{ background: 'none', padding: 0, boxShadow: 'none', border: 'none', marginBottom: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Account Name *</label>
                <input type="text" required value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Type *</label>
                <select value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  <option value="asset">Asset</option>
                  <option value="liability">Liability</option>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="capital">Capital</option>
                </select>
              </div>
            </div>
            <div className="button-group">
              <button type="submit">Create Account</button>
              <button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="page-card">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Account Name</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', color: '#bbb', padding: '40px 0' }}>No accounts yet</td></tr>
            ) : accounts.map((acc, i) => (
              <tr key={acc.id}>
                <td style={{ color: '#aaa', width: 40 }}>{i + 1}</td>
                <td style={{ fontWeight: 500 }}>{acc.name}</td>
                <td><span className={`status-badge ${acc.type.toLowerCase()}`}>{acc.type}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
