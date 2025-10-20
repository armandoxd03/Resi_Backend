# Vercel Deployment Checklist for ResiLinked Backend

## ✅ Pre-Deployment Checklist

### 1. MongoDB Atlas Configuration
- [ ] MongoDB Atlas account created
- [ ] Database cluster created
- [ ] Database user created with read/write permissions
- [ ] **CRITICAL**: Network Access set to `0.0.0.0/0` (Allow Access from Anywhere)
- [ ] Connection string copied

### 2. Email Service Setup
Choose ONE option:

**Option A: Gmail/SMTP**
- [ ] Gmail account ready
- [ ] 2-factor authentication enabled on Gmail
- [ ] App-specific password generated
- [ ] App password saved securely

**Option B: SendGrid**
- [ ] SendGrid account created
- [ ] Sender identity verified
- [ ] API key generated
- [ ] API key saved securely

### 3. Vercel Project Setup
- [ ] Vercel account created
- [ ] GitHub repository connected to Vercel
- [ ] Project imported to Vercel

## 🚀 Deployment Steps

### Step 1: Configure Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project or import it
3. Go to **Settings** > **General**
4. Set these values:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

### Step 2: Add Environment Variables
Go to **Settings** > **Environment Variables** and add:

#### Core Variables (Required)
```
NODE_ENV = production
PORT = 5000
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET = your-strong-secret-key
FRONTEND_URL = https://resi-frontend.vercel.app,https://resilinked.vercel.app
CLIENT_URL = https://resi-frontend.vercel.app,https://resilinked.vercel.app
CORS_ENABLED = true
```

#### Email Variables (Choose Gmail OR SendGrid)

**For Gmail:**
```
EMAIL_SERVICE = gmail
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_SECURE = false
EMAIL_USER = resilinked@gmail.com
EMAIL_PASS = your-app-password
EMAIL_FROM = ResiLinked <resilinked@gmail.com>
```

**For SendGrid:**
```
SENDGRID_API_KEY = SG.your-api-key
EMAIL_FROM = ResiLinked <no-reply@resilinked.com>
```

#### Optional Variables
```
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 100
AUTH_RATE_LIMIT_MAX = 5
```

### Step 3: Deploy
- [ ] Click **Deployments** tab
- [ ] Click **Redeploy** or push to GitHub to trigger deployment
- [ ] Wait for deployment to complete (check logs for errors)

### Step 4: Get Deployment URL
- [ ] Copy your deployment URL (e.g., `https://resi-backend.vercel.app`)
- [ ] Test health endpoint: `https://your-url.vercel.app/api/health`

### Step 5: Update Frontend
- [ ] Go to your frontend Vercel project
- [ ] Update environment variable:
  - `VITE_API_URL` = `https://your-backend-url.vercel.app`
  - OR `NEXT_PUBLIC_API_URL` = `https://your-backend-url.vercel.app`
- [ ] Redeploy frontend

## 🧪 Testing

### Backend Tests
- [ ] Health check: `https://your-backend.vercel.app/api/health`
- [ ] CORS test: `https://your-backend.vercel.app/api/cors-test`
- [ ] Test login from frontend
- [ ] Test user registration
- [ ] Test password reset email
- [ ] Test file upload (if applicable)

### Frontend Tests
- [ ] Login works
- [ ] Registration works
- [ ] Password reset works
- [ ] API calls succeed
- [ ] No CORS errors in console

## 🔧 Troubleshooting

### If deployment fails:
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set correctly
3. Check MongoDB connection string
4. Ensure IP `0.0.0.0/0` is whitelisted in MongoDB Atlas

### If MongoDB connection fails:
1. Verify connection string format
2. Check username and password are URL-encoded
3. Ensure network access allows `0.0.0.0/0`
4. Test connection string locally first

### If CORS errors occur:
1. Verify `FRONTEND_URL` includes your frontend domain
2. Check for typos in URLs
3. Ensure no trailing slashes
4. Verify HTTP vs HTTPS is correct

### If emails don't send:
**For Gmail:**
- Verify app password is correct
- Check 2FA is enabled
- Try generating new app password

**For SendGrid:**
- Verify sender identity is verified
- Check API key is valid
- Ensure API key has "Mail Send" permission

## 📋 Post-Deployment

- [ ] Backend deployed successfully
- [ ] Frontend updated with new API URL
- [ ] All features tested and working
- [ ] Error monitoring set up (optional)
- [ ] Custom domain configured (optional)

## 🎉 Success Criteria

Your deployment is successful when:
1. ✅ Health endpoint returns `{"status": "healthy"}`
2. ✅ Frontend can communicate with backend
3. ✅ Users can register and login
4. ✅ Password reset emails are sent
5. ✅ No CORS errors in browser console

---

**Need Help?** Check `VERCEL_DEPLOYMENT.md` for detailed instructions or visit [Vercel Documentation](https://vercel.com/docs).
