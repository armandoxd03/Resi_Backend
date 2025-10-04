const User = require('../models/User');
const Job = require('../models/Job');
const Rating = require('../models/Rating');
const Report = require('../models/Report');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalJobs, totalRatings, totalReports] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Rating.countDocuments(),
      Report.countDocuments()
    ]);

    // Mock/sample analytics data for frontend
    res.status(200).json({
      totalUsers,
      usersTrend: '+12% this month',
      totalJobs,
      jobsTrend: '+8% this month',
      totalRatings,
      ratingsTrend: '+15% this month',
      totalReports,
      reportsTrend: '-5% this month',
      userDistribution: {
        employee: Math.floor(totalUsers * 0.7),
        employer: Math.floor(totalUsers * 0.3),
        employeePercentage: 70,
        employerPercentage: 30
      },
      verifiedUsers: {
        count: Math.floor(totalUsers * 0.6),
        percentage: 60
      },
      jobStats: {
        active: Math.floor(totalJobs * 0.5),
        completed: Math.floor(totalJobs * 0.5),
        totalValue: 500000,
        averagePrice: 2500
      },
      popularBarangays: [
        { barangay: 'Barangay 1', count: 42 },
        { barangay: 'Barangay 2', count: 37 },
        { barangay: 'Barangay 3', count: 29 },
        { barangay: 'Barangay 4', count: 21 },
        { barangay: 'Barangay 5', count: 18 }
      ],
      recentActivity: [
        { _id: '1', type: 'user', description: 'New user registered', createdAt: new Date() },
        { _id: '2', type: 'job', description: 'Job posted: Plumbing', createdAt: new Date() },
        { _id: '3', type: 'user', description: 'User verified', createdAt: new Date() },
        { _id: '4', type: 'job', description: 'Job completed: Carpentry', createdAt: new Date() }
      ]
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching dashboard stats",
      error: err.message
    });
  }
};

exports.getUserGrowth = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);
    
    res.status(200).json(userGrowth);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching user growth data",
      error: err.message
    });
  }
};

exports.getJobStatistics = async (req, res) => {
  try {
    const { by = 'status' } = req.query;
    
    let groupBy;
    switch (by) {
      case 'category':
        // Assuming you have a category field in your Job model
        groupBy = "$category";
        break;
      case 'barangay':
        groupBy = "$barangay";
        break;
      case 'status':
      default:
        groupBy = "$status";
        break;
    }
    
    const jobStats = await Job.aggregate([
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json(jobStats);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching job statistics",
      error: err.message
    });
  }
};

exports.getPopularJobs = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const popularJobs = await Job.aggregate([
      {
        $addFields: {
          applicantCount: { $size: { $ifNull: ["$applicants", []] } }
        }
      },
      {
        $sort: { applicantCount: -1, createdAt: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $lookup: {
          from: 'users',
          localField: 'postedBy',
          foreignField: '_id',
          as: 'poster'
        }
      },
      {
        $unwind: '$poster'
      },
      {
        $project: {
          title: 1,
          barangay: 1,
          price: 1,
          applicantCount: 1,
          'poster.firstName': 1,
          'poster.lastName': 1
        }
      }
    ]);
    
    res.status(200).json(popularJobs);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching popular jobs",
      error: err.message
    });
  }
};