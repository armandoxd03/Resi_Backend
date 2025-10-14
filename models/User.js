const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Personal Information
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    mobileNo: { type: String, required: true },
    address: { type: String },
    barangay: { type: String, required: true },
    description: { type: String, default: "" },
    bio: { type: String, default: "" },

    // Identification Information
    idType: { type: String, required: true },
    idNumber: { type: String, required: true },
    idFrontImage: { type: String },
    idBackImage: { type: String },

    // Skills Information
    skills: [{ type: String }],

    // User Role Information
    userType: { 
        type: String, 
        enum: ['employee', 'employer', 'both', 'admin'], 
        required: true 
    },

    // Verification and Profile Information
    isVerified: { type: Boolean, default: false },  // Admin verification
    verificationToken: { type: String },
    verificationExpires: { type: Date },
    gender: { 
        type: String, 
        enum: ['male', 'female', 'others', 'other', ''], 
        lowercase: true,
        default: '' 
    },
    profilePicture: { type: String, default: "" },

    // Goals Information
    goals: [{
        targetAmount: Number,
        progress: { type: Number, default: 0 },
        description: String
    }],

    // Metadata Information
    createdAt: { type: Date, default: Date.now },
    
    // Soft Delete Information
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
});

// Add a global query middleware to filter out soft-deleted users by default
userSchema.pre('find', function() {
    // Only include non-deleted users unless explicitly asked for deleted ones
    if (!this.getQuery().includeSoftDeleted) {
        this.where({ isDeleted: false });
    }
});

userSchema.pre('findOne', function() {
    // Only include non-deleted users unless explicitly asked for deleted ones
    if (!this.getQuery().includeSoftDeleted) {
        this.where({ isDeleted: false });
    }
});

userSchema.pre('countDocuments', function() {
    // Only count non-deleted users unless explicitly asked for deleted ones
    if (!this.getQuery().includeSoftDeleted) {
        this.where({ isDeleted: false });
    }
});

module.exports = mongoose.model('User', userSchema);
