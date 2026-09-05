import { useState } from 'react';
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

const PAGES = {
  DASHBOARD: 'dashboard',
  CONTACTS: 'contacts',
  PRODUCTS: 'products',
  ACCOUNTS: 'accounts',
  JOURNALS: 'journals',
  PURCHASE_ORDERS: 'purchase-orders',
  VENDOR_BILLS: 'vendor-bills',
  SALES_ORDERS: 'sales-orders',
  CUSTOMER_INVOICES: 'customer-invoices',
  PAYMENTS: 'payments',
  JOURNAL_ENTRIES: 'journal-entries',
  REPORTS: 'reports',
};

function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.DASHBOARD);
  const [currentUser, setCurrentUser] = useState('admin');

  const renderPage = () => {
    switch (currentPage) {
      case PAGES.DASHBOARD:
        return <Dashboard />;
      case PAGES.CONTACTS:
        return <ContactsPage />;
      case PAGES.PRODUCTS:
        return <ProductsPage />;
      case PAGES.ACCOUNTS:
        return <AccountsPage />;
      case PAGES.JOURNALS:
        return <JournalsPage />;
      case PAGES.PURCHASE_ORDERS:
        return <PurchaseOrdersPage />;
      case PAGES.VENDOR_BILLS:
        return <VendorBillsPage />;
      case PAGES.SALES_ORDERS:
        return <SalesOrdersPage />;
      case PAGES.CUSTOMER_INVOICES:
        return <CustomerInvoicesPage />;
      case PAGES.PAYMENTS:
        return <PaymentsPage />;
      case PAGES.JOURNAL_ENTRIES:
        return <JournalEntriesPage />;
      case PAGES.REPORTS:
        return <ReportsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div>
      <header>
        <div className="header-top">
          <h1>FinEdge-ERP</h1>
          <div className="user-selector">
            <label>User:</label>
            <select value={currentUser} onChange={(e) => setCurrentUser(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="accountant">Accountant</option>
              <option value="contact">Contact</option>
            </select>
          </div>
        </div>
        <p>AI-Powered Accounting & Business Management System</p>
      </header>

      <nav>
        <button
          className={currentPage === PAGES.DASHBOARD ? 'active' : ''}
          onClick={() => setCurrentPage(PAGES.DASHBOARD)}
        >
          Dashboard
        </button>
        <button
          className={currentPage === PAGES.CONTACTS ? 'active' : ''}
          onClick={() => setCurrentPage(PAGES.CONTACTS)}
        >
          Contacts
        </button>
        <button
          className={currentPage === PAGES.PRODUCTS ? 'active' : ''}
          onClick={() => setCurrentPage(PAGES.PRODUCTS)}
        >
          Products
        </button>
        <button
          className={currentPage === PAGES.ACCOUNTS ? 'active' : ''}
          onClick={() => setCurrentPage(PAGES.ACCOUNTS)}
        >
          Accounts
        </button>
        <button
          className={currentPage === PAGES.JOURNALS ? 'active' : ''}
          onClick={() => setCurrentPage(PAGES.JOURNALS)}
        >
          Journals
        </button>
        <button
          className={currentPage === PAGES.PURCHASE_ORDERS ? 'active' : ''}
          onClick={() => setCurrentPage(PAGES.PURCHASE_ORDERS)}
        >
          Purchase Orders
        </button>
        <button
          className={currentPage === PAGES.VENDOR_BILLS ? 'active' : ''}
          onClick={() => setCurrentPage(PAGES.VENDOR_BILLS)}
        >
          Vendor Bills
        </button>
        <button
          className={currentPage === PAGES.SALES_ORDERS ? 'active' : ''}
          onClick={() => setCurrentPage(PAGES.SALES_ORDERS)}
        >
          Sales Orders
        </button>
        <button
          className={currentPage === PAGES.CUSTOMER_INVOICES ? 'active' : ''}
          onClick={() => setCurrentPage(PAGES.CUSTOMER_INVOICES)}
        >
          Customer Invoices
        </button>
        <button
          className={currentPage === PAGES.PAYMENTS ? 'active' : ''}
          onClick={() => setCurrentPage(PAGES.PAYMENTS)}
        >
          Payments
        </button>
        <button
          className={currentPage === PAGES.JOURNAL_ENTRIES ? 'active' : ''}
          onClick={() => setCurrentPage(PAGES.JOURNAL_ENTRIES)}
        >
          Journal Entries
        </button>
        <button
          className={currentPage === PAGES.REPORTS ? 'active' : ''}
          onClick={() => setCurrentPage(PAGES.REPORTS)}
        >
          Reports
        </button>
      </nav>

      <main className="container">{renderPage()}</main>
    </div>
  );
}

export default App;
