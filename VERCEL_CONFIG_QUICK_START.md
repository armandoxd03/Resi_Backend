# Vercel Configuration - Copy/Paste Guide

## Project Settings

**Framework Preset**: Express (or Other)  
**Root Directory**: `./`  
**Build Command**: `npm run build`  
**Output Directory**: *(leave empty)*  
**Install Command**: `npm install`  
**Development Command**: `npm run dev`

---

## Environment Variables

Copy these exactly as shown:

### Required Core Variables
```
NODE_ENV
production
```

```
PORT
5000
```

```
MONGODB_URI
mongodb+srv://resilinked_db_admin:dDJwBzfpJvaBUQqt@resilinked.bddvynh.mongodb.net/ResiLinked?retryWrites=true&w=majority
```

```
JWT_SECRET
shd72shd8shd28hsd72js8shd
```

### CORS Configuration
```
FRONTEND_URL
https://resi-frontend.vercel.app,https://resilinked.vercel.app
```

```
CLIENT_URL
https://resi-frontend.vercel.app,https://resilinked.vercel.app
```

```
CORS_ENABLED
true
```

### Email Configuration (Gmail)
```
EMAIL_HOST
smtp.gmail.com
```

```
EMAIL_PORT
587
```

```
EMAIL_SECURE
false
```

```
EMAIL_USER
resilinked@gmail.com
```

```
EMAIL_PASS
wbfcutjxqqkiqcvk
```

```
EMAIL_FROM
ResiLinked <resilinked@gmail.com>
```

### Rate Limiting
```
RATE_LIMIT_WINDOW_MS
900000
```

```
RATE_LIMIT_MAX_REQUESTS
100
```

```
AUTH_RATE_LIMIT_MAX
5
```

---

## Quick Fix for Your Current Setup

You have most variables correct, but you need to:

1. **Change Output Directory**: Clear the field (it should be empty, not `npm run dev`)
2. **Add these missing variables**:
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = `https://resi-frontend.vercel.app,https://resilinked.vercel.app`
3. **Update FRONTEND_URL**: Remove `http://localhost:5173` from production (keep only production URLs)
4. **Remove CORS_ORIGIN**: You don't need this variable (we use CLIENT_URL and FRONTEND_URL instead)

---

## Corrected Environment Variables List

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | `mongodb+srv://resilinked_db_admin:dDJwBzfpJvaBUQqt@resilinked.bddvynh.mongodb.net/ResiLinked?retryWrites=true&w=majority` |
| `JWT_SECRET` | `shd72shd8shd28hsd72js8shd` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_SECURE` | `false` |
| `EMAIL_USER` | `resilinked@gmail.com` |
| `EMAIL_PASS` | `wbfcutjxqqkiqcvk` |
| `EMAIL_FROM` | `ResiLinked <resilinked@gmail.com>` |
| `FRONTEND_URL` | `https://resi-frontend.vercel.app,https://resilinked.vercel.app` |
| `CLIENT_URL` | `https://resi-frontend.vercel.app,https://resilinked.vercel.app` |
| `CORS_ENABLED` | `true` |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` |
| `AUTH_RATE_LIMIT_MAX` | `5` |

---

## Step-by-Step in Vercel UI

1. **Clear Output Directory field** (should be empty)
2. **Scroll down to Environment Variables section**
3. **Click "Add More"** for each new variable
4. **Enter Key and Value** exactly as shown above
5. **Click "Deploy"**

---

## After Deployment

Once deployed, you'll get a URL like:
```
https://resi-backend-xyz123.vercel.app
```

**Update your frontend** with this URL:
- Go to your frontend Vercel project
- Add/update environment variable:
  - `VITE_API_URL` = `https://resi-backend-xyz123.vercel.app`
- Redeploy frontend

---

## Important MongoDB Step

Before deploying, make sure MongoDB Atlas allows Vercel's IPs:

1. Go to MongoDB Atlas
2. Click "Network Access"
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" (`0.0.0.0/0`)
5. Save

This is required because Vercel uses dynamic IPs for serverless functions.
