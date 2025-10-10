const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY && 
    process.env.SENDGRID_API_KEY !== 'paste_your_sendgrid_api_key_here' &&
    !process.env.SENDGRID_API_KEY.includes('your_') &&
    process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log("✅ SendGrid API key configured");
} else {
  console.log("⚠️ SendGrid API key not provided or invalid, will try to use Gmail as fallback");
}

/**
 * Sends verification email to new users
 * @param {string} email - User email address
 * @param {string} token - Verification token
 */
const sendVerificationEmail = async (email, token) => {
  try {
    console.log(`📧 Attempting to send verification email to ${email}`);
    
    // Get the first URL if multiple are provided (comma-separated)
    const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",")[0].trim() : 'https://resi-frontend.vercel.app';
    console.log(`🔗 Using frontend URL: ${frontendUrl}`);
    
    const verificationLink = `${frontendUrl}/verify-email/${token}`;
    console.log(`🔗 Verification link: ${verificationLink}`);
    
    const emailContent = {
      to: email,
      from: process.env.EMAIL_FROM || "ResiLinked <noreply@resilinked.com>",
      subject: "Verify Your ResiLinked Account",
      text: `Welcome to ResiLinked! Please verify your email address by visiting: ${verificationLink}`,
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

    // Check if SendGrid API key is properly configured (not the default placeholder)
    if (process.env.SENDGRID_API_KEY && 
        process.env.SENDGRID_API_KEY !== 'paste_your_sendgrid_api_key_here' &&
        !process.env.SENDGRID_API_KEY.includes('your_') &&
        process.env.SENDGRID_API_KEY.startsWith('SG.')) {
      console.log(`📨 Attempting to send via SendGrid`);
      try {
        await sgMail.send(emailContent);
        console.log(`✅ Verification email sent to ${email} via SendGrid`);
        return true;
      } catch (sgError) {
        console.error(`❌ SendGrid error: ${sgError.message}`, sgError);
        console.log(`⚠️ Falling back to Gmail`);
        // Fall through to Gmail fallback
      }
    }
    
    // Try Gmail as fallback or primary if SendGrid isn't configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log(`📨 Attempting to send via Gmail SMTP`);
      console.log(`📧 Gmail settings: Host=${process.env.EMAIL_HOST || "smtp.gmail.com"}, Port=${process.env.EMAIL_PORT || "587"}, Secure=${process.env.EMAIL_SECURE || "false"}`);
      
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        // Increase timeout settings
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 30000,
        socketTimeout: 60000, // 60 seconds
        // Debug options
        logger: true
      });
      
      try {
        // Verify connection configuration
        await transporter.verify();
        console.log('✅ SMTP connection verified');
        
        // Send email
        await transporter.sendMail(emailContent);
        console.log(`✅ Verification email sent to ${email} via Gmail SMTP`);
        return true;
      } catch (gmailError) {
        console.error(`❌ Gmail SMTP error: ${gmailError.message}`, gmailError);
        throw gmailError; // Re-throw as we have no more fallbacks
      }
    } else {
      console.error(`❌ No email configuration available`);
      throw new Error("Email service not configured - neither SendGrid nor Gmail credentials found");
    }
  } catch (error) {
    console.error(`❌ Verification email error: ${error.message}`);
    console.error(error.stack);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

/**
 * Sends password reset email
 * @param {string} to - Recipient email
 * @param {string} resetLink - Password reset link
 */
const sendResetEmail = async (to, resetLink) => {
  try {
    console.log(`📧 Attempting to send reset email to ${to}`);
    
    // Get the first URL if multiple are provided (comma-separated)
    const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",")[0].trim() : 'https://resi-frontend.vercel.app';
    console.log(`🔗 Using frontend URL: ${frontendUrl}`);
    
    // If resetLink doesn't have a full URL, add the frontend URL
    if (!resetLink.startsWith("http")) {
      resetLink = `${frontendUrl}${resetLink.startsWith("/") ? "" : "/"}${resetLink}`;
    }
    console.log(`🔗 Reset link: ${resetLink}`);
    
    const emailContent = {
      to: to,
      from: process.env.EMAIL_FROM || "ResiLinked <noreply@resilinked.com>",
      subject: "ResiLinked Password Reset",
      text: `You requested a password reset for your ResiLinked account. Visit the following link to reset your password: ${resetLink}`,
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
    };

    // Check if SendGrid API key is properly configured (not the default placeholder)
    if (process.env.SENDGRID_API_KEY && 
        process.env.SENDGRID_API_KEY !== 'paste_your_sendgrid_api_key_here' &&
        !process.env.SENDGRID_API_KEY.includes('your_') &&
        process.env.SENDGRID_API_KEY.startsWith('SG.')) {
      console.log(`📨 Attempting to send via SendGrid`);
      try {
        await sgMail.send(emailContent);
        console.log(`✅ Password reset email sent to ${to} via SendGrid`);
        return true;
      } catch (sgError) {
        console.error(`❌ SendGrid error: ${sgError.message}`, sgError);
        console.log(`⚠️ Falling back to Gmail`);
        // Fall through to Gmail fallback
      }
    }
    
    // Try Gmail as fallback or primary if SendGrid isn't configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log(`📨 Attempting to send via Gmail SMTP`);
      console.log(`📧 Gmail settings: Host=${process.env.EMAIL_HOST || "smtp.gmail.com"}, Port=${process.env.EMAIL_PORT || "587"}, Secure=${process.env.EMAIL_SECURE || "false"}`);
      
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        // Increase timeout settings
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 30000,
        socketTimeout: 60000, // 60 seconds
        // Debug options
        logger: true
      });
      
      try {
        // Verify connection configuration
        await transporter.verify();
        console.log('✅ SMTP connection verified');
        
        // Send email
        await transporter.sendMail(emailContent);
        console.log(`✅ Password reset email sent to ${to} via Gmail SMTP`);
        return true;
      } catch (gmailError) {
        console.error(`❌ Gmail SMTP error: ${gmailError.message}`, gmailError);
        throw gmailError; // Re-throw as we have no more fallbacks
      }
    } else {
      console.error(`❌ No email configuration available`);
      throw new Error("Email service not configured - neither SendGrid nor Gmail credentials found");
    }
  } catch (error) {
    console.error(`❌ Password reset email error: ${error.message}`);
    console.error(error.stack);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

// Verify email configuration
const verifyConnection = async () => {
  const hasSendGrid = Boolean(process.env.SENDGRID_API_KEY && 
                             process.env.SENDGRID_API_KEY.startsWith('SG.') &&
                             process.env.SENDGRID_API_KEY !== 'paste_your_sendgrid_api_key_here' &&
                             !process.env.SENDGRID_API_KEY.includes('your_'));
  const hasGmail = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  
  console.log(`📧 Email configuration check:`);
  console.log(`- SendGrid configured: ${hasSendGrid}`);
  console.log(`- Gmail configured: ${hasGmail}`);
  console.log(`- FRONTEND_URL: ${process.env.FRONTEND_URL || 'not set'}`);
  console.log(`- EMAIL_FROM: ${process.env.EMAIL_FROM || 'not set'}`);
  console.log(`- EMAIL_HOST: ${process.env.EMAIL_HOST || 'not set (using default smtp.gmail.com)'}`);
  console.log(`- EMAIL_PORT: ${process.env.EMAIL_PORT || 'not set (using default 587)'}`);
  
  // Test Gmail connection if configured
  if (hasGmail) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        connectionTimeout: 10000 // 10 seconds for testing
      });
      
      await transporter.verify();
      console.log('✅ Gmail SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('❌ Gmail SMTP connection test failed:', error.message);
      // Still return true if SendGrid is configured
      return hasSendGrid;
    }
  }
  
  return hasSendGrid || hasGmail;
};

module.exports = {
  sendVerificationEmail,
  sendResetEmail,
  verifyConnection
};