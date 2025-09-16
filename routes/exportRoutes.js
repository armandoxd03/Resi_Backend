const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const auth = require('../middleware/auth');
const verifyAdmin = require('../middleware/verifyAdmin');

// All routes require authentication and admin privileges
router.use(auth.verify);
router.use(verifyAdmin);

// Export data with query parameter filters
router.get('/:type', exportController.exportData);

// Export filtered data with POST request (for complex filters)
router.post('/:type/filtered', exportController.exportFilteredData);

module.exports = router;