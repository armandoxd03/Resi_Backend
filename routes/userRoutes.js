const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

// User Profile
router.get('/me', auth.verify, userController.getProfile);

// Profile update with file upload support
router.put('/me', 
    auth.verify,
    upload.single('profilePicture'),
    userController.editProfile
);

// Workers (public route)
router.get('/workers', userController.getWorkers);

// Goals (Legacy)
router.post('/goals', auth.verify, userController.setGoal);

module.exports = router;