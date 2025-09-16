const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetAmount: { type: Number, required: true },
    progress: { type: Number, default: 0 },
    description: { type: String },
    completed: { type: Boolean, default: false }
});

module.exports = mongoose.model('Goal', goalSchema);