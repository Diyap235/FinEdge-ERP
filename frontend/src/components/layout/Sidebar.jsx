import { useState } from 'react';
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
} from 'lucide-react';

/* ── Navigation definition ─────────────────────────────────────────
   Grouped so the sidebar can render section separators naturally.
─────────────────────────────────────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: null, // no section header for top-level
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
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
      { id: 'sales-orders',       label: 'Sales Orders',       icon: ShoppingCart },
      { id: 'customer-invoices',  label: 'Customer Invoices',  icon: Receipt      },
    ],
  },
  {
    label: 'Finance',
    items: [
      { id: 'payments',        label: 'Payments',        icon: CreditCard },
      { id: 'journal-entries', label: 'Journal Entries', icon: Pencil     },
      { id: 'reports',         label: 'Reports',         icon: BarChart2  },
    ],
  },
];

/* ── Inner content — shared between desktop aside & mobile drawer ── */
function SidebarContent({ currentPage, onNavigate, onClose, aiOpen, onAiToggle }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Brand -------------------------------------------------------- */}
      <div className="flex-shrink-0 px-5 pt-6 pb-5"
           style={{ borderBottom: '1px solid #e8e3d8' }}>
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
               style={{ background: 'linear-gradient(135deg,#0F6A4B,#1a8a60)',
                        boxShadow: '0 3px 10px rgba(15,106,75,0.35)' }}>
            <TrendingUp size={17} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[15px] font-bold text-stone-900 leading-tight tracking-tight">
              FinEdge ERP
            </p>
            <p className="text-[10.5px] text-stone-400 leading-tight mt-0.5 font-medium">
              AI-Powered Accounting
            </p>
          </div>
        </div>
      </div>

      {/* Nav ---------------------------------------------------------- */}
      <nav className="flex-1 overflow-y-auto py-4 px-3"
           style={{ scrollbarWidth: 'thin', scrollbarColor: '#d6d1c9 transparent' }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
            {/* Section label */}
            {group.label && (
              <p className="px-3 mb-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest select-none">
                {group.label}
              </p>
            )}

            <div className="space-y-0.5">
              {group.items.map(({ id, label, icon: Icon }) => {
                const active = currentPage === id;
                return (
                  <button
                    key={id}
                    onClick={() => { onNavigate(id); onClose?.(); }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl
                               text-left text-[13px] font-medium outline-none transition-all duration-150"
                    style={active ? {
                      background: '#0F6A4B',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(15,106,75,0.30)',
                    } : {
                      color: '#555',
                      background: 'transparent',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#ede9e0'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Icon
                      size={15}
                      style={{ color: active ? '#fff' : '#999', flexShrink: 0 }}
                    />
                    <span style={{ color: active ? '#fff' : '#444' }}>{label}</span>

                    {/* Active indicator dot */}
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-300 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom quote ------------------------------------------------- */}
      <div className="flex-shrink-0 px-5 py-5"
           style={{ borderTop: '1px solid #e8e3d8' }}>

        {/* AI Assistant toggle — pinned just above the quote */}
        <button
          onClick={() => { onAiToggle(); onClose?.(); }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl
                     text-left text-[13px] font-medium outline-none transition-all duration-150 mb-4"
          style={aiOpen ? {
            background: 'linear-gradient(135deg,#0F6A4B,#1a8a60)',
            color: '#fff',
            boxShadow: '0 2px 10px rgba(15,106,75,0.35)',
          } : {
            background: '#f0ede6',
            color: '#444',
            border: '1px solid #e5e0d6',
          }}
          onMouseEnter={e => {
            if (!aiOpen) e.currentTarget.style.background = '#e6f5ef';
          }}
          onMouseLeave={e => {
            if (!aiOpen) e.currentTarget.style.background = '#f0ede6';
          }}
        >
          <Sparkles
            size={15}
            style={{
              flexShrink: 0,
              color: aiOpen ? '#a8f0cc' : '#0F6A4B',
            }}
          />
          <span style={{ color: aiOpen ? '#fff' : '#333', flex: 1 }}>AI Assistant</span>
          {/* Pulsing dot when open */}
          {aiOpen && (
            <span
              style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#a8f0cc',
                animation: 'aiBounce 1.5s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
          )}
        </button>

        <p className="text-[11px] italic leading-relaxed"
           style={{ color: '#b0a898' }}>
          "Numbers move futures.<br />Every entry counts."
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="w-5 h-0.5 rounded-full" style={{ background: '#0F6A4B', opacity: 0.5 }} />
          <p className="text-[10px] font-semibold" style={{ color: '#0F6A4B', opacity: 0.7 }}>
            Phase 1
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Main export ───────────────────────────────────────────────── */
export default function Sidebar({ currentPage, onNavigate, aiOpen, onAiToggle }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-[252px] z-40"
        style={{ background: '#F6F3EC', borderRight: '1px solid #e8e3d8' }}
      >
        <SidebarContent
          currentPage={currentPage}
          onNavigate={onNavigate}
          aiOpen={aiOpen}
          onAiToggle={onAiToggle}
        />
      </aside>

      {/* ── Mobile: hamburger trigger ─────────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3.5 left-4 z-50 w-9 h-9 flex items-center
                   justify-center rounded-xl border border-stone-200 bg-white
                   text-stone-600 shadow-sm"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* ── Mobile: backdrop ─────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/25 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile: drawer ───────────────────────────────────────── */}
      {mobileOpen && (
        <aside
          className="md:hidden fixed top-0 left-0 h-screen w-[252px] z-50 flex flex-col"
          style={{ background: '#F6F3EC', borderRight: '1px solid #e8e3d8' }}
        >
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center
                       rounded-xl text-stone-500 hover:bg-stone-200 transition-colors"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
          <SidebarContent
            currentPage={currentPage}
            onNavigate={onNavigate}
            onClose={() => setMobileOpen(false)}
            aiOpen={aiOpen}
            onAiToggle={onAiToggle}
          />
        </aside>
      )}
    </>
  );
}
