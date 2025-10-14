#!/usr/bin/env node

/**
 * Email Test Script for ResiLinked
 * 
 * This script tests both verification emails and password reset emails
 * with the anti-spam configuration.
 * 
 * Usage:
 * node test-emails.js your@email.com [verify|reset|both]
 */

require('dotenv').config();
const mailer = require('./utils/mailer');

// Get recipient email from command line args
const recipientEmail = process.argv[2];
const emailType = process.argv[3]?.toLowerCase() || 'both';

if (!recipientEmail) {
  console.error('❌ Error: No recipient email provided');
  console.log('Usage: node test-emails.js your@email.com [verify|reset|both]');
  process.exit(1);
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(recipientEmail)) {
  console.error('❌ Error: Invalid email format');
  process.exit(1);
}

console.log(`🔍 Testing emails with anti-spam measures...`);
console.log(`📧 Will send ${emailType} email(s) to: ${recipientEmail}`);

// Functions to send test emails
const sendVerificationEmail = async () => {
  console.log('\n📨 Sending verification email...');
  const testToken = `verify-${Date.now()}`;
  await mailer.sendVerificationEmail(recipientEmail, testToken);
  console.log('✅ Verification email sent successfully!');
};

const sendPasswordResetEmail = async () => {
  console.log('\n📨 Sending password reset email...');
  const resetToken = `reset-${Date.now()}`;
  const resetLink = `/reset-password/${resetToken}`;
  await mailer.sendResetEmail(recipientEmail, resetLink);
  console.log('✅ Password reset email sent successfully!');
};

// Main function
const runTests = async () => {
  try {
    if (emailType === 'verify' || emailType === 'both') {
      await sendVerificationEmail();
    }
    
    if (emailType === 'reset' || emailType === 'both') {
      await sendPasswordResetEmail();
    }
    
    console.log('\n📝 Next steps:');
    console.log('1. Check your inbox (and spam folder) for the test email(s)');
    console.log('2. If the email is in spam, check the email headers for authentication results');
    console.log('3. Verify that DKIM, SPF and DMARC passed in the headers');
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Failed to send email(s):`, error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run the tests
runTests();