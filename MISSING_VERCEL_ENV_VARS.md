# Missing Environment Variables in Vercel

## ❌ Critical Variables You Need to Add

Based on your current Vercel environment variables, you're missing these **CRITICAL** variables:

### 1. **MONGODB_URI** (CRITICAL - Database Connection)
```
Key: MONGODB_URI
Value: mongodb+srv://resilinked_db_admin:dDJwBzfpJvaBUQqt@resilinked.bddvynh.mongodb.net/ResiLinked?retryWrites=true&w=majority
Environment: All Environments
```

Without this, your backend **cannot connect to the database** and will fail completely.

### 2. **JWT_SECRET** (CRITICAL - Authentication)
```
Key: JWT_SECRET
Value: shd72shd8shd28hsd72js8shd
Environment: All Environments
```

Without this, user authentication and login **will not work**.

### 3. **CORS_ORIGIN** (Important - Frontend Connection)
```
Key: CORS_ORIGIN
Value: https://resi-frontend.vercel.app,https://resilinked.vercel.app
Environment: All Environments
```

This is needed for proper CORS handling (you have CLIENT_URL but also need CORS_ORIGIN).

### 4. **NODE_ENV** (Recommended)
```
Key: NODE_ENV
Value: production
Environment: Production only
```

This helps the backend know it's running in production mode.

---

## ✅ Steps to Add Missing Variables

1. Go to: https://vercel.com/dashboard
2. Select your `resi-backend` project
3. Click **Settings** → **Environment Variables**
4. Click **"Add New Variable"** for each missing variable above
5. After adding all variables, **REDEPLOY** your backend

---

## 🔄 After Adding Variables

1. **Redeploy the backend**:
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**

2. **Test the deployment**:
   - Try registering a new user
   - Check if email is sent
   - Try logging in

3. **Check logs** if issues persist:
   ```bash
   vercel logs resi-backend --follow
   ```

---

## 📋 Current Status

### ✅ Variables You Already Have:
- EMAIL_HOST ✅
- EMAIL_PORT ✅
- EMAIL_SECURE ✅
- EMAIL_USER ✅
- EMAIL_PASS ✅
- EMAIL_FROM ✅
- FRONTEND_URL ✅
- CLIENT_URL ✅
- CORS_ENABLED ✅
- RATE_LIMIT_WINDOW_MS ✅
- RATE_LIMIT_MAX_REQUESTS ✅
- AUTH_RATE_LIMIT_MAX ✅

### ❌ Variables You're Missing:
- **MONGODB_URI** ❌ (CRITICAL)
- **JWT_SECRET** ❌ (CRITICAL)
- **CORS_ORIGIN** ❌ (Important)
- **NODE_ENV** ❌ (Recommended)

---

**Priority**: Add MONGODB_URI and JWT_SECRET immediately, then redeploy!
