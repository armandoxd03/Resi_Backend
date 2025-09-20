const User = require('../models/User');
const { createNotification } = require('../utils/notificationHelper');
const Activity = require('../models/Activity'); // ✅ ADDED

// Helper function to create activity log
const createActivityLog = async (activityData) => {
  try {
    const activity = new Activity(activityData);
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error creating activity log:', error);
    // Don't throw to avoid breaking main functionality
    return null;
  }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('goals');

        if (!user) {
            return res.status(404).json({ 
                message: "User not found",
                alert: "Your profile could not be found"
            });
        }

        res.status(200).json({
            user,
            alert: "Profile loaded successfully"
        });
    } catch (err) {
        res.status(500).json({ 
            message: "Error fetching profile", 
            error: err.message,
            alert: "Failed to load profile"
        });
    }
};

exports.editProfile = async (req, res) => {
    try {
        const updates = req.body;
        
        console.log('Profile update received:', updates);
        
        // Handle profile picture upload if present
        if (req.file) {
            updates.profilePicture = req.file.buffer.toString('base64');
        }

        const originalUser = await User.findById(req.user.id);
        
        // Filter updates to only include fields that exist in the schema
        const validUpdates = {};
        Object.keys(updates).forEach(key => {
            if (key in originalUser._doc) {
                // Special handling for gender field to ensure valid values
                if (key === 'gender') {
                    console.log(`Processing gender value: "${updates[key]}"`, typeof updates[key]);
                    if (updates[key] === '') {
                        console.log('Empty gender provided, allowing empty string');
                    }
                }
                validUpdates[key] = updates[key];
            } else {
                console.log(`Ignoring unknown field: ${key}`);
            }
        });
        
        console.log('Applying updates:', validUpdates);
        
        let user;
        try {
            user = await User.findByIdAndUpdate(
                req.user.id, 
                validUpdates, 
                { new: true, runValidators: true }
            ).select('-password');
            
            // The update succeeded
            console.log('User updated successfully:', user.gender);
        } catch (validationError) {
            console.error('Validation error during update:', validationError);
            return res.status(400).json({ 
                message: "Error updating profile", 
                error: validationError.message,
                alert: "Profile update failed: " + validationError.message
            });
        }

        if (!user) {
            return res.status(404).json({ 
                message: "User not found",
                alert: "Your profile could not be found"
            });
        }

        const changes = {};
        Object.keys(updates).forEach(key => {
            if (originalUser[key] !== user[key]) {
                changes[key] = {
                    from: originalUser[key],
                    to: user[key]
                };
            }
        });

        if (Object.keys(changes).length > 0) {
            await createNotification({
                recipient: user._id,
                type: 'profile_update',
                message: 'Your profile was updated'
            });

            // ✅ LOG ACTIVITY: Profile updated
            await createActivityLog({
              userId: user._id,
              userName: `${user.firstName} ${user.lastName}`,
              type: 'profile_update',
              description: 'User updated their profile',
              metadata: {
                updatedFields: Object.keys(changes),
                updateTime: new Date()
              }
            });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user,
            changes: Object.keys(changes).length > 0 ? changes : undefined,
            alert: "Profile updated successfully"
        });
    } catch (err) {
        console.error('Profile update error:', err);
        
        res.status(500).json({ 
            message: "Error updating profile", 
            error: err.message,
            alert: "Failed to update profile"
        });
    }
};

exports.setGoal = async (req, res) => {
    try {
        const { targetAmount, description } = req.body;
        
        if (!targetAmount || !description) {
            return res.status(400).json({
                message: "Missing required fields",
                required: ["targetAmount", "description"],
                alert: "Please fill all required fields"
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ 
                message: "User not found",
                alert: "Your profile could not be found"
            });
        }

        user.goals.push({ 
            targetAmount, 
            description, 
            progress: 0,
            createdAt: new Date()
        });
        await user.save();

        await createNotification({
            recipient: user._id,
            type: 'goal_created',
            message: `New goal set: ${description} (₱${targetAmount})`
        });

        // ✅ LOG ACTIVITY: Goal created
        await createActivityLog({
          userId: user._id,
          userName: `${user.firstName} ${user.lastName}`,
          type: 'goal_created',
          description: `User created a new goal: ${description}`,
          metadata: {
            targetAmount: targetAmount,
            description: description
          }
        });

        res.status(200).json({
            message: "Goal set successfully",
            goals: user.goals,
            alert: "New goal added to your profile"
        });
    } catch (err) {
        res.status(500).json({ 
            message: "Error setting goal", 
            error: err.message,
            alert: "Failed to set goal"
        });
    }
};

// GET /api/users/workers → Get all workers
exports.getWorkers = async (req, res) => {
    try {
        const { barangay, skill, search, page = 1, limit = 20 } = req.query;
        
        let query = { 
            userType: { $in: ['employee', 'both'] },
            isVerified: true
        };
        
        if (barangay) query.barangay = barangay;
        if (skill) query.skills = { $in: skill.split(',') };
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { skills: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password -idNumber -idFrontImage -idBackImage')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            User.countDocuments(query)
        ]);

        // ✅ LOG ACTIVITY: Workers search
        await createActivityLog({
          userId: req.user.id,
          userName: `${req.user.firstName} ${req.user.lastName}`,
          type: 'search',
          description: 'User searched for workers',
          metadata: {
            searchParams: {
              barangay: barangay || 'all',
              skill: skill || 'all',
              search: search || '',
              page: page,
              limit: limit,
              results: total
            }
          }
        });

        res.status(200).json({
            success: true,
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            alert: users.length ? `Found ${total} workers` : "No workers found matching your criteria"
        });
    } catch (err) {
        res.status(500).json({ 
            message: "Error fetching workers", 
            error: err.message,
            alert: "Failed to load workers"
        });
    }
};