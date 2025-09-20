const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

// User Profile
router.get('/me', auth.verify, userController.getProfile);
router.put('/me', 
    auth.verify, 
    upload.single('profilePicture'), 
    userController.editProfile
);

// Workers
router.get('/workers', auth.verify, userController.getWorkers);

// Goals (Legacy)
router.post('/goals', auth.verify, userController.setGoal);

module.exports = router;