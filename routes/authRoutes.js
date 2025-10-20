const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { uploadRegistration } = require('../middleware/cloudinaryUpload');
const { registerValidation } = require('../middleware/validate');
const auth = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimit');
const tokenCacheControl = require('../middleware/tokenCacheControl');

// Registration (no rate limit) - Using Cloudinary upload
router.post('/register',
  uploadRegistration,
  registerValidation,
  authController.register
);

// Login with rate limiting
router.post('/login', loginLimiter, authController.login);

// Token verification (no rate limit)
router.get('/verify', tokenCacheControl, auth.verify, authController.verifyToken);

// Password reset (no rate limit)
router.post('/reset/request', authController.resetRequest);
router.post('/reset', authController.resetPassword);

// Email verification (no rate limit)
router.post('/verify/resend', authController.resendVerification);
router.get('/verify-email/:token', tokenCacheControl, authController.verifyEmail);

// Delete unverified
router.post('/delete-unverified', authController.deleteUnverified);

module.exports = router;