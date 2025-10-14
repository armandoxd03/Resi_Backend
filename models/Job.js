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
    completed: { type: Boolean, default: false },
    
    // Soft Delete Information
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
});

// Add a global query middleware to filter out soft-deleted jobs by default
jobSchema.pre('find', function() {
    // Only include non-deleted jobs unless explicitly asked for deleted ones
    if (!this.getQuery().includeSoftDeleted) {
        this.where({ isDeleted: false });
    }
});

jobSchema.pre('findOne', function() {
    // Only include non-deleted jobs unless explicitly asked for deleted ones
    if (!this.getQuery().includeSoftDeleted) {
        this.where({ isDeleted: false });
    }
});

jobSchema.pre('countDocuments', function() {
    // Only count non-deleted jobs unless explicitly asked for deleted ones
    if (!this.getQuery().includeSoftDeleted) {
        this.where({ isDeleted: false });
    }
});

module.exports = mongoose.model('Job', jobSchema);