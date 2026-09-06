import { useState, useRef, useEffect } from 'react';
import {
  Search, ChevronDown, X, CalendarDays,
  ShieldCheck, Calculator, UserCircle, Check,
  Sun, Moon,
} from 'lucide-react';

/* ── Page label map ─────────────────────────────────────────────── */
const PAGE_LABELS = {
  'dashboard':         'Dashboard',
  'contacts':          'Contacts',
  'products':          'Products',
  'accounts':          'Accounts',
  'journals':          'Journals',
  'purchase-orders':   'Purchase Orders',
  'vendor-bills':      'Vendor Bills',
  'sales-orders':      'Sales Orders',
  'customer-invoices': 'Customer Invoices',
  'payments':          'Payments',
  'journal-entries':   'Journal Entries',
  'reports':           'Reports',
  'ocr-scanner':       'AI Invoice Scanner',
};

/* ── Role definitions ───────────────────────────────────────────── */
const ROLES = [
  {
    id:       'admin',
    label:    'Admin',
    subtitle: 'Administrator',
    initials: 'A',
    icon:     ShieldCheck,
    color:    '#0F6A4B',
    bg:       '#e6f5ef',
  },
  {
    id:       'accountant',
    label:    'Accountant',
    subtitle: 'Accountant',
    initials: 'AC',
    icon:     Calculator,
    color:    '#1a56db',
    bg:       '#e8f0fe',
  },
  {
    id:       'contact',
    label:    'User',
    subtitle: 'Customer / User',
    initials: 'U',
    icon:     UserCircle,
    color:    '#7c3aed',
    bg:       '#f3e8ff',
  },
];

/* ── Date pill helper ───────────────────────────────────────────── */
function formatDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/* ══════════════════════════════════════════════════════════════════
   RoleDropdown — self-contained, click-outside-aware
══════════════════════════════════════════════════════════════════ */
function RoleDropdown({ currentUser, onUserChange, isNight = false }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  /* Close on outside click ──────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const active = ROLES.find(r => r.id === currentUser) ?? ROLES[0];

  const handleSelect = (roleId) => {
    onUserChange(roleId);
    setOpen(false);
  };

  /* Theme tokens for the trigger */
  const triggerBg     = open
    ? (isNight ? 'rgba(31,138,104,0.18)' : '#e6f5ef')
    : (isNight ? 'rgba(28,35,39,0.55)'   : '#f5f2eb');
  const triggerBorder = open
    ? (isNight ? 'rgba(52,211,153,0.28)' : '#a8d8c0')
    : (isNight ? 'rgba(245,242,236,0.14)': '#e5e0d6');
  const triggerShadow = open
    ? `0 0 0 3px ${isNight ? 'rgba(31,138,104,0.15)' : 'rgba(15,106,75,0.08)'}`
    : 'none';
  const nameColor     = isNight ? '#F5F2EC' : '#1c1c1e';
  const subtitleColor = isNight ? '#807B72' : '#999';

  return (
    <div ref={wrapperRef} style={{ position: 'relative', flexShrink: 0 }}>

      {/* ── Trigger button ──────────────────────────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px 6px 8px',
          borderRadius: 12,
          background:  triggerBg,
          border:      `1.5px solid ${triggerBorder}`,
          cursor:      'pointer',
          boxShadow:   triggerShadow,
          backdropFilter:      'blur(14px)',
          WebkitBackdropFilter:'blur(14px)',
          transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => {
          if (!open) e.currentTarget.style.background = isNight ? 'rgba(40,50,55,0.70)' : '#ede9e0';
        }}
        onMouseLeave={e => {
          if (!open) e.currentTarget.style.background = triggerBg;
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch role"
      >
        {/* Avatar */}
        <div
          style={{
            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg,#0F6A4B,#1a8a60)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 10, fontWeight: 800,
            letterSpacing: active.initials.length > 1 ? '-0.5px' : '0',
            boxShadow: '0 1px 4px rgba(15,106,75,0.3)',
          }}
        >
          {active.initials}
        </div>

        {/* Name + subtitle */}
        <div className="hidden sm:block" style={{ textAlign: 'left' }}>
          <p style={{
            margin: 0, fontSize: 12.5, fontWeight: 700,
            color: nameColor, lineHeight: 1.2, whiteSpace: 'nowrap',
          }}>
            {active.label}
          </p>
          <p style={{
            margin: 0, fontSize: 10,
            color: subtitleColor,
            lineHeight: 1.2, whiteSpace: 'nowrap',
          }}>
            {active.subtitle}
          </p>
        </div>

        {/* Chevron */}
        <ChevronDown
          size={13}
          style={{
            color: isNight ? '#807B72' : '#aaa', flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* ── Dropdown menu ───────────────────────────────────────── */}
      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 220,
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #ede9e0',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            zIndex: 200,
            /* Entrance animation via CSS — no extra deps */
            animation: 'roleDropIn 0.18s cubic-bezier(0.22,1,0.36,1) both',
          }}
        >
          {/* Menu header */}
          <div style={{
            padding: '10px 14px 8px',
            borderBottom: '1px solid #f5f2ec',
          }}>
            <p style={{
              margin: 0, fontSize: 10, fontWeight: 800,
              color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.7px',
            }}>
              Switch Role
            </p>
          </div>

          {/* Role options */}
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isActive = role.id === currentUser;
            return (
              <button
                key={role.id}
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(role.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 14px',
                  background: isActive ? '#f0faf5' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  boxShadow: 'none',
                  transition: 'background 0.12s',
                  borderLeft: isActive ? `3px solid #0F6A4B` : '3px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = '#faf8f4';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Role icon badge */}
                <div style={{
                  width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                  background: isActive ? role.bg : '#f5f2eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.12s',
                }}>
                  <Icon size={14} style={{ color: isActive ? role.color : '#aaa' }} />
                </div>

                {/* Label + subtitle */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0, fontSize: 13, fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#111' : '#444', lineHeight: 1.2,
                  }}>
                    {role.label}
                  </p>
                  <p style={{
                    margin: 0, fontSize: 10.5,
                    color: isActive ? '#0F6A4B' : '#aaa', lineHeight: 1.2,
                  }}>
                    {role.subtitle}
                  </p>
                </div>

                {/* Active checkmark */}
                {isActive && (
                  <div style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    background: '#0F6A4B',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Check size={11} color="white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}

          {/* Footer hint */}
          <div style={{
            padding: '8px 14px 10px',
            borderTop: '1px solid #f5f2ec',
          }}>
            <p style={{
              margin: 0, fontSize: 10, color: '#ccc', textAlign: 'center',
            }}>
              Role is loaded from the User table for AI requests
            </p>
          </div>
        </div>
      )}

      {/* Keyframe for dropdown entrance */}
      <style>{`
        @keyframes roleDropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Topbar — matte glass header, theme-aware
══════════════════════════════════════════════════════════════════ */
export default function Topbar({ currentPage, currentUser, onUserChange, isNight = false, onBgToggle }) {
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  /* ── Theme-derived tokens ──────────────────────────────────── */
  const headerBg     = isNight ? 'rgba(18, 22, 26, 0.62)' : 'rgba(246, 241, 234, 0.62)';
  const headerBorder = isNight ? 'rgba(245, 242, 236, 0.10)' : 'rgba(220, 210, 195, 0.55)';
  const dividerColor = isNight ? 'rgba(245,242,236,0.12)' : 'rgba(210,200,185,0.50)';

  const textPrimary   = isNight ? '#F5F2EC' : '#1a1714';
  const textSubtitle  = isNight ? '#C8C4BC' : '#5a5248';
  const textDate      = isNight ? '#D8D3CB' : '#3d3830';
  const textSearch    = isNight ? '#F5F2EC' : '#1a1714';
  const textSearchPh  = isNight ? '#807B72' : '#9a9080';

  const searchBg      = isNight
    ? (searchFocused ? 'rgba(28,35,39,0.85)' : 'rgba(28,35,39,0.55)')
    : (searchFocused ? 'rgba(255,255,255,0.85)' : 'rgba(246,241,234,0.70)');
  const searchBorder  = searchFocused ? '#1F8A68' : (isNight ? 'rgba(245,242,236,0.14)' : 'rgba(210,200,185,0.65)');
  const searchShadow  = searchFocused ? `0 0 0 3px ${isNight ? 'rgba(31,138,104,0.18)' : 'rgba(15,106,75,0.10)'}` : 'none';

  const datePillBg    = isNight ? 'rgba(28,35,39,0.55)' : 'rgba(240,237,230,0.75)';
  const datePillBdr   = isNight ? 'rgba(245,242,236,0.12)' : 'rgba(210,200,185,0.60)';

  return (
    <header
      className="fixed z-30 flex items-center gap-3 px-5"
      style={{
        /* ── Floating dock geometry ────────────────────────────── */
        top:    16,
        left:   'max(16px, calc(272px + 16px))',   /* sidebar width + gap; collapses to 16px on mobile */
        right:  16,
        height: 54,

        /* ── Matte glass surface ───────────────────────────────── */
        background:           headerBg,
        backdropFilter:       'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius:         24,
        border:               `1px solid ${headerBorder}`,
        boxShadow:            isNight
          ? '0 8px 32px rgba(0,0,0,0.50), 0 2px 8px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.04)'
          : '0 8px 32px rgba(40,30,20,0.12), 0 2px 8px rgba(40,30,20,0.06), inset 0 1px 0 rgba(255,255,255,0.60)',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* ── Page title ──────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col justify-center flex-shrink-0 min-w-0">
        <span
          className="text-[15px] font-bold leading-tight truncate"
          style={{ color: textPrimary }}
        >
          {PAGE_LABELS[currentPage] ?? 'FinEdge ERP'}
        </span>
        <span
          className="text-[10.5px] leading-tight"
          style={{ color: textSubtitle, fontWeight: 600 }}
        >
          FinEdge ERP
        </span>
      </div>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div
        className="hidden md:block h-6 w-px flex-shrink-0"
        style={{ background: dividerColor }}
      />

      {/* ── Search ──────────────────────────────────────────────── */}
      <div className="flex-1 max-w-[320px]">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-150"
          style={{
            background:  searchBg,
            border:      `1.5px solid ${searchBorder}`,
            boxShadow:   searchShadow,
            backdropFilter:      'blur(14px)',
            WebkitBackdropFilter:'blur(14px)',
          }}
        >
          <Search size={13} style={{ color: isNight ? '#807B72' : '#9a9080', flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search anything…"
            style={{
              flex: 1, background: 'transparent', border: 'none',
              outline: 'none', fontSize: '13px',
              color: textSearch,
              minWidth: 0, fontFamily: 'inherit',
            }}
          />
          {/* placeholder color via inline style tag scoped to this input */}
          <style>{`
            .topbar-search::placeholder { color: ${textSearchPh}; opacity: 1; }
          `}</style>
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'none', border: 'none', padding: 0,
                boxShadow: 'none', cursor: 'pointer',
                color: isNight ? '#807B72' : '#9a9080',
                display: 'flex', alignItems: 'center', flexShrink: 0,
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Spacer ──────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Date pill ───────────────────────────────────────────── */}
      <div
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-shrink-0"
        style={{
          background:          datePillBg,
          border:              `1px solid ${datePillBdr}`,
          backdropFilter:      'blur(14px)',
          WebkitBackdropFilter:'blur(14px)',
        }}
      >
        <CalendarDays size={12} style={{ color: '#1F8A68', flexShrink: 0 }} />
        <span
          className="text-[11.5px] font-semibold"
          style={{ color: textDate }}
        >
          {formatDate()}
        </span>
      </div>

      {/* ── Day / Night toggle ──────────────────────────────────── */}
      <button
        onClick={onBgToggle}
        aria-label={isNight ? 'Switch to day background' : 'Switch to night background'}
        title={isNight ? 'Switch to day' : 'Switch to night'}
        style={{
          width: 42, height: 42,
          borderRadius: '50%',
          border: `1px solid ${isNight ? 'rgba(197,184,240,0.35)' : 'rgba(229,216,160,0.60)'}`,
          background: isNight ? 'rgba(30,22,60,0.72)' : 'rgba(254,243,199,0.80)',
          backdropFilter:      'blur(20px)',
          WebkitBackdropFilter:'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
          boxShadow: isNight
            ? '0 2px 10px rgba(99,60,220,0.22), 0 1px 3px rgba(0,0,0,0.18)'
            : '0 2px 10px rgba(245,158,11,0.18), 0 1px 3px rgba(0,0,0,0.06)',
          transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.15s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = isNight
            ? '0 6px 18px rgba(99,60,220,0.32), 0 2px 6px rgba(0,0,0,0.22)'
            : '0 6px 18px rgba(245,158,11,0.28), 0 2px 6px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = isNight
            ? '0 2px 10px rgba(99,60,220,0.22), 0 1px 3px rgba(0,0,0,0.18)'
            : '0 2px 10px rgba(245,158,11,0.18), 0 1px 3px rgba(0,0,0,0.06)';
        }}
      >
        {isNight
          ? <Moon size={17} style={{ color: '#ddd6fe', flexShrink: 0 }} />
          : <Sun  size={17} style={{ color: '#d97706', flexShrink: 0 }} />
        }
      </button>

      {/* ── Role dropdown ───────────────────────────────────────── */}
      <RoleDropdown currentUser={currentUser} onUserChange={onUserChange} isNight={isNight} />
    </header>
  );
}
