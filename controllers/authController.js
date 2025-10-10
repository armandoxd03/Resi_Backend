const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { createAccessToken } = require('../middleware/auth');
const { sendVerificationEmail, sendResetEmail } = require('../utils/mailer');
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

// Register
exports.register = async (req, res) => {
    try {
        const requiredFields = [
            'firstName', 'lastName', 'email', 'password',
            'mobileNo', 'barangay', 'address', 'idType', 'idNumber', 'userType'
        ];

        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: "Missing required fields",
                missingFields,
                alert: "Please fill all required fields"
            });
        }

        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered",
                alert: "This email is already in use"
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const verificationToken = crypto.randomBytes(20).toString('hex');

        const user = new User({
            ...req.body,
            password: hashedPassword,
            profileImage: req.files?.profileImage?.[0]?.buffer.toString('base64') || '',
            idFrontImage: req.files?.idFrontImage?.[0]?.buffer.toString('base64') || '',
            idBackImage: req.files?.idBackImage?.[0]?.buffer.toString('base64') || '',
            isVerified: false,
            verificationToken,
            verificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });

        await user.save();

        // ✅ LOG ACTIVITY: User registration
        await createActivityLog({
          userId: user._id,
          userName: `${user.firstName} ${user.lastName}`,
          type: 'registration',
          description: 'User registered an account',
          metadata: {
            email: user.email,
            userType: user.userType
          }
        });

        await sendVerificationEmail(user.email, verificationToken);

        // Notify admin
        const adminUser = await User.findOne({ userType: 'admin' });
        if (adminUser) {
            await createNotification({
                recipient: adminUser._id,
                type: 'admin_message',
                message: `New user ${user.email} requires verification`
            });

            // ✅ LOG ACTIVITY: Admin notification
            await createActivityLog({
              userId: adminUser._id,
              userName: `${adminUser.firstName} ${adminUser.lastName}`,
              type: 'admin_action',
              description: `Admin notified about new user ${user.email}`,
              metadata: {
                newUserEmail: user.email,
                newUserName: `${user.firstName} ${user.lastName}`
              }
            });
        }

        res.status(201).json({
            success: true,
            message: "Registration successful - please check your email",
            data: {
                userId: user._id,       // explicitly showing the user's id
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            },
            alert: "Verification email sent!"
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message,
            alert: "Registration failed. Please try again."
        });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
                alert: "Please provide email and password"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                alert: "Invalid email or password"
            });
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            await user.save();

            // ✅ LOG ACTIVITY: Failed login attempt
            await createActivityLog({
              userId: user._id,
              userName: `${user.firstName} ${user.lastName}`,
              type: 'security_alert',
              description: `Failed login attempt (attempt ${user.loginAttempts})`,
              metadata: {
                attempt: user.loginAttempts,
                email: email
              }
            });

            if (user.loginAttempts >= 3) {
                await createNotification({
                    recipient: user._id,
                    type: 'security_alert',
                    message: 'Multiple failed login attempts detected'
                });

                // ✅ LOG ACTIVITY: Multiple failed attempts
                await createActivityLog({
                  userId: user._id,
                  userName: `${user.firstName} ${user.lastName}`,
                  type: 'security_alert',
                  description: 'Multiple failed login attempts detected',
                  metadata: {
                    attempts: user.loginAttempts,
                    locked: user.loginAttempts >= 5
                  }
                });
            }

            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
                alert: "Invalid email or password",
                remainingAttempts: 5 - user.loginAttempts
            });
        }

        if (!user.isVerified) {
            // ✅ LOG ACTIVITY: Attempt to login unverified account
            await createActivityLog({
              userId: user._id,
              userName: `${user.firstName} ${user.lastName}`,
              type: 'email_verification',
              description: 'Attempt to login with unverified account',
              metadata: {
                email: user.email,
                verified: false
              }
            });

            return res.status(403).json({
                success: false,
                message: "Account not verified",
                alert: "Please verify your email first"
            });
        }

        user.loginAttempts = 0;
        user.lastLogin = new Date();
        await user.save();

        const token = createAccessToken(user);

        await createNotification({
            recipient: user._id,
            type: 'security_alert',
            message: 'New login detected'
        });

        // ✅ LOG ACTIVITY: Successful login
        await createActivityLog({
          userId: user._id,
          userName: `${user.firstName} ${user.lastName}`,
          type: 'login',
          description: 'User logged in successfully',
          metadata: {
            loginTime: new Date(),
            userType: user.userType
          }
        });

        res.status(200).json({
            success: true,
            token,
            userId: user._id,
            userType: user.userType,
            isVerified: user.isVerified,
            alert: "Login successful"
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Login error",
            error: error.message,
            alert: "Login failed. Please try again."
        });
    }
};

// Validate token
exports.validateToken = async (req, res) => {
    try {
        // If we reach here, the auth middleware has already validated the token
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                alert: "User account no longer exists"
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                userType: user.userType
            },
            message: "Token is valid"
        });
    } catch (error) {
        console.error("Token validation error:", error);
        res.status(500).json({
            success: false,
            message: "Token validation error",
            error: error.message
        });
    }
};

// Request Password Reset
exports.resetRequest = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email is required",
                alert: "Please provide your email"
            });
        }

        const user = await User.findOne({ email });
        if (user) {
            const token = createAccessToken(user);
            const link = `${process.env.FRONTEND_URL}/reset-password/${token}`;

            await sendResetEmail(user.email, link);

            await createNotification({
                recipient: user._id,
                type: 'security_alert',
                message: 'Password reset requested'
            });

            // ✅ LOG ACTIVITY: Password reset requested
            await createActivityLog({
              userId: user._id,
              userName: `${user.firstName} ${user.lastName}`,
              type: 'password_reset',
              description: 'Password reset requested',
              metadata: {
                email: user.email,
                resetRequested: new Date()
              }
            });
        }

        res.status(200).json({
            success: true,
            message: "If an account exists with this email, a reset link has been sent",
            alert: "Password reset link sent if email exists"
        });

    } catch (error) {
        console.error("Reset request error:", error);
        res.status(500).json({
            success: false,
            message: "Error sending reset email",
            error: error.message,
            alert: "Failed to send reset email"
        });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({
                message: "Token and new password are required",
                alert: "Please provide all required fields"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "Password too short",
                alert: "Password must be at least 8 characters"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                alert: "Invalid reset token"
            });
        }

        const isSamePassword = bcrypt.compareSync(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                message: "New password must be different",
                alert: "Please choose a different password"
            });
        }

        user.password = bcrypt.hashSync(newPassword, 10);
        await user.save();

        await createNotification({
            recipient: user._id,
            type: 'security_alert',
            message: 'Your password was successfully reset'
        });

        // ✅ LOG ACTIVITY: Password reset successful
        await createActivityLog({
          userId: user._id,
          userName: `${user.firstName} ${user.lastName}`,
          type: 'password_reset',
          description: 'Password successfully reset',
          metadata: {
            resetTime: new Date()
          }
        });

        res.status(200).json({
            success: true,
            message: "Password updated successfully",
            alert: "Password has been reset"
        });

    } catch (error) {
        console.error("Reset password error:", error);
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({
                success: false,
                message: "Reset token expired",
                alert: "Password reset link has expired. Please request a new one."
            });
        }

        res.status(400).json({
            success: false,
            message: "Invalid or expired reset token",
            error: error.message,
            alert: "Password reset failed. The link may have expired."
        });
    }
};

// Resend Verification Email
exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email is required",
                alert: "Please provide your email"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, a verification link has been sent",
                alert: "Verification email sent if account exists"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Already verified",
                alert: "This account is already verified"
            });
        }

        // Renew token if expired
        if (!user.verificationToken || user.verificationExpires < Date.now()) {
            user.verificationToken = crypto.randomBytes(20).toString('hex');
            user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
            await user.save();
        }

        await sendVerificationEmail(user.email, user.verificationToken);

        // ✅ LOG ACTIVITY: Verification email resent
        await createActivityLog({
          userId: user._id,
          userName: `${user.firstName} ${user.lastName}`,
          type: 'email_verification',
          description: 'Verification email resent',
          metadata: {
            email: user.email,
            resent: new Date()
          }
        });

        res.status(200).json({
            success: true,
            message: "Verification email resent",
            alert: "Verification email sent. Please check your inbox."
        });

    } catch (error) {
        console.error("Resend verification error:", error);
        res.status(500).json({
            success: false,
            message: "Error resending verification",
            error: error.message,
            alert: "Failed to resend verification email"
        });
    }
};

// Verify Token
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ valid: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ valid: false, message: "User not found" });
    }

    res.status(200).json({ valid: true, user });
  } catch (error) {
    res.status(401).json({ valid: false, message: "Invalid or expired token" });
  }
};

// Delete Unverified
exports.deleteUnverified = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOneAndDelete({ email, isVerified: false });
    if (!user) {
      return res.status(404).json({
        message: "Unverified user not found",
        alert: "No unverified user found with that email"
      });
    }

    // ✅ LOG ACTIVITY: Unverified account deleted
    await createActivityLog({
      userId: user._id,
      userName: `${user.firstName} ${user.lastName}`,
      type: 'admin_action',
      description: 'Unverified account deleted',
      metadata: {
        email: user.email,
        deletionTime: new Date()
      }
    });

    res.status(200).json({
      message: "Unverified account deleted successfully",
      alert: "Account deleted"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting unverified account",
      error: error.message
    });
  }
};