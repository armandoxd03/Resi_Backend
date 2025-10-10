const Goal = require('../models/Goal');
const { createNotification } = require('../utils/notificationHelper');

/**
 * Update goals with job payment and handle cascading to next goal if completed
 * @param {string} userId - User ID
 * @param {number} amount - Job payment amount
 * @param {string} jobId - Job ID that was completed
 * @returns {Promise<Object>} - Result of the goal update operation
 */
exports.updateGoalsWithJobPayment = async (userId, amount, jobId) => {
    try {
        // Get all incomplete goals for the user, sorted by creation date (oldest first)
        const goals = await Goal.find({ 
            user: userId, 
            completed: false 
        }).sort({ createdAt: 1 });
        
        if (goals.length === 0) {
            return { 
                success: true, 
                message: 'No active goals found', 
                goalsUpdated: 0,
                remainingAmount: amount
            };
        }
        
        let remainingAmount = amount;
        let updatedGoals = [];
        let completedGoals = [];
        
        // Process each goal until payment is fully allocated
        for (const goal of goals) {
            if (remainingAmount <= 0) break;
            
            const amountNeededToComplete = goal.targetAmount - goal.progress;
            const amountToAllocate = Math.min(remainingAmount, amountNeededToComplete);
            
            // Add to goal progress
            goal.progress += amountToAllocate;
            
            // Add to history
            goal.history.push({
                amount: amountToAllocate,
                source: 'job',
                jobId,
                date: new Date()
            });
            
            // Check if goal is completed
            if (goal.progress >= goal.targetAmount) {
                goal.completed = true;
                goal.completedAt = new Date();
                completedGoals.push(goal);
                
                // Create notification for goal completion
                await createNotification({
                    recipient: userId,
                    type: 'goal_completed',
                    message: `Congratulations! You completed your goal: ${goal.description} (₱${goal.targetAmount})`
                });
            }
            
            await goal.save();
            updatedGoals.push(goal);
            
            remainingAmount -= amountToAllocate;
        }
        
        return {
            success: true,
            message: `Goals updated successfully`,
            updatedGoals,
            completedGoals,
            goalsUpdated: updatedGoals.length,
            goalsCompleted: completedGoals.length,
            remainingAmount
        };
        
    } catch (error) {
        console.error('Error updating goals with job payment:', error);
        return {
            success: false,
            message: 'Error updating goals with job payment',
            error: error.message
        };
    }
};

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