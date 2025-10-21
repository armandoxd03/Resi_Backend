# Testing Login Locally

## 1. Start the backend server:
```bash
cd Resi_Backend
npm install
npm run dev
```

## 2. Test login with curl or Postman:
```bash
# Using PowerShell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"yourpassword"}'
```

## 3. Check console for detailed logs:
Look for the emoji logs like:
- 🔐 Login attempt for: test@example.com
- 📋 Finding user in database...
- 🔍 Comparing password...
- ✅ Login successful

## Common Issues:

### Issue 1: Database Connection Failed
**Error:** `❌ MongoDB connection error`
**Fix:** Check MONGODB_URI in .env file

### Issue 2: JWT Secret Warning
**Error:** `⚠️ WARNING: Using default JWT secret`
**Fix:** Add JWT_SECRET to .env file

### Issue 3: User Not Found
**Error:** `❌ User not found`
**Fix:** Make sure the email exists in database

### Issue 4: Password Mismatch
**Error:** `❌ Password mismatch`
**Fix:** Verify the password is correct

### Issue 5: Activity Model Error
**Error:** Related to Activity or Notification
**Fix:** All activity/notification errors are now caught and won't break login

## Deploying to Vercel:

1. Make sure environment variables are set on Vercel dashboard
2. Push changes to Git
3. Vercel will auto-deploy
4. Check Function Logs on Vercel to see the detailed logs
