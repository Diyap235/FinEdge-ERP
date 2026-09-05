import { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'furniture',
    salesPrice: '',
    cost: '',
    category: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

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

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div>
      <h2>Products</h2>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="section">
          <h3>Create Product</h3>
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
            <label>Sales Price *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.salesPrice}
              onChange={(e) => setFormData({ ...formData, salesPrice: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Cost *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
          + Create Product
        </button>
      )}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Sales Price</th>
            <th>Cost</th>
            <th>Profit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const profit = parseFloat(product.salesPrice) - parseFloat(product.cost);
            return (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category || '-'}</td>
                <td>₹{parseFloat(product.salesPrice).toFixed(2)}</td>
                <td>₹{parseFloat(product.cost).toFixed(2)}</td>
                <td>₹{profit.toFixed(2)}</td>
                <td>
                  <button
                    className="danger"
                    onClick={() => handleDelete(product.id)}
                    style={{ padding: '5px 10px', fontSize: '12px' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
