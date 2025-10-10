// test-email.js - Script to test email configuration
require('dotenv').config();
const { sendVerificationEmail, verifyConnection } = require('./utils/mailer');

// Immediately invoked async function
(async () => {
  console.log('🔍 Testing email configuration...');
  
  try {
    // First check connection config
    console.log('\n📧 Verifying email configuration:');
    const isConfigured = await verifyConnection();
    console.log(`Email configuration status: ${isConfigured ? '✅ Ready' : '❌ Not properly configured'}`);
    
    if (!isConfigured) {
      console.error('❌ Email is not properly configured. Please check your .env file.');
      return;
    }
    
    // Ask for test email address
    const testEmail = process.argv[2];
    if (!testEmail) {
      console.error('❌ Please provide a test email address as an argument: node test-email.js your-email@example.com');
      return;
    }
    
    // Send a test verification email
    console.log(`\n📨 Sending test verification email to ${testEmail}...`);
    const testToken = 'TEST-TOKEN-' + Math.random().toString(36).substring(2, 15);
    await sendVerificationEmail(testEmail, testToken);
    console.log(`\n✅ Test email sent successfully to ${testEmail}! Please check your inbox.`);
    
  } catch (error) {
    console.error(`\n❌ Email test failed: ${error.message}`);
    console.error(error.stack);
  }
})();