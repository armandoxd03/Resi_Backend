const Activity = require('../models/Activity');
const User = require('../models/User');

exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    
    // For now, we'll return mock data since we don't have an Activity model
    // In a real implementation, you would query the Activity collection
    const mockActivities = [
      {
        _id: '1',
        userId: userId,
        type: 'registration',
        description: 'User registered an account',
        timestamp: user.createdAt
      },
      {
        _id: '2',
        userId: userId,
        type: 'profile_update',
        description: 'User updated their profile',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        _id: '3',
        userId: userId,
        type: 'job_apply',
        description: 'User applied for a job',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];
    
    // If you have an Activity model, you would use this instead:
    // const activity = await Activity.find({ userId })
    //   .sort({ timestamp: -1 })
    //   .limit(parseInt(limit));
    
    res.status(200).json(mockActivities);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching user activity",
      error: err.message
    });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Mock data - replace with actual Activity model queries
    const mockActivities = [
      {
        _id: '1',
        userId: 'user1',
        userName: 'John Doe',
        type: 'registration',
        description: 'New user registered',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      },
      {
        _id: '2',
        userId: 'user2',
        userName: 'Jane Smith',
        type: 'job_post',
        description: 'New job posted: House Cleaning',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        _id: '3',
        userId: 'user3',
        userName: 'Mike Johnson',
        type: 'job_apply',
        description: 'User applied for a painting job',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      }
    ];
    
    res.status(200).json(mockActivities);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching recent activity",
      error: err.message
    });
  }
};