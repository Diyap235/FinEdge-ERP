import { useState, useRef, useEffect } from 'react';
import {
  Search, Bell, ChevronDown, X, CalendarDays,
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
function RoleDropdown({ currentUser, onUserChange }) {
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
          background: open ? '#e6f5ef' : '#f5f2eb',
          border: `1.5px solid ${open ? '#a8d8c0' : '#e5e0d6'}`,
          cursor: 'pointer',
          boxShadow: open ? '0 0 0 3px rgba(15,106,75,0.08)' : 'none',
          transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = '#ede9e0'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = '#f5f2eb'; }}
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
            color: '#1c1c1e', lineHeight: 1.2, whiteSpace: 'nowrap',
          }}>
            {active.label}
          </p>
          <p style={{
            margin: 0, fontSize: 10, color: '#999',
            lineHeight: 1.2, whiteSpace: 'nowrap',
          }}>
            {active.subtitle}
          </p>
        </div>

        {/* Chevron */}
        <ChevronDown
          size={13}
          style={{
            color: '#aaa', flexShrink: 0,
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
   Topbar — unchanged except user profile replaced with RoleDropdown
══════════════════════════════════════════════════════════════════ */
export default function Topbar({ currentPage, currentUser, onUserChange, isNight = false, onBgToggle }) {
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 md:left-[252px] right-0 h-14 z-30
                 flex items-center gap-3 px-5"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #ede9e0',
        boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Page title */}
      <div className="hidden md:flex flex-col justify-center flex-shrink-0 min-w-0">
        <span className="text-[15px] font-bold text-stone-800 leading-tight truncate">
          {PAGE_LABELS[currentPage] ?? 'FinEdge ERP'}
        </span>
        <span className="text-[10.5px] text-stone-400 leading-tight">
          FinEdge ERP
        </span>
      </div>

      {/* Divider */}
      <div className="hidden md:block h-6 w-px bg-stone-200 flex-shrink-0" />

      {/* ── Search ────────────────────────────────────────────── */}
      <div className="flex-1 max-w-[320px]">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-150"
          style={{
            background: searchFocused ? '#fff' : '#f5f2eb',
            border: `1.5px solid ${searchFocused ? '#0F6A4B' : '#ede9e0'}`,
            boxShadow: searchFocused ? '0 0 0 3px rgba(15,106,75,0.10)' : 'none',
          }}
        >
          <Search size={13} style={{ color: '#aaa', flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search anything…"
            style={{
              flex: 1, background: 'transparent', border: 'none',
              outline: 'none', fontSize: '13px', color: '#1c1c1e',
              minWidth: 0, fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'none', border: 'none', padding: 0,
                boxShadow: 'none', cursor: 'pointer', color: '#aaa',
                display: 'flex', alignItems: 'center', flexShrink: 0,
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── Date pill ─────────────────────────────────────────── */}
      <div
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-shrink-0"
        style={{ background: '#f0ede6', border: '1px solid #e5e0d6' }}
      >
        <CalendarDays size={12} style={{ color: '#0F6A4B', flexShrink: 0 }} />
        <span className="text-[11.5px] font-medium" style={{ color: '#555' }}>
          {formatDate()}
        </span>
      </div>

      {/* ── Day / Night background toggle ─────────────────────── */}
      <button
        onClick={onBgToggle}
        aria-label={isNight ? 'Switch to day background' : 'Switch to night background'}
        title={isNight ? 'Switch to day' : 'Switch to night'}
        style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          border: `1.5px solid ${isNight ? '#c5b8f0' : '#e5d8a0'}`,
          background: isNight
            ? 'linear-gradient(135deg,#2d1f6e 0%,#1a1040 100%)'
            : 'linear-gradient(135deg,#fef3c7 0%,#fde68a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: isNight
            ? '0 2px 8px rgba(99,60,220,0.30)'
            : '0 2px 8px rgba(245,158,11,0.25)',
          transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.10)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {isNight
          ? <Moon size={15} style={{ color: '#c5b8f0' }} />
          : <Sun  size={15} style={{ color: '#d97706' }} />
        }
      </button>

      {/* ── Notifications ─────────────────────────────────────── */}
      <button
        className="relative w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
        style={{ background: '#f5f2eb', border: '1px solid #ede9e0', boxShadow: 'none' }}
        onMouseEnter={e => e.currentTarget.style.background = '#ede9e0'}
        onMouseLeave={e => e.currentTarget.style.background = '#f5f2eb'}
        aria-label="Notifications"
      >
        <Bell size={15} style={{ color: '#666' }} />
        <span
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
          style={{ background: '#e74c3c', border: '1.5px solid #fff' }}
        />
      </button>

      {/* ── Role dropdown (replaces old static profile) ───────── */}
      <RoleDropdown currentUser={currentUser} onUserChange={onUserChange} />
    </header>
  );
}
