# 📊 Bulk Seed Data - 200+ Entries Per Entity

This guide will help you populate your FinEdge-ERP database with **200+ realistic entries** for evaluation and testing purposes.

---

## 🚀 Quick Start

### **Step 1: Navigate to Backend**
```bash
cd backend
```

### **Step 2: Run Bulk Seed Script**
```bash
npm run seed:bulk
```

**This will create:**
- ✅ 4 Users (Admin, Accountant, Sales, Purchase)
- ✅ 200 Contacts (100 Customers + 100 Vendors)
- ✅ 200 Products (Various furniture items)
- ✅ 200 Purchase Orders (with random line items)
- ✅ ~150 Vendor Bills (converted from confirmed POs)
- ✅ 200 Sales Orders (with random line items)
- ✅ ~150 Customer Invoices (generated from confirmed SOs)
- ✅ ~150 Payments (mix of full & partial payments, cash & bank)
- ✅ Master data (Accounts, Journals, Opening Capital)

---

## ⏱️ Estimated Time

- **Initial Seed:** ~5-10 minutes (depending on system performance)
- **Re-running:** Safe to run multiple times (skips existing data)

---

## 📋 What Gets Created

### **1. Master Data**

#### Users (4):
- admin@finedge.com (Admin)
- accountant@finedge.com (Accountant)
- sales@finedge.com (Accountant role)
- purchase@finedge.com (Accountant role)

#### Accounts (7):
- Bank (Asset)
- Cash (Asset)
- Creditors (Liability)
- Debtors (Asset)
- Owner Capital (Capital)
- Purchase Expense (Expense)
- Sales Income (Income)

#### Journals (4):
- Bank Journal
- Cash Journal
- Purchase Journal
- Sales Journal

#### Opening Capital:
- ₹500,000 in Bank account

---

### **2. Contacts (200)**

#### Customers (100):
- Random Indian names (e.g., "Arjun Sharma", "Priya Patel")
- Unique emails (e.g., arjun.sharma42@example.com)
- Mobile numbers (+91-9000000XXX)

#### Vendors (100):
- Company names (e.g., "Azure Furniture", "Royal Interiors")
- Business emails (e.g., info@azurefurniture.com)
- Mobile numbers (+91-8000000XXX)

---

### **3. Products (200)**

**Categories:**
- Seating (chairs, sofas, bean bags)
- Tables (dining, coffee, office desks)
- Storage (wardrobes, bookshelves, cabinets)
- Beds (king, queen, single, bunk)
- Office Furniture
- Living Room
- Dining Room

**Sample Products:**
- Office Chair - Variant 1
- Executive Chair - Variant 2
- Dining Table - Variant 3
- King Size Bed - Variant 4
- Wardrobe - Variant 5
- ... (195 more)

**Pricing:**
- Cost: ₹1,000 - ₹50,000
- Sales Price: 30-100% markup over cost
- Realistic Indian furniture pricing

---

### **4. Purchase Orders (200)**

**Details:**
- Random vendors from 100 vendors
- 1-5 line items per order
- Random quantities (1-20 units)
- Prices vary ±10% from product cost
- **70% Confirmed** (ready for billing)
- **30% Draft** (not yet confirmed)

**Example:**
```
PO #42
Vendor: Azure Furniture
Items:
  - Office Chair x 5 @ ₹2,850 = ₹14,250
  - Dining Table x 2 @ ₹7,200 = ₹14,400
Total: ₹28,650
Status: CONFIRMED
```

---

### **5. Vendor Bills (~150)**

**Created from confirmed Purchase Orders:**
- Automatically converted from CONFIRMED status POs
- Journal entries created (Debit: Purchase Expense, Credit: Creditors)
- **50% Paid** (full or partial payments)
- **50% Unpaid** (outstanding bills)

**Payment Types:**
- Bank transfers
- Cash payments
- Mix of full and partial payments (30-100% of total)

---

### **6. Sales Orders (200)**

**Details:**
- Random customers from 100 customers
- 1-5 line items per order
- Random quantities (1-15 units)
- Prices vary ±5% from product sales price
- GST included (0%, 5%, 12%, or 18%)
- **70% Confirmed** (ready for invoicing)
- **30% Draft** (not yet confirmed)

**Example:**
```
SO #78
Customer: Priya Patel
Items:
  - Sofa Set x 1 @ ₹14,800 + 18% GST = ₹17,464
  - Coffee Table x 1 @ ₹3,200 + 18% GST = ₹3,776
Total: ₹21,240
Status: CONFIRMED
```

---

### **7. Customer Invoices (~150)**

**Generated from confirmed Sales Orders:**
- Automatically generated from CONFIRMED status SOs
- Journal entries created (Debit: Debtors, Credit: Sales Income)
- **50% Paid** (full or partial payments received)
- **50% Unpaid** (outstanding invoices)

**Payment Types:**
- Bank transfers
- Cash payments
- Mix of full and partial payments (40-100% of total)

---

### **8. Payments (~150)**

**Vendor Payments:**
- Recorded against Vendor Bills
- Debit: Creditors, Credit: Bank/Cash
- Updates bill status to PAID when fully paid

**Customer Payments:**
- Received against Customer Invoices
- Debit: Bank/Cash, Credit: Debtors
- Updates invoice status to PAID when fully paid

---

## 🔍 Verification

After running the seed, check the summary output:

```
============================================================
📊 DATABASE SUMMARY
============================================================
👤 Users:              4
👥 Contacts:           200
📦 Products:           200
💼 Accounts:           7
📖 Journals:           4
🛒 Purchase Orders:    200
💰 Vendor Bills:       ~150
🛍️  Sales Orders:       200
📄 Customer Invoices:  ~150
💳 Payments:           ~150
📝 Journal Entries:    ~300+
============================================================
✅ BULK SEED COMPLETE!
============================================================
```

---

## 🌐 Testing in Frontend

### **1. Start Backend**
```bash
cd backend
npm run dev
```

### **2. Start Frontend**
```bash
cd frontend
npm run dev
```

### **3. Access Application**
Open http://localhost:5173

### **4. Test Login**
- **Admin:** admin@finedge.com
- **Accountant:** accountant@finedge.com
- **Sales:** sales@finedge.com
- **Purchase:** purchase@finedge.com

---

## 📈 What You Can Test

### **Dashboard**
- ✅ Revenue charts with 150+ sales
- ✅ Expense charts with 150+ purchases
- ✅ Top customers list
- ✅ Recent activity feed
- ✅ Financial overview

### **Contacts**
- ✅ 200 contacts in list view
- ✅ Search and filter
- ✅ Customer vs Vendor separation

### **Products**
- ✅ 200 products catalog
- ✅ Different categories
- ✅ Pricing display

### **Purchase Orders**
- ✅ 200 purchase orders
- ✅ Multiple statuses (DRAFT, CONFIRMED, BILLED)
- ✅ Multi-line orders
- ✅ Convert to Vendor Bills

### **Vendor Bills**
- ✅ ~150 vendor bills
- ✅ Payment recording
- ✅ Outstanding amount calculation
- ✅ Partial payments
- ✅ Status updates (POSTED → PAID)

### **Sales Orders**
- ✅ 200 sales orders
- ✅ Multiple statuses (DRAFT, CONFIRMED, INVOICED)
- ✅ GST calculations
- ✅ Generate invoices

### **Customer Invoices**
- ✅ ~150 customer invoices
- ✅ Payment collection
- ✅ Outstanding tracking
- ✅ Partial payments

### **Payments**
- ✅ ~150 payment records
- ✅ Bank vs Cash
- ✅ Linked to bills/invoices

### **Reports**
- ✅ Profit & Loss statement
- ✅ Balance Sheet
- ✅ Account balances
- ✅ Ledger entries
- ✅ Dashboard summary

---

## 🔧 Troubleshooting

### **Error: Port 3000 already in use**
```bash
# Kill the process
taskkill /F /PID <PID>

# Or change port in backend/.env
PORT=3001
```

### **Error: Database connection failed**
Check `backend/.env`:
```
DATABASE_URL="your_postgres_connection_string"
```

### **Seed runs but creates fewer entries**
- Some orders may fail validation (expected behavior)
- Check console output for specific errors
- Final count should still be close to 200 per entity

### **Want to reset and re-seed?**
```bash
# Reset database
cd backend
npx prisma migrate reset --force

# Run migrations
npx prisma migrate deploy

# Run bulk seed
npm run seed:bulk
```

---

## 🎯 Performance Tips

### **During Seeding:**
- Close unnecessary applications
- Don't interrupt the process
- Watch console for progress updates

### **After Seeding:**
- Backend may take 2-3 seconds to start (loading data)
- Frontend pagination handles 200+ entries smoothly
- Reports may take 1-2 seconds to generate

---

## 📊 Database Size

**Expected after bulk seed:**
- **Total Records:** ~1,200+
- **Database Size:** ~5-10 MB (PostgreSQL)
- **Seed File:** backend/prisma/seed-bulk.js

---

## 🎉 Benefits for Evaluation

1. **Realistic Data Volume** - Tests performance with production-like data
2. **Variety** - Multiple products, customers, vendors, transactions
3. **Complete Workflows** - PO → Bill → Payment, SO → Invoice → Payment
4. **Accounting Accuracy** - All journal entries balanced
5. **Search & Filter Testing** - Enough data to test pagination, search
6. **Report Generation** - Meaningful P&L, Balance Sheet
7. **UI/UX Testing** - Tables, lists, charts with real volume

---

## 🔄 Re-running the Seed

**Safe to run multiple times!**
- Skips existing users, accounts, journals
- Creates new transactions each time
- Checks for duplicates before creating

**To add more data:**
```bash
npm run seed:bulk
```

Will add:
- 200 more purchase orders
- 200 more sales orders
- Additional bills, invoices, payments

---

## 📝 Notes

- **Idempotent:** Safe to run multiple times
- **Fast:** Batch operations for performance
- **Realistic:** Indian names, companies, pricing
- **Balanced:** Proper double-entry accounting
- **Varied:** Mix of paid/unpaid, full/partial payments

---

## ✅ Success Checklist

After running bulk seed, verify:

- [ ] 200 contacts visible in Contacts page
- [ ] 200 products visible in Products page
- [ ] 200+ purchase orders in Purchase Orders page
- [ ] 150+ vendor bills in Vendor Bills page
- [ ] 200+ sales orders in Sales Orders page
- [ ] 150+ customer invoices in Customer Invoices page
- [ ] 150+ payments in Payments page
- [ ] Dashboard shows revenue/expense charts
- [ ] Reports generate successfully
- [ ] All journal entries balanced

---

**🎊 Ready for Evaluation!**

Your FinEdge-ERP system is now populated with comprehensive test data for demonstration and evaluation purposes.
