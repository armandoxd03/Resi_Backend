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
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your ResiLinked Account</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f4f4f4">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 30px 40px; background: #0066ee; border-radius: 8px 8px 0 0;">
                      <h1 style="color: #ffffff; margin: 0;">ResiLinked</h1>
                    </td>
                  </tr>
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #0066ee; margin-top: 0;">Welcome to ResiLinked!</h2>
                      <p>Thank you for joining our platform. To complete your registration and access all features, please verify your email address by clicking the button below:</p>
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${verificationLink}" style="display: inline-block; background: #0066ee; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
                          </td>
                        </tr>
                      </table>
                      <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                      <p style="background: #f4f4f4; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 14px;"><a href="${verificationLink}" style="color: #0066ee; text-decoration: none;">${verificationLink}</a></p>
                      <p><strong>Important:</strong> This link will expire in 24 hours.</p>
                      <p style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 14px; color: #666;">If you did not create an account with ResiLinked, please disregard this email.</p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px; text-align: center; background: #f8f8f8; border-radius: 0 0 8px 8px; font-size: 12px; color: #666;">
                      <p>&copy; ${new Date().getFullYear()} ResiLinked. All rights reserved.</p>
                      <p>This is an automated email, please do not reply.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      // Anti-spam headers
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High", 
        "Importance": "High",
        "X-Entity-Ref-ID": `resilinked-verification-${new Date().getTime()}`,
        "List-Unsubscribe": `<mailto:unsubscribe@resilinked.com?subject=unsubscribe>`,
        "X-Report-Abuse": `Please report abuse here: ${frontendUrl}/report-abuse`,
        "Feedback-ID": `verification:resilinked:${new Date().toISOString().slice(0, 10)}`,
        "X-Mailer": "ResiLinked Account Services"
      },
      category: ["account", "verification"]
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
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your ResiLinked Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f4f4f4">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 30px 40px; background: #ff6600; border-radius: 8px 8px 0 0;">
                      <h1 style="color: #ffffff; margin: 0;">ResiLinked</h1>
                    </td>
                  </tr>
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #ff6600; margin-top: 0;">Password Reset Request</h2>
                      <p>We received a request to reset your password for your ResiLinked account. To reset your password, please click the button below:</p>
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${resetLink}" style="display: inline-block; background: #ff6600; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                          </td>
                        </tr>
                      </table>
                      <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                      <p style="background: #f4f4f4; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 14px;"><a href="${resetLink}" style="color: #ff6600; text-decoration: none;">${resetLink}</a></p>
                      <p><strong>Important:</strong> This link will expire in 30 minutes for security reasons.</p>
                      <p style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; font-size: 14px; color: #666;">If you did not request a password reset, please ignore this email or contact support if you have concerns about your account security.</p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px; text-align: center; background: #f8f8f8; border-radius: 0 0 8px 8px; font-size: 12px; color: #666;">
                      <p>&copy; ${new Date().getFullYear()} ResiLinked. All rights reserved.</p>
                      <p>This is an automated email, please do not reply.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      // Anti-spam headers
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High", 
        "Importance": "High",
        "X-Entity-Ref-ID": `resilinked-reset-${new Date().getTime()}`,
        "List-Unsubscribe": `<mailto:unsubscribe@resilinked.com?subject=unsubscribe>`,
        "X-Report-Abuse": `Please report abuse here: ${frontendUrl}/report-abuse`,
        "Feedback-ID": `reset:resilinked:${new Date().toISOString().slice(0, 10)}`,
        "X-Mailer": "ResiLinked Account Services"
      },
      category: ["account", "password-reset"]
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

/**
 * Add these environment variables to your .env file to prevent emails from going to spam:
 * 
 * DKIM_DOMAIN=yourdomain.com
 * DKIM_SELECTOR=email (or whatever selector you configured with your DNS provider)
 * DKIM_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
 * 
 * Make sure to set up SPF and DMARC records in your DNS settings as well.
 * See EMAIL_SETUP.md for detailed instructions.
 */
module.exports = {
  sendVerificationEmail,
  sendResetEmail,
  verifyConnection
};