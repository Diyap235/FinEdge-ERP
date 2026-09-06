import { useState, useEffect } from 'react';
import { journalEntriesAPI } from '../services/api';
import { Calendar, ChevronLeft } from 'lucide-react';

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await journalEntriesAPI.getAll();
        setEntries(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="loading">Loading journal entries…</div>;

  const selectedData = entries.find(e => e.id === selectedEntry);

  return (
    <div className="page-root">

      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          {selectedEntry && (
            <button className="action-btn" onClick={() => setSelectedEntry(null)}
              style={{ background: 'transparent', color: '#555', border: '1.5px solid #d6d1c9', boxShadow: 'none' }}>
              <ChevronLeft size={14} />
              Back to list
            </button>
          )}
        </div>
      </div>

      {/* Detail view */}
      {selectedData && (
        <div className="page-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>Entry #{selectedData.id}</h3>
              <p style={{ margin: 0, color: '#888', fontSize: 13 }}>
                {selectedData.journal.name} · {new Date(selectedData.date).toLocaleDateString('en-IN')}
              </p>
            </div>
            <span className={`status-badge ${selectedData.status.toLowerCase()}`}>{selectedData.status}</span>
          </div>

          {selectedData.reference && (
            <p style={{ marginBottom: 16, fontSize: 13, color: '#666' }}>
              Reference: <strong>{selectedData.reference}</strong>
            </p>
          )}

          <h4 style={{ marginTop: 0 }}>Line Items</h4>
          <table>
            <thead>
              <tr><th>Account</th><th>Debit</th><th>Credit</th></tr>
            </thead>
            <tbody>
              {selectedData.items.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500 }}>{item.account.name}</td>
                  <td style={{ color: item.debit > 0 ? '#0F6A4B' : '#bbb', fontWeight: item.debit > 0 ? 600 : 400 }}>
                    {item.debit > 0 ? '₹' + parseFloat(item.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—'}
                  </td>
                  <td style={{ color: item.credit > 0 ? '#c0392b' : '#bbb', fontWeight: item.credit > 0 ? 600 : 400 }}>
                    {item.credit > 0 ? '₹' + parseFloat(item.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* List */}
      {!selectedEntry && (
        <div className="page-card">
          <table>
            <thead>
              <tr>
                <th>Entry #</th>
                <th>Journal</th>
                <th>Date</th>
                <th>Reference</th>
                <th>Items</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#bbb', padding: '40px 0' }}>No journal entries</td></tr>
              ) : entries.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600, color: '#0F6A4B' }}>#{e.id}</td>
                  <td>{e.journal.name}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={12} style={{ color: '#aaa' }} />
                      {new Date(e.date).toLocaleDateString('en-IN')}
                    </span>
                  </td>
                  <td>{e.reference || <span style={{ color: '#bbb' }}>—</span>}</td>
                  <td><span className="status-badge draft">{e.items.length} items</span></td>
                  <td><span className={`status-badge ${e.status.toLowerCase()}`}>{e.status}</span></td>
                  <td>
                    <button onClick={() => setSelectedEntry(e.id)}
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
