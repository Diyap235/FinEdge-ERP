# 🚀 START HERE - FinEdge-ERP

## ⚡ FASTEST WAY TO START

### **Just Double-Click This File:**
```
START_ALL.bat
```

**That's it!** Everything will start automatically.

---

## 📋 What Happens When You Run START_ALL.bat:

1. ✅ Kills any process using port 3000
2. ✅ Starts Backend server (port 3000)
3. ✅ Starts Frontend app (port 5173)
4. ✅ Waits for services to initialize
5. ✅ Opens browser automatically

**Two terminal windows will open - DON'T CLOSE THEM!**

---

## 🎯 Expected Result:

After 10-15 seconds, your browser opens to:
```
http://localhost:5173
```

You should see the **FinEdge-ERP Dashboard**

---

## ❌ If You See "Can't Reach This Page"

### **Quick Fix:**

1. Look at the **Backend window** (black terminal)
2. You should see: **"FinEdge-ERP Backend running on port 3000"**
3. If you see an error instead, close both windows
4. Double-click `KILL_PORT_3000.bat`
5. Try `START_ALL.bat` again

---

## 🔄 Alternative: Manual Start

If the automatic script doesn't work:

### **Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

### **Terminal 2 - Frontend:**
```bash
cd frontend  
npm run dev
```

Then open: http://localhost:5173

---

## 📊 Add Demo Data (200+ Entries)

**After backend is running:**

Double-click: `SEED_DATABASE.bat`

This adds:
- 200 Contacts
- 200 Products  
- 200 Purchase Orders
- 200 Sales Orders
- ~150 Bills & Invoices
- ~150 Payments

**Takes 5-10 minutes**

---

## ✅ Quick Health Check

Open these URLs after starting:

1. **Backend Health:** http://localhost:3000/health
   - Should show: `{"status":"ok"}`

2. **Frontend:** http://localhost:5173
   - Should show: FinEdge-ERP Dashboard

---

## 🆘 Common Issues

### **Port 3000 Already in Use**
- Double-click: `KILL_PORT_3000.bat`
- Wait 2 seconds
- Try starting again

### **"The system cannot find the path"**
- Make sure you're in the project folder
- Right-click START_ALL.bat → Run as Administrator

### **Backend starts but frontend won't**
- Check if port 5173 is free
- Open terminal manually and run:
  ```bash
  cd frontend
  npm run dev
  ```

---

## 📝 Test Accounts (After Seeding)

- **Admin:** admin@finedge.com
- **Accountant:** accountant@finedge.com  
- **Sales:** sales@finedge.com
- **Purchase:** purchase@finedge.com

---

## 🎉 You're Ready!

1. Double-click `START_ALL.bat`
2. Wait 15 seconds
3. Browser opens automatically
4. Start testing!

For evaluation with lots of data:
- Also run `SEED_DATABASE.bat`

---

## 📚 More Help

- **Full Guide:** See `QUICK_START.md`
- **Seed Guide:** See `BULK_SEED_GUIDE.md`
- **Check Setup:** Run `CHECK_SETUP.bat`

---

**Happy Testing! 🚀**
