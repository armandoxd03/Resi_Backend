const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/upload');
const { registerValidation } = require('../middleware/validate');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

// Registration
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
router.post('/login', authLimiter, authController.login);

// Token verification ✅
router.get('/verify', auth.verify, authController.verifyToken);

// Password reset with rate limiting
router.post('/reset/request', authLimiter, authController.resetRequest);
router.post('/reset', authController.resetPassword);

// Email verification with rate limiting
router.post('/verify/resend', authLimiter, authController.resendVerification);

// Delete unverified
router.post('/delete-unverified', authController.deleteUnverified);

module.exports = router;