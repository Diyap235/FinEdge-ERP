import { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { PackagePlus, Trash2 } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'furniture', salesPrice: '', cost: '', category: '' });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data);
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
      if (!formData.name || !formData.salesPrice || !formData.cost) {
        setError('Name, sales price, and cost are required');
        return;
      }
      await productsAPI.create(formData);
      setFormData({ name: '', type: 'furniture', salesPrice: '', cost: '', category: '' });
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await productsAPI.delete(id);
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading products…</div>;

  return (
    <div className="page-root">

      {/* Action buttons */}
      <div className="page-header">
        {!showForm && (
          <button className="action-btn" style={{ marginLeft: 'auto' }} onClick={() => setShowForm(true)}>
            <PackagePlus size={14} />
            New Product
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {/* Create form */}
      {showForm && (
        <div className="page-card">
          <h3 className="card-section-title">New Product</h3>
          <form onSubmit={handleSubmit} style={{ background: 'none', padding: 0, boxShadow: 'none', border: 'none', marginBottom: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Name *</label>
                <input type="text" required value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Category</label>
                <input type="text" value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Sales Price *</label>
                <input type="number" step="0.01" required value={formData.salesPrice}
                  onChange={e => setFormData({ ...formData, salesPrice: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Cost *</label>
                <input type="number" step="0.01" required value={formData.cost}
                  onChange={e => setFormData({ ...formData, cost: e.target.value })} />
              </div>
            </div>
            <div className="button-group">
              <button type="submit">Create Product</button>
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
              <th>Name</th>
              <th>Category</th>
              <th>Sales Price</th>
              <th>Cost</th>
              <th>Margin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#bbb', padding: '40px 0' }}>No products yet</td></tr>
            ) : products.map(product => {
              const profit = parseFloat(product.salesPrice) - parseFloat(product.cost);
              const margin = parseFloat(product.salesPrice) > 0
                ? ((profit / parseFloat(product.salesPrice)) * 100).toFixed(1)
                : '0.0';
              return (
                <tr key={product.id}>
                  <td style={{ fontWeight: 500 }}>{product.name}</td>
                  <td>{product.category || <span style={{ color: '#bbb' }}>—</span>}</td>
                  <td>₹{parseFloat(product.salesPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td>₹{parseFloat(product.cost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td>
                    <span style={{ color: profit >= 0 ? '#0F6A4B' : '#c0392b', fontWeight: 600 }}>
                      {margin}%
                    </span>
                  </td>
                  <td>
                    <button className="danger" onClick={() => handleDelete(product.id)}
                      style={{ padding: '5px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
