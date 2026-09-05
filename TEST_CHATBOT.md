# Quick Test Guide for AI Chatbot

## 🚀 Quick Start (5 Steps)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Get Your Groq API Key
1. Go to: https://console.groq.com/keys
2. Sign up/Login
3. Click "Create API Key"
4. Copy the key (starts with `gsk_`)

### Step 3: Add API Key to Backend
Edit `backend/.env` file:
```env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
PORT=3000
GROQ_API_KEY=gsk_YOUR_KEY_HERE
```

### Step 4: Start Backend
```bash
cd backend
npm run dev
```

You should see:
```
FinEdge-ERP Backend running on port 3000
```

### Step 5: Test the API
Open a new terminal and run:
```bash
curl -X POST http://localhost:3000/api/ai/chat -H "Content-Type: application/json" -d "{\"message\":\"Hello! What can you help me with?\"}"
```

Expected response:
```json
{
  "success": true,
  "reply": "Hello! I'm Urbie, your FinEdge-ERP AI assistant..."
}
```

---

## 🎨 Test the Frontend

### Step 1: Make sure frontend dependencies are installed
```bash
cd frontend
npm install
```

### Step 2: Start Frontend
```bash
npm run dev
```

### Step 3: Open Browser
Go to: http://localhost:5173

### Step 4: Open AI Chatbot
Look for the **AI Copilot** or **Sparkles icon** button and click it.

### Step 5: Try These Questions:
- "What can you help me with?"
- "Explain what a journal entry is"
- "How does double-entry bookkeeping work?"
- "What's the difference between debit and credit?"
- "Summarize this month's financials"

---

## ✅ Success Indicators

### Backend is Working:
- ✅ No errors in terminal
- ✅ Server running on port 3000
- ✅ `curl` command returns JSON response
- ✅ Response contains AI-generated text

### Frontend is Working:
- ✅ AI Panel opens when button clicked
- ✅ Can type messages
- ✅ AI responds with text
- ✅ No red error banners
- ✅ Typing indicator shows while loading

---

## ❌ Common Issues

### "GROQ_API_KEY is not configured"
**Fix:** Add your API key to `backend/.env` and restart backend

### "Failed to connect to AI service"
**Fix:** 
1. Check backend is running: `curl http://localhost:3000/health`
2. Check API key is valid
3. Check internet connection

### Frontend shows "Failed to load"
**Fix:**
1. Check frontend `.env` has: `VITE_API_URL=http://localhost:3000/api`
2. Restart frontend: `Ctrl+C` then `npm run dev`
3. Hard refresh browser: `Ctrl+Shift+R`

### "framer-motion" module error
**Fix:**
```bash
cd frontend
npm install
```

---

## 🧪 Advanced Testing

### Test with PowerShell (Windows)
```powershell
$body = @{
    message = "What is FinEdge ERP?"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/ai/chat" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### Test with Conversation History
```bash
curl -X POST http://localhost:3000/api/ai/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"What else can you help with?\",\"conversation\":[{\"role\":\"user\",\"content\":\"Hello\"},{\"role\":\"assistant\",\"content\":\"Hi! I'm Urbie, your AI assistant.\"}]}"
```

### Test Error Handling
```bash
# Test without message (should return 400 error)
curl -X POST http://localhost:3000/api/ai/chat ^
  -H "Content-Type: application/json" ^
  -d "{}"
```

---

## 📸 Screenshot Checklist

For hackathon demo, capture:
- [ ] AI Panel open with welcome message
- [ ] User asking a question
- [ ] AI responding with helpful answer
- [ ] Multiple messages in conversation
- [ ] Quick action buttons
- [ ] No error messages

---

## 🎤 Demo Script

1. **Open App:** "This is FinEdge ERP, our furniture business management system"

2. **Click AI Button:** "We've integrated an AI assistant called Urbie"

3. **Show Welcome:** "It greets users and offers quick actions"

4. **Ask Question:** "Let me ask: 'Explain what a journal entry is'"

5. **Show Response:** "The AI understands accounting concepts and explains them clearly"

6. **Show Conversation:** "It maintains context - I can ask follow-up questions"

7. **Show Quick Actions:** "Users can click suggestions for common tasks"

8. **Explain Security:** "The API key is secured on the backend, never exposed to the browser"

---

## 🎯 Judging Points to Highlight

✅ **Technical Implementation**
- RESTful API design
- Proper error handling
- Security best practices
- Clean code architecture

✅ **User Experience**
- Intuitive UI
- Fast responses
- Helpful suggestions
- Error messages are friendly

✅ **Innovation**
- AI integration in ERP
- Context-aware responses
- Conversation memory
- Accounting domain knowledge

✅ **Completeness**
- Full stack implementation
- Frontend + Backend
- Documentation
- Testing guide

---

## 📝 Quick Commands Reference

### Start Everything
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Stop Everything
- Press `Ctrl+C` in each terminal

### Check if Running
```bash
# Check backend
curl http://localhost:3000/health

# Check frontend
# Open http://localhost:5173 in browser
```

---

**Ready to test? Start with Step 1!** 🚀
