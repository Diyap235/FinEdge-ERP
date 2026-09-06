import { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import { RefreshCw, TrendingUp, Scale, BookOpen } from 'lucide-react';

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

  if (loading) return <div className="loading">Loading reports…</div>;
  if (error) return <div className="error">{error}</div>;

  const TABS = [
    { id: 'pl',     label: 'Profit & Loss', icon: TrendingUp },
    { id: 'bs',     label: 'Balance Sheet', icon: Scale      },
    { id: 'ledger', label: 'Ledger',        icon: BookOpen   },
  ];

  return (
    <div className="page-root">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="page-header">
        <div style={{ marginLeft: 'auto' }}>
          <button className="action-btn" onClick={loadReports}>
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────── */}
      <div className="page-card" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`tab-btn${activeTab === id ? ' active' : ''}`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Profit & Loss ───────────────────────────────────────── */}
      {activeTab === 'pl' && pl && (
        <div className="page-card">
          <h3 className="card-section-title">Profit & Loss Statement</h3>

          {/* Summary KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Revenue',  value: pl.totalIncome,  color: '#0F6A4B', bg: '#e6f5ef' },
              { label: 'Total Expenses', value: pl.totalExpense, color: '#c0392b', bg: '#fef0ee' },
              { label: 'Net Profit',     value: pl.netProfit,    color: '#1a56db', bg: '#e8f0fe' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className="card" style={{ marginBottom: 0 }}>
                <div className="card-title">{label}</div>
                <div className="card-value" style={{ color }}>
                  ₹{parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>

          <table>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Total Revenue</td>
                <td style={{ fontWeight: 600, color: '#0F6A4B' }}>
                  ₹{parseFloat(pl.totalIncome).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Total Expenses</td>
                <td style={{ fontWeight: 600, color: '#c0392b' }}>
                  ₹{parseFloat(pl.totalExpense).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr style={{ background: '#e6f5ef' }}>
                <td style={{ fontWeight: 700 }}>Net Profit</td>
                <td style={{ fontWeight: 800, color: '#0F6A4B', fontSize: 15 }}>
                  ₹{parseFloat(pl.netProfit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ── Balance Sheet ───────────────────────────────────────── */}
      {activeTab === 'bs' && bs && (
        <div className="page-card">
          <h3 className="card-section-title">Balance Sheet</h3>

          <div className="flex" style={{ gap: 32, alignItems: 'flex-start' }}>

            {/* Assets */}
            <div className="flex-1">
              <h4 style={{ marginTop: 0 }}>Assets</h4>
              <table>
                <tbody>
                  {bs.assets.items.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>
                        ₹{parseFloat(item.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f5f2ec' }}>
                    <td style={{ fontWeight: 700 }}>Total Assets</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#0F6A4B' }}>
                      ₹{parseFloat(bs.assets.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Liabilities & Capital */}
            <div className="flex-1">
              <h4 style={{ marginTop: 0 }}>Liabilities & Capital</h4>
              <table>
                <tbody>
                  <tr style={{ background: '#faf8f4' }}>
                    <td colSpan={2} style={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888' }}>
                      Liabilities
                    </td>
                  </tr>
                  {bs.liabilities.items.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>
                        ₹{parseFloat(item.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: '#faf8f4' }}>
                    <td colSpan={2} style={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888' }}>
                      Capital
                    </td>
                  </tr>
                  {bs.capital.items.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>
                        ₹{parseFloat(item.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td>Net Profit</td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>
                      ₹{parseFloat(bs.netProfit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr style={{ background: '#f5f2ec' }}>
                    <td style={{ fontWeight: 700 }}>Total Liabilities & Capital</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#0F6A4B' }}>
                      ₹{parseFloat(bs.totalLiabilitiesAndCapital).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Balance indicator */}
          <div
            style={{
              marginTop: 20,
              padding: '12px 16px',
              borderRadius: 12,
              background: bs.isBalanced ? '#e6f5ef' : '#fef0ee',
              borderLeft: `4px solid ${bs.isBalanced ? '#0F6A4B' : '#ef4444'}`,
              color: bs.isBalanced ? '#0F6A4B' : '#b91c1c',
              fontWeight: 600,
              fontSize: 13.5,
            }}
          >
            {bs.isBalanced
              ? '✓ Balance Sheet is Balanced'
              : '✗ Balance Sheet is NOT Balanced'}
          </div>
        </div>
      )}

      {/* ── General Ledger ──────────────────────────────────────── */}
      {activeTab === 'ledger' && ledger && (
        <div className="page-card">
          <h3 className="card-section-title">General Ledger</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Account</th>
                <th>Reference</th>
                <th>Debit</th>
                <th>Credit</th>
              </tr>
            </thead>
            <tbody>
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#bbb', padding: '40px 0' }}>
                    No ledger entries
                  </td>
                </tr>
              ) : ledger.map((item, idx) => (
                <tr key={idx}>
                  <td>{new Date(item.date).toLocaleDateString('en-IN')}</td>
                  <td style={{ fontWeight: 500 }}>{item.account}</td>
                  <td>{item.reference || <span style={{ color: '#bbb' }}>—</span>}</td>
                  <td style={{ color: parseFloat(item.debit) > 0 ? '#0F6A4B' : '#bbb', fontWeight: parseFloat(item.debit) > 0 ? 600 : 400 }}>
                    {parseFloat(item.debit) > 0
                      ? '₹' + parseFloat(item.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })
                      : '—'}
                  </td>
                  <td style={{ color: parseFloat(item.credit) > 0 ? '#c0392b' : '#bbb', fontWeight: parseFloat(item.credit) > 0 ? 600 : 400 }}>
                    {parseFloat(item.credit) > 0
                      ? '₹' + parseFloat(item.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })
                      : '—'}
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
