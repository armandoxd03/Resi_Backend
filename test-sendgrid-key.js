// test-sendgrid-key.js
// Script to test if SendGrid API key is valid
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

async function testSendGridKey() {
  console.log('======================================');
  console.log('  TESTING SENDGRID API KEY VALIDITY');
  console.log('======================================');
  
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    console.error('❌ SENDGRID_API_KEY environment variable is not set');
    return false;
  }
  
  if (!apiKey.startsWith('SG.')) {
    console.error('❌ Invalid SendGrid API key format - should start with "SG."');
    return false;
  }
  
  console.log('✅ API key format looks valid');
  console.log('🔑 API key (masked): ', apiKey.substring(0, 7) + '...' + apiKey.substring(apiKey.length - 5));
  
  try {
    // Set the API key
    sgMail.setApiKey(apiKey);
    
    // Test the API key by making a simple request
    console.log('📨 Testing API key with SendGrid...');
    
    // Get SendGrid API information
    const response = await sgMail.request({
      method: 'GET',
      url: '/v3/user/credits',
    });
    
    console.log('✅ SendGrid API key is valid!');
    console.log('📊 Account information:');
    console.log(JSON.stringify(response[0].body, null, 2));
    return true;
  } catch (error) {
    console.error('❌ SendGrid API key validation failed:');
    console.error(error.response ? error.response.body : error.message);
    return false;
  } finally {
    console.log('======================================');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSendGridKey()
    .then(isValid => {
      if (!isValid) process.exit(1);
    })
    .catch(err => {
      console.error('Unexpected error:', err);
      process.exit(1);
    });
}

module.exports = testSendGridKey;