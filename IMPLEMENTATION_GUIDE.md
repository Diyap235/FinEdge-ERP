# FinEdge-ERP Implementation Guide

## What You Have

A **complete, working MVP** of an accounting ERP with:
- ✅ All backend services implemented
- ✅ All frontend pages implemented
- ✅ Database schema with relationships
- ✅ Seed data for immediate testing
- ✅ API endpoints fully functional
- ✅ Accounting service with validation
- ✅ Tests included
- ✅ Documentation complete

## 5-Minute Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Terminal 1: Backend

```bash
cd backend

# Copy environment
cp .env.example .env

# Install
npm install

# Migrate database (creates dev.db for SQLite)
npx prisma migrate dev

# Seed initial data
npx prisma db seed

# Start
npm run dev
```

**Output should show**: `FinEdge-ERP Backend running on port 3000`

### Terminal 2: Frontend

```bash
cd frontend

# Copy environment
cp .env.example .env

# Install
npm install

# Start (opens browser automatically)
npm run dev
```

**Output should show**: `VITE v... ready in ... ms`

### Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Prisma Studio** (database viewer): `npx prisma studio`

## Complete End-to-End Test Flow

Once both servers are running, execute this flow to verify everything works:

### Step 1: Create Master Data

**Navigate to Contacts page**
- Click "+ Create Contact"
- Name: `Azure Furniture`
- Type: `Vendor`
- Email: `azure@furniture.com`
- Create

- Click "+ Create Contact"
- Name: `Nimesh Pathak`
- Type: `Customer`
- Email: `nimesh@example.com`
- Create

**Navigate to Products page**
- Click "+ Create Product"
- Name: `Office Chair`
- Sales Price: `5000`
- Cost: `3000`
- Category: `Seating`
- Create

### Step 2: Purchase Flow (Vendor → Bill → Payment)

**Navigate to Purchase Orders**
- Click "+ Create Purchase Order"
- Vendor: Select "Azure Furniture"
- Product: Select "Office Chair"
- Quantity: `5`
- Unit Price: `3000`
- Click "+ Add Line Item" if needed
- Create

**In the Purchase Orders list, click "View" on your new order**
- Click "Convert to Vendor Bill"
- **✓ Verify success message**

**Check the Accounting Entry:**
- Navigate to Journal Entries
- See the new entry with reference `PO-[ID]`
- Should show:
  - Purchase Expense: Debit ₹15,000
  - Creditors: Credit ₹15,000

**Navigate to Vendor Bills**
- Click "View" on your bill
- Click "Record Payment"
- Amount: `15000`
- Payment Type: `Bank`
- Click "Record Payment"
- **✓ Bill status should change to PAID**

**Check the Payment Entry:**
- Navigate to Journal Entries
- See new entry with reference `PAYMENT-[BILL_ID]`
- Should show:
  - Creditors: Debit ₹15,000
  - Bank: Credit ₹15,000

### Step 3: Sales Flow (Customer → Invoice → Payment)

**Navigate to Sales Orders**
- Click "+ Create Sales Order"
- Customer: Select "Nimesh Pathak"
- Product: Select "Office Chair"
- Quantity: `5`
- Unit Price: `5000`
- Tax: `10`
- Create

**In the Sales Orders list, click "View" on your new order**
- Click "Generate Invoice"
- **✓ Verify success message and status changes to INVOICED**

**Check the Invoice Entry:**
- Navigate to Journal Entries
- See new entry with reference `SO-[ID]`
- Should show:
  - Debtors: Debit ₹27,500 (25,000 * 1.1 tax)
  - Sales Income: Credit ₹27,500

**Navigate to Customer Invoices**
- Click "View" on your invoice
- Click "Record Payment"
- Amount: `27500`
- Payment Type: `Bank`
- Click "Record Payment"
- **✓ Invoice status should change to PAID**

**Check the Payment Entry:**
- Navigate to Journal Entries
- See new entry with reference `PAYMENT-[INVOICE_ID]`
- Should show:
  - Bank: Debit ₹27,500
  - Debtors: Credit ₹27,500

### Step 4: Verify Reports

**Navigate to Reports**

**Profit & Loss**
- Total Revenue: ₹27,500
- Total Expenses: ₹15,000
- Net Profit: ₹12,500

**Balance Sheet**
- Should show "✓ Balance Sheet is Balanced"
- Assets = Liabilities + Capital
- Bank account shows the net: ₹12,500 (27,500 - 15,000 paid out)

**Ledger**
- Shows all transactions chronologically
- Each entry shows Debit/Credit by account

**Dashboard**
- Net Profit: ₹12,500
- Revenue: ₹27,500
- Expenses: ₹15,000
- Bank Balance: ₹12,500

## Running Tests

```bash
cd backend
npm run test
```

Expected output:
```
✓ TEST 1: Balanced journal entry succeeds
✓ TEST 2: Unbalanced journal entry fails
✓ TEST 3: Vendor Bill creates correct entries
✓ TEST 4: Vendor Payment creates correct entries
✓ TEST 5: Customer Invoice creates correct entries
✓ TEST 6: Customer Payment creates correct entries
✓ TEST 7: Cannot have both debit and credit on same item
✓ TEST 8: Ledger calculation works correctly
✓ TEST 9: Invalid account throws error
✓ TEST 10: Invalid journal throws error

10 pass in 5s
```

## API Examples

### Create Purchase Order

```bash
curl -X POST http://localhost:3000/api/purchase-orders \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": 1,
    "lines": [
      {
        "productId": 1,
        "qty": 5,
        "unitPrice": 3000
      }
    ]
  }'
```

### Convert to Vendor Bill

```bash
curl -X POST http://localhost:3000/api/purchase-orders/1/convert-to-bill \
  -H "Content-Type: application/json"
```

### Record Vendor Payment

```bash
curl -X POST http://localhost:3000/api/vendor-bills/1/pay \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 15000,
    "paymentType": "bank"
  }'
```

### Get All Journal Entries

```bash
curl http://localhost:3000/api/journal-entries
```

### Get Profit & Loss

```bash
curl http://localhost:3000/api/reports/profit-loss
```

### Get Balance Sheet

```bash
curl http://localhost:3000/api/reports/balance-sheet
```

## Database Management

### View Database (GUI)
```bash
cd backend
npx prisma studio
```
Opens http://localhost:5555

### Reset Database (Development)
```bash
cd backend
npx prisma migrate reset
```
Warning: Deletes all data and re-seeds.

### View Migrations
```bash
cd backend
npx prisma migrate status
```

## Troubleshooting

### Issue: "Port 3000 already in use"
```bash
# Find process
lsof -i :3000
# Kill it
kill -9 <PID>
```

### Issue: "Cannot find module '@prisma/client'"
```bash
cd backend
npm install
npx prisma generate
```

### Issue: "Database connection failed"
- Check `backend/.env` has DATABASE_URL
- For SQLite: Should be `file:./dev.db`
- For PostgreSQL: Verify database exists

### Issue: Frontend shows "Cannot reach API"
- Verify backend is running on port 3000
- Check `frontend/.env` has `VITE_API_URL=http://localhost:3000/api`
- Clear browser cache (Ctrl+Shift+Delete)

### Issue: Payments not recording
- Verify amount is less than or equal to bill/invoice total
- Check payment type is 'bank' or 'cash'
- Look for error messages in network tab (browser F12)

## File Quick Reference

**Key Accounting Service**
- `backend/src/services/accounting.service.js` - All journal entry creation

**Business Logic**
- `backend/src/services/purchase.service.js` - PO → Bill → Payment
- `backend/src/services/sales.service.js` - SO → Invoice → Payment
- `backend/src/services/report.service.js` - Reports calculation

**Data Model**
- `backend/prisma/schema.prisma` - All database tables
- `backend/prisma/seed.js` - Initial data

**API Routes**
- `backend/src/routes/` - All endpoints

**Frontend Components**
- `frontend/src/pages/` - All page implementations
- `frontend/src/App.jsx` - Main navigation
- `frontend/src/services/api.js` - API client

**Documentation**
- `SETUP.md` - Installation guide
- `ARCHITECTURE.md` - System design
- `ACCOUNTING_RULES.md` - Accounting flows
- `PROJECT_SUMMARY.md` - What was built

## Extending the System

### Add a New Page

1. Create `frontend/src/pages/NewPage.jsx`
2. Add to `frontend/src/App.jsx` imports
3. Add case in switch statement
4. Add navigation button

### Add a New API Endpoint

1. Create route in `backend/src/routes/new.routes.js`
2. Import and mount in `backend/src/app.js`
3. Add to API client `frontend/src/services/api.js`
4. Use in frontend components

### Add a New Account Type

1. Update `backend/prisma/schema.prisma` if needed
2. Add to seed data in `backend/prisma/seed.js`
3. Add account in UI or API call

### Modify Accounting Logic

**IMPORTANT**: Modify `backend/src/services/accounting.service.js`
- This is the only place journal entries are created
- Any business logic changes go in service layers
- Never create entries directly in routes

## Performance Notes

- Dashboard queries all transactions (OK for MVP)
- Ledger calculated on-the-fly (OK for MVP)
- No caching (OK for MVP)
- For production: Add indexes, caching, pagination

## Security Notes (MVP vs Production)

**This MVP does NOT have**:
- User authentication
- Password protection
- Role-based access control
- Audit logging
- Data encryption
- API rate limiting

**For production**, add:
- JWT authentication
- Bcrypt for passwords
- Role-based middleware
- Audit trail logging
- HTTPS/TLS encryption
- API rate limiting
- Input validation with schemas
- CORS policy

## Next Steps

1. ✅ Set up both servers (backend & frontend)
2. ✅ Run the complete test flow above
3. ✅ Run npm test
4. ✅ Explore the database with Prisma Studio
5. ✅ Read ARCHITECTURE.md for system understanding
6. ✅ Test all pages and features
7. ✅ Review code in services/ folder
8. 📋 Extend with additional features as needed

## Support Resources

- `SETUP.md` - Setup help
- `ARCHITECTURE.md` - How it works
- `ACCOUNTING_RULES.md` - Accounting logic
- `PROJECT_SUMMARY.md` - What was built
- API endpoints in code comments
- Test cases show usage patterns

## Success Criteria

You'll know it's working when:

✅ Backend starts on port 3000
✅ Frontend starts on port 5173
✅ Can create contacts, products
✅ Can create purchase orders
✅ Can convert to vendor bills
✅ Bills create accounting entries
✅ Payments create accounting entries
✅ Journal entries show in Journal Entries page
✅ Ledger shows transactions
✅ P&L calculates correctly
✅ Balance Sheet balances
✅ Tests pass (npm run test)

🎉 **You now have a working accounting ERP!**
