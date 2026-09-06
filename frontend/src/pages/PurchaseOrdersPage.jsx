import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { purchaseOrdersAPI, contactsAPI, productsAPI } from '../services/api';
import { Plus, ChevronLeft, X } from 'lucide-react';

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    vendorId: '',
    lines: [{ productId: '', qty: 1, unitPrice: '' }],
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, vendorsRes, productsRes] = await Promise.all([
        purchaseOrdersAPI.getAll(),
        contactsAPI.getAll(),
        productsAPI.getAll(),
      ]);
      setOrders(ordersRes.data);
      setVendors(vendorsRes.data.filter(c => c.type === 'vendor' || c.type === 'both'));
      setProducts(productsRes.data);
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
      if (!formData.vendorId || formData.lines.length === 0) { setError('Vendor and at least one line are required'); return; }
      const validLines = formData.lines.filter(l => l.productId && l.qty && l.unitPrice);
      if (validLines.length === 0) { setError('All line items must have product, quantity, and price'); return; }
      await purchaseOrdersAPI.create({
        vendorId: parseInt(formData.vendorId),
        lines: validLines.map(l => ({ productId: parseInt(l.productId), qty: parseInt(l.qty), unitPrice: parseFloat(l.unitPrice) })),
      });
      setFormData({ vendorId: '', lines: [{ productId: '', qty: 1, unitPrice: '' }] });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const addLineItem = () => setFormData({ ...formData, lines: [...formData.lines, { productId: '', qty: 1, unitPrice: '' }] });

  const updateLineItem = (index, field, value) => {
    const newLines = [...formData.lines];
    newLines[index][field] = value;
    setFormData({ ...formData, lines: newLines });
  };

  const removeLineItem = (index) => setFormData({ ...formData, lines: formData.lines.filter((_, i) => i !== index) });

  const handleConvertToBill = async (orderId) => {
    try {
      // Find the order to check its status
      const order = orders.find(o => o.id === orderId);
      
      // If order is DRAFT, confirm it first
      if (order && order.status === 'DRAFT') {
        await purchaseOrdersAPI.confirm(orderId);
      }
      
      // Then convert to bill
      await purchaseOrdersAPI.convertToBill(orderId);
      setSelectedOrder(null);
      loadData();
      toast.success('Purchase Order converted to Vendor Bill successfully!');
    } catch (err) {
      console.error('Convert to bill error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to convert purchase order';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  if (loading) return <div className="loading">Loading purchase orders…</div>;

  const selectedOrderData = orders.find(o => o.id === selectedOrder);

  return (
    <div className="page-root">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchase Orders</h1>
          <p className="page-subtitle">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {selectedOrder && (
            <button className="action-btn" onClick={() => setSelectedOrder(null)}
              style={{ background: 'transparent', color: '#555', border: '1.5px solid #d6d1c9', boxShadow: 'none' }}>
              <ChevronLeft size={14} /> Back
            </button>
          )}
          {!showForm && !selectedOrder && (
            <button className="action-btn" onClick={() => setShowForm(true)}>
              <Plus size={14} /> New Purchase Order
            </button>
          )}
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Create form */}
      {showForm && (
        <div className="page-card">
          <h3 className="card-section-title">New Purchase Order</h3>
          <form onSubmit={handleSubmit} style={{ background: 'none', padding: 0, boxShadow: 'none', border: 'none', marginBottom: 0 }}>
            <div className="form-group">
              <label>Vendor *</label>
              <select required value={formData.vendorId}
                onChange={e => setFormData({ ...formData, vendorId: e.target.value })}>
                <option value="">Select Vendor</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>

            <h4>Line Items</h4>
            {formData.lines.map((line, index) => (
              <div key={index} className="section" style={{ padding: 14, marginBottom: 10 }}>
                <div className="flex" style={{ alignItems: 'flex-end' }}>
                  <div className="flex-1">
                    <label>Product</label>
                    <select value={line.productId} onChange={e => updateLineItem(index, 'productId', e.target.value)}>
                      <option value="">Select Product</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label>Quantity</label>
                    <input type="number" min="1" value={line.qty}
                      onChange={e => updateLineItem(index, 'qty', e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <label>Unit Price</label>
                    <input type="number" step="0.01" value={line.unitPrice}
                      onChange={e => updateLineItem(index, 'unitPrice', e.target.value)} />
                  </div>
                  <button type="button" className="danger" onClick={() => removeLineItem(index)}
                    style={{ padding: '8px 12px', display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))}

            <button type="button" className="secondary" onClick={addLineItem}
              style={{ marginBottom: 4 }}>
              + Add Line Item
            </button>

            <div className="button-group">
              <button type="submit">Create Purchase Order</button>
              <button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Detail view */}
      {selectedOrderData && (
        <div className="page-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>PO #{selectedOrderData.id}</h3>
              <p style={{ margin: 0, color: '#888', fontSize: 13 }}>
                Vendor: <strong style={{ color: '#333' }}>{selectedOrderData.vendor.name}</strong>
              </p>
            </div>
            <span className={`status-badge ${selectedOrderData.status.toLowerCase()}`}>{selectedOrderData.status}</span>
          </div>

          <table>
            <thead>
              <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
            </thead>
            <tbody>
              {selectedOrderData.lines.map(line => {
                const total = line.qty * parseFloat(line.unitPrice);
                return (
                  <tr key={line.id}>
                    <td style={{ fontWeight: 500 }}>{line.product.name}</td>
                    <td>{line.qty}</td>
                    <td>₹{parseFloat(line.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ fontWeight: 600 }}>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="button-group">
            {selectedOrderData.status === 'DRAFT' && (
              <button onClick={() => toast.info('Confirm functionality coming soon')}>Confirm Order</button>
            )}
            {selectedOrderData.status !== 'BILLED' && !selectedOrderData.vendorBill && (
              <button onClick={() => handleConvertToBill(selectedOrderData.id)}>Convert to Vendor Bill</button>
            )}
            {selectedOrderData.vendorBill && (
              <div className="success" style={{ marginBottom: 0, flex: 1 }}>
                ✓ Converted to Vendor Bill #{selectedOrderData.vendorBill.id}
              </div>
            )}
          </div>
        </div>
      )}

      {/* List */}
      {!selectedOrder && !showForm && (
        <div className="page-card">
          <table>
            <thead>
              <tr>
                <th>PO #</th>
                <th>Vendor</th>
                <th>Status</th>
                <th>Items</th>
                <th>Bill Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#bbb', padding: '40px 0' }}>No purchase orders yet</td></tr>
              ) : orders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600, color: '#0F6A4B' }}>#{order.id}</td>
                  <td style={{ fontWeight: 500 }}>{order.vendor.name}</td>
                  <td><span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span></td>
                  <td><span className="status-badge draft">{order.lines.length} items</span></td>
                  <td>
                    {order.vendorBill
                      ? <span className="status-badge billed">Billed</span>
                      : <span className="status-badge draft">Not Billed</span>}
                  </td>
                  <td>
                    <button onClick={() => setSelectedOrder(order.id)}
                      style={{ padding: '5px 14px', fontSize: '12px' }}>
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
