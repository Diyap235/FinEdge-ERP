import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import AiPanel from './components/layout/AiPanel';
import { setCurrentUserId, usersAPI } from './services/api';
import Dashboard from './pages/Dashboard';
import ContactsPage from './pages/ContactsPage';
import ProductsPage from './pages/ProductsPage';
import AccountsPage from './pages/AccountsPage';
import JournalsPage from './pages/JournalsPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import VendorBillsPage from './pages/VendorBillsPage';
import SalesOrdersPage from './pages/SalesOrdersPage';
import CustomerInvoicesPage from './pages/CustomerInvoicesPage';
import PaymentsPage from './pages/PaymentsPage';
import JournalEntriesPage from './pages/JournalEntriesPage';
import ReportsPage from './pages/ReportsPage';

// ── Page IDs ─────────────────────────────────────────────────────────────────
const PAGES = {
  DASHBOARD:          'dashboard',
  CONTACTS:           'contacts',
  PRODUCTS:           'products',
  ACCOUNTS:           'accounts',
  JOURNALS:           'journals',
  PURCHASE_ORDERS:    'purchase-orders',
  VENDOR_BILLS:       'vendor-bills',
  SALES_ORDERS:       'sales-orders',
  CUSTOMER_INVOICES:  'customer-invoices',
  PAYMENTS:           'payments',
  JOURNAL_ENTRIES:    'journal-entries',
  REPORTS:            'reports',
};

function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.DASHBOARD);
  const [currentUser, setCurrentUser] = useState('admin');
  const [aiOpen, setAiOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);

  useEffect(() => {
    let cancelled = false;

    usersAPI
      .getAll()
      .then((response) => {
        if (cancelled) return;
        const users = Array.isArray(response.data) ? response.data : [];
        const match = users.find((user) => {
          const role = String(user.role || '').toLowerCase();
          if (currentUser === 'contact') {
            return role === 'contact' || role === 'user';
          }
          return role === currentUser;
        });
        setSessionUser(match || null);
        setCurrentUserId(match?.id ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setSessionUser(null);
        setCurrentUserId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  // ── Page renderer — unchanged ─────────────────────────────────────────────
  const renderPage = () => {
    switch (currentPage) {
      case PAGES.DASHBOARD:          return <Dashboard />;
      case PAGES.CONTACTS:           return <ContactsPage />;
      case PAGES.PRODUCTS:           return <ProductsPage />;
      case PAGES.ACCOUNTS:           return <AccountsPage />;
      case PAGES.JOURNALS:           return <JournalsPage />;
      case PAGES.PURCHASE_ORDERS:    return <PurchaseOrdersPage />;
      case PAGES.VENDOR_BILLS:       return <VendorBillsPage />;
      case PAGES.SALES_ORDERS:       return <SalesOrdersPage />;
      case PAGES.CUSTOMER_INVOICES:  return <CustomerInvoicesPage />;
      case PAGES.PAYMENTS:           return <PaymentsPage />;
      case PAGES.JOURNAL_ENTRIES:    return <JournalEntriesPage />;
      case PAGES.REPORTS:            return <ReportsPage />;
      default:                       return <Dashboard />;
    }
  };

  return (
    // Full-screen flex: sidebar + right column
    <div className="flex min-h-screen" style={{ background: '#F6F3EC' }}>

      {/* Fixed left sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        aiOpen={aiOpen}
        onAiToggle={() => setAiOpen(v => !v)}
      />

      {/* Right column: topbar + scrollable content.
          When AI panel is open, shrink right margin by 420px so content
          doesn't slide under the panel. Transition matches panel spring. */}
      <div
        className="flex flex-col flex-1 md:ml-[252px]"
        style={{
          marginRight: aiOpen ? 420 : 0,
          transition: 'margin-right 0.3s ease',
        }}
      >
        {/* Fixed topbar */}
        <Topbar
          currentPage={currentPage}
          currentUser={currentUser}
          onUserChange={setCurrentUser}
        />

        {/* Scrollable page area — offset for topbar height */}
        <main className="flex-1 overflow-y-auto pt-14">
          {/* Inner wrapper preserves the legacy .container width/padding */}
          <div className="container" style={{ padding: '20px' }}>
            {renderPage()}
          </div>
        </main>
      </div>

      {/* AI Copilot panel — slides in from the right */}
      <AnimatePresence>
        {aiOpen && (
          <AiPanel
            onClose={() => setAiOpen(false)}
            userName={sessionUser?.name || (currentUser === 'admin' ? 'Arjun' : currentUser)}
            role={currentUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
