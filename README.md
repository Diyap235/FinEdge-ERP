# FinEdge-ERP - AI-Powered Accounting System

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)](https://neon.tech/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-brightgreen)](https://www.prisma.io/)

**A modern, AI-powered ERP system for furniture businesses with intelligent invoice scanning, comprehensive accounting, and beautiful UI.**

---

## 🚀 Quick Start (30 Seconds)

### **1. Start Everything**
```bash
# Just double-click this file:
START_ALL.bat
```

### **2. Add Demo Data (Optional)**
```bash
# Double-click this for 200+ demo entries:
SEED_DATABASE.bat
```

### **3. Open Browser**
```
http://localhost:5173
```

**That's it! You're running! 🎉**

---

## ✨ Features

### **📊 Comprehensive Accounting**
- Double-entry bookkeeping
- Chart of accounts
- Journal entries
- Financial reports (P&L, Balance Sheet)
- Account ledger

### **🛒 Purchase Management**
- Purchase orders
- Vendor bills
- Vendor payments
- Purchase expense tracking

### **🛍️ Sales Management**
- Sales orders
- Customer invoices
- Customer payments
- Sales income tracking

### **🤖 AI-Powered Features**
- **Invoice OCR:** Scan and extract invoice data automatically
- **AI Chatbot:** Ask questions about your business
- **Smart Insights:** AI-generated financial insights

### **💰 Payment Processing**
- Bank payments
- Cash payments
- Partial payments
- Outstanding tracking
- Auto-calculation

### **📈 Reports & Analytics**
- Dashboard with charts
- Profit & Loss statement
- Balance Sheet
- Account balances
- Ledger reports
- Revenue/Expense trends

### **👥 User Management**
- Role-based access (Admin, Accountant, User)
- Multi-user support
- Audit trail

### **🎨 Beautiful UI**
- Day/Night mode
- Responsive design
- Smooth animations
- Toast notifications
- Real-time updates

---

## 🏗️ Tech Stack

### **Backend**
- **Runtime:** Node.js 22.x
- **Framework:** Express.js
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **AI:** Groq API (LLaMA models)
- **OCR:** Tesseract.js + PDF Parse

### **Frontend**
- **Framework:** React 18.x
- **Build Tool:** Vite
- **Routing:** React Router
- **Animations:** Framer Motion
- **Notifications:** React Hot Toast
- **Charts:** Recharts
- **Icons:** Lucide React

---

## 📂 Project Structure

```
FinEdge-ERP/
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── app.js             # Main server
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   └── lib/               # Utilities
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── seed.js            # Basic seed
│   │   └── seed-bulk.js       # 200+ entries seed
│   ├── .env                   # Environment config
│   └── package.json
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── services/          # API client
│   │   └── assets/            # Images, styles
│   ├── .env                   # Frontend config
│   └── package.json
│
├── docs/                       # Documentation
│   ├── ACCOUNTING_RULES.md
│   └── ARCHITECTURE.md
│
├── START_ALL.bat              # 🚀 Start everything
├── START_BACKEND.bat          # Start backend only
├── START_FRONTEND.bat         # Start frontend only
├── SEED_DATABASE.bat          # Add 200+ demo entries
├── KILL_PORT_3000.bat         # Kill port 3000
├── CHECK_SETUP.bat            # Verify setup
│
├── START_HERE.md              # 👈 Quick start guide
├── QUICK_START.md             # Detailed instructions
├── BULK_SEED_GUIDE.md         # Seeding guide
└── README.md                  # This file
```

---

## 📦 Installation

### **Prerequisites**
- Node.js 22.x or higher
- npm or yarn
- PostgreSQL database (or Neon account)

### **Setup**

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/FinEdge-ERP.git
   cd FinEdge-ERP
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment**
   ```bash
   # Backend
   cd ../backend
   cp .env.example .env
   # Edit .env with your database URL and API keys

   # Frontend
   cd ../frontend
   cp .env.example .env
   # Edit .env if needed (defaults work for local dev)
   ```

5. **Setup database**
   ```bash
   cd ../backend
   npx prisma migrate deploy
   npm run seed
   ```

6. **Start services**
   ```bash
   # Use the batch file (Windows):
   START_ALL.bat

   # Or manually:
   # Terminal 1:
   cd backend && npm run dev

   # Terminal 2:
   cd frontend && npm run dev
   ```

---

## 🎯 Usage

### **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Health Check: http://localhost:3000/health

### **Test Accounts**
```
Admin:      admin@finedge.com
Accountant: accountant@finedge.com
Sales:      sales@finedge.com
Purchase:   purchase@finedge.com
```

### **Add Demo Data**
```bash
# Windows:
SEED_DATABASE.bat

# Or manually:
cd backend
npm run seed:bulk
```

This creates:
- 200 Contacts (100 customers + 100 vendors)
- 200 Products
- 200 Purchase Orders
- 200 Sales Orders
- ~150 Vendor Bills with payments
- ~150 Customer Invoices with payments
- 300+ Journal Entries

---

## 🧪 Testing

### **Run Tests**
```bash
cd backend
npm test
```

### **Test Coverage**
```bash
npm run test:coverage
```

---

## 📊 Database

### **Schema**
See `backend/prisma/schema.prisma`

**Main Entities:**
- Users
- Contacts (Customers/Vendors)
- Products
- Accounts (Chart of Accounts)
- Journals
- Purchase Orders
- Vendor Bills
- Sales Orders
- Customer Invoices
- Payments
- Journal Entries

### **Migrations**
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

### **Seed Data**
```bash
# Basic seed (5-10 entries per entity)
npm run seed

# Bulk seed (200+ entries per entity)
npm run seed:bulk
```

---

## 🤖 AI Features

### **Invoice OCR**
- Upload PDF or image invoices
- AI extracts: vendor, date, items, amounts
- Powered by Groq LLaMA models
- One-click confirmation

### **AI Chatbot**
- Ask questions about your business
- Financial insights
- Context-aware responses
- Conversational interface

---

## 🔧 Configuration

### **Backend (.env)**
```env
DATABASE_URL="postgresql://user:pass@host/database"
PORT=3000
GROQ_API_KEY="your_groq_api_key"
GROQ_MODEL="openai/gpt-oss-120b"
JWT_SECRET="your_jwt_secret"
NODE_ENV="development"
```

### **Frontend (.env)**
```env
VITE_API_URL="http://localhost:3000/api"
```

---

## 📈 API Documentation

### **Base URL**
```
http://localhost:3000/api
```

### **Endpoints**

#### **Users**
- `GET /users` - List all users
- `POST /users` - Create user
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### **Contacts**
- `GET /contacts` - List all contacts
- `POST /contacts` - Create contact
- `GET /contacts/:id` - Get contact
- `PUT /contacts/:id` - Update contact
- `DELETE /contacts/:id` - Delete contact

#### **Products**
- `GET /products` - List all products
- `POST /products` - Create product
- `GET /products/:id` - Get product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

#### **Purchase Orders**
- `GET /purchase-orders` - List all POs
- `POST /purchase-orders` - Create PO
- `GET /purchase-orders/:id` - Get PO
- `POST /purchase-orders/:id/confirm` - Confirm PO
- `POST /purchase-orders/:id/convert-to-bill` - Convert to bill

#### **Vendor Bills**
- `GET /vendor-bills` - List all bills
- `GET /vendor-bills/:id` - Get bill
- `POST /vendor-bills/:id/pay` - Record payment

#### **Sales Orders**
- `GET /sales-orders` - List all SOs
- `POST /sales-orders` - Create SO
- `GET /sales-orders/:id` - Get SO
- `POST /sales-orders/:id/confirm` - Confirm SO
- `POST /sales-orders/:id/generate-invoice` - Generate invoice

#### **Customer Invoices**
- `GET /customer-invoices` - List all invoices
- `GET /customer-invoices/:id` - Get invoice
- `POST /customer-invoices/:id/pay` - Receive payment

#### **Reports**
- `GET /reports/dashboard/summary` - Dashboard data
- `GET /reports/profit-loss` - P&L statement
- `GET /reports/balance-sheet` - Balance sheet
- `GET /reports/ledger?accountId=X` - Account ledger
- `GET /reports/account-balances` - All account balances

#### **AI**
- `POST /ai/chat` - Chat with AI assistant
- `POST /ocr/process` - Process invoice OCR
- `POST /ocr/confirm` - Confirm and create bill

---

## 🛠️ Troubleshooting

### **Port 3000 Already in Use**
```bash
# Windows:
KILL_PORT_3000.bat

# Or manually:
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

### **Database Connection Error**
- Check DATABASE_URL in backend/.env
- Verify PostgreSQL is running
- Check network connectivity

### **Frontend Can't Connect to Backend**
- Ensure backend is running (should show "Backend running on port 3000")
- Check http://localhost:3000/health
- Verify VITE_API_URL in frontend/.env

### **OCR Not Working**
- Check GROQ_API_KEY in backend/.env
- Verify API key is valid
- Check console for error messages

---

## 📝 Development

### **Backend Development**
```bash
cd backend
npm run dev  # Auto-restart on changes
```

### **Frontend Development**
```bash
cd frontend
npm run dev  # Hot reload enabled
```

### **Database Changes**
```bash
# 1. Update schema.prisma
# 2. Create migration
npx prisma migrate dev --name your_migration_name

# 3. Generate Prisma Client
npx prisma generate
```

---

## 🚀 Deployment

### **Backend Deployment**
1. Set environment variables
2. Run migrations: `npx prisma migrate deploy`
3. Start server: `npm start`

### **Frontend Deployment**
1. Build: `npm run build`
2. Deploy `dist/` folder to hosting service

### **Recommended Platforms**
- **Backend:** Railway, Render, Heroku
- **Frontend:** Vercel, Netlify, Cloudflare Pages
- **Database:** Neon, Supabase, Railway

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Author

**Ishita Prajapati**
- GitHub: [@IshitaPrajapati08](https://github.com/IshitaPrajapati08)

---

## 🙏 Acknowledgments

- Groq for AI API
- Neon for PostgreSQL hosting
- Prisma for ORM
- React team for the framework
- All open-source contributors

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Run `CHECK_SETUP.bat` to verify configuration

---

## 🎉 Start Building!

```bash
# Just run this:
START_ALL.bat
```

**Happy Coding! 🚀**
