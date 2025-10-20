# Cloudinary Setup Guide for ResiLinked

## Why Cloudinary?

✅ **Perfect for Vercel Serverless**
- Vercel has read-only file system
- Cloudinary stores images in the cloud
- No disk storage needed

✅ **Better than Base64**
- **25 GB** free storage (vs bloating your MongoDB)
- **25 GB** free bandwidth/month
- Fast CDN delivery worldwide
- Automatic image optimization
- Automatic format conversion (WebP when supported)
- Image transformations (resize, crop, compress)

✅ **Free Tier Benefits**
- 25 GB storage
- 25 GB bandwidth/month  
- 25,000 transformations/month
- Perfect for small-medium apps

---

## Step 1: Create Cloudinary Account

1. **Go to**: https://cloudinary.com/users/register/free
2. **Sign up** with your email
3. **Verify** your email address
4. **Log in** to your dashboard

---

## Step 2: Get Your Credentials

1. **Go to Dashboard**: https://cloudinary.com/console
2. You'll see your credentials at the top:
   ```
   Cloud Name: your-cloud-name
   API Key: 123456789012345
   API Secret: your-api-secret-here
   ```
3. **Copy these values** - you'll need them for Vercel

---

## Step 3: Add Credentials to Vercel

### Via Vercel Dashboard:

1. Go to: https://vercel.com/dashboard
2. Select your `resi-backend` project
3. Click: **Settings** → **Environment Variables**
4. Add these three variables:

   ```
   Key: CLOUDINARY_CLOUD_NAME
   Value: [your-cloud-name]
   Environments: ✓ Production ✓ Preview ✓ Development
   ```

   ```
   Key: CLOUDINARY_API_KEY
   Value: [your-api-key]
   Environments: ✓ Production ✓ Preview ✓ Development
   ```

   ```
   Key: CLOUDINARY_API_SECRET
   Value: [your-api-secret]
   Environments: ✓ Production ✓ Preview ✓ Development
   ```

5. **Save** and **Redeploy** your backend

### Via Local .env File:

Add to your `Resi_Backend/.env` file:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret-here
```

---

## Step 4: Update .env.vercel

Add to `Resi_Backend/.env.vercel`:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret-here
```

---

## Step 5: Deploy Changes

### Option A: Using Git

```powershell
cd "c:\Users\JOHN ROY\Documents\resi\Resi_Backend"
git add .
git commit -m "Add Cloudinary integration for image uploads"
git push origin main
```

Vercel will automatically deploy.

### Option B: Using Vercel CLI

```powershell
cd "c:\Users\JOHN ROY\Documents\resi\Resi_Backend"
vercel --prod
```

---

## Step 6: Test the Integration

1. **Wait for deployment** to complete (1-2 minutes)
2. **Go to your frontend** and try to register a new user
3. **Upload images** (profile picture + ID documents)
4. **Check Cloudinary Dashboard**:
   - Go to: https://cloudinary.com/console/media_library
   - You should see your uploaded images in folders:
     - `resilinked/profile-pictures/`
     - `resilinked/id-documents/`

---

## What Changed in the Code

### ✅ Files Modified:

1. **`middleware/cloudinaryUpload.js`** (NEW)
   - Configures Cloudinary storage
   - Handles profile pictures and ID documents
   - Automatic image optimization
   - Custom folder structure

2. **`routes/authRoutes.js`**
   - Uses `uploadRegistration` from Cloudinary middleware
   - No more local disk storage

3. **`routes/userRoutes.js`**
   - Uses `uploadProfilePicture` from Cloudinary middleware
   - Profile updates now use Cloudinary

4. **`controllers/authController.js`**
   - Simplified file handling
   - Cloudinary URLs stored directly in database
   - No more base64 or file path conversions

### ✅ Packages Installed:

```json
{
  "cloudinary": "^1.x.x",
  "multer-storage-cloudinary": "^4.x.x"
}
```

---

## Image Storage Structure

Your images will be organized like this in Cloudinary:

```
resilinked/
  ├── profile-pictures/
  │   ├── profile-johndoe-1634567890123.jpg
  │   ├── profile-janedoe-1634567891234.jpg
  │   └── ...
  └── id-documents/
      ├── idFrontImage-johndoe-1634567890125.jpg
      ├── idBackImage-johndoe-1634567890126.jpg
      └── ...
```

---

## Image Optimizations Applied

### Profile Pictures:
- Max size: 500x500px
- Quality: auto (Cloudinary optimizes)
- Formats: JPEG, PNG, WebP
- File size limit: 5MB

### ID Documents:
- Max size: 1200x1200px
- Quality: auto
- Formats: JPEG, PNG, PDF
- File size limit: 5MB

---

## Benefits You'll See

### Before (Base64):
```javascript
// Stored in MongoDB
profilePicture: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA..."
// 📦 1.5 MB in database
```

### After (Cloudinary):
```javascript
// Stored in MongoDB
profilePicture: "https://res.cloudinary.com/your-cloud/image/upload/v1634567890/resilinked/profile-pictures/profile-johndoe-1634567890123.jpg"
// 📦 ~100 bytes in database
// 🚀 Image loaded from fast CDN
// ⚡ Automatically optimized WebP for modern browsers
```

---

## Monitoring Usage

1. **Check usage**: https://cloudinary.com/console/usage
2. **View media library**: https://cloudinary.com/console/media_library
3. **See transformations**: https://cloudinary.com/console/transformations

---

## Troubleshooting

### Issue: "Invalid cloud_name"
**Solution**: Double-check your `CLOUDINARY_CLOUD_NAME` in Vercel

### Issue: "Upload failed"
**Solution**: Verify all three environment variables are set:
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

### Issue: Images not showing
**Solution**: Check Cloudinary dashboard to verify uploads succeeded

### Issue: "Invalid API key"
**Solution**: Regenerate API credentials in Cloudinary dashboard

---

## Free Tier Limits

- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ 25,000 transformations/month
- ✅ Unlimited images

**For ResiLinked:** This supports ~5,000-10,000 users easily!

---

## Next Steps

1. ✅ Create Cloudinary account
2. ✅ Get your credentials  
3. ✅ Add to Vercel environment variables
4. ✅ Redeploy backend
5. ✅ Test user registration with images
6. ✅ Check Cloudinary dashboard for uploaded images

---

**Last Updated**: October 20, 2025
