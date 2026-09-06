import {
  TrendingUp, TrendingDown, DollarSign,
  Wallet, Landmark, Users, ArrowDownCircle,
} from 'lucide-react';

const ROWS = [
  { key: 'revenue',     label: 'Revenue',      icon: TrendingUp,      lightColor: '#0F6A50', darkColor: '#34d399' },
  { key: 'expenses',    label: 'Expenses',      icon: TrendingDown,    lightColor: '#c0392b', darkColor: '#f87171' },
  { key: 'netProfit',   label: 'Net Profit',    icon: DollarSign,      lightColor: '#1a56db', darkColor: '#60a5fa' },
  { key: 'cashBalance', label: 'Cash',          icon: Wallet,          lightColor: '#0F6A50', darkColor: '#34d399' },
  { key: 'bankBalance', label: 'Bank',          icon: Landmark,        lightColor: '#C89A52', darkColor: '#fbbf24' },
  { key: 'receivables', label: 'Receivables',   icon: Users,           lightColor: '#C89A52', darkColor: '#fbbf24' },
  { key: 'payables',    label: 'Payables',      icon: ArrowDownCircle, lightColor: '#c0392b', darkColor: '#f87171' },
];

export default function FinancialOverview({ summary, isNight }) {
  /* ── shared token helpers ──────────────────────────────────────── */
  const card = {
    background:          isNight ? 'rgba(22,28,31,0.60)' : 'rgba(246,240,231,0.60)',
    backdropFilter:      'blur(22px)',
    WebkitBackdropFilter:'blur(22px)',
    borderRadius:        20,
    border:              `1px solid ${isNight ? 'rgba(245,242,236,0.10)' : 'rgba(232,221,208,0.70)'}`,
    boxShadow:           isNight
      ? '0 12px 36px -4px rgba(0,0,0,0.45)'
      : '0 8px 30px -4px rgba(29,27,24,0.06)',
    padding:             '22px 24px',
    display:             'flex',
    flexDirection:       'column',
    gap:                 0,
    height:              '100%',
  };

  const textPrimary   = isNight ? '#F5F2EC' : '#1D1B18';
  const textSecondary = isNight ? '#B7B2A8' : '#746C62';
  const textMuted     = isNight ? '#807B72' : '#9E9589';
  const divider       = isNight ? 'rgba(245,242,236,0.07)' : 'rgba(232,221,208,0.50)';

  const fmt = (v) =>
    '₹' + parseFloat(v ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <div style={card}>
      {/* Title */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: textPrimary, letterSpacing: '-0.2px' }}>
          Financial Overview
        </h3>
        <p style={{ margin: '2px 0 0', fontSize: 11.5, color: textSecondary }}>
          Current period summary
        </p>
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, flex: 1 }}>
        {ROWS.map(({ key, label, icon: Icon, lightColor, darkColor }, idx) => {
          const color = isNight ? darkColor : lightColor;
          return (
            <div
              key={key}
              style={{
                display:       'flex',
                alignItems:    'center',
                justifyContent:'space-between',
                padding:       '9px 0',
                borderBottom:  idx < ROWS.length - 1 ? `1px solid ${divider}` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                  background: isNight ? 'rgba(255,255,255,0.07)' : `${lightColor}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${isNight ? 'rgba(255,255,255,0.06)' : `${lightColor}22`}`,
                }}>
                  <Icon size={12} style={{ color }} />
                </div>
                <span style={{ fontSize: 12.5, color: textMuted, fontWeight: 500 }}>{label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color, letterSpacing: '-0.3px' }}>
                {fmt(summary?.[key])}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
