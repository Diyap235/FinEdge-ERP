import { useState, useEffect } from 'react';
import { salesOrdersAPI, contactsAPI, productsAPI } from '../services/api';
import { Plus, ChevronLeft, X } from 'lucide-react';

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

  if (loading) return <div className="loading">Loading sales orders…</div>;

  const selectedOrderData = orders.find((o) => o.id === selectedOrder);

  return (
    <div className="page-root">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="page-header">
        <div style={{ display: 'flex', gap: 10 }}>
          {selectedOrder && (
            <button
              className="action-btn"
              onClick={() => setSelectedOrder(null)}
              style={{ background: 'transparent', color: '#555', border: '1.5px solid #d6d1c9', boxShadow: 'none' }}
            >
              <ChevronLeft size={14} />
              Back to list
            </button>
          )}
          {!showForm && !selectedOrder && (
            <button className="action-btn" onClick={() => setShowForm(true)}>
              <Plus size={14} />
              New Sales Order
            </button>
          )}
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {/* ── Create form ─────────────────────────────────────────── */}
      {showForm && (
        <div className="page-card">
          <h3 className="card-section-title">New Sales Order</h3>
          <form
            onSubmit={handleSubmit}
            style={{ background: 'none', padding: 0, boxShadow: 'none', border: 'none', marginBottom: 0 }}
          >
            <div className="form-group">
              <label>Customer *</label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <h4>Line Items</h4>
            {formData.lines.map((line, idx) => (
              <div key={idx} className="section" style={{ padding: 14, marginBottom: 10 }}>
                <div className="flex" style={{ alignItems: 'flex-end' }}>
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
                        <option key={p.id} value={p.id}>{p.name}</option>
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
                  <button
                    type="button"
                    className="danger"
                    onClick={() => setFormData({ ...formData, lines: formData.lines.filter((_, i) => i !== idx) })}
                    style={{ padding: '8px 12px', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="secondary"
              onClick={() => setFormData({ ...formData, lines: [...formData.lines, { productId: '', qty: 1, unitPrice: '', tax: 0 }] })}
              style={{ marginBottom: 4 }}
            >
              + Add Line
            </button>

            <div className="button-group">
              <button type="submit">Create Sales Order</button>
              <button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Detail view ─────────────────────────────────────────── */}
      {selectedOrderData && (
        <div className="page-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>
                Sales Order #{selectedOrderData.id}
              </h3>
              <p style={{ margin: 0, color: '#888', fontSize: 13 }}>
                Customer: <strong style={{ color: '#333' }}>{selectedOrderData.customer.name}</strong>
              </p>
            </div>
            <span className={`status-badge ${selectedOrderData.status.toLowerCase()}`}>
              {selectedOrderData.status}
            </span>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Tax</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrderData.lines.map((l) => {
                const total = l.qty * parseFloat(l.unitPrice) * (1 + parseFloat(l.tax) / 100);
                return (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 500 }}>{l.product.name}</td>
                    <td>{l.qty}</td>
                    <td>₹{parseFloat(l.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>{l.tax}%</td>
                    <td style={{ fontWeight: 600 }}>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="button-group">
            {selectedOrderData.status !== 'INVOICED' && !selectedOrderData.customerInvoice && (
              <button onClick={() => handleGenerateInvoice(selectedOrderData.id)}>
                Generate Invoice
              </button>
            )}
            {selectedOrderData.customerInvoice && (
              <div className="success" style={{ marginBottom: 0, flex: 1 }}>
                ✓ Invoice Generated
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── List ────────────────────────────────────────────────── */}
      {!selectedOrder && !showForm && (
        <div className="page-card">
          <table>
            <thead>
              <tr>
                <th>SO #</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Items</th>
                <th>Invoice</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#bbb', padding: '40px 0' }}>
                    No sales orders yet
                  </td>
                </tr>
              ) : orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600, color: '#0F6A4B' }}>#{o.id}</td>
                  <td style={{ fontWeight: 500 }}>{o.customer.name}</td>
                  <td>
                    <span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span>
                  </td>
                  <td>
                    <span className="status-badge draft">{o.lines.length} items</span>
                  </td>
                  <td>
                    {o.customerInvoice
                      ? <span className="status-badge invoiced">Invoiced</span>
                      : <span className="status-badge draft">Not Invoiced</span>}
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedOrder(o.id)}
                      style={{ padding: '5px 14px', fontSize: '12px' }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
