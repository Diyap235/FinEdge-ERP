import { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import {
  TrendingUp, TrendingDown, DollarSign,
  Landmark, Wallet, Users, ArrowDownCircle,
  RefreshCw, Calendar, ScanLine,
} from 'lucide-react';
import FinancialOverview from '../components/dashboard/FinancialOverview';
import UrbiePanel        from '../components/dashboard/UrbiePanel';
import QuickActions      from '../components/dashboard/QuickActions';
import InsightBanner     from '../components/dashboard/InsightBanner';
import RevenueChart      from '../components/charts/RevenueChart';
import ProfitChart       from '../components/charts/ProfitChart';

/* ── KPI metadata ───────────────────────────────────────────────── */
const KPI_META = [
  { key: 'revenue',     label: 'Total Revenue',   icon: TrendingUp,      color: '#0F6A50', bg: 'rgba(15,106,80,0.12)' },
  { key: 'expenses',    label: 'Total Expenses',   icon: TrendingDown,    color: '#c0392b', bg: 'rgba(192,57,43,0.12)' },
  { key: 'netProfit',   label: 'Net Profit',       icon: DollarSign,      color: '#1a56db', bg: 'rgba(26,86,219,0.12)' },
  { key: 'cashBalance', label: 'Cash Balance',     icon: Wallet,          color: '#0F6A50', bg: 'rgba(15,106,80,0.12)' },
  { key: 'bankBalance', label: 'Bank Balance',     icon: Landmark,        color: '#C89A52', bg: 'rgba(200,154,82,0.14)' },
  { key: 'receivables', label: 'Receivables',      icon: Users,           color: '#C89A52', bg: 'rgba(200,154,82,0.14)' },
  { key: 'payables',    label: 'Payables',         icon: ArrowDownCircle, color: '#c0392b', bg: 'rgba(192,57,43,0.12)' },
];

/* ── All logic preserved exactly ────────────────────────────────── */
export default function Dashboard({ onNavigate, currentUser }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ── Theme state synced with existing toggle ──────────────────── */
  const [isNight, setIsNight] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('finedge-bg') === 'night';
    }
    return false;
  });

  useEffect(() => {
    const syncTheme = () => {
      if (typeof window !== 'undefined') {
        const night = localStorage.getItem('finedge-bg') === 'night';
        setIsNight(prev => prev !== night ? night : prev);
      }
    };
    const interval = setInterval(syncTheme, 250);
    window.addEventListener('storage', syncTheme);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  const rawRole = typeof currentUser === 'object' ? currentUser?.role : currentUser;
  const role = String(rawRole || '').toLowerCase().trim();
  const isAuthorizedRole = role === 'admin' || role === 'accountant';

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getDashboardSummary();
      setSummary(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Matte frosted visual tokens ──────────────────────────────── */
  const matteCard = {
    background: isNight ? 'rgba(22, 28, 31, 0.60)' : 'rgba(246, 240, 231, 0.60)',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
    borderRadius: 20,
    border: `1px solid ${isNight ? 'rgba(245, 242, 236, 0.10)' : 'rgba(232, 221, 208, 0.70)'}`,
    boxShadow: isNight
      ? '0 12px 36px -4px rgba(0, 0, 0, 0.45), 0 4px 12px -2px rgba(0, 0, 0, 0.25)'
      : '0 8px 30px -4px rgba(29, 27, 24, 0.06), 0 2px 8px -2px rgba(29, 27, 24, 0.04)',
    color: isNight ? '#F5F2EC' : '#1D1B18',
  };

  const textPrimary = isNight ? '#F5F2EC' : '#1D1B18';
  const textSecondary = isNight ? '#B7B2A8' : '#746C62';
  const textMuted = isNight ? '#807B72' : '#9E9589';

  if (loading) {
    return (
      <div className="page-root">
        <div
          style={{
            ...matteCard,
            padding: '60px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            fontSize: 14,
            fontWeight: 500,
            color: textSecondary,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: `2px solid ${isNight ? 'rgba(245, 242, 236, 0.15)' : 'rgba(232, 221, 208, 0.75)'}`,
              borderTopColor: isNight ? '#1F8A68' : '#0F6A50',
              animation: 'spin 0.7s linear infinite',
            }}
          />
          Loading dashboard…
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="page-root">
        <div
          className="error"
          style={{
            borderRadius: 20,
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            background: isNight ? 'rgba(239, 68, 68, 0.15)' : 'rgba(192, 57, 43, 0.12)',
            border: `1px solid ${isNight ? 'rgba(239, 68, 68, 0.30)' : 'rgba(192, 57, 43, 0.25)'}`,
            color: isNight ? '#f87171' : '#c0392b',
            padding: '16px 20px',
            fontSize: 13.5,
          }}
        >
          Failed to load dashboard
        </div>
      </div>
    );
  }

  return (
    <div className="page-root">

      {/* ── Action bar — right-aligned ──────────────────────── */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginLeft: 'auto' }}>
          {isAuthorizedRole && (
            <button
              className="action-btn"
              onClick={() => onNavigate?.('ocr-scanner')}
              style={{
                background: 'linear-gradient(135deg, #0F6A50, #168a62)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: isNight ? '0 4px 16px rgba(31, 138, 104, 0.32)' : '0 3px 12px rgba(15, 106, 80, 0.28)',
                padding: '9px 18px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                cursor: 'pointer',
              }}
            >
              <ScanLine size={15} />
              AI Invoice Scanner
            </button>
          )}
          <button
            onClick={fetchDashboard}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 16px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              background: isNight ? 'rgba(28, 35, 39, 0.65)' : 'rgba(246, 240, 231, 0.70)',
              border: `1px solid ${isNight ? 'rgba(245, 242, 236, 0.10)' : 'rgba(232, 221, 208, 0.70)'}`,
              color: textPrimary,
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
              boxShadow: isNight ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.04)',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} style={{ color: isNight ? '#34d399' : '#0F6A50' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Hero spacer — showroom is the landing visual ─────── */}
      {/* The spacer pushes KPI cards to ~40vh from the top of the viewport.
          The topbar is fixed at 56px (pt-14) and the container padding is 20px,
          so 40vh minus those offsets gives the right visual landing position.   */}
      <div style={{ paddingTop: 'calc(40vh - 76px)' }}>

        {error && (
          <div
            className="error"
            style={{
              borderRadius: 16,
              backdropFilter: 'blur(22px)',
              background: isNight ? 'rgba(239, 68, 68, 0.15)' : 'rgba(192, 57, 43, 0.12)',
              border: `1px solid ${isNight ? 'rgba(239, 68, 68, 0.30)' : 'rgba(192, 57, 43, 0.25)'}`,
              color: isNight ? '#f87171' : '#c0392b',
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {/* ── KPI cards (Matte Frosted with Hover Lift) ──────── */}
        <div className="dashboard-grid">
          {KPI_META.map(({ key, label, icon: Icon, color, bg }) => {
            const activeColor = isNight && (key === 'revenue' || key === 'cashBalance') ? '#34d399' :
                                isNight && (key === 'bankBalance' || key === 'receivables') ? '#fbbf24' :
                                isNight && (key === 'expenses' || key === 'payables') ? '#f87171' :
                                isNight && key === 'netProfit' ? '#60a5fa' : color;

            const activeBg = isNight ? 'rgba(255, 255, 255, 0.08)' : bg;

            return (
              <div className="card matte-kpi-card" key={key} style={{ ...matteCard, padding: '22px 24px', cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: activeBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    border: `1px solid ${isNight ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.04)'}`,
                  }}>
                    <Icon size={14} style={{ color: activeColor }} />
                  </div>
                  <span className="card-title" style={{
                    margin: 0,
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.65px',
                    color: isNight ? '#F5F2EC' : '#111827',
                    textTransform: 'uppercase',
                  }}>
                    {label}
                  </span>
                </div>
                <div className="card-value" style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: activeColor,
                  letterSpacing: '-0.6px',
                  lineHeight: 1.15,
                }}>
                  ₹{parseFloat(summary[key] ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Recent Transactions ────────────────────────────── */}
        <div className="page-card" style={{ ...matteCard, padding: '26px 28px', marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h2 className="card-section-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0, fontSize: 16, fontWeight: 700, color: textPrimary }}>
                Recent Transactions
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: textSecondary }}>
                Recent transactions · live data
              </p>
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: isNight ? 'rgba(31, 138, 104, 0.18)' : 'rgba(15, 106, 80, 0.12)',
              color: isNight ? '#34d399' : '#0F6A50',
              padding: '4px 12px', borderRadius: 20,
              fontSize: 11.5, fontWeight: 700,
              border: `1px solid ${isNight ? 'rgba(52, 211, 153, 0.22)' : 'rgba(15, 106, 80, 0.18)'}`,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: isNight ? '#34d399' : '#0F6A50',
                boxShadow: `0 0 8px ${isNight ? '#34d399' : '#0F6A50'}`,
                animation: 'pulse 1.8s infinite',
              }} />
              Live
            </span>
          </div>

          {summary.recentTransactions && summary.recentTransactions.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: isNight ? 'rgba(28, 35, 39, 0.75)' : 'rgba(246, 240, 231, 0.80)' }}>
                    <th style={{ padding: '12px 16px', borderBottom: `1px solid ${isNight ? 'rgba(245, 242, 236, 0.08)' : 'rgba(232, 221, 208, 0.55)'}`, color: textSecondary, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '12px 16px', borderBottom: `1px solid ${isNight ? 'rgba(245, 242, 236, 0.08)' : 'rgba(232, 221, 208, 0.55)'}`, color: textSecondary, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase' }}>Journal</th>
                    <th style={{ padding: '12px 16px', borderBottom: `1px solid ${isNight ? 'rgba(245, 242, 236, 0.08)' : 'rgba(232, 221, 208, 0.55)'}`, color: textSecondary, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase' }}>Reference</th>
                    <th style={{ padding: '12px 16px', borderBottom: `1px solid ${isNight ? 'rgba(245, 242, 236, 0.08)' : 'rgba(232, 221, 208, 0.55)'}`, color: textSecondary, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase' }}>Items</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentTransactions.map((txn) => (
                    <tr key={txn.id} className="table-row-hover">
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${isNight ? 'rgba(245, 242, 236, 0.08)' : 'rgba(232, 221, 208, 0.55)'}`, color: textPrimary }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={13} style={{ color: textSecondary, flexShrink: 0 }} />
                          {new Date(txn.date).toLocaleDateString('en-IN')}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${isNight ? 'rgba(245, 242, 236, 0.08)' : 'rgba(232, 221, 208, 0.55)'}`, fontWeight: 500, color: textPrimary }}>
                        {txn.journal}
                      </td>
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${isNight ? 'rgba(245, 242, 236, 0.08)' : 'rgba(232, 221, 208, 0.55)'}`, color: textPrimary }}>
                        {txn.reference || <span style={{ color: textMuted }}>—</span>}
                      </td>
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${isNight ? 'rgba(245, 242, 236, 0.08)' : 'rgba(232, 221, 208, 0.55)'}` }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontSize: '11.5px',
                            fontWeight: 600,
                            background: isNight ? 'rgba(31, 138, 104, 0.18)' : 'rgba(15, 106, 80, 0.12)',
                            color: isNight ? '#34d399' : '#0F6A50',
                            border: `1px solid ${isNight ? 'rgba(52, 211, 153, 0.22)' : 'rgba(15, 106, 80, 0.18)'}`,
                          }}
                        >
                          {txn.items?.length ?? 0} {txn.items?.length === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: textMuted }}>
              <p style={{ margin: 0, fontSize: 13 }}>No transactions recorded yet</p>
            </div>
          )}
        </div>

        {/* ── Charts row: Revenue + Profit side by side ──────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
          marginTop: 20,
          alignItems: 'stretch',
        }}>
          <RevenueChart isNight={isNight} />
          <ProfitChart  isNight={isNight} />
        </div>

        <div style={{ marginTop: 20, paddingBottom: 32 }} />

      </div>{/* end hero spacer */}

      {/* ── Scoped Hover & Animation Styles ─────────────────────── */}
      <style>{`
        .matte-kpi-card {
          transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms cubic-bezier(0.16, 1, 0.3, 1), border-color 180ms ease;
        }
        .matte-kpi-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: ${isNight
            ? '0 18px 44px -4px rgba(0, 0, 0, 0.60), 0 6px 16px -2px rgba(0, 0, 0, 0.35)'
            : '0 14px 34px -4px rgba(29, 27, 24, 0.12), 0 4px 12px -2px rgba(29, 27, 24, 0.06)'} !important;
          border-color: ${isNight ? 'rgba(212, 169, 90, 0.38)' : 'rgba(200, 154, 82, 0.45)'} !important;
        }
        .table-row-hover {
          transition: background-color 150ms ease;
        }
        .table-row-hover:hover {
          background-color: ${isNight ? 'rgba(245, 242, 236, 0.04)' : 'rgba(232, 221, 208, 0.30)'} !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

