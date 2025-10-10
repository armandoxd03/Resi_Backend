const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetAmount: { type: Number, required: true },
    progress: { type: Number, default: 0 },
    description: { type: String },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    targetDate: { type: Date },
    history: [{ 
        amount: { type: Number },
        source: { type: String, enum: ['job', 'manual', 'other'] },
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
        date: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('Goal', goalSchema);