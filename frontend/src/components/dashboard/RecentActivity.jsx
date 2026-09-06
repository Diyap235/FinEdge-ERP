import { Calendar } from 'lucide-react';

/**
 * RecentActivity — matte panel wrapping the recent transactions table.
 * Receives the recentTransactions array from the Dashboard summary;
 * contains zero data-fetching logic of its own.
 */
export default function RecentActivity({ transactions = [], isNight }) {
  const matteCard = {
    background: isNight ? 'rgba(22, 28, 31, 0.60)' : 'rgba(246, 240, 231, 0.60)',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
    borderRadius: 20,
    border: `1px solid ${isNight ? 'rgba(245,242,236,0.10)' : 'rgba(232,221,208,0.70)'}`,
    boxShadow: isNight
      ? '0 12px 36px -4px rgba(0,0,0,0.45), 0 4px 12px -2px rgba(0,0,0,0.25)'
      : '0 8px 30px -4px rgba(29,27,24,0.06), 0 2px 8px -2px rgba(29,27,24,0.04)',
  };

  const textPrimary   = isNight ? '#F5F2EC' : '#1D1B18';
  const textSecondary = isNight ? '#B7B2A8' : '#746C62';
  const textMuted     = isNight ? '#807B72' : '#9E9589';
  const borderColor   = isNight ? 'rgba(245,242,236,0.08)' : 'rgba(232,221,208,0.55)';
  const accentColor   = isNight ? '#34d399' : '#0F6A50';
  const accentBg      = isNight ? 'rgba(31,138,104,0.18)' : 'rgba(15,106,80,0.12)';
  const accentBorder  = isNight ? 'rgba(52,211,153,0.22)' : 'rgba(15,106,80,0.18)';
  const rowHoverBg    = isNight ? 'rgba(245,242,236,0.04)' : 'rgba(232,221,208,0.30)';

  const thStyle = {
    padding: '12px 16px',
    borderBottom: `1px solid ${borderColor}`,
    color: textSecondary,
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
    textAlign: 'left',
  };

  const tdStyle = {
    padding: '13px 16px',
    borderBottom: `1px solid ${borderColor}`,
    color: textPrimary,
  };

  return (
    <div style={{ ...matteCard, padding: '26px 28px' }}>
      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18, flexWrap: 'wrap', gap: 8,
      }}>
        <div>
          <h2 style={{
            margin: 0, fontSize: 16, fontWeight: 700,
            color: textPrimary, letterSpacing: '-0.2px',
          }}>
            Recent Activity
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: textSecondary }}>
            Latest journal transactions
          </p>
        </div>
        {/* Live badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: accentBg, color: accentColor,
          padding: '4px 12px', borderRadius: 20,
          fontSize: 11.5, fontWeight: 700,
          border: `1px solid ${accentBorder}`,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: accentColor,
            boxShadow: `0 0 8px ${accentColor}`,
            animation: 'pulse 1.8s infinite',
          }} />
          Live
        </span>
      </div>

      {/* Table or empty state */}
      {transactions.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{
                background: isNight
                  ? 'rgba(28,35,39,0.75)'
                  : 'rgba(246,240,231,0.80)',
              }}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Journal</th>
                <th style={thStyle}>Reference</th>
                <th style={thStyle}>Items</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr
                  key={txn.id}
                  style={{ transition: 'background-color 150ms ease' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = rowHoverBg; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td style={tdStyle}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={13} style={{ color: textSecondary, flexShrink: 0 }} />
                      {new Date(txn.date).toLocaleDateString('en-IN')}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{txn.journal}</td>
                  <td style={tdStyle}>
                    {txn.reference || <span style={{ color: textMuted }}>—</span>}
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '3px 10px', borderRadius: 20,
                      fontSize: 11.5, fontWeight: 600,
                      background: accentBg, color: accentColor,
                      border: `1px solid ${accentBorder}`,
                    }}>
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
  );
}
