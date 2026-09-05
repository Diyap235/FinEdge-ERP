# 👥 FOR TEAM MEMBERS - Setup & Environment Variables

## TL;DR - Quick Answer

**Q: Why can't I pull `.env` file?**  
A: Because `.env` contains secrets (database password, API keys) that shouldn't be in Git.

**Q: How do I set it up?**  
A: Copy `.env.example` to `.env` and fill in your own values.

**Q: What values do I need?**  
A: Just 4 things:
1. **DATABASE_URL** - Ask team lead (Neon connection string)
2. **GROQ_API_KEY** - Get your own from https://console.groq.com/
3. **NODE_ENV** - Set to `development`
4. **PORT** - Use `3000`

---

## 📋 Complete Setup Instructions

### Step 1: Create Backend `.env`

```bash
# Go to backend folder
cd backend

# Copy template to actual env file
cp .env.example .env

# Open in your editor
# Edit backend/.env
```

**Fill in these values:**

```dotenv
# Get DATABASE_URL from team lead (Neon connection string)
DATABASE_URL="postgresql://..."

# Keep these same
NODE_ENV="development"
PORT=3000

# Get your own GROQ_API_KEY from https://console.groq.com/
GROQ_API_KEY="gsk_..."
```

### Step 2: Create Frontend `.env`

```bash
# Go to frontend folder
cd ../frontend

# Copy template
cp .env.example .env
```

**Content:**
```dotenv
VITE_API_URL=http://localhost:3000/api
```

### Step 3: Get Your Own Groq API Key

1. Go to: https://console.groq.com/
2. Click "Sign Up" or "Login"
3. Go to "API Keys"
4. Click "Create New Key"
5. Copy the key (looks like: `gsk_XXXXXXXXXXXX`)
6. Paste into your `backend/.env`

---

## 🔐 Important Security Rules

### ✅ DO
- Keep `.env` file on your computer only
- Never commit `.env` to Git
- Get your own API key (don't share the same key)
- Share `.env.example` (it's safe - no secrets)

### ❌ DON'T
- Push `.env` to GitHub
- Send `.env` in Slack, email, or chat
- Use someone else's `.env`
- Hardcode secrets in code

### If You Accidentally Commit `.env`
1. Tell the team immediately
2. We'll rotate all keys
3. Delete the commit from history

---

## 📁 File Guide

| File | In Git? | What It Is | What To Do |
|------|---------|-----------|-----------|
| `.env.example` | ✅ YES | Template with placeholders | Read it, copy to `.env` |
| `.env` | ❌ NO | Your actual secrets | Create it, don't commit |
| `backend/.env` | ❌ NO | Backend secrets | Create it yourself |
| `frontend/.env` | ❌ NO | Frontend config | Create it yourself |

---

## 🎯 Environment Variables Explained

### Backend `.env` Variables

```dotenv
# DATABASE_URL - How to connect to database
# Ask team lead for the value
# Example: postgresql://user:pass@host/db
DATABASE_URL="postgresql://..."

# NODE_ENV - Environment type
# Use "development" for local testing
NODE_ENV="development"

# PORT - What port backend runs on
# Usually 3000
PORT=3000

# GROQ_API_KEY - Your Groq AI API key
# Get from https://console.groq.com/ (free signup)
GROQ_API_KEY="gsk_..."
```

### Frontend `.env` Variables

```dotenv
# VITE_API_URL - Where backend API is
# Usually http://localhost:3000/api (if running locally)
VITE_API_URL=http://localhost:3000/api
```

---

## 🔗 How to Get Each Variable

### DATABASE_URL
```
👤 Ask: Team lead
📍 Get from: Neon console (https://console.neon.tech/)
📋 Format: postgresql://user:password@host/database
💾 Store in: backend/.env
```

### GROQ_API_KEY
```
👤 You get your own (don't share)
📍 Get from: https://console.groq.com/
📋 Format: gsk_XXXXXXXXXXXXXXXX
💾 Store in: backend/.env
⏱️ Takes: 2 minutes to setup
```

### NODE_ENV
```
🎯 Always: "development"
💾 Store in: backend/.env
```

### PORT
```
🎯 Usually: 3000
💾 Store in: backend/.env
```

### VITE_API_URL
```
🎯 Usually: http://localhost:3000/api
💾 Store in: frontend/.env
```

---

## ✅ Setup Verification

After creating your `.env` files:

```bash
# Backend
cd backend
npm install                    # Should work
npx prisma db push            # Should work
npx prisma db seed            # Should work
npm run dev                    # Should start on port 3000

# Frontend  
cd ../frontend
npm install                    # Should work
npm run dev                    # Should start on port 5173
```

Then open: http://localhost:5173

If it works, you're done! ✅

---

## 🐛 Common Issues

### "Cannot find module 'DATABASE_URL'"
**Problem**: `.env` file not created  
**Fix**: Create `backend/.env` and fill in values

### "GROQ API key not found"
**Problem**: `GROQ_API_KEY` not in `.env`  
**Fix**: Get key from https://console.groq.com/ and add to `.env`

### "Port 3000 already in use"
**Problem**: Something else is using port 3000  
**Fix**: Change `PORT=3000` to `PORT=3001` in `.env`

### "connection refused"
**Problem**: Database not accessible  
**Fix**: Ask team lead for correct `DATABASE_URL`

### "npm ERR! Could not resolve dependency"
**Problem**: Dependencies not installed  
**Fix**: Run `npm install` again

---

## 📞 Who To Ask

| Question | Ask |
|----------|-----|
| Where do I get DATABASE_URL? | Team lead |
| How do I get GROQ_API_KEY? | Follow setup in this guide |
| Database not connecting | Team lead |
| Frontend not working | Check `.env` is correct |
| Backend not starting | Check PORT not in use |

---

## 🎊 You're Done!

Once your `.env` files are set up:

✅ Backend runs at http://localhost:3000  
✅ Frontend runs at http://localhost:5173  
✅ Database is connected  
✅ API keys are working  
✅ You're ready to develop!

---

## 📚 Next Steps

- Read `docs/API.md` - API documentation
- Read `TEAM_SETUP_GUIDE.md` - Detailed setup guide
- Read `BACKEND_READY.md` - Backend integration guide
- Start coding! 🚀

---

**Questions? Ask your team lead or check TEAM_SETUP_GUIDE.md**
