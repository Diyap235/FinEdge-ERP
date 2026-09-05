# FinEdge-ERP Team Setup Guide

## 🚀 For New Team Members

This guide helps you set up the FinEdge-ERP project locally.

---

## STEP 1: Clone the Repository

```bash
git clone https://github.com/Diyap235/FinEdge-ERP.git
cd FinEdge-ERP
```

---

## STEP 2: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd ../frontend
npm install
```

---

## STEP 3: Environment Variables (.env)

### Important: `.env` is NOT in Git

The `.env` file is protected by `.gitignore` because it contains secrets:
- Database connection string (with password)
- Groq API key
- Other sensitive configuration

### Setup Your .env Files

#### Backend `.env` (Create this file yourself)

**Location**: `backend/.env`

```bash
# Copy from .env.example as template
cp backend/.env.example backend/.env
```

**Then edit `backend/.env` and fill in YOUR values:**

```
# Database Configuration
# Option 1: Local PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/finedge_erp"

# Option 2: Neon (Cloud PostgreSQL) - Ask team lead for connection string
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-XXXX.c-XXXX.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Environment
NODE_ENV="development"
PORT=3000

# Groq API Key (Get your own)
GROQ_API_KEY="your_groq_api_key_here"
```

#### Frontend `.env` (Create this file yourself)

**Location**: `frontend/.env`

```bash
# Copy from .env.example as template
cp frontend/.env.example frontend/.env
```

**Then edit `frontend/.env`:**

```
VITE_API_URL=http://localhost:3000/api
```

---

## STEP 4: Get Required API Keys & Credentials

### Database Connection (PostgreSQL)

**Option A: Local Setup**
```bash
# Install PostgreSQL locally
# Create database and user
createdb finedge_erp
createuser finedge_user --password
```

**Option B: Neon Cloud PostgreSQL (Recommended)**
- Ask your team lead for the `DATABASE_URL`
- Team lead will provide: `postgresql://...`
- Just paste it into your `.env`

### Groq API Key (Required for AI Features)

1. **Go to**: https://console.groq.com/
2. **Sign up** for free (takes 2 minutes)
3. **Create API key**: Settings → API Keys → Create New Key
4. **Copy the key**: `gsk_XXXXXX...`
5. **Paste into `.env`**:
   ```
   GROQ_API_KEY="gsk_XXXXXX..."
   ```

---

## STEP 5: Setup Database

### Create Tables
```bash
cd backend
npx prisma db push
```

### Seed Test Data
```bash
npx prisma db seed
```

This creates:
- 2 test users
- 2 test contacts (vendor + customer)
- 3 test products
- 7 chart of accounts
- 4 journals

---

## STEP 6: Run the Project

### Terminal 1: Backend
```bash
cd backend
npm run dev
# Backend runs at http://localhost:3000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Frontend runs at http://localhost:5173
```

### Terminal 3 (Optional): Database Viewer
```bash
cd backend
npx prisma studio
# Database viewer at http://localhost:5555
```

---

## ✅ Verify Everything Works

### Check Backend Health
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok"}
```

### Check Frontend
```
Open browser to http://localhost:5173
# Should see FinEdge-ERP dashboard
```

### Check Database
```
Open http://localhost:5555 (after running prisma studio)
# Should see all tables and seed data
```

---

## 📋 Environment Variables Reference

### Backend `.env`

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `DATABASE_URL` | ✅ Yes | `postgresql://...` | Get from team lead (Neon) or setup local |
| `NODE_ENV` | ✅ Yes | `development` | Use `development` for local testing |
| `PORT` | ✅ Yes | `3000` | Backend port |
| `GROQ_API_KEY` | ✅ Yes | `gsk_...` | Get from https://console.groq.com |

### Frontend `.env`

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `VITE_API_URL` | ✅ Yes | `http://localhost:3000/api` | Must match backend URL |

---

## 🔐 SECURITY RULES

### ✅ DO
- Keep `.env` file local only
- Never commit `.env` to git
- Never share `.env` file contents
- Share only `.env.example` (safe template)
- Use unique API keys for each developer

### ❌ DON'T
- Push `.env` to GitHub
- Share `.env` in Slack/Email
- Use same API key for everyone
- Commit secrets to git

### If You Accidentally Push `.env`
1. Tell your team lead immediately
2. Rotate all API keys
3. Delete the commit from git history

---

## 🐛 Troubleshooting

### "Cannot find DATABASE_URL"
- Solution: Create `backend/.env` file with DATABASE_URL

### "Groq API key not found"
- Solution: Get API key from https://console.groq.com and add to `.env`

### "Port 3000 already in use"
- Solution: Kill the process or change PORT in `.env`

### "Connection refused at localhost:5432"
- Solution: Start PostgreSQL or ask team lead for Neon connection string

### "Module not found: @tailwindcss/vite"
- Solution: Run `npm install` in frontend folder

### "npm ERR! Could not resolve dependency"
- Solution: Delete `node_modules` and `package-lock.json`, then run `npm install` again

---

## 📁 Project Structure

```
FinEdge-ERP/
├── backend/
│   ├── src/
│   │   ├── app.js              (Express app)
│   │   ├── routes/             (API endpoints)
│   │   └── services/           (Business logic)
│   ├── prisma/
│   │   ├── schema.prisma       (Database schema)
│   │   └── seed.js             (Test data)
│   ├── .env                    (Secrets - NOT in git)
│   ├── .env.example            (Template - in git)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/              (React pages)
│   │   ├── components/         (React components)
│   │   └── services/           (API client)
│   ├── .env                    (Not in git)
│   ├── .env.example            (Template)
│   └── package.json
├── docs/
│   ├── API.md                  (API documentation)
│   └── ACCOUNTING_RULES.md     (Business rules)
└── README.md
```

---

## 🔗 Useful Links

- **Backend API Docs**: `docs/API.md`
- **Accounting Rules**: `docs/ACCOUNTING_RULES.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Groq API**: https://console.groq.com/
- **Prisma Docs**: https://www.prisma.io/docs/
- **React Docs**: https://react.dev/
- **Express Docs**: https://expressjs.com/

---

## 👥 Team Roles

### Backend Developer (You)
- Works on `diya/backend` branch
- Handles API, services, database

### Frontend Developer (Pragati)
- Works on `frontend-pragati` branch
- Handles UI components, pages, forms

### Team Lead
- Provides Neon database connection string
- Approves pull requests
- Manages main branch

---

## 🤝 How to Coordinate

### Getting Database Connection (Neon)
1. Ask team lead for `DATABASE_URL`
2. Paste into your `backend/.env`
3. Run `npx prisma db push`
4. You're set!

### Sharing API Keys
**DO NOT share in Slack or Git:**
- ❌ Share `.env` file
- ❌ Share secrets in chat
- ❌ Commit `.env` to git

**DO share safely:**
- ✅ Teammates get their own Groq API key
- ✅ Teammates setup their own `.env`
- ✅ All `.env` files are local only

### Working Together
1. Both pull latest from `main`
2. Backend works on backend features
3. Frontend works on frontend features
4. Create pull requests
5. Team lead reviews and merges

---

## ✅ Initial Setup Checklist

- [ ] Clone repository
- [ ] Run `npm install` in both backend and frontend
- [ ] Copy `.env.example` to `.env` (backend)
- [ ] Copy `.env.example` to `.env` (frontend)
- [ ] Get Groq API key (https://console.groq.com/)
- [ ] Get database connection from team lead
- [ ] Fill in `.env` files with your values
- [ ] Run `npx prisma db push` (backend)
- [ ] Run `npx prisma db seed` (backend)
- [ ] Run `npm run dev` in backend
- [ ] Run `npm run dev` in frontend
- [ ] Verify at http://localhost:5173
- [ ] Run `npx prisma studio` (optional)

---

## 🎉 You're Ready!

Once everything is set up:
- Backend running at http://localhost:3000
- Frontend running at http://localhost:5173
- Database has test data
- You can start developing!

---

## 📞 Questions?

- API issues? Check `docs/API.md`
- Setup issues? Check Troubleshooting section
- Need help? Ask your team lead

**Happy coding!** 🚀
