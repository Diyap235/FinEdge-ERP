import { useState } from 'react';
import { Search, Bell, ChevronDown, X, CalendarDays } from 'lucide-react';

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
};

/* ── Date pill helper ───────────────────────────────────────────── */
function formatDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/* ── User initials ──────────────────────────────────────────────── */
function initials(name) {
  return name.charAt(0).toUpperCase();
}

/* ── Component ──────────────────────────────────────────────────── */
export default function Topbar({ currentPage, currentUser, onUserChange }) {
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
      {/* Page title — desktop only (mobile space taken by hamburger) */}
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
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              color: '#1c1c1e',
              minWidth: 0,
              fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                boxShadow: 'none',
                cursor: 'pointer',
                color: '#aaa',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Spacer pushes right-side controls to the edge */}
      <div className="flex-1" />

      {/* ── Date pill ─────────────────────────────────────────── */}
      <div
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-shrink-0"
        style={{
          background: '#f0ede6',
          border: '1px solid #e5e0d6',
        }}
      >
        <CalendarDays size={12} style={{ color: '#0F6A4B', flexShrink: 0 }} />
        <span className="text-[11.5px] font-medium" style={{ color: '#555' }}>
          {formatDate()}
        </span>
      </div>

      {/* ── Notifications ─────────────────────────────────────── */}
      <button
        className="relative w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0
                   transition-colors"
        style={{ background: '#f5f2eb', border: '1px solid #ede9e0', boxShadow: 'none' }}
        onMouseEnter={e => e.currentTarget.style.background = '#ede9e0'}
        onMouseLeave={e => e.currentTarget.style.background = '#f5f2eb'}
        aria-label="Notifications"
      >
        <Bell size={15} style={{ color: '#666' }} />
        {/* Unread badge */}
        <span
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
          style={{ background: '#e74c3c', border: '1.5px solid #fff' }}
        />
      </button>

      {/* ── User profile ──────────────────────────────────────── */}
      <div
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl flex-shrink-0 cursor-pointer
                   transition-colors"
        style={{ background: '#f5f2eb', border: '1px solid #ede9e0' }}
        onMouseEnter={e => e.currentTarget.style.background = '#ede9e0'}
        onMouseLeave={e => e.currentTarget.style.background = '#f5f2eb'}
      >
        {/* Avatar */}
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center
                     text-white text-[11px] font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#0F6A4B,#1a8a60)' }}
        >
          {initials(currentUser)}
        </div>

        {/* Name + role */}
        <div className="hidden sm:block">
          <p className="text-[12.5px] font-semibold text-stone-800 leading-tight capitalize">
            {currentUser}
          </p>
          <p className="text-[10px] text-stone-400 leading-tight">
            {currentUser === 'admin' ? 'Administrator' :
             currentUser === 'accountant' ? 'Accountant' : 'Contact'}
          </p>
        </div>

        {/* Inline select overlaid transparently for functionality */}
        <div className="relative flex items-center flex-shrink-0">
          <ChevronDown size={12} style={{ color: '#aaa', pointerEvents: 'none' }} />
          <select
            value={currentUser}
            onChange={e => onUserChange(e.target.value)}
            aria-label="Switch user"
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              cursor: 'pointer',
              width: '100%',
              height: '100%',
              fontSize: '13px',
              fontFamily: 'inherit',
              border: 'none',
            }}
          >
            <option value="admin">Admin</option>
            <option value="accountant">Accountant</option>
            <option value="contact">Contact</option>
          </select>
        </div>
      </div>
    </header>
  );
}
