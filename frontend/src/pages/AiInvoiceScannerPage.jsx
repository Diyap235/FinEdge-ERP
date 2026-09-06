import { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  Receipt,
  FileCheck,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { ocrAPI } from '../services/api';

export default function AiInvoiceScannerPage({ currentUser, onNavigate }) {
  // Unauthorized guard: only admin and accountant are allowed; user/contact is blocked
  const rawRole = typeof currentUser === 'object' ? currentUser?.role : currentUser;
  const role = String(rawRole || '').toLowerCase().trim();
  const isAuthorized = role === 'admin' || role === 'accountant';
  const isUnauthorized = !isAuthorized;

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [error, setError] = useState(null);

  // Review & Edit State
  const [invoiceData, setInvoiceData] = useState(null);
  const [validation, setValidation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);

  const fileInputRef = useRef(null);

  if (isUnauthorized) {
    return (
      <div className="page-root">
        <div
          className="page-card"
          style={{
            maxWidth: 540,
            margin: '60px auto',
            textAlign: 'center',
            padding: '36px 24px',
            border: '1px solid #fed7aa',
            background: '#fffaf5',
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: '#ffedd5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <ShieldAlert size={26} color="#ea580c" />
          </div>
          <p
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#9a3412',
              margin: 0,
            }}
          >
            I don't have access to show you this information.
          </p>
        </div>
      </div>
    );
  }

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    // Validate type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const validExts = /\.(pdf|png|jpe?g|webp)$/i;

    if (!validTypes.includes(selectedFile.type) && !validExts.test(selectedFile.name)) {
      setError('Please select a valid PDF, PNG, or JPG invoice document.');
      return;
    }

    // Validate size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit. Please upload a smaller document.');
      return;
    }

    setError(null);
    setFile(selectedFile);
    setInvoiceData(null);
    setCreatedResult(null);

    // Image thumbnail preview if image
    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleProcessDocument = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setProgressStep(1);

    const formData = new FormData();
    formData.append('invoice', file);

    try {
      // Animated step ticker for visual feedback
      const timer1 = setTimeout(() => setProgressStep(2), 1200);
      const timer2 = setTimeout(() => setProgressStep(3), 2800);

      const response = await ocrAPI.processFile(formData);

      clearTimeout(timer1);
      clearTimeout(timer2);
      setProgressStep(4);

      if (response.data?.success) {
        setInvoiceData(response.data.data);
        setValidation(response.data.validation);
      } else {
        throw new Error(response.data?.error || 'Failed to extract invoice data.');
      }
    } catch (err) {
      console.error('OCR processing error:', err);
      const errMsg =
        err.response?.data?.error ||
        err.message ||
        'Unable to process invoice document. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
      setProgressStep(0);
    }
  };

  // Recalculate totals whenever items change
  const updateTotals = (items) => {
    const sub = items.reduce(
      (acc, it) => acc + (parseFloat(it.quantity) || 0) * (parseFloat(it.unitPrice) || 0),
      0
    );
    const tax = items.reduce(
      (acc, it) =>
        acc +
        ((parseFloat(it.quantity) || 0) *
          (parseFloat(it.unitPrice) || 0) *
          (parseFloat(it.tax) || 0)) /
          100,
      0
    );
    const tot = sub + tax;

    return {
      subtotal: Math.round(sub * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(tot * 100) / 100,
    };
  };

  const handleFieldChange = (field, value) => {
    setInvoiceData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setInvoiceData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };

      // Recalculate line total
      const qty = parseFloat(updatedItems[index].quantity) || 0;
      const price = parseFloat(updatedItems[index].unitPrice) || 0;
      updatedItems[index].total = Math.round(qty * price * 100) / 100;

      const newTotals = updateTotals(updatedItems);

      return {
        ...prev,
        items: updatedItems,
        ...newTotals,
      };
    });
  };

  const handleAddItem = () => {
    setInvoiceData((prev) => {
      const newItem = {
        id: (prev.items.length || 0) + 1,
        productName: 'New Item',
        quantity: 1,
        unitPrice: 0,
        tax: 0,
        total: 0,
        isNewProduct: true,
      };
      const updatedItems = [...prev.items, newItem];
      return {
        ...prev,
        items: updatedItems,
        ...updateTotals(updatedItems),
      };
    });
  };

  const handleRemoveItem = (index) => {
    setInvoiceData((prev) => {
      const updatedItems = prev.items.filter((_, i) => i !== index);
      return {
        ...prev,
        items: updatedItems,
        ...updateTotals(updatedItems),
      };
    });
  };

  const handleConfirmInvoice = async () => {
    if (!invoiceData) return;

    if (!invoiceData.partyName || invoiceData.partyName.trim() === '') {
      setError('Please enter a valid Customer or Vendor name.');
      return;
    }

    if (!invoiceData.items || invoiceData.items.length === 0) {
      setError('At least one item is required to create an invoice.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await ocrAPI.confirmInvoice(invoiceData);
      if (response.data?.success) {
        setCreatedResult(response.data.invoice);
        setInvoiceData(null);
      } else {
        throw new Error(response.data?.error || 'Failed to create invoice.');
      }
    } catch (err) {
      console.error('Invoice confirmation error:', err);
      const errMsg =
        err.response?.data?.error ||
        err.message ||
        'Failed to create invoice in ERP. Please check line details.';
      setError(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFilePreview(null);
    setInvoiceData(null);
    setValidation(null);
    setCreatedResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="page-root">
      {/* Header */}
      <div className="page-header">
        {invoiceData && (
          <button
            className="tab-btn"
            onClick={handleReset}
            style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}
          >
            <RefreshCw size={13} />
            Scan New Invoice
          </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div
          className="error"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderRadius: 12,
          }}
        >
          <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, lineHeight: 1.4 }}>{error}</span>
        </div>
      )}

      {/* SUCCESS SCREEN */}
      {createdResult && (
        <div
          className="page-card"
          style={{
            textAlign: 'center',
            padding: '40px 24px',
            maxWidth: 600,
            margin: '20px auto',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle2 size={32} color="#0F6A4B" />
          </div>

          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>
            {createdResult.invoiceType === 'vendor_bill'
              ? 'Vendor Bill Created Successfully!'
              : 'Customer Invoice Created Successfully!'}
          </h2>
          <p style={{ color: '#666', fontSize: 13.5, margin: '0 0 24px' }}>
            The invoice has been verified, matched to existing master records, and posted with corresponding accounting journal entries.
          </p>

          <div
            style={{
              background: '#f8f6f0',
              borderRadius: 14,
              padding: '18px 20px',
              textAlign: 'left',
              marginBottom: 24,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
              fontSize: 13,
            }}
          >
            <div>
              <span style={{ color: '#888', display: 'block', fontSize: 11.5 }}>RECORD ID</span>
              <strong style={{ color: '#1c1c1e' }}>#{createdResult.id}</strong>
            </div>
            <div>
              <span style={{ color: '#888', display: 'block', fontSize: 11.5 }}>INVOICE NUMBER</span>
              <strong style={{ color: '#1c1c1e' }}>{createdResult.invoiceNumber}</strong>
            </div>
            <div>
              <span style={{ color: '#888', display: 'block', fontSize: 11.5 }}>PARTY NAME</span>
              <strong style={{ color: '#1c1c1e' }}>{createdResult.contactName}</strong>
            </div>
            <div>
              <span style={{ color: '#888', display: 'block', fontSize: 11.5 }}>STATUS</span>
              <span className="status-badge unpaid">UNPAID</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              className="action-btn"
              onClick={() =>
                onNavigate?.(
                  createdResult.invoiceType === 'vendor_bill'
                    ? 'vendor-bills'
                    : 'customer-invoices'
                )
              }
            >
              <Receipt size={15} />
              View in {createdResult.invoiceType === 'vendor_bill' ? 'Vendor Bills' : 'Customer Invoices'}
            </button>
            <button
              className="tab-btn"
              onClick={handleReset}
            >
              <RefreshCw size={14} />
              Scan Another
            </button>
          </div>
        </div>
      )}

      {/* UPLOAD & PROCESSING VIEW (Shown if not yet in review or success) */}
      {!invoiceData && !createdResult && (
        <div className="page-card">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#0F6A4B' : '#d6d1c9'}`,
              borderRadius: 16,
              padding: '48px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? '#eef7f3' : '#faf9f6',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />

            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: '#e8f4ee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 2px 6px rgba(15,106,75,0.15)',
              }}
            >
              <UploadCloud size={28} color="#0F6A4B" />
            </div>

            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>
              {file ? file.name : 'Drag & drop invoice document here'}
            </h3>
            <p style={{ margin: '0 0 16px', color: '#777', fontSize: 13 }}>
              Supports PDF, PNG, JPG, or JPEG (Max file size 10MB)
            </p>

            <button
              type="button"
              className="action-btn"
              style={{ pointerEvents: 'none' }}
            >
              Browse Files
            </button>
          </div>

          {/* Selected File Details & Process Button */}
          {file && (
            <div
              style={{
                marginTop: 20,
                padding: '16px 20px',
                borderRadius: 14,
                background: '#fff',
                border: '1px solid #e5e0d6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {filePreview ? (
                  <img
                    src={filePreview}
                    alt="Thumbnail"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      objectFit: 'cover',
                      border: '1px solid #ddd',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      background: '#f0ede6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={22} color="#555" />
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{file.name}</div>
                  <div style={{ color: '#888', fontSize: 12 }}>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Document'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="tab-btn"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Change File
                </button>
                <button
                  type="button"
                  className="action-btn"
                  onClick={handleProcessDocument}
                  disabled={loading}
                  style={{ minWidth: 160, justifyContent: 'center' }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      Scan & Extract
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Animated Processing Stepper */}
          {loading && (
            <div
              style={{
                marginTop: 24,
                padding: '20px',
                borderRadius: 14,
                background: '#f8faf9',
                border: '1px solid #d1fae5',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <RefreshCw size={16} color="#0F6A4B" className="animate-spin" />
                <span style={{ fontWeight: 600, color: '#0F6A4B', fontSize: 13.5 }}>
                  Processing Document with FinEdge OCR Engine & Groq AI...
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 10,
                  fontSize: 12,
                }}
              >
                {[
                  { step: 1, label: '1. Document Upload' },
                  { step: 2, label: '2. Text Extraction (OCR)' },
                  { step: 3, label: '3. Groq AI Analysis' },
                  { step: 4, label: '4. Master Data Matching' },
                ].map(({ step, label }) => {
                  const isDone = progressStep > step;
                  const isCurrent = progressStep === step;

                  return (
                    <div
                      key={step}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 10,
                        background: isDone
                          ? '#ecfdf5'
                          : isCurrent
                          ? '#f0fdf4'
                          : '#f3f4f6',
                        border: `1px solid ${
                          isDone ? '#a7f3d0' : isCurrent ? '#86efac' : '#e5e7eb'
                        }`,
                        color: isDone || isCurrent ? '#065f46' : '#6b7280',
                        fontWeight: isCurrent || isDone ? 600 : 400,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {isDone ? (
                        <CheckCircle2 size={14} color="#059669" />
                      ) : isCurrent ? (
                        <RefreshCw size={13} className="animate-spin" color="#059669" />
                      ) : (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#9ca3af',
                          }}
                        />
                      )}
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* REVIEW & EDIT SCREEN */}
      {invoiceData && !createdResult && (
        <div className="page-root">
          {/* Validation warnings banner if discrepancies were found */}
          {validation?.warnings?.length > 0 && (
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 12,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                fontSize: 12.5,
                color: '#92400e',
              }}
            >
              <AlertTriangle size={17} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong style={{ display: 'block', marginBottom: 2 }}>Extraction Warnings (Please Verify):</strong>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {validation.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="page-card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 16,
                borderBottom: '1px solid #f0ede6',
                marginBottom: 20,
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                  Review & Confirm Extracted Invoice
                </h3>
                <p style={{ margin: '2px 0 0', color: '#777', fontSize: 12.5 }}>
                  Review extracted data below. Edit any fields before creating the final ERP record.
                </p>
              </div>

              {/* Invoice Type Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#555' }}>
                  Invoice Type:
                </span>
                <select
                  value={invoiceData.invoiceType}
                  onChange={(e) => handleFieldChange('invoiceType', e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #0F6A4B',
                    background: '#fff',
                    fontWeight: 600,
                    fontSize: 13,
                    color: '#0F6A4B',
                    cursor: 'pointer',
                  }}
                >
                  <option value="vendor_bill">Vendor Bill (Purchase)</option>
                  <option value="customer_invoice">Customer Invoice (Sales)</option>
                </select>
              </div>
            </div>

            {/* Document Header Fields */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
                marginBottom: 24,
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#444', marginBottom: 4 }}>
                  {invoiceData.invoiceType === 'vendor_bill' ? 'Vendor / Supplier Name *' : 'Customer Name *'}
                </label>
                <input
                  type="text"
                  value={invoiceData.partyName || ''}
                  onChange={(e) => handleFieldChange('partyName', e.target.value)}
                  placeholder="Company or Contact name"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #d6d1c9',
                    fontSize: 13,
                  }}
                />
                <div style={{ marginTop: 4, fontSize: 11.5 }}>
                  {invoiceData.matchedContact ? (
                    <span style={{ color: '#0F6A4B', fontWeight: 600 }}>
                      ✓ Matched Existing Contact: {invoiceData.matchedContact.name}
                    </span>
                  ) : (
                    <span style={{ color: '#d97706', fontWeight: 500 }}>
                      + New Contact will be created
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#444', marginBottom: 4 }}>
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={invoiceData.invoiceNumber || ''}
                  onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
                  placeholder="e.g. INV-2026-001"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #d6d1c9',
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#444', marginBottom: 4 }}>
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={invoiceData.invoiceDate || ''}
                  onChange={(e) => handleFieldChange('invoiceDate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #d6d1c9',
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#444', marginBottom: 4 }}>
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={invoiceData.dueDate || ''}
                  onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #d6d1c9',
                    fontSize: 13,
                  }}
                />
              </div>
            </div>

            {/* Line Items Table */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Line Items</h4>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="tab-btn"
                  style={{ fontSize: 12, padding: '4px 10px' }}
                >
                  <Plus size={13} />
                  Add Line
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f5f2eb', textAlign: 'left', borderBottom: '1px solid #e2ddd3' }}>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>Product / Item</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600, width: 90 }}>Qty</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600, width: 130 }}>Unit Price (₹)</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600, width: 90 }}>Tax %</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600, width: 120 }}>Total (₹)</th>
                      <th style={{ padding: '8px 8px', width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px 12px' }}>
                          <input
                            type="text"
                            value={item.productName || ''}
                            onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              borderRadius: 6,
                              border: '1px solid #d6d1c9',
                              fontSize: 13,
                            }}
                          />
                          {item.matchedProductName ? (
                            <span style={{ fontSize: 11, color: '#0F6A4B', fontWeight: 500 }}>
                              ✓ Matches: {item.matchedProductName}
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: '#b45309', fontWeight: 500 }}>
                              + New product will be created
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              borderRadius: 6,
                              border: '1px solid #d6d1c9',
                              fontSize: 13,
                            }}
                          />
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              borderRadius: 6,
                              border: '1px solid #d6d1c9',
                              fontSize: 13,
                            }}
                          />
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={item.tax || 0}
                            onChange={(e) => handleItemChange(idx, 'tax', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              borderRadius: 6,
                              border: '1px solid #d6d1c9',
                              fontSize: 13,
                            }}
                          />
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1c1c1e' }}>
                          ₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                          {invoiceData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#999',
                                padding: 4,
                              }}
                              title="Delete row"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary & Confirm Action */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                gap: 20,
                paddingTop: 16,
                borderTop: '1px solid #f0ede6',
              }}
            >
              <div style={{ color: '#888', fontSize: 12 }}>
                <div>Confidence Score: <strong style={{ textTransform: 'capitalize', color: '#333' }}>{invoiceData.confidence || 'Medium'}</strong></div>
                {invoiceData.notes && <div style={{ marginTop: 2 }}>{invoiceData.notes}</div>}
              </div>

              <div style={{ minWidth: 260 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: '#666' }}>Subtotal:</span>
                  <span>₹{invoiceData.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: '#666' }}>Tax:</span>
                  <span>₹{invoiceData.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 16,
                    fontWeight: 700,
                    paddingTop: 8,
                    borderTop: '1.5px solid #1c1c1e',
                    color: '#0F6A4B',
                    marginBottom: 16,
                  }}
                >
                  <span>Total Amount:</span>
                  <span>₹{invoiceData.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="tab-btn"
                    onClick={handleReset}
                    disabled={saving}
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    className="action-btn"
                    onClick={handleConfirmInvoice}
                    disabled={saving}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {saving ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FileCheck size={15} />
                        Confirm & Create Invoice
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
