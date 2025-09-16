const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

// User reports another user
router.post('/', auth.verify, reportController.reportUser);

// Admin fetches all reports
router.get('/', auth.verify, auth.verifyAdmin, reportController.getReports);

// Admin updates report status
router.patch('/:id', auth.verify, auth.verifyAdmin, reportController.updateReportStatus);

module.exports = router;
