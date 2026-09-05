import { useState, useEffect } from 'react';
import { journalsAPI } from '../services/api';

export default function JournalsPage() {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const response = await journalsAPI.getAll();
        setJournals(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJournals();
  }, []);

  if (loading) return <div className="loading">Loading journals…</div>;

  return (
    <div className="page-root">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Journals</h1>
          <p className="page-subtitle">{journals.length} journal{journals.length !== 1 ? 's' : ''} configured</p>
        </div>
      </div>

      {/* Table */}
      <div className="page-card">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Journal Name</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {journals.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', color: '#bbb', padding: '40px 0' }}>No journals found</td></tr>
            ) : journals.map((journal, i) => (
              <tr key={journal.id}>
                <td style={{ color: '#aaa', width: 40 }}>{i + 1}</td>
                <td style={{ fontWeight: 500 }}>{journal.name}</td>
                <td><span className={`status-badge ${journal.type.toLowerCase()}`}>{journal.type}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
