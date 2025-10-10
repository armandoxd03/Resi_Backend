const nodemailer = require('nodemailer');
require('dotenv').config();

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Sends verification email to new users
 * @param {string} email - User's email address
 * @param {string} token - Verification token
 */
const sendVerificationEmail = async (email, token) => {
    try {
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;
        
        const mailOptions = {
            from: `ResiLinked <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your ResiLinked Account',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0066ee;">Welcome to ResiLinked!</h2>
                    <p>Please verify your email address to complete your registration:</p>
                    <a href="${verificationLink}" 
                       style="display: inline-block; background: #0066ee; color: white; 
                              padding: 10px 20px; text-decoration: none; border-radius: 5px;
                              margin: 15px 0;">
                        Verify Email Address
                    </a>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't create this account, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Verification email sent to ${email}`);
    } catch (error) {
        console.error('❌ Verification email error:', error);
        throw new Error('Failed to send verification email');
    }
};

/**
 * Sends password reset email
 * @param {string} to - Recipient email
 * @param {string} resetLink - Password reset link
 */
const sendResetEmail = async (to, resetLink) => {
    try {
        await transporter.sendMail({
            from: `ResiLinked <${process.env.EMAIL_USER}>`,
            to,
            subject: "ResiLinked Password Reset",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0066ee;">Password Reset Request</h2>
                    <p>Click the button below to reset your password:</p>
                    <a href="${resetLink}" 
                       style="display: inline-block; background: #ff6600; color: white; 
                              padding: 10px 20px; text-decoration: none; border-radius: 5px;
                              margin: 15px 0;">
                        Reset Password
                    </a>
                    <p>This link will expire in 30 minutes.</p>
                    <p>If you did not request a password reset, please ignore this email.</p>
                </div>
            `
        });
        console.log(`✅ Password reset email sent to ${to}`);
    } catch (error) {
        console.error('❌ Password reset email error:', error);
        throw new Error('Failed to send password reset email');
    }
};

module.exports = {
    sendVerificationEmail,
    sendResetEmail
};
