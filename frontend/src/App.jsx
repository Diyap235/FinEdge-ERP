import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
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
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Right column: topbar + scrollable content */}
      <div className="flex flex-col flex-1 md:ml-[260px]">

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
    </div>
  );
}

export default App;
