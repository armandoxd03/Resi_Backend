const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    skillsRequired: [{ type: String }],
    barangay: { type: String, required: true },
    location: { type: String },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true },
    datePosted: { type: Date, default: Date.now },
    isOpen: { type: Boolean, default: true },
    applicants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
    }],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If accepted
    completed: { type: Boolean, default: false }
});

module.exports = mongoose.model('Job', jobSchema);