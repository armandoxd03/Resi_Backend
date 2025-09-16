const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['registration', 'login', 'profile_update', 'job_post', 'job_apply', 'rating', 'report']
  },
  description: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    enum: ['User', 'Job', 'Rating', 'Report']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
activitySchema.index({ userId: 1, timestamp: -1 });
activitySchema.index({ type: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);