import { useState, useEffect } from 'react';
import { journalEntriesAPI } from '../services/api';

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

  if (loading) return <div className="loading">Loading...</div>;

  const selectedData = entries.find((e) => e.id === selectedEntry);

  return (
    <div>
      <h2>Journal Entries</h2>

      {selectedData && (
        <div className="section">
          <h3>Entry #{selectedData.id}</h3>
          <p>Journal: <strong>{selectedData.journal.name}</strong></p>
          <p>Date: {new Date(selectedData.date).toLocaleDateString()}</p>
          <p>Reference: {selectedData.reference || '-'}</p>
          <p>Status: <span className={`status-badge ${selectedData.status.toLowerCase()}`}>{selectedData.status}</span></p>

          <h4>Items</h4>
          <table>
            <thead>
              <tr><th>Account</th><th>Debit</th><th>Credit</th></tr>
            </thead>
            <tbody>
              {selectedData.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.account.name}</td>
                  <td>{item.debit > 0 ? '₹' + parseFloat(item.debit).toFixed(2) : '-'}</td>
                  <td>{item.credit > 0 ? '₹' + parseFloat(item.credit).toFixed(2) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="secondary" onClick={() => setSelectedEntry(null)} style={{ marginTop: '20px' }}>
            Close
          </button>
        </div>
      )}

      {!selectedEntry && (
        <table>
          <thead>
            <tr><th>Entry #</th><th>Journal</th><th>Date</th><th>Reference</th><th>Items</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td>#{e.id}</td>
                <td>{e.journal.name}</td>
                <td>{new Date(e.date).toLocaleDateString()}</td>
                <td>{e.reference || '-'}</td>
                <td>{e.items.length}</td>
                <td><span className={`status-badge ${e.status.toLowerCase()}`}>{e.status}</span></td>
                <td><button onClick={() => setSelectedEntry(e.id)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
