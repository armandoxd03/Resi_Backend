#!/usr/bin/env node

/**
 * Email Anti-Spam Test Script for ResiLinked
 * 
 * This script sends a test email to verify that the anti-spam 
 * configuration is working correctly.
 * 
 * Usage:
 * node test-email-spam.js your@email.com
 */

require('dotenv').config();
const mailer = require('./utils/mailer');

// Get recipient email from command line args
const recipientEmail = process.argv[2];

if (!recipientEmail) {
  console.error('❌ Error: No recipient email provided');
  console.log('Usage: node test-email-spam.js your@email.com');
  process.exit(1);
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(recipientEmail)) {
  console.error('❌ Error: Invalid email format');
  process.exit(1);
}

console.log(`🔍 Testing email configuration with anti-spam measures...`);
console.log(`📧 Sending test email to: ${recipientEmail}`);

// Create a fake token for testing
const testToken = `test-${Date.now()}`;

// Send test email
mailer.sendVerificationEmail(recipientEmail, testToken)
  .then(() => {
    console.log('✅ Test email sent successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Check your inbox (and spam folder) for the test email');
    console.log('2. If the email is in spam, check the email headers for authentication results');
    console.log('3. Verify that DKIM, SPF and DMARC passed in the headers');
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to send test email:', error.message);
    console.error(error);
    process.exit(1);
  });