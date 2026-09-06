import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { usersAPI } from '../services/api';
import { Plus, Edit2, Trash2, Shield, Calculator, UserCircle } from 'lucide-react';

const ROLE_CONFIG = {
  admin: {
    label: 'Admin',
    icon: Shield,
    color: '#0F6A4B',
    bg: '#e6f5ef',
  },
  accountant: {
    label: 'Accountant',
    icon: Calculator,
    color: '#1a56db',
    bg: '#e8f0fe',
  },
  contact: {
    label: 'User',
    icon: UserCircle,
    color: '#7c3aed',
    bg: '#f3e8ff',
  },
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'contact',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Load users error:', err);
      setError(err.message);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (!formData.name || !formData.email || !formData.role) {
        toast.warning('All fields are required');
        return;
      }

      if (editingUser) {
        await usersAPI.update(editingUser.id, formData);
        toast.success('User updated successfully!');
      } else {
        await usersAPI.create(formData);
        toast.success('User created successfully!');
      }

      setFormData({ name: '', email: '', role: 'contact' });
      setEditingUser(null);
      setShowForm(false);
      await loadUsers();
    } catch (err) {
      console.error('Save user error:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to save user';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setShowForm(true);
  };

  const handleDelete = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await usersAPI.delete(userId);
      toast.success('User deleted successfully!');
      await loadUsers();
    } catch (err) {
      console.error('Delete user error:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to delete user';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'contact' });
    setError(null);
  };

  if (loading) return <div className="loading">Loading users…</div>;

  return (
    <div className="page-root">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">
            {users.length} user{users.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        {!showForm && (
          <button className="action-btn" onClick={() => setShowForm(true)}>
            <Plus size={14} /> New User
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="page-card">
          <h3 className="card-section-title">
            {editingUser ? 'Edit User' : 'New User'}
          </h3>
          <form onSubmit={handleSubmit} style={{ background: 'none', padding: 0, boxShadow: 'none', border: 'none', marginBottom: 0 }}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>

            <div className="form-group">
              <label>Role *</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="contact">User / Contact</option>
                <option value="accountant">Accountant</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="button-group">
              <button type="submit">
                {editingUser ? 'Update User' : 'Create User'}
              </button>
              <button type="button" className="secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      {!showForm && (
        <div className="page-card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#bbb', padding: '40px 0' }}>
                    No users yet
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.contact;
                  const Icon = roleConfig.icon;

                  return (
                    <tr key={user.id}>
                      <td style={{ fontWeight: 600, color: '#0F6A4B' }}>#{user.id}</td>
                      <td style={{ fontWeight: 500 }}>{user.name}</td>
                      <td style={{ color: '#666', fontSize: '12px' }}>{user.email}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: roleConfig.bg,
                            color: roleConfig.color,
                            fontSize: '11.5px',
                            fontWeight: 600,
                          }}
                        >
                          <Icon size={12} />
                          {roleConfig.label}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#888' }}>
                        {new Date(user.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => handleEdit(user)}
                            style={{
                              padding: '5px 10px',
                              fontSize: '11px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              background: '#f0f7ff',
                              color: '#1a56db',
                              border: '1px solid #d1e3ff',
                            }}
                            title="Edit user"
                          >
                            <Edit2 size={11} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            style={{
                              padding: '5px 10px',
                              fontSize: '11px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              background: '#fff1f0',
                              color: '#c0392b',
                              border: '1px solid #ffd6d1',
                            }}
                            title="Delete user"
                          >
                            <Trash2 size={11} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
