import { useState, useEffect } from 'react';
import { contactsAPI } from '../services/api';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'customer', email: '', mobile: '' });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await contactsAPI.getAll();
      setContacts(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await contactsAPI.create(formData);
      setFormData({ name: '', type: 'customer', email: '', mobile: '' });
      setShowForm(false);
      fetchContacts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await contactsAPI.delete(id);
      fetchContacts();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading contacts...</div>;

  return (
    <div>
      <h2>Contacts</h2>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="section">
          <h3>Create Contact</h3>
          <div className="form-group">
            <label>Name *</label>
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
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Mobile</label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />
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
          + Create Contact
        </button>
      )}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>{contact.name}</td>
              <td>
                <span className={`status-badge ${contact.type.toLowerCase()}`}>
                  {contact.type}
                </span>
              </td>
              <td>{contact.email || '-'}</td>
              <td>{contact.mobile || '-'}</td>
              <td>
                <button
                  className="danger"
                  onClick={() => handleDelete(contact.id)}
                  style={{ padding: '5px 10px', fontSize: '12px' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
