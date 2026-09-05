import { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';

export default function ReportsPage() {
  const [pl, setPL] = useState(null);
  const [bs, setBS] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [activeTab, setActiveTab] = useState('pl');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [plRes, bsRes, ledgerRes] = await Promise.all([
        reportsAPI.getProfitAndLoss(),
        reportsAPI.getBalanceSheet(),
        reportsAPI.getLedger(),
      ]);
      setPL(plRes.data);
      setBS(bsRes.data);
      setLedger(ledgerRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading reports...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Reports</h2>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('pl')}
          className={activeTab === 'pl' ? '' : 'secondary'}
          style={{ marginRight: '10px' }}
        >
          Profit & Loss
        </button>
        <button
          onClick={() => setActiveTab('bs')}
          className={activeTab === 'bs' ? '' : 'secondary'}
          style={{ marginRight: '10px' }}
        >
          Balance Sheet
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={activeTab === 'ledger' ? '' : 'secondary'}
        >
          Ledger
        </button>
      </div>

      {activeTab === 'pl' && pl && (
        <div className="section">
          <h3>Profit & Loss Statement</h3>
          <table>
            <tbody>
              <tr>
                <td><strong>Total Revenue</strong></td>
                <td>₹{parseFloat(pl.totalIncome).toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>Total Expenses</strong></td>
                <td>₹{parseFloat(pl.totalExpense).toFixed(2)}</td>
              </tr>
              <tr style={{ backgroundColor: '#d5f4e6' }}>
                <td><strong>Net Profit</strong></td>
                <td><strong>₹{parseFloat(pl.netProfit).toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'bs' && bs && (
        <div className="section">
          <h3>Balance Sheet</h3>
          <div className="flex" style={{ gap: '40px' }}>
            <div className="flex-1">
              <h4>Assets</h4>
              <table>
                <tbody>
                  {bs.assets.items.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td>₹{parseFloat(item.balance).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#ecf0f1' }}>
                    <td><strong>Total Assets</strong></td>
                    <td><strong>₹{parseFloat(bs.assets.total).toFixed(2)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex-1">
              <h4>Liabilities & Capital</h4>
              <table>
                <tbody>
                  <tr><td colSpan="2"><strong>Liabilities</strong></td></tr>
                  {bs.liabilities.items.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td>₹{parseFloat(item.balance).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr><td colSpan="2"><strong>Capital</strong></td></tr>
                  {bs.capital.items.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td>₹{parseFloat(item.balance).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td>Net Profit</td>
                    <td>₹{parseFloat(bs.netProfit).toFixed(2)}</td>
                  </tr>
                  <tr style={{ backgroundColor: '#ecf0f1' }}>
                    <td><strong>Total Liabilities & Capital</strong></td>
                    <td><strong>₹{parseFloat(bs.totalLiabilitiesAndCapital).toFixed(2)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: bs.isBalanced ? '#d5f4e6' : '#fadbd8' }}>
            {bs.isBalanced ? (
              <p>✓ <strong>Balance Sheet is Balanced</strong></p>
            ) : (
              <p>✗ <strong>Balance Sheet is NOT Balanced</strong></p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ledger' && ledger && (
        <div className="section">
          <h3>General Ledger</h3>
          <table>
            <thead>
              <tr><th>Date</th><th>Account</th><th>Reference</th><th>Debit</th><th>Credit</th></tr>
            </thead>
            <tbody>
              {ledger.map((item, idx) => (
                <tr key={idx}>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>{item.account}</td>
                  <td>{item.reference || '-'}</td>
                  <td>{parseFloat(item.debit) > 0 ? '₹' + parseFloat(item.debit).toFixed(2) : '-'}</td>
                  <td>{parseFloat(item.credit) > 0 ? '₹' + parseFloat(item.credit).toFixed(2) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
