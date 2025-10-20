# Setting Up Environment Variables in Vercel

## ⚠️ IMPORTANT: Email Not Sending Issue

If emails are not being sent when users register, it's because **Vercel doesn't automatically read `.env.vercel` file**. You need to manually add environment variables to your Vercel project.

## 📋 Steps to Configure Environment Variables in Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to your Vercel project**:
   - Visit: https://vercel.com/dashboard
   - Select your `resi-backend` project

2. **Navigate to Settings**:
   - Click on "Settings" tab
   - Click on "Environment Variables" in the left sidebar

3. **Add ALL the following environment variables**:

   Click "Add New" for each variable:

   ```
   Key: NODE_ENV
   Value: production
   ```

   ```
   Key: MONGODB_URI
   Value: mongodb+srv://resilinked_db_admin:dDJwBzfpJvaBUQqt@resilinked.bddvynh.mongodb.net/ResiLinked?retryWrites=true&w=majority
   ```

   ```
   Key: JWT_SECRET
   Value: shd72shd8shd28hsd72js8shd
   ```

   **🔑 EMAIL CONFIGURATION (Critical for sending emails):**
   ```
   Key: EMAIL_HOST
   Value: smtp.gmail.com
   ```

   ```
   Key: EMAIL_PORT
   Value: 587
   ```

   ```
   Key: EMAIL_SECURE
   Value: false
   ```

   ```
   Key: EMAIL_USER
   Value: resilinked@gmail.com
   ```

   ```
   Key: EMAIL_PASS
   Value: wbfcutjxqqkiqcvk
   ```

   ```
   Key: EMAIL_FROM
   Value: ResiLinked <resilinked@gmail.com>
   ```

   **🌐 FRONTEND/CORS CONFIGURATION:**
   ```
   Key: FRONTEND_URL
   Value: https://resi-frontend.vercel.app,https://resilinked.vercel.app
   ```

   ```
   Key: CORS_ORIGIN
   Value: https://resi-frontend.vercel.app,https://resilinked.vercel.app
   ```

   ```
   Key: CORS_ENABLED
   Value: true
   ```

   **⏱️ RATE LIMITING:**
   ```
   Key: RATE_LIMIT_WINDOW_MS
   Value: 900000
   ```

   ```
   Key: RATE_LIMIT_MAX_REQUESTS
   Value: 100
   ```

   ```
   Key: AUTH_RATE_LIMIT_MAX
   Value: 5
   ```

4. **Set Environment Scope**:
   - For each variable, select: `Production`, `Preview`, and `Development`
   - This ensures the variables work in all deployment environments

5. **Save and Redeploy**:
   - After adding all variables, click "Save"
   - Go to "Deployments" tab
   - Click "..." on your latest deployment
   - Click "Redeploy" to apply the new environment variables

### Method 2: Via Vercel CLI

If you have Vercel CLI installed:

```bash
cd Resi_Backend

# Add environment variables from .env.vercel file
vercel env pull .env.production

# Or add them manually:
vercel env add NODE_ENV production
vercel env add EMAIL_USER resilinked@gmail.com
vercel env add EMAIL_PASS wbfcutjxqqkiqcvk
# ... (add all other variables)

# Then redeploy
vercel --prod
```

## ✅ Verify Email Configuration

After setting up environment variables and redeploying:

1. **Check the deployment logs**:
   - Go to your Vercel project
   - Click on "Deployments"
   - Click on your latest deployment
   - Check "Function Logs" for email-related messages

2. **Test user registration**:
   - Register a new test user
   - Check the Vercel logs for:
     - `✅ Verification email successfully sent to [email]`
     - Or any error messages starting with `❌`

3. **Check your email inbox**:
   - Look for the verification email (might be in spam folder)
   - If not received, check Vercel logs for errors

## 🔍 Troubleshooting

### If emails are still not sending:

1. **Check Gmail App Password**:
   - The `EMAIL_PASS` should be a Gmail "App Password", not your regular password
   - Generate one at: https://myaccount.google.com/apppasswords
   - Replace `wbfcutjxqqkiqcvk` with your new app password if needed

2. **Check Vercel Logs**:
   ```
   vercel logs --follow
   ```
   Look for email-related errors

3. **Verify SMTP Connection**:
   - Check if the `EMAIL_HOST` and `EMAIL_PORT` are correct
   - Gmail SMTP should be `smtp.gmail.com` on port `587`

4. **Check Gmail Account Settings**:
   - Ensure "Less secure app access" is OFF (use App Passwords instead)
   - Enable 2-factor authentication if not already enabled
   - Generate a new App Password specifically for ResiLinked

## 📝 Notes

- **Environment variables in Vercel are encrypted** and secure
- Changes to environment variables require a **redeploy** to take effect
- The `.env.vercel` file is for reference only - Vercel doesn't read it automatically
- Always use separate credentials for production vs development

## 🚀 Quick Fix Summary

If you just deployed and emails aren't working:

1. Go to https://vercel.com/dashboard
2. Select your backend project
3. Settings → Environment Variables
4. Add the EMAIL_* variables listed above
5. Redeploy your application
6. Test registration again

---

**Last Updated**: October 20, 2025
