import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  BookText,
  BookOpen,
  ShoppingBag,
  FileText,
  ShoppingCart,
  Receipt,
  CreditCard,
  Pencil,
  BarChart2,
  Menu,
  X,
  TrendingUp,
  Sparkles,
  ScanLine,
} from 'lucide-react';

/* ── Navigation definition — unchanged ────────────────────────── */
const NAV_GROUPS = [
  {
    label: null,
    items: [
      { id: 'dashboard',   label: 'Dashboard',          icon: LayoutDashboard },
      { id: 'ocr-scanner', label: 'AI Invoice Scanner', icon: ScanLine, minRole: 'accountant' },
    ],
  },
  {
    label: 'Master Data',
    items: [
      { id: 'contacts',  label: 'Contacts',  icon: Users    },
      { id: 'products',  label: 'Products',  icon: Package  },
      { id: 'accounts',  label: 'Accounts',  icon: BookText },
      { id: 'journals',  label: 'Journals',  icon: BookOpen },
    ],
  },
  {
    label: 'Purchasing',
    items: [
      { id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingBag },
      { id: 'vendor-bills',    label: 'Vendor Bills',    icon: FileText   },
    ],
  },
  {
    label: 'Sales',
    items: [
      { id: 'sales-orders',      label: 'Sales Orders',      icon: ShoppingCart },
      { id: 'customer-invoices', label: 'Customer Invoices', icon: Receipt      },
    ],
  },
  {
    label: 'Finance & AI',
    items: [
      { id: 'payments',        label: 'Payments',        icon: CreditCard },
      { id: 'journal-entries', label: 'Journal Entries', icon: Pencil     },
      { id: 'reports',         label: 'Reports',         icon: BarChart2  },
    ],
  },
];

/* ── Theme hook — syncs with the existing localStorage toggle ──── */
function useIsNight() {
  const [isNight, setIsNight] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('finedge-bg') === 'night'
  );

  useEffect(() => {
    const sync = () => {
      const night = localStorage.getItem('finedge-bg') === 'night';
      setIsNight(prev => prev !== night ? night : prev);
    };
    const interval = setInterval(sync, 250);
    window.addEventListener('storage', sync);
    return () => { clearInterval(interval); window.removeEventListener('storage', sync); };
  }, []);

  return isNight;
}

/* ── Design tokens derived from theme ─────────────────────────── */
function useTokens(isNight) {
  return {
    /* Floating panel surface */
    panelBg:        isNight ? 'rgba(18, 22, 26, 0.58)' : 'rgba(246, 241, 234, 0.58)',
    panelBorder:    isNight ? 'rgba(245, 242, 236, 0.10)' : 'rgba(220, 210, 195, 0.55)',
    panelShadow:    isNight
      ? '0 8px 40px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.30)'
      : '0 8px 40px rgba(40,30,20,0.12), 0 2px 8px rgba(40,30,20,0.06)',

    /* Dividers */
    divider:        isNight ? 'rgba(245,242,236,0.08)' : 'rgba(210,200,185,0.45)',

    /* Text */
    textBrand:      isNight ? '#E8E4DC' : '#1a1714',
    textSub:        isNight ? '#7A7570' : '#9a9080',
    textSection:    isNight ? '#5A5550' : '#b0a898',
    textNav:        isNight ? '#C8C4BC' : '#4a4540',
    textNavMuted:   isNight ? '#6A6560' : '#9a9080',
    textQuote:      isNight ? '#C8C4BC' : '#4a4540',

    /* Nav item states */
    navHoverBg:     isNight ? 'rgba(255,255,255,0.07)' : 'rgba(15,106,75,0.08)',
    navActiveBg:    '#0F6A4B',
    navActiveText:  '#fff',
    navActiveGlow:  '0 2px 10px rgba(15,106,75,0.38)',

    /* AI button */
    aiBtnBg:        isNight ? 'rgba(255,255,255,0.06)' : 'rgba(15,106,75,0.08)',
    aiBtnBorder:    isNight ? 'rgba(255,255,255,0.10)' : 'rgba(15,106,75,0.20)',
    aiBtnHoverBg:   isNight ? 'rgba(52,211,153,0.10)' : 'rgba(15,106,75,0.14)',
    aiBtnOpenBg:    'linear-gradient(135deg,#0F6A4B,#1a8a60)',

    /* Scrollbar */
    scrollThumb:    isNight ? 'rgba(255,255,255,0.12)' : 'rgba(15,106,75,0.18)',

    /* Mobile hamburger */
    hamburgerBg:    isNight ? 'rgba(18,22,26,0.72)' : 'rgba(246,241,234,0.80)',
  };
}

/* ═══════════════════════════════════════════════════════════════
   SidebarContent — inner layout, shared by desktop & mobile
═══════════════════════════════════════════════════════════════ */
function SidebarContent({ currentPage, onNavigate, onClose, aiOpen, onAiToggle, currentUser, isNight, t }) {
  const rawRole = typeof currentUser === 'object' ? currentUser?.role : currentUser;
  const role = String(rawRole || '').toLowerCase().trim();
  const isAuthorizedRole = role === 'admin' || role === 'accountant';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Brand ──────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        padding: '22px 20px 18px',
        borderBottom: `1px solid ${t.divider}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          {/* Logo mark */}
          <div style={{
            width: 36, height: 36, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg,#0F6A4B,#1a8a60)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 12px rgba(15,106,75,0.38)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}>
            <TrendingUp size={17} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <p style={{
              margin: 0, fontSize: 14.5, fontWeight: 700,
              color: t.textBrand, letterSpacing: '-0.3px', lineHeight: 1.2,
            }}>
              FinEdge ERP
            </p>
            <p style={{
              margin: '2px 0 0', fontSize: 10, fontWeight: 600,
              color: t.textSub, letterSpacing: '0.2px',
            }}>
              AI-Powered Accounting
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav style={{
        flex: 1, overflowY: 'auto', padding: '12px 10px',
        scrollbarWidth: 'thin',
        scrollbarColor: `${t.scrollThumb} transparent`,
      }}>
        {NAV_GROUPS.map((group, gi) => {
          const visibleItems = group.items.filter(item =>
            item.minRole === 'accountant' ? isAuthorizedRole : true
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={gi} style={{ marginTop: gi > 0 ? 18 : 0 }}>
              {/* Section label */}
              {group.label && (
                <p style={{
                  margin: '0 0 5px', padding: '0 10px',
                  fontSize: 9.5, fontWeight: 800, letterSpacing: '0.8px',
                  textTransform: 'uppercase', color: t.textSection,
                  userSelect: 'none',
                }}>
                  {group.label}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {visibleItems.map(({ id, label, icon: Icon }) => {
                  const active = currentPage === id;
                  return (
                    <button
                      key={id}
                      onClick={() => { onNavigate(id); onClose?.(); }}
                      style={{
                        width: '100%',
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 12px',
                        borderRadius: 12,
                        border: 'none',
                        textAlign: 'left', cursor: 'pointer',
                        fontSize: 13, fontWeight: active ? 600 : 500,
                        fontFamily: 'inherit',
                        outline: 'none',
                        transition: 'background 0.14s ease, box-shadow 0.14s ease, transform 0.10s ease',
                        background: active ? t.navActiveBg : 'transparent',
                        color: active ? t.navActiveText : t.textNav,
                        boxShadow: active ? t.navActiveGlow : 'none',
                      }}
                      onMouseEnter={e => {
                        if (!active) {
                          e.currentTarget.style.background = t.navHoverBg;
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }
                      }}
                    >
                      <Icon
                        size={14}
                        style={{
                          flexShrink: 0,
                          color: active ? '#fff' : t.textNavMuted,
                        }}
                      />
                      <span style={{ flex: 1, color: active ? '#fff' : t.textNav }}>
                        {label}
                      </span>
                      {/* Active dot */}
                      {active && (
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: 'rgba(255,255,255,0.55)',
                          flexShrink: 0,
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── Footer: AI toggle + quote ───────────────────────────── */}
      <div style={{
        flexShrink: 0,
        padding: '14px 10px 18px',
        borderTop: `1px solid ${t.divider}`,
      }}>
        {/* AI Assistant toggle */}
        <button
          onClick={() => { onAiToggle(); onClose?.(); }}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 13px',
            borderRadius: 13,
            border: `1px solid ${aiOpen ? 'rgba(255,255,255,0.18)' : t.aiBtnBorder}`,
            cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, outline: 'none',
            marginBottom: 14,
            transition: 'background 0.15s ease, box-shadow 0.15s ease',
            background: aiOpen ? t.aiBtnOpenBg : t.aiBtnBg,
            color: aiOpen ? '#fff' : t.textNav,
            boxShadow: aiOpen ? '0 2px 12px rgba(15,106,75,0.38)' : 'none',
          }}
          onMouseEnter={e => {
            if (!aiOpen) e.currentTarget.style.background = t.aiBtnHoverBg;
          }}
          onMouseLeave={e => {
            if (!aiOpen) e.currentTarget.style.background = t.aiBtnBg;
          }}
        >
          <Sparkles
            size={14}
            style={{ flexShrink: 0, color: aiOpen ? '#a8f0cc' : '#0F6A4B' }}
          />
          <span style={{ flex: 1, color: aiOpen ? '#fff' : t.textNav }}>
            AI Assistant
          </span>
          {aiOpen && (
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'rgba(168,240,204,0.80)',
              flexShrink: 0,
              animation: 'aiBounce 1.5s ease-in-out infinite',
            }} />
          )}
        </button>

        {/* Quote */}
        <p style={{
          margin: '0 0 8px',
          padding: '0 4px',
          fontSize: 10.5, fontStyle: 'italic',
          lineHeight: 1.6, color: t.textQuote,
        }}>
          "Numbers move futures.<br />Every entry counts."
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 4px' }}>
          <div style={{
            width: 18, height: 1.5, borderRadius: 2,
            background: '#0F6A4B', opacity: 0.55,
          }} />
          <span style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: '0.4px',
            color: isNight ? '#34d399' : '#0F6A4B',
          }}>
            FinEdge ERP
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Sidebar — floating matte glass panel, 16px margin from edges
═══════════════════════════════════════════════════════════════ */
export default function Sidebar({ currentPage, onNavigate, aiOpen, onAiToggle, currentUser }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isNight = useIsNight();
  const t = useTokens(isNight);

  /* Shared floating panel style */
  const floatPanel = {
    background:          t.panelBg,
    backdropFilter:      'blur(24px)',
    WebkitBackdropFilter:'blur(24px)',
    borderRadius:        28,
    border:              `1px solid ${t.panelBorder}`,
    boxShadow:           t.panelShadow,
    display:             'flex',
    flexDirection:       'column',
    overflow:            'hidden',
  };

  return (
    <>
      {/* ── Desktop: floating panel ───────────────────────────── */}
      <aside
        className="hidden md:block"
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          /* Full viewport height minus top+bottom margin */
          height: 'calc(100vh - 32px)',
          width: 240,
          zIndex: 40,
          ...floatPanel,
        }}
      >
        <SidebarContent
          currentPage={currentPage}
          onNavigate={onNavigate}
          aiOpen={aiOpen}
          onAiToggle={onAiToggle}
          currentUser={currentUser}
          isNight={isNight}
          t={t}
        />
      </aside>

      {/* ── Mobile: hamburger ─────────────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed z-50"
        style={{
          top: 12, left: 16,
          width: 38, height: 38,
          borderRadius: 12,
          background: 'transparent',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          border: 'none',
          boxShadow: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          color: isNight ? '#C8C4BC' : '#4a4540',
          transition: 'background 0.14s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = t.navHoverBg; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* ── Mobile: backdrop ──────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile: floating drawer ───────────────────────────── */}
      {mobileOpen && (
        <aside
          className="md:hidden fixed z-50"
          style={{
            top: 16,
            left: 16,
            height: 'calc(100vh - 32px)',
            width: 240,
            ...floatPanel,
          }}
        >
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'absolute', top: 14, right: 14,
              width: 30, height: 30, borderRadius: 9,
              background: t.navHoverBg,
              border: `1px solid ${t.panelBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: t.textNav,
              boxShadow: 'none',
            }}
            aria-label="Close menu"
          >
            <X size={14} />
          </button>
          <SidebarContent
            currentPage={currentPage}
            onNavigate={onNavigate}
            onClose={() => setMobileOpen(false)}
            aiOpen={aiOpen}
            onAiToggle={onAiToggle}
            currentUser={currentUser}
            isNight={isNight}
            t={t}
          />
        </aside>
      )}

      {/* Keyframe for AI pulsing dot — scoped to sidebar */}
      <style>{`
        @keyframes aiBounce {
          0%, 100% { opacity: 0.8; transform: scale(1);    }
          50%       { opacity: 0.3; transform: scale(0.75); }
        }
      `}</style>
    </>
  );
}
