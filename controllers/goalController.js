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
            // If no active goals found, create a record of the payment for future reference
            // This could be stored in a separate collection or as a user activity
            await createNotification({
                recipient: userId,
                type: 'job_payment',
                message: `You received a payment of ₱${amount} from a completed job, but you have no active goals.`,
                relatedJob: jobId
            });
            
            return { 
                success: true, 
                message: 'No active goals found. Payment recorded but not allocated.', 
                goalsUpdated: 0,
                remainingAmount: amount
            };
        }
        
        let remainingAmount = amount;
        let updatedGoals = [];
        let completedGoals = [];
        
        // Process goals in sequence (oldest first) until payment is fully allocated
        for (let i = 0; i < goals.length; i++) {
            const goal = goals[i];
            
            // Stop if no more funds to allocate
            if (remainingAmount <= 0) break;
            
            // Calculate how much more is needed to complete this goal
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
            
            // Track remaining amount
            remainingAmount -= amountToAllocate;
            
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
                
                console.log(`Goal completed: ${goal._id} - ${goal.description} - ₱${goal.targetAmount}`);
                
                // If there are excess funds, they'll cascade to the next goal in the next iteration
                // This is handled automatically by the loop
            }
            
            await goal.save();
            updatedGoals.push(goal);
        }
        
        // If there's still remaining amount but no more active goals
        if (remainingAmount > 0) {
            await createNotification({
                recipient: userId,
                type: 'excess_payment',
                message: `You received an excess payment of ₱${remainingAmount} after updating your goals.`,
                relatedJob: jobId
            });
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
        const { targetAmount, description, targetDate, progress = 0, completed } = req.body;
        
        if (!targetAmount || !description) {
            return res.status(400).json({
                message: "Missing required fields",
                required: ["targetAmount", "description"],
                alert: "Please fill all required fields"
            });
        }

        // Determine if the goal should be marked as completed
        const isCompleted = completed !== undefined ? 
            completed : 
            (progress >= targetAmount);
        
        const goal = new Goal({
            user: req.user.id,
            targetAmount,
            description,
            targetDate,
            progress: progress || 0,
            completed: isCompleted,
            completedAt: isCompleted ? new Date() : undefined
        });

        await goal.save();

        // Create appropriate notification
        if (isCompleted) {
            await createNotification({
                recipient: req.user.id,
                type: 'goal_completed',
                message: `New goal created and completed: ${description} (₱${targetAmount})`
            });
        } else {
            await createNotification({
                recipient: req.user.id,
                type: 'goal_created',
                message: `New goal created: ${description} (₱${targetAmount})`
            });
        }

        res.status(201).json({
            message: "Goal created successfully",
            goal,
            alert: isCompleted ? "New goal created and completed! 🎉" : "New goal created!"
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
        
        // For debugging
        console.log('Update goal request:', {
            goalId: req.params.id,
            userId: req.user.id,
            body: req.body
        });
        
        // Auto-calculate completion status based on progress vs target
        const isCompleted = completed !== undefined ? 
            completed : 
            (targetAmount && progress >= targetAmount);
        
        console.log('Calculated completion status:', {
            isCompleted,
            providedCompleted: completed,
            progress,
            targetAmount,
            calculation: progress >= targetAmount
        });
        
        const updates = { 
            progress, 
            targetAmount, 
            description, 
            targetDate,
            completed: isCompleted
        };
        
        // If goal is being completed, add completedAt date
        if (isCompleted) {
            updates.completedAt = new Date();
            console.log('Goal is complete, setting completedAt:', updates.completedAt);
        } else {
            // If the goal is being marked as incomplete, remove completedAt
            updates.completedAt = null;
        }
        
        // Remove undefined values from the updates object
        Object.keys(updates).forEach(key => {
            if (updates[key] === undefined) {
                delete updates[key];
            }
        });
        
        console.log('Final updates to apply:', updates);
        
        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            updates,
            { new: true }
        );

        if (!goal) {
            return res.status(404).json({ 
                message: "Goal not found",
                alert: "No goal found with that ID"
            });
        }

        console.log('Updated goal result:', {
            id: goal._id,
            completed: goal.completed,
            completedAt: goal.completedAt,
            progress: goal.progress,
            targetAmount: goal.targetAmount
        });

        // If goal is now completed, create a notification
        if (goal.completed) {
            await createNotification({
                recipient: req.user.id,
                type: 'goal_completed',
                message: `Congratulations! You completed your goal: ${goal.description}`
            });
        }

        res.status(200).json({
            message: "Goal updated successfully",
            goal,
            alert: goal.completed ? "Congratulations! Goal completed! 🎉" : "Goal updated"
        });
    } catch (err) {
        console.error('Error updating goal:', err);
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