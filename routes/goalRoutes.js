const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const auth = require('../middleware/auth');

// Goals CRUD
router.post('/', auth.verify, goalController.createGoal);
router.get('/', auth.verify, goalController.getMyGoals);
router.put('/:id', auth.verify, goalController.updateGoal);
router.delete('/:id', auth.verify, goalController.deleteGoal);

module.exports = router;