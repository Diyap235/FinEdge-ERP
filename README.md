# FinEdge-ERP

AI-Powered Accounting & Business Management System

A quick, functional MVP accounting ERP for a furniture business.

## Quick Start

### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Architecture

- **Accounting Service**: Single source of truth for journal entries
- **Double-entry validation**: All transactions must balance
- **Transaction safety**: Database transactions with rollback on validation failure
- **Phases**: Master Data → Purchase/Sales → Accounting → Reporting

## End-to-End Flow

1. Create contacts (vendor, customer)
2. Create products
3. Create purchase order → convert to vendor bill → record payment
4. Create sales order → generate customer invoice → record payment
5. View ledger, P&L, balance sheet

See `docs/ACCOUNTING_RULES.md` for detailed accounting logic.
