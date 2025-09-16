const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Notifications
router.get('/', auth.verify, notificationController.getMyNotifications);
router.post('/', auth.verify, notificationController.createNotification);
router.patch('/:id/read', auth.verify, notificationController.markAsRead);
router.delete('/:id', auth.verify, notificationController.deleteNotification);

module.exports = router;