import { useState, useEffect } from 'react';
import { purchaseOrdersAPI, contactsAPI, productsAPI, vendorBillsAPI } from '../services/api';

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, vendorsRes, productsRes] = await Promise.all([
        purchaseOrdersAPI.getAll(),
        contactsAPI.getAll(),
        productsAPI.getAll(),
      ]);
      setOrders(ordersRes.data);
      setVendors(vendorsRes.data.filter((c) => c.type === 'vendor' || c.type === 'both'));
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
      if (!formData.vendorId || formData.lines.length === 0) {
        setError('Vendor and at least one line are required');
        return;
      }

      const validLines = formData.lines.filter((l) => l.productId && l.qty && l.unitPrice);
      if (validLines.length === 0) {
        setError('All line items must have product, quantity, and price');
        return;
      }

      await purchaseOrdersAPI.create({
        vendorId: parseInt(formData.vendorId),
        lines: validLines.map((l) => ({
          productId: parseInt(l.productId),
          qty: parseInt(l.qty),
          unitPrice: parseFloat(l.unitPrice),
        })),
      });

      setFormData({ vendorId: '', lines: [{ productId: '', qty: 1, unitPrice: '' }] });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { productId: '', qty: 1, unitPrice: '' }],
    });
  };

  const updateLineItem = (index, field, value) => {
    const newLines = [...formData.lines];
    newLines[index][field] = value;
    setFormData({ ...formData, lines: newLines });
  };

  const removeLineItem = (index) => {
    setFormData({
      ...formData,
      lines: formData.lines.filter((_, i) => i !== index),
    });
  };

  const handleConvertToBill = async (orderId) => {
    try {
      await purchaseOrdersAPI.convertToBill(orderId);
      setSelectedOrder(null);
      loadData();
      alert('Purchase Order converted to Vendor Bill successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading purchase orders...</div>;

  const selectedOrderData = orders.find((o) => o.id === selectedOrder);

  return (
    <div>
      <h2>Purchase Orders</h2>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="section">
          <h3>Create Purchase Order</h3>
          <div className="form-group">
            <label>Vendor *</label>
            <select
              required
              value={formData.vendorId}
              onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
            >
              <option value="">Select Vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <h4>Line Items</h4>
          {formData.lines.map((line, index) => (
            <div key={index} className="section" style={{ padding: '15px', marginBottom: '10px' }}>
              <div className="flex">
                <div className="flex-1">
                  <label>Product</label>
                  <select
                    value={line.productId}
                    onChange={(e) => updateLineItem(index, 'productId', e.target.value)}
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={line.qty}
                    onChange={(e) => updateLineItem(index, 'qty', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label>Unit Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={line.unitPrice}
                    onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="danger"
                  onClick={() => removeLineItem(index)}
                  style={{ padding: '8px', marginTop: '25px', height: 'fit-content' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button type="button" className="secondary" onClick={addLineItem}>
            + Add Line Item
          </button>

          <div className="button-group" style={{ marginTop: '20px' }}>
            <button type="submit">Create</button>
            <button type="button" className="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <button onClick={() => setShowForm(true)} className="mb-20">
          + Create Purchase Order
        </button>
      )}

      {selectedOrderData && (
        <div className="section">
          <h3>Purchase Order #{selectedOrderData.id}</h3>
          <p>Vendor: <strong>{selectedOrderData.vendor.name}</strong></p>
          <p>Status: <span className={`status-badge ${selectedOrderData.status.toLowerCase()}`}>{selectedOrderData.status}</span></p>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrderData.lines.map((line) => {
                const total = line.qty * parseFloat(line.unitPrice);
                return (
                  <tr key={line.id}>
                    <td>{line.product.name}</td>
                    <td>{line.qty}</td>
                    <td>₹{parseFloat(line.unitPrice).toFixed(2)}</td>
                    <td>₹{total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="button-group">
            {selectedOrderData.status === 'DRAFT' && (
              <button onClick={() => alert('Confirm functionality coming soon')}>Confirm</button>
            )}
            {selectedOrderData.status !== 'BILLED' && !selectedOrderData.vendorBill && (
              <button onClick={() => handleConvertToBill(selectedOrderData.id)}>
                Convert to Vendor Bill
              </button>
            )}
            {selectedOrderData.vendorBill && (
              <div className="success">
                ✓ Converted to Vendor Bill #{selectedOrderData.vendorBill.id}
              </div>
            )}
            <button className="secondary" onClick={() => setSelectedOrder(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {!selectedOrder && (
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
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.vendor.name}</td>
                <td>
                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>{order.lines.length}</td>
                <td>
                  {order.vendorBill ? (
                    <span className="status-badge billed">Billed</span>
                  ) : (
                    <span className="status-badge draft">Not Billed</span>
                  )}
                </td>
                <td>
                  <button onClick={() => setSelectedOrder(order.id)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
