import {
  ShoppingCart, ShoppingBag, Receipt, FileText,
} from 'lucide-react';

const ACTIONS = [
  { label: 'New Sale',          icon: ShoppingCart, page: 'sales-orders'      },
  { label: 'Purchase Order',    icon: ShoppingBag,  page: 'purchase-orders'   },
  { label: 'Customer Invoice',  icon: Receipt,      page: 'customer-invoices' },
  { label: 'Vendor Bill',       icon: FileText,     page: 'vendor-bills'      },
];

export default function QuickActions({ isNight, onNavigate }) {
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
    height:              '100%',
  };

  const textPrimary   = isNight ? '#F5F2EC' : '#1D1B18';
  const textSecondary = isNight ? '#B7B2A8' : '#746C62';
  const btnBg         = isNight ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.70)';
  const btnBorder     = isNight ? 'rgba(245,242,236,0.10)' : 'rgba(232,221,208,0.80)';
  const btnHoverBg    = isNight ? 'rgba(52,211,153,0.10)' : 'rgba(15,106,80,0.08)';
  const btnHoverBorder= isNight ? 'rgba(52,211,153,0.28)' : 'rgba(15,106,80,0.28)';
  const iconColor     = isNight ? '#34d399'  : '#0F6A50';
  const iconBg        = isNight ? 'rgba(52,211,153,0.12)' : 'rgba(15,106,80,0.10)';

  return (
    <div style={card}>
      {/* Title */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: textPrimary, letterSpacing: '-0.2px' }}>
          Quick Actions
        </h3>
        <p style={{ margin: '2px 0 0', fontSize: 11.5, color: textSecondary }}>
          Navigate to common tasks
        </p>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {ACTIONS.map(({ label, icon: Icon, page }) => (
          <button
            key={page}
            onClick={() => onNavigate?.(page)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 14px',
              borderRadius: 12, cursor: 'pointer', textAlign: 'left',
              background: btnBg, border: `1px solid ${btnBorder}`,
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              boxShadow: 'none', fontFamily: 'inherit',
              transition: 'background 0.15s ease, border-color 0.15s ease, transform 0.12s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = btnHoverBg;
              e.currentTarget.style.borderColor = btnHoverBorder;
              e.currentTarget.style.transform = 'translateX(3px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = btnBg;
              e.currentTarget.style.borderColor = btnBorder;
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${isNight ? 'rgba(52,211,153,0.18)' : 'rgba(15,106,80,0.14)'}`,
            }}>
              <Icon size={13} style={{ color: iconColor }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
