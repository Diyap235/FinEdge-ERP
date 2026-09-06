/**
 * StatCard — matte frosted KPI card.
 * Accepts isNight so it renders correctly in both themes without
 * duplicating the theme-sync logic from Dashboard.
 */
export default function StatCard({ label, value, icon: Icon, color, bg, isNight }) {
  const matteCard = {
    background: isNight ? 'rgba(22, 28, 31, 0.60)' : 'rgb(246, 240, 231)',
    backdropFilter: isNight ? 'blur(22px)' : 'none',
    WebkitBackdropFilter: isNight ? 'blur(22px)' : 'none',
    borderRadius: 20,
    border: `1px solid ${isNight ? 'rgba(245,242,236,0.10)' : 'rgba(232,221,208,0.70)'}`,
    boxShadow: isNight
      ? '0 12px 36px -4px rgba(0,0,0,0.45), 0 4px 12px -2px rgba(0,0,0,0.25)'
      : '0 8px 30px -4px rgba(29,27,24,0.06), 0 2px 8px -2px rgba(29,27,24,0.04)',
  };

  const labelColor  = isNight ? '#F5F2EC' : '#111827';
  const iconBg      = isNight ? 'rgba(255,255,255,0.08)' : bg;
  const iconBorder  = isNight ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)';

  return (
    <div
      className="matte-kpi-card"
      style={{ ...matteCard, padding: '22px 24px', cursor: 'default' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: iconBg, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${iconBorder}`,
        }}>
          <Icon size={14} style={{ color }} />
        </div>
        <span style={{
          margin: 0, fontSize: 11, fontWeight: 700,
          letterSpacing: '0.65px', color: labelColor,
          textTransform: 'uppercase',
        }}>
          {label}
        </span>
      </div>
      <div style={{
        fontSize: 28, fontWeight: 800,
        color, letterSpacing: '-0.6px', lineHeight: 1.15,
      }}>
        ₹{parseFloat(value ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
}
