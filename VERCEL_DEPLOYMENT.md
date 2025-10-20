# Vercel Deployment Guide for ResiLinked Backend

This guide explains how to deploy your ResiLinked Express backend to Vercel as a serverless application.

## Prerequisites

- Vercel account connected to your GitHub
- MongoDB Atlas database (with IP whitelist set to `0.0.0.0/0` for Vercel serverless functions)
- All necessary API keys (SendGrid or Gmail app password)

## Step 1: Configure Vercel Project Settings

### Framework Preset
- **Framework**: Other (or None)
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: Leave empty
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

## Step 2: Configure Environment Variables

Add these environment variables in your Vercel project settings:

### Required Variables

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `5000` | Port (not used in serverless but required by app) |
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/database` | MongoDB connection string |
| `JWT_SECRET` | `your-secret-key` | JWT signing secret |
| `FRONTEND_URL` | `https://resi-frontend.vercel.app,https://resilinked.vercel.app` | Frontend URLs for CORS |
| `CLIENT_URL` | `https://resi-frontend.vercel.app,https://resilinked.vercel.app` | Client URLs for CORS |
| `CORS_ENABLED` | `true` | Enable CORS |

### Email Configuration (Choose One)

**Option A: Gmail/SMTP**
| Key | Value |
|-----|-------|
| `EMAIL_SERVICE` | `gmail` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_SECURE` | `false` |
| `EMAIL_USER` | `your-email@gmail.com` |
| `EMAIL_PASS` | `your-app-password` |
| `EMAIL_FROM` | `ResiLinked <your-email@gmail.com>` |

**Option B: SendGrid**
| Key | Value |
|-----|-------|
| `SENDGRID_API_KEY` | `SG.xxxxxxxxxxxxxx` |
| `EMAIL_FROM` | `ResiLinked <no-reply@resilinked.com>` |

### Optional Variables
| Key | Value | Description |
|-----|-------|-------------|
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |
| `AUTH_RATE_LIMIT_MAX` | `5` | Auth endpoint rate limit |

## Step 3: Important MongoDB Atlas Configuration

Since Vercel uses serverless functions with dynamic IPs, you need to:

1. Go to MongoDB Atlas
2. Navigate to **Network Access**
3. Click **Add IP Address**
4. Select **Allow Access from Anywhere** (`0.0.0.0/0`)
5. Click **Confirm**

⚠️ **Security Note**: This allows all IPs to connect. Make sure your MongoDB credentials are strong and never committed to Git.

## Step 4: Deploy

### Option A: Deploy via GitHub Integration
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **Add New Project**
4. Import your repository
5. Configure environment variables
6. Click **Deploy**

### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Step 5: Update Frontend Configuration

After deployment, update your frontend environment variables:

**Vercel Frontend Project Settings:**
- `VITE_API_URL` = `https://your-backend-project.vercel.app`
- OR `NEXT_PUBLIC_API_URL` = `https://your-backend-project.vercel.app`

## Vercel Serverless Limitations

Be aware of these limitations:

1. **Execution Time**: 10 seconds max (Hobby plan), 60 seconds (Pro)
2. **Memory**: 1024 MB max (configurable in vercel.json)
3. **Cold Starts**: Functions may take 1-2 seconds to start if idle
4. **File System**: Read-only except for `/tmp` directory (500 MB)
5. **Uploads**: File uploads work but are limited to function execution time

## File Upload Considerations

Since Vercel's serverless functions have limited file system access:

1. **Small files** (<10MB): Can be handled in `/tmp` directory
2. **Larger files**: Consider using:
   - AWS S3
   - Cloudinary
   - MongoDB GridFS
   - Vercel Blob Storage

## Troubleshooting

### Issue: MongoDB Connection Timeout
**Solution**: 
- Add `0.0.0.0/0` to MongoDB Atlas IP whitelist
- Check connection string is correct
- Verify MongoDB user has proper permissions

### Issue: CORS Errors
**Solution**:
- Ensure `FRONTEND_URL` and `CLIENT_URL` include your frontend domain
- Check for trailing slashes in URLs
- Verify HTTP vs HTTPS is correct

### Issue: Cold Start Delays
**Solution**:
- This is normal for serverless functions
- Consider keeping function warm with periodic pings
- Or upgrade to Vercel Pro for better performance

### Issue: File Upload Failures
**Solution**:
- Check file size limits
- Verify `/tmp` directory is being used
- Consider external storage for larger files

## Testing Your Deployment

1. **Health Check**: Visit `https://your-backend.vercel.app/api/health`
2. **CORS Test**: Visit `https://your-backend.vercel.app/api/cors-test`
3. **API Endpoint**: Test any API endpoint from your frontend

## Monitoring and Logs

Access your deployment logs:
1. Go to Vercel Dashboard
2. Select your project
3. Click on a deployment
4. View **Function Logs** tab

## Cost Considerations

**Vercel Hobby (Free) Plan:**
- 100 GB bandwidth
- Serverless function executions included
- Good for development and small production apps

**Vercel Pro Plan ($20/month):**
- 1 TB bandwidth
- Longer function execution times
- Better performance
- Team collaboration features

---

## Next Steps

1. Deploy backend to Vercel
2. Note the deployment URL
3. Update frontend `VITE_API_URL` with the Vercel backend URL
4. Redeploy frontend
5. Test the complete application

**Need Help?** Check [Vercel Documentation](https://vercel.com/docs) or contact support.
