import { useState, useEffect } from 'react';
import { salesOrdersAPI, contactsAPI, productsAPI } from '../services/api';

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    lines: [{ productId: '', qty: 1, unitPrice: '', tax: 0 }],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        salesOrdersAPI.getAll(),
        contactsAPI.getAll(),
        productsAPI.getAll(),
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data.filter((c) => c.type === 'customer' || c.type === 'both'));
      setProducts(productsRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.customerId || formData.lines.length === 0) {
        setError('Customer and lines required');
        return;
      }
      const validLines = formData.lines.filter((l) => l.productId && l.qty && l.unitPrice);
      if (validLines.length === 0) {
        setError('All lines must have product, quantity, and price');
        return;
      }
      await salesOrdersAPI.create({
        customerId: parseInt(formData.customerId),
        lines: validLines.map((l) => ({
          productId: parseInt(l.productId),
          qty: parseInt(l.qty),
          unitPrice: parseFloat(l.unitPrice),
          tax: parseFloat(l.tax || 0),
        })),
      });
      setFormData({ customerId: '', lines: [{ productId: '', qty: 1, unitPrice: '', tax: 0 }] });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGenerateInvoice = async (orderId) => {
    try {
      await salesOrdersAPI.generateInvoice(orderId);
      setSelectedOrder(null);
      loadData();
      alert('Invoice generated successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const selectedOrderData = orders.find((o) => o.id === selectedOrder);

  return (
    <div>
      <h2>Sales Orders</h2>
      {error && <div className="error">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="section">
          <h3>Create Sales Order</h3>
          <div className="form-group">
            <label>Customer *</label>
            <select
              required
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <h4>Line Items</h4>
          {formData.lines.map((line, idx) => (
            <div key={idx} className="section" style={{ padding: '15px', marginBottom: '10px' }}>
              <div className="flex">
                <div className="flex-1">
                  <label>Product</label>
                  <select
                    value={line.productId}
                    onChange={(e) => {
                      const newLines = [...formData.lines];
                      newLines[idx].productId = e.target.value;
                      setFormData({ ...formData, lines: newLines });
                    }}
                  >
                    <option value="">Select</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label>Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={line.qty}
                    onChange={(e) => {
                      const newLines = [...formData.lines];
                      newLines[idx].qty = e.target.value;
                      setFormData({ ...formData, lines: newLines });
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label>Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={line.unitPrice}
                    onChange={(e) => {
                      const newLines = [...formData.lines];
                      newLines[idx].unitPrice = e.target.value;
                      setFormData({ ...formData, lines: newLines });
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label>Tax %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={line.tax}
                    onChange={(e) => {
                      const newLines = [...formData.lines];
                      newLines[idx].tax = e.target.value;
                      setFormData({ ...formData, lines: newLines });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="secondary" onClick={() => {
            setFormData({
              ...formData,
              lines: [...formData.lines, { productId: '', qty: 1, unitPrice: '', tax: 0 }],
            });
          }}>
            + Add Line
          </button>
          <div className="button-group" style={{ marginTop: '20px' }}>
            <button type="submit">Create</button>
            <button type="button" className="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && <button onClick={() => setShowForm(true)} className="mb-20">+ Create Sales Order</button>}

      {selectedOrderData && (
        <div className="section">
          <h3>Sales Order #{selectedOrderData.id}</h3>
          <p>Customer: <strong>{selectedOrderData.customer.name}</strong></p>
          <table>
            <thead>
              <tr><th>Product</th><th>Qty</th><th>Price</th><th>Tax</th><th>Total</th></tr>
            </thead>
            <tbody>
              {selectedOrderData.lines.map((l) => {
                const total = l.qty * parseFloat(l.unitPrice) * (1 + parseFloat(l.tax) / 100);
                return (
                  <tr key={l.id}>
                    <td>{l.product.name}</td>
                    <td>{l.qty}</td>
                    <td>₹{parseFloat(l.unitPrice).toFixed(2)}</td>
                    <td>{l.tax}%</td>
                    <td>₹{total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {selectedOrderData.status !== 'INVOICED' && !selectedOrderData.customerInvoice && (
            <button onClick={() => handleGenerateInvoice(selectedOrderData.id)} style={{ marginTop: '15px' }}>
              Generate Invoice
            </button>
          )}
          {selectedOrderData.customerInvoice && (
            <div className="success" style={{ marginTop: '15px' }}>✓ Invoice Generated</div>
          )}
          <button className="secondary" onClick={() => setSelectedOrder(null)} style={{ marginTop: '15px' }}>Close</button>
        </div>
      )}

      {!selectedOrder && (
        <table>
          <thead>
            <tr><th>SO #</th><th>Customer</th><th>Status</th><th>Items</th><th>Invoice</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.customer.name}</td>
                <td><span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                <td>{o.lines.length}</td>
                <td>{o.customerInvoice ? 'Yes' : 'No'}</td>
                <td><button onClick={() => setSelectedOrder(o.id)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
