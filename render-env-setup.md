# Render Environment Variables Setup Guide

## Step 1: Login to Render Dashboard
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Login to your account
3. Select your ResiLinked backend service

## Step 2: Navigate to Environment Settings
1. Click on the "Environment" tab in the left sidebar
2. Look for the "Environment Variables" section

## Step 3: Add the Following Environment Variables

| Key | Value |
|-----|-------|
| `PORT` | `10000` |
| `MONGODB_URI` | `mongodb+srv://resilinked_db_admin:dDJwBzfpJvaBUQqt@resilinked.bddvynh.mongodb.net/ResiLinked?retryWrites=true&w=majority` |
| `JWT_SECRET` | `shd72shd8shd28hsd72js8shd` |
| `SENDGRID_API_KEY` | `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` |
| `EMAIL_FROM` | `ResiLinked <resilinked@gmail.com>` |
| `EMAIL_SERVICE` | `gmail` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_SECURE` | `false` |
| `EMAIL_USER` | `resilinked@gmail.com` |
| `EMAIL_PASS` | `wbfc utjx qqki qcvk` |
| `CLIENT_URL` | `https://resi-frontend.vercel.app,https://resilinked.vercel.app` |
| `FRONTEND_URL` | `https://resi-frontend.vercel.app,https://resilinked.vercel.app` |
| `CORS_ENABLED` | `true` |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` |
| `AUTH_RATE_LIMIT_MAX` | `5` |

## Step 4: Save Changes
1. After adding all environment variables, click the "Save Changes" button
2. Wait for Render to redeploy your application with the new environment variables

## Step 5: Verify Deployment
1. Check the logs to ensure your application started correctly
2. Look for the message "✅ SendGrid API key configured" in the logs
3. Make sure CORS is properly configured by checking for "🔒 CORS allowed origins:" in the logs

## Troubleshooting
If you still see "⚠️ SendGrid API key not provided or invalid":
1. Verify the API key is entered correctly without extra spaces
2. Try regenerating the SendGrid API key and updating it
3. Check if Gmail fallback is working properly

## Important Note
Render automatically sets PORT to 10000 in their environment. Your code uses `process.env.PORT || 5000` which will correctly use 10000 when deployed on Render.