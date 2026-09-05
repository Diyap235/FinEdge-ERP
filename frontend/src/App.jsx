import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import AiPanel from './components/layout/AiPanel';
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
import dayBg from './assets/backgrounds/finedge-day.webp';
import nightBg from './assets/backgrounds/finedge-night.webp';

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
  const [isNight, setIsNight] = useState(
    () => localStorage.getItem('finedge-bg') === 'night'
  );

  const toggleBg = () => {
    setIsNight(prev => {
      const next = !prev;
      localStorage.setItem('finedge-bg', next ? 'night' : 'day');
      return next;
    });
  };

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

  // Background image is global — applies on every page.
  // isNight toggles between day and night environment.
  const activeBg = isNight ? nightBg : dayBg;

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundImage:      `url(${activeBg})`,
        backgroundColor:      '#F6F3EC',
        backgroundSize:       'cover',
        backgroundPosition:   'center',
        backgroundRepeat:     'no-repeat',
        backgroundAttachment: 'fixed',
        transition:           'background-image 0.3s ease',
      }}
    >
      {/* Fixed left sidebar — floats above the background */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        aiOpen={aiOpen}
        onAiToggle={() => setAiOpen(v => !v)}
      />

      {/* Right column: topbar + scrollable content */}
      <div
        className="flex flex-col flex-1 md:ml-[252px]"
        style={{
          marginRight: aiOpen ? 420 : 0,
          transition: 'margin-right 0.3s ease',
        }}
      >
        {/* Fixed topbar — floats above the background */}
        <Topbar
          currentPage={currentPage}
          currentUser={currentUser}
          onUserChange={setCurrentUser}
          isNight={isNight}
          onBgToggle={toggleBg}
        />

        {/* Scrollable page area — offset for topbar height */}
        <main className="flex-1 overflow-y-auto pt-14">
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
            userName={currentUser === 'admin' ? 'Arjun' : currentUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
