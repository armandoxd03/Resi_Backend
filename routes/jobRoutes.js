const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const auth = require('../middleware/auth');

// Jobs
router.post('/', auth.verify, jobController.postJob);
router.get('/', jobController.getAll);
router.get('/my-matches', auth.verify, jobController.getMyMatches);
router.get('/my-jobs', auth.verify, jobController.getMyJobs);
router.get('/my-applications', auth.verify, jobController.getMyApplications);
router.get('/my-applications-received', auth.verify, jobController.getMyApplicationsReceived);
router.get('/search', jobController.search);
router.get('/popular', jobController.getPopularJobs);
router.get('/:id', jobController.getJob);  // Individual job details
router.post('/:id/apply', auth.verify, jobController.applyJob);
router.delete('/:id/cancel-application', auth.verify, jobController.cancelApplication);
router.post('/:id/assign', auth.verify, jobController.assignWorker);
router.post('/:id/reject', auth.verify, jobController.rejectApplication);
router.put('/:jobId/applicants/:userId', auth.verify, jobController.updateApplicantStatus);
router.put('/:id/close', auth.verify, jobController.closeJob);
router.delete('/:id', auth.verify, jobController.deleteJob);

module.exports = router;