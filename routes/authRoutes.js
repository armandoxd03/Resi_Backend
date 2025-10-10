const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/upload');
const { registerValidation } = require('../middleware/validate');
const auth = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimit');

// Registration (no rate limit)
router.post('/register',
  upload.fields([
    { name: 'idFrontImage', maxCount: 1 },
    { name: 'idBackImage', maxCount: 1 },
    { name: 'profilePicture', maxCount: 1 }
  ]),
  registerValidation,
  authController.register
);

// Login with rate limiting
router.post('/login', loginLimiter, authController.login);

// Token verification (no rate limit)
router.get('/verify', auth.verify, authController.verifyToken);

// Password reset (no rate limit)
router.post('/reset/request', authController.resetRequest);
router.post('/reset', authController.resetPassword);

// Email verification endpoints (no rate limit)
router.post('/verify', authController.verifyEmail); // New endpoint to verify email with token
router.post('/verify/resend', authController.resendVerification);

// Delete unverified
router.post('/delete-unverified', authController.deleteUnverified);

module.exports = router;