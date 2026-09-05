# FinEdge-ERP Setup Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL 12+ (or SQLite for development)

## Quick Start

### 1. Database Setup

#### Option A: PostgreSQL
```bash
# Create database
createdb finedge_erp

# In backend/.env, add:
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/finedge_erp"
```

#### Option B: SQLite (Development)
```bash
# In backend/.env, add:
DATABASE_URL="file:./dev.db"
```

### 2. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Run migrations
npx prisma migrate dev --name init

# Seed database with initial data
npx prisma db seed

# Start backend
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

## Testing

### Run Backend Tests

```bash
cd backend
npm run test
```

Tests cover:
- Balanced journal entry validation
- Unbalanced entry rejection
- Purchase flow accounting
- Sales flow accounting
- Payment flows
- Ledger calculations

## End-to-End Acceptance Test

Follow this exact flow to verify the system works:

### STEP 1: Create Contacts
- Navigate to Contacts
- Create "Azure Furniture" as Vendor
- Create "Nimesh Pathak" as Customer

### STEP 2: Create Products
- Navigate to Products
- Create "Office Chair"
  - Sales Price: 5000
  - Cost: 3000

### STEP 3: Create Purchase Order
- Navigate to Purchase Orders
- Create Purchase Order
  - Vendor: Azure Furniture
  - Product: Office Chair
  - Quantity: 5
  - Unit Price: 3000

### STEP 4: Convert to Vendor Bill
- Click "Convert to Vendor Bill"
- Verify Journal Entry created:
  - Debit Purchase Expense: 15,000
  - Credit Creditors: 15,000

### STEP 5: Record Vendor Payment
- Navigate to Vendor Bills
- Click on Bill
- Record Payment: 15,000 (Bank)
- Verify Journal Entry created:
  - Debit Creditors: 15,000
  - Credit Bank: 15,000

### STEP 6: Create Sales Order
- Navigate to Sales Orders
- Create Sales Order
  - Customer: Nimesh Pathak
  - Product: Office Chair
  - Quantity: 5
  - Unit Price: 5000
  - Tax: 10

### STEP 7: Generate Customer Invoice
- Click "Generate Invoice"
- Verify Invoice status changes to INVOICED
- Verify Journal Entry created:
  - Debit Debtors: 27,500 (25,000 * 1.1)
  - Credit Sales Income: 27,500

### STEP 8: Record Customer Payment
- Navigate to Customer Invoices
- Click on Invoice
- Record Payment: 27,500 (Bank)
- Verify Journal Entry created:
  - Debit Bank: 27,500
  - Credit Debtors: 27,500

### STEP 9: Verify Reports
- Navigate to Reports
- Check Profit & Loss:
  - Revenue: 27,500
  - Expenses: 15,000
  - Net Profit: 12,500
- Check Balance Sheet:
  - Should be balanced
  - Bank: increased by 12,500 (27,500 - 15,000)

## Database Prisma Commands

```bash
# View database
npx prisma studio

# Create migration after schema changes
npx prisma migrate dev --name <migration_name>

# Reset database (development only!)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

## Troubleshooting

### Port Already in Use
```bash
# Find process on port 3000
lsof -i :3000

# Find process on port 5173
lsof -i :5173

# Kill process
kill -9 <PID>
```

### Database Connection Error
- Verify DATABASE_URL in `.env`
- Verify PostgreSQL is running
- Verify database exists
- Run migrations: `npx prisma migrate dev`

### Prisma Client Error
```bash
cd backend
npx prisma generate
npm install
```

### Port 5173 Not Accessible
- Clear browser cache
- Check frontend `.env` has correct API_URL
- Restart frontend: `npm run dev`

## Production Deployment

1. **Environment Variables**
   - Set NODE_ENV=production
   - Use PostgreSQL (not SQLite)
   - Set secure DATABASE_URL

2. **Backend**
   ```bash
   npm run build
   npm start
   ```

3. **Frontend**
   ```bash
   npm run build
   # Serve dist/ folder with static server
   ```

4. **Database**
   - Run migrations: `npx prisma migrate deploy`
   - Regular backups recommended

## Development Tips

- Backend auto-reloads with `npm run dev`
- Frontend hot-reloads with Vite
- Use `npx prisma studio` to explore database
- Check `backend/tests/` for test examples
- API responses include errors in `.message` field

## Architecture Overview

See `docs/ARCHITECTURE.md` for detailed architecture.

## Accounting Rules

See `docs/ACCOUNTING_RULES.md` for accounting flow details.
