# FinEdge-ERP Architecture

## Overview

FinEdge-ERP is an accounting ERP for furniture business operations. It connects operational transactions (purchase orders, sales orders) to accounting automatically through a centralized accounting service.

## System Architecture

```
Frontend (React/Vite)
    ↓
REST API (Express)
    ↓
Business Services (Purchase, Sales, Payment)
    ↓
Accounting Service (createJournalEntry)
    ↓
Database Transaction (Prisma)
    ↓
PostgreSQL / SQLite
```

## Critical Service: Accounting Service

**File**: `backend/src/services/accounting.service.js`

The accounting service is the **single source of truth** for all journal entries. It:
- Validates that all entries are balanced
- Ensures data integrity with database transactions
- Rolls back on validation failure
- Is the ONLY place where journal entries are created

**Key Method**: `createJournalEntry(journalId, items, reference)`

### Validation Process
1. Verify journal exists
2. For each item:
   - Verify account exists
   - Ensure either debit OR credit (not both)
   - Ensure non-negative amounts
3. Calculate total debits and total credits
4. Verify TOTAL DEBIT === TOTAL CREDIT
5. If balanced: Create entry and items
6. If unbalanced: Throw error and rollback

## Data Model

### Core Tables

**User**
- id, name, email, role

**Contact** (Vendor/Customer)
- id, name, type (vendor/customer/both), email, mobile

**Product**
- id, name, type, salesPrice, cost, category

**Account** (Chart of Accounts)
- id, name, type (asset/liability/expense/income/capital)

**Journal**
- id, name, type (sales/purchase/bank/cash)

**JournalEntry**
- id, journalId, date, reference, status

**JournalItem**
- id, entryId, accountId, debit, credit

**PurchaseOrder** → **VendorBill** → **Payment**
- Linked through relationships
- Each creates accounting entries

**SalesOrder** → **CustomerInvoice** → **Payment**
- Linked through relationships
- Each creates accounting entries

## Business Flow

### Purchase Flow
```
1. Create Purchase Order (DRAFT)
2. Confirm Purchase Order (CONFIRMED)
3. Convert to Vendor Bill (BILLED)
   → Creates accounting entry
   → DEBIT: Purchase Expense
   → CREDIT: Creditors
4. Record Payment (Bank/Cash)
   → Creates accounting entry
   → DEBIT: Creditors
   → CREDIT: Bank/Cash
   → Bill status → PAID
```

### Sales Flow
```
1. Create Sales Order (DRAFT)
2. Confirm Sales Order (CONFIRMED)
3. Generate Customer Invoice (INVOICED)
   → Creates accounting entry
   → DEBIT: Debtors
   → CREDIT: Sales Income
4. Record Payment (Bank/Cash)
   → Creates accounting entry
   → DEBIT: Bank/Cash
   → CREDIT: Debtors
   → Invoice status → PAID
```

## Backend Modules

**Routes** (`backend/src/routes/`)
- Handle HTTP requests
- Delegate to services

**Controllers** (Not needed for MVP - routes call services directly)

**Services** (`backend/src/services/`)
- `accounting.service.js` - Journal entry validation & creation
- `purchase.service.js` - Purchase order & vendor bill logic
- `sales.service.js` - Sales order & customer invoice logic
- `report.service.js` - P&L, Balance Sheet, Ledger calculations

## Frontend Pages

**App.jsx** - Main navigation and page routing

**Pages**:
- Dashboard - Summary of financials
- Contacts - CRUD for vendors/customers
- Products - CRUD for products
- Accounts - Chart of accounts
- Journals - Journal list
- Purchase Orders - Create and manage
- Vendor Bills - View and pay
- Sales Orders - Create and manage
- Customer Invoices - View and pay
- Payments - Payment history
- Journal Entries - Accounting entries
- Reports - P&L, Balance Sheet, Ledger

## API Endpoints

See `API.md` for complete endpoint documentation.

## Database

### PostgreSQL (Recommended)
```
DATABASE_URL="postgresql://user:password@localhost:5432/finedge_erp"
```

### SQLite (Development/Testing)
```
DATABASE_URL="file:./dev.db"
```

## Security Notes

This is a **prototype MVP** without:
- Real authentication
- User permission checks
- Encryption
- Audit trails

For production:
- Add JWT authentication
- Add role-based access control
- Add audit logging
- Add encryption for sensitive data
- Add API rate limiting

## Testing

Backend tests are in `backend/tests/`

Run: `npm run test`

Tests cover:
- Balanced journal entry creation
- Unbalanced entry rejection
- Accounting flows (purchase, sales, payment)
- Ledger calculations
- Error handling

## Performance Considerations

- Ledger is calculated on-the-fly (not pre-cached)
- Reports query journal items directly
- Database transactions ensure consistency
- No complex joins (flat data structure)
- Use indexes on foreign keys and commonly filtered fields

## Deployment

For development:
```bash
cd backend && npm run dev
cd frontend && npm run dev
```

For production:
- Backend: Build and run with Node.js
- Frontend: Build with Vite and serve static files
- Database: Use PostgreSQL with proper backups
