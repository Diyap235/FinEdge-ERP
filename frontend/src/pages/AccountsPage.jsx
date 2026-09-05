import { useState, useEffect } from 'react';
import { accountsAPI } from '../services/api';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'asset' });

  useEffect(() => {
    fetchAccounts();
  }, []);

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

  if (loading) return <div className="loading">Loading accounts...</div>;

  return (
    <div>
      <h2>Chart of Accounts</h2>

      {showForm && (
        <form onSubmit={handleSubmit} className="section">
          <h3>Create Account</h3>
          <div className="form-group">
            <label>Account Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="asset">Asset</option>
              <option value="liability">Liability</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="capital">Capital</option>
            </select>
          </div>
          <div className="button-group">
            <button type="submit">Create</button>
            <button type="button" className="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <button onClick={() => setShowForm(true)} className="mb-20">
          + Create Account
        </button>
      )}

      <table>
        <thead>
          <tr>
            <th>Account Name</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc.id}>
              <td>{acc.name}</td>
              <td>
                <span className={`status-badge ${acc.type.toLowerCase()}`}>{acc.type}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
