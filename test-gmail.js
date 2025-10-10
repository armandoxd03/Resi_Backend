// Test the email functionality with a new Gmail account
require('dotenv').config();
const { testEmailSending } = require('./utils/mailer.js.new');

// Get the recipient email from command line arguments or use a default
const recipientEmail = process.argv[2] || 'your-test-recipient@example.com';

async function runTest() {
  console.log('🧪 Starting email configuration test...');
  
  try {
    await testEmailSending(recipientEmail);
    console.log('✅ Email test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    process.exit(1);
  }
}

runTest();