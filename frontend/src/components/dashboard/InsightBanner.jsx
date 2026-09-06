import { ScanLine, ArrowRight, Lightbulb } from 'lucide-react';

export default function InsightBanner({ isNight, onNavigate, isAuthorized }) {
  const accentGreen  = isNight ? '#34d399'  : '#0F6A50';
  const accentGold   = isNight ? '#fbbf24'  : '#C89A52';
  const textPrimary  = isNight ? '#F5F2EC'  : '#1D1B18';
  const textSecondary= isNight ? '#B7B2A8'  : '#746C62';

  const wrapper = {
    display:             'flex',
    alignItems:          'center',
    gap:                 16,
    flexWrap:            'wrap',
    background:          isNight ? 'rgba(22,28,31,0.60)' : 'rgba(246,240,231,0.60)',
    backdropFilter:      'blur(22px)',
    WebkitBackdropFilter:'blur(22px)',
    borderRadius:        20,
    border:              `1px solid ${isNight ? 'rgba(245,242,236,0.10)' : 'rgba(232,221,208,0.70)'}`,
    boxShadow:           isNight
      ? '0 12px 36px -4px rgba(0,0,0,0.45)'
      : '0 8px 30px -4px rgba(29,27,24,0.06)',
    padding:             '18px 24px',
  };

  return (
    <div style={wrapper}>
      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: isNight ? 'rgba(251,191,36,0.15)' : 'rgba(200,154,82,0.14)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${isNight ? 'rgba(251,191,36,0.28)' : 'rgba(200,154,82,0.24)'}`,
      }}>
        <Lightbulb size={19} style={{ color: accentGold }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: textPrimary }}>
            Today's Insight
          </span>
          <span style={{
            fontSize: 10, fontWeight: 800, letterSpacing: '0.6px',
            background: isNight ? 'rgba(212,169,90,0.20)' : 'rgba(200,154,82,0.14)',
            color: accentGold, padding: '2px 7px', borderRadius: 6,
            textTransform: 'uppercase',
            border: `1px solid ${isNight ? 'rgba(212,169,90,0.32)' : 'rgba(200,154,82,0.22)'}`,
          }}>
            Smart OCR
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 12.5, color: textSecondary, lineHeight: 1.5 }}>
          Upload a vendor bill or customer invoice — FinEdge AI will extract line items,
          match products and contacts, and record the transaction automatically.
        </p>
      </div>

      {/* CTA — only shown to authorized roles */}
      {isAuthorized && (
        <button
          onClick={() => onNavigate?.('ocr-scanner')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', borderRadius: 12,
            background: 'linear-gradient(135deg,#0F6A50,#168a62)',
            color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.18)', flexShrink: 0,
            boxShadow: isNight ? '0 4px 14px rgba(31,138,104,0.32)' : '0 3px 12px rgba(15,106,80,0.28)',
          }}
        >
          <ScanLine size={14} />
          Scan Invoice
          <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}
