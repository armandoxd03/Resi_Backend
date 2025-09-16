const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const auth = require('../middleware/auth');
const verifyAdmin = require('../middleware/verifyAdmin');

// All routes require authentication
router.use(auth.verify);

// Get user activity - admin only
router.get('/users/:userId/activity', verifyAdmin, activityController.getUserActivity);

// Get recent activity - admin only
router.get('/recent-activity', verifyAdmin, activityController.getRecentActivity);

module.exports = router;