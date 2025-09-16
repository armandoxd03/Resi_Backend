const Goal = require('../models/Goal');
const { createNotification } = require('../utils/notificationHelper');

exports.createGoal = async (req, res) => {
    try {
        const { targetAmount, description, targetDate } = req.body;
        
        if (!targetAmount || !description) {
            return res.status(400).json({
                message: "Missing required fields",
                required: ["targetAmount", "description"],
                alert: "Please fill all required fields"
            });
        }

        const goal = new Goal({
            user: req.user.id,
            targetAmount,
            description,
            targetDate,
            progress: 0,
            completed: false
        });

        await goal.save();

        await createNotification({
            recipient: req.user.id,
            type: 'goal_created',
            message: `New goal created: ${description} (₱${targetAmount})`
        });

        res.status(201).json({
            message: "Goal created successfully",
            goal,
            alert: "New goal created!"
        });
    } catch (err) {
        res.status(500).json({ 
            message: "Error creating goal", 
            error: err.message,
            alert: "Failed to create goal"
        });
    }
};

exports.getMyGoals = async (req, res) => {
    try {
        const { completed, sortBy = 'targetDate', order = 'asc' } = req.query;
        
        let query = { user: req.user.id };
        if (completed !== undefined) {
            query.completed = completed === 'true';
        }

        const sortOptions = {};
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;

        const goals = await Goal.find(query).sort(sortOptions);

        const totalAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
        const completedAmount = goals
            .filter(g => g.completed)
            .reduce((sum, goal) => sum + goal.targetAmount, 0);

        res.status(200).json({
            goals,
            summary: {
                totalGoals: goals.length,
                completedGoals: goals.filter(g => g.completed).length,
                totalAmount,
                completedAmount,
                completionPercentage: goals.length > 0 
                    ? Math.round((completedAmount / totalAmount) * 100) 
                    : 0
            },
            alert: `Found ${goals.length} goals`
        });
    } catch (err) {
        res.status(500).json({ 
            message: "Error fetching goals", 
            error: err.message,
            alert: "Failed to load your goals"
        });
    }
};

exports.updateGoal = async (req, res) => {
    try {
        const { progress, completed, targetAmount, description, targetDate } = req.body;
        
        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { progress, completed, targetAmount, description, targetDate },
            { new: true }
        );

        if (!goal) {
            return res.status(404).json({ 
                message: "Goal not found",
                alert: "No goal found with that ID"
            });
        }

        if (completed) {
            await createNotification({
                recipient: req.user.id,
                type: 'goal_completed',
                message: `Congratulations! You completed your goal: ${goal.description}`
            });
        }

        res.status(200).json({
            message: "Goal updated successfully",
            goal,
            alert: "Goal updated"
        });
    } catch (err) {
        res.status(500).json({ 
            message: "Error updating goal", 
            error: err.message,
            alert: "Failed to update goal"
        });
    }
};

exports.deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndDelete({ 
            _id: req.params.id, 
            user: req.user.id 
        });

        if (!goal) {
            return res.status(404).json({ 
                message: "Goal not found",
                alert: "No goal found with that ID"
            });
        }

        res.status(200).json({
            message: "Goal deleted successfully",
            deletedGoal: {
                id: goal._id,
                description: goal.description
            },
            alert: "Goal deleted"
        });
    } catch (err) {
        res.status(500).json({ 
            message: "Error deleting goal", 
            error: err.message,
            alert: "Failed to delete goal"
        });
    }
};