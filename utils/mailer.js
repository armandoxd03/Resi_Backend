const nodemailer = require('nodemailer');
require('dotenv').config();

// SendGrid Email transporter configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'apikey', // SendGrid always uses 'apikey' as the username
        pass: process.env.SENDGRID_API_KEY // Your SendGrid API Key
    }
});

/**
 * Sends verification email to new users
 * @param {string} email - User email address
 * @param {string} token - Verification token
 */
const sendVerificationEmail = async (email, token) => {
    try {
        // Get the first URL if multiple are provided (comma-separated)
        const frontendUrl = process.env.FRONTEND_URL.split(",")[0].trim();
        const verificationLink = `${frontendUrl}/verify-email/${token}`;
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'ResiLinked <noreply@resilinked.com>',
            to: email,
            subject: "Verify Your ResiLinked Account",
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
                    <p>If you did not create this account, please ignore this email.</p>
                </div>
            `
        };

        // Try sending email with retries
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
            try {
                await transporter.sendMail(mailOptions);
                console.log(`✅ Verification email sent to ${email} on attempt ${attempts + 1}`);
                return; // Success, exit the function
            } catch (err) {
                console.error(`❌ Verification email attempt ${attempts + 1} failed:`, err);
                attempts++;
                // Wait 2 seconds before retrying
                if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }
        
        // All attempts failed
        console.error("❌ All verification email attempts failed after", maxAttempts, "attempts");
        throw new Error("Failed to send verification email after multiple attempts");
    } catch (error) {
        console.error("❌ Verification email error:", error);
        throw new Error("Failed to send verification email");
    }
};

/**
 * Sends password reset email
 * @param {string} to - Recipient email
 * @param {string} resetLink - Password reset link
 */
const sendResetEmail = async (to, resetLink) => {
    try {
        // Get the first URL if multiple are provided (comma-separated)
        const frontendUrl = process.env.FRONTEND_URL.split(",")[0].trim();
        
        // Try sending email with retries
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_FROM || 'ResiLinked <noreply@resilinked.com>',
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
                console.log(`✅ Password reset email sent to ${to} on attempt ${attempts + 1}`);
                return; // Success, exit the function
            } catch (err) {
                console.error(`❌ Password reset email attempt ${attempts + 1} failed:`, err);
                attempts++;
                // Wait 2 seconds before retrying
                if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }
        
        // All attempts failed
        console.error("❌ All password reset email attempts failed after", maxAttempts, "attempts");
        throw new Error("Failed to send password reset email after multiple attempts");
    } catch (error) {
        console.error("❌ Password reset email error:", error);
        throw new Error("Failed to send password reset email");
    }
};

// Verify SMTP connection on startup
const verifyConnection = async () => {
    try {
        await transporter.verify();
        console.log("✅ SMTP server connection established");
        return true;
    } catch (error) {
        console.error("❌ SMTP server connection failed:", error);
        return false;
    }
};

// Run verification on module import
verifyConnection();

module.exports = {
    sendVerificationEmail,
    sendResetEmail,
    verifyConnection
};
