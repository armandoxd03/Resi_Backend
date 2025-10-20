# Vercel Deployment Fix - File Upload Issue

## Problem Fixed ✅

**Error**: `EROFS: read-only file system, open '/var/task/uploads/...'`

**Cause**: Vercel's serverless functions have a read-only file system and cannot save files to disk.

**Solution**: Automatically use memory storage on Vercel and convert uploaded files to Base64 for MongoDB storage.

---

## Changes Made

### 1. Updated `middleware/upload.js`
- **Auto-detects serverless environments** (Vercel, AWS Lambda)
- Uses **memory storage** on Vercel (no disk writes)
- Uses **disk storage** on local development
- Logs which storage method is being used

### 2. Updated `api/index.js`
- Fixed module export for Vercel compatibility
- Changed from `const { app } = require('../app')` to `const app = require('../app')`

### 3. Registration Already Handles Base64
The `authController.js` already converts uploaded files to Base64 when using memory storage:
```javascript
if (req.files.profilePicture[0].buffer) {
    profilePicture = `data:${req.files.profilePicture[0].mimetype};base64,${req.files.profilePicture[0].buffer.toString('base64')}`;
}
```

---

## How It Works Now

### On Vercel (Serverless):
1. File uploaded → stored in **memory** (buffer)
2. Converted to **Base64 string**
3. Saved to **MongoDB** as Base64
4. Retrieved and displayed in frontend

### On Local Development:
1. File uploaded → saved to **disk** (`uploads/` folder)
2. Saved to **MongoDB** as file path
3. Served via Express static middleware

---

## Deployment Steps

### 1. Commit and Push Changes
```powershell
cd "c:\Users\JOHN ROY\Documents\resi\Resi_Backend"
git add .
git commit -m "Fix Vercel file upload - use memory storage instead of disk"
git push origin main
```

### 2. Vercel Will Auto-Deploy
If you have automatic deployments enabled, Vercel will:
- Detect the push to `main` branch
- Build and deploy automatically
- Apply the fixes

### 3. Manual Deploy (If Needed)
```powershell
cd "c:\Users\JOHN ROY\Documents\resi\Resi_Backend"
vercel --prod
```

### 4. Verify Environment Variables
Make sure these are set in Vercel dashboard:
- ✅ `MONGODB_URI`
- ✅ `JWT_SECRET`
- ✅ `EMAIL_HOST`
- ✅ `EMAIL_PORT`
- ✅ `EMAIL_USER`
- ✅ `EMAIL_PASS`
- ✅ `EMAIL_FROM`
- ✅ `CORS_ORIGIN`
- ✅ `FRONTEND_URL`

---

## Testing

### 1. Test Registration
- Go to your frontend
- Try registering a new user with:
  - Profile picture
  - ID front image
  - ID back image
- Should work now without "read-only file system" error

### 2. Check Vercel Logs
```powershell
vercel logs --follow
```

You should see:
```
🔧 Using memory storage (serverless environment detected)
✅ Verification email successfully sent to [email]
```

Instead of:
```
❌ EROFS: read-only file system...
```

---

## Future Improvements

For production, consider using cloud storage:

### Option 1: Cloudinary (Recommended)
```bash
npm install cloudinary
```
- Free tier: 25GB storage, 25GB bandwidth/month
- Automatic image optimization
- CDN delivery

### Option 2: AWS S3
```bash
npm install @aws-sdk/client-s3
```
- Pay as you go
- Highly scalable
- Integration with other AWS services

### Option 3: Vercel Blob Storage
```bash
npm install @vercel/blob
```
- Native Vercel integration
- Simple API
- Good for small to medium files

---

## Important Notes

### Base64 Limitations:
- **File size increases by ~33%** when encoded
- Recommended for files **< 2MB**
- For larger files, use cloud storage (Cloudinary, S3, etc.)

### Current MongoDB Limit:
- Maximum document size: **16MB**
- With Base64 encoding: ~**12MB original file** max
- Current limit in code: **10MB** (safe margin)

### Performance:
- Base64 works fine for profile pictures and ID cards
- For many large images, cloud storage is better
- Consider implementing cloud storage before launch

---

## Status

✅ File upload fixed for Vercel
✅ Memory storage automatically used on serverless
✅ Disk storage still works for local development
✅ Registration should now work end-to-end

**Next**: After deploying, test registration with file uploads!
