import { Sparkles, ScanLine, ArrowRight } from 'lucide-react';

export default function UrbiePanel({ isNight, onNavigate, isAuthorized }) {
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
  const accentColor   = isNight ? '#34d399' : '#0F6A50';

  return (
    <div style={card}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 11, flexShrink: 0,
          background: 'linear-gradient(135deg,#0F6A50,#168a62)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 3px 10px rgba(15,106,80,0.32)',
          border: '1px solid rgba(255,255,255,0.18)',
        }}>
          <Sparkles size={17} color="white" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: textPrimary, letterSpacing: '-0.2px' }}>
            AI Assistant
          </h3>
          <p style={{ margin: 0, fontSize: 11, color: accentColor, fontWeight: 600, letterSpacing: '0.3px' }}>
            FinEdge Copilot · Beta
          </p>
        </div>
      </div>

      {/* Body */}
      <p style={{
        fontSize: 12.5, color: textSecondary, lineHeight: 1.55,
        margin: '0 0 16px', flex: 1,
      }}>
        Ask your accounting copilot anything — summarise finances, explain journal entries,
        create transactions, or scan invoices with Smart OCR.
      </p>

      {/* Suggestion chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {['Summarise finances', 'Highest expenses?', 'Create journal'].map(chip => (
          <span key={chip} style={{
            fontSize: 11, fontWeight: 600, padding: '4px 10px',
            borderRadius: 20, cursor: 'default',
            background: isNight ? 'rgba(52,211,153,0.12)' : 'rgba(15,106,80,0.10)',
            color: accentColor,
            border: `1px solid ${isNight ? 'rgba(52,211,153,0.22)' : 'rgba(15,106,80,0.18)'}`,
          }}>
            {chip}
          </span>
        ))}
      </div>

      {/* CTA */}
      {isAuthorized && (
        <button
          onClick={() => onNavigate?.('ocr-scanner')}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            width: '100%', padding: '10px 16px', borderRadius: 12,
            background: 'linear-gradient(135deg,#0F6A50,#168a62)',
            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: isNight ? '0 4px 14px rgba(31,138,104,0.32)' : '0 3px 12px rgba(15,106,80,0.28)',
          }}
        >
          <ScanLine size={14} />
          Launch AI Scanner
          <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}
