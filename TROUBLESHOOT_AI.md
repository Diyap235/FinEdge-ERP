# AI Chatbot Troubleshooting Guide

## 🚨 Error: "Failed to get AI response"

You're seeing this error, which means the backend is running but the Groq API call is failing.

---

## ✅ IMMEDIATE FIX

### **Step 1: Restart Backend with New Error Logging**

The code has been updated with better error logging. Restart your backend:

```bash
# In your backend terminal, press Ctrl+C to stop
# Then restart:
npm run dev
```

### **Step 2: Test Again**

```bash
curl -X POST http://localhost:3000/api/ai/chat -H "Content-Type: application/json" -d "{\"message\":\"Hello\"}"
```

### **Step 3: Check Backend Terminal**

Look at the backend terminal output. You should now see detailed error logs that tell you exactly what went wrong.

---

## 🔍 Common Error Messages & Solutions

### Error: "Invalid GROQ_API_KEY"

**Cause:** Your API key is expired, invalid, or not set correctly

**Solution:**
1. Get a new key from: https://console.groq.com/keys
2. Update `backend/.env`:
   ```env
   GROQ_API_KEY=gsk_your_new_key_here
   ```
3. Restart backend: `npm run dev`

---

### Error: "Rate limit exceeded"

**Cause:** You've made too many requests in a short time

**Solution:**
1. Wait 1-2 minutes
2. Try again
3. If on free tier, consider upgrading at console.groq.com

---

### Error: "Cannot connect to Groq API"

**Cause:** Network/internet connection issue

**Solution:**
1. Check your internet connection
2. Try opening: https://api.groq.com in browser
3. Check if any firewall is blocking the connection
4. Try using a VPN if Groq is blocked in your region

---

### Error: "Model not found"

**Cause:** The model name may have changed or is unavailable

**Solution:**
Try a different model. Edit `backend/src/services/ai.service.js` line 60:

```javascript
// Change from:
model: 'llama-3.3-70b-versatile',

// To one of these:
model: 'llama3-70b-8192',
// or
model: 'mixtral-8x7b-32768',
// or
model: 'llama3-8b-8192',
```

Then restart backend.

---

### Error: "groq-sdk not found" or "Cannot find module"

**Cause:** Groq SDK not installed

**Solution:**
```bash
cd backend
npm install groq-sdk
npm run dev
```

---

## 🧪 Test API Key Separately

Test if your API key works with a simple Node.js script:

### Create `test-groq.js` in backend folder:

```javascript
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'Say hello' }],
      max_tokens: 50,
    });
    console.log('✅ Success!');
    console.log('Response:', completion.choices[0].message.content);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);
  }
}

test();
```

### Run it:
```bash
cd backend
node test-groq.js
```

This will tell you if the issue is with your API key or the integration.

---

## 🔧 Alternative Models

If `llama-3.3-70b-versatile` doesn't work, try these models:

| Model | Speed | Quality | Use Case |
|-------|-------|---------|----------|
| `llama3-8b-8192` | ⚡ Fast | Good | Quick responses |
| `llama3-70b-8192` | Medium | Better | Balanced |
| `mixtral-8x7b-32768` | Medium | Excellent | Best quality |
| `gemma-7b-it` | ⚡ Fast | Good | Lightweight |

Change in `backend/src/services/ai.service.js`:
```javascript
model: 'YOUR_CHOSEN_MODEL',
```

---

## 📋 Checklist

Before asking for help, verify:

- [ ] Backend is running (`npm run dev` in backend folder)
- [ ] Groq SDK is installed (`npm list groq-sdk` shows version)
- [ ] API key is in `.env` file
- [ ] API key starts with `gsk_`
- [ ] No spaces around API key in `.env`
- [ ] Backend was restarted after changing `.env`
- [ ] Internet connection is working
- [ ] You can access https://api.groq.com in browser

---

## 🆘 Still Not Working?

### Check the exact error:

1. **In backend terminal**, look for the console.error output
2. **Copy the full error message**
3. **Share it** so I can help debug

### Quick diagnostic commands:

```bash
# Check if backend is running
curl http://localhost:3000/health

# Check if API key is loaded
# In backend terminal, you should NOT see this error on startup:
# "GROQ_API_KEY is not configured"

# Test with minimal request
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Hi\"}"
```

---

## 💡 Working Alternative (If Groq Still Fails)

If you can't get Groq working for the demo, you can temporarily use a mock response:

Edit `backend/src/services/ai.service.js`:

```javascript
async chat(message, conversation = []) {
  // TEMPORARY: Mock response for demo
  return `I'm Urbie, your FinEdge-ERP AI assistant. You asked: "${message}". 
  
  I can help you with:
  - Understanding financial reports
  - Explaining accounting concepts
  - Answering questions about your ERP system
  
  (Note: This is a demo response. Real AI integration coming soon!)`;
}
```

This will at least let you demo the UI and flow for the hackathon.

---

## 📞 Next Steps

1. ✅ Restart backend with new error logging
2. ✅ Try the API call again
3. ✅ Check what error message appears in backend terminal
4. ✅ Follow the specific solution for that error above

**The enhanced error logging will tell us exactly what's wrong!**
