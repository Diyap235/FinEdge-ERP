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

  if (loading) return <div className="loading">Loading journals...</div>;

  return (
    <div>
      <h2>Journals</h2>
      <table>
        <thead>
          <tr>
            <th>Journal Name</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {journals.map((journal) => (
            <tr key={journal.id}>
              <td>{journal.name}</td>
              <td>
                <span className={`status-badge ${journal.type.toLowerCase()}`}>{journal.type}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
