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
    isEmailVerified: { type: Boolean, default: false },  // Email verification
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
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
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
