# 🔐 Authentication Setup Guide - FinEdge ERP

## Overview

FinEdge ERP now includes a complete JWT-based authentication system with the following features:

- ✅ User registration and login
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Token refresh mechanism
- ✅ Role-based access control (admin, accountant, contact)
- ✅ Password change functionality
- ✅ Protected routes on frontend
- ✅ Secure API endpoints

## 🚀 Quick Start

### 1. Database Migration

Add password field to existing users:

```bash
cd backend
npx prisma migrate dev --name add_user_password
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Create Admin User

```bash
node scripts/create-admin.js
```

This creates an admin user with:
- **Email**: admin@finedge.com
- **Password**: Password@123
- **Role**: admin

### 4. Update Existing Users (Optional)

If you have existing users without passwords:

```bash
node scripts/update-user-passwords.js
```

This sets default password `Password@123` for all existing users.

## 🔑 Environment Variables

The `.env` file has been updated with a secure JWT secret:

```env
JWT_SECRET=8f62ef1a062bc3724b89a4076699b284e2f0f11a0235a2c4478cbf95a61568d43a21780e4f2986c2191df4351dc3f0a77d71b843999146a5bd9e2a2745575755
```

**⚠️ Important**: This is a cryptographically secure 128-character secret. Never commit this to public repositories!

### Generate New Secret (if needed)

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

#### 1. Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "accountant"
}
```

**Response**:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "accountant"
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@finedge.com",
  "password": "Password@123"
}
```

**Response**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@finedge.com",
    "role": "admin"
  }
}
```

#### 3. Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response**:
```json
{
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@finedge.com",
    "role": "admin",
    "createdAt": "2026-09-05T10:00:00.000Z"
  }
}
```

#### 4. Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "Password@123",
  "newPassword": "NewSecurePass456"
}
```

#### 5. Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <token>
```

## 🛡️ Middleware Usage

### Protect Routes

```javascript
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

// Require authentication
router.get('/protected', authMiddleware, (req, res) => {
  // req.user contains: { userId, email, role, name }
  res.json({ user: req.user });
});

// Require specific role
router.post('/admin-only', 
  authMiddleware, 
  roleMiddleware('admin'), 
  (req, res) => {
    res.json({ message: 'Admin access granted' });
  }
);

// Multiple allowed roles
router.get('/financial-data',
  authMiddleware,
  roleMiddleware('admin', 'accountant'),
  (req, res) => {
    res.json({ data: 'Financial data' });
  }
);
```

## 🎨 Frontend Integration

### 1. Wrap App with AuthProvider

```jsx
// main.jsx
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

### 2. Use Protected Routes

```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
```

### 3. Use Auth Hook

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    const result = await login('admin@finedge.com', 'Password@123');
    if (result.success) {
      console.log('Logged in!', result.user);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

## 🔒 Security Best Practices

### Implemented:
- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ Secure, randomly generated JWT secret (128 chars)
- ✅ Token validation on every protected request
- ✅ Automatic logout on token expiration
- ✅ Password minimum length (6 characters)
- ✅ Email validation
- ✅ Role-based access control

### Recommendations:
- Change default admin password immediately
- Use HTTPS in production
- Set shorter token expiration in production
- Implement rate limiting for auth endpoints
- Add refresh token rotation
- Enable CORS only for trusted domains
- Log authentication attempts
- Implement account lockout after failed attempts

## 🧪 Testing Authentication

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finedge.com","password":"Password@123"}'
```

**Access Protected Route:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Thunder Client / Postman

1. Login to get token
2. Copy token from response
3. Add header: `Authorization: Bearer YOUR_TOKEN`
4. Test protected endpoints

## 📁 File Structure

```
backend/
├── src/
│   ├── middleware/
│   │   └── auth.js                 # Auth & role middleware
│   ├── routes/
│   │   └── auth.routes.js          # Auth endpoints
│   └── app.js                      # Updated with auth routes
├── scripts/
│   ├── create-admin.js             # Create admin user
│   └── update-user-passwords.js    # Update existing users
├── prisma/
│   ├── schema.prisma               # Updated with password field
│   └── migrations/
│       └── 20260905120000_add_user_password/
│           └── migration.sql       # Password field migration
└── .env                            # JWT secret

frontend/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx         # Auth state management
│   ├── components/
│   │   └── ProtectedRoute.jsx      # Route protection
│   ├── pages/
│   │   └── LoginPage.jsx           # Login UI
│   ├── utils/
│   │   └── auth.js                 # Auth utilities
│   └── services/
│       └── api.js                  # Updated with auth interceptors
```

## 🎯 Next Steps

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Login with default credentials:**
   - Email: `admin@finedge.com`
   - Password: `Password@123`

4. **Change password** after first login

5. **Create additional users** as needed with different roles

## ❓ Troubleshooting

### "Invalid token" error
- Token may have expired (7 days)
- Login again to get a new token

### "User not found" after login
- Run migrations: `npx prisma migrate dev`
- Create admin: `node scripts/create-admin.js`

### CORS errors
- Check frontend is using correct API_URL
- Ensure backend CORS is configured properly

### Password won't accept
- Minimum 6 characters required
- Check for special characters if validation added

## 📞 Support

For issues or questions about authentication:
1. Check this guide first
2. Review error messages in console
3. Check backend logs
4. Verify JWT_SECRET is set in .env

---

**🎉 Authentication is now fully configured and ready to use!**
