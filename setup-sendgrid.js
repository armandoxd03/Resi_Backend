// setup-sendgrid.js - Configure SendGrid API key for ResiLinked
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔑 SendGrid API Key Setup for ResiLinked');
console.log('----------------------------------------');
console.log('This script will help you configure SendGrid for your ResiLinked app.');
console.log('Follow these steps to get your SendGrid API key:');
console.log('1. Create a SendGrid account at https://app.sendgrid.com/');
console.log('2. Verify your sender identity (email address)');
console.log('3. Navigate to Settings > API Keys');
console.log('4. Create a new API key with "Full Access" or "Restricted Access" with Mail Send permissions');
console.log('5. Copy the API key (it starts with "SG.")');
console.log('----------------------------------------\n');

// Prompt for API key
rl.question('Please enter your SendGrid API key (starts with SG.): ', async (apiKey) => {
  if (!apiKey) {
    console.error('❌ No API key provided. Setup cancelled.');
    rl.close();
    return;
  }

  if (!apiKey.startsWith('SG.')) {
    console.error('❌ Invalid API key format. SendGrid API keys must start with "SG."');
    rl.close();
    return;
  }

  // Update .env file
  try {
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace existing SENDGRID_API_KEY line
    const regex = /SENDGRID_API_KEY=.*/;
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `SENDGRID_API_KEY=${apiKey}`);
    } else {
      // Add new line if not found
      envContent += `\nSENDGRID_API_KEY=${apiKey}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ SendGrid API key saved to .env file');
    
    // Test the configuration
    console.log('\n🧪 Testing SendGrid configuration...');
    
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(apiKey);
    
    // Ask for test email
    rl.question('\nEnter an email address to receive a test message: ', async (email) => {
      if (!email || !email.includes('@')) {
        console.error('❌ Invalid email address. Test cancelled.');
        rl.close();
        return;
      }
      
      try {
        const msg = {
          to: email,
          from: process.env.EMAIL_FROM || 'ResiLinked <resilinked@gmail.com>',
          subject: 'ResiLinked SendGrid Test',
          text: 'This is a test email from ResiLinked using SendGrid.',
          html: '<h3>SendGrid Test Successful!</h3><p>Your ResiLinked app is now configured to send emails through SendGrid.</p>',
        };
        
        await sgMail.send(msg);
        console.log(`✅ Test email sent successfully to ${email}`);
        console.log('🚀 SendGrid is now configured for your ResiLinked application!');
      } catch (error) {
        console.error('❌ SendGrid test failed:');
        console.error(error.response ? error.response.body : error);
        console.log('\n⚠️ Please check:');
        console.log('1. The API key is correct');
        console.log('2. Your SendGrid account is active');
        console.log('3. The sender identity (EMAIL_FROM) is verified in SendGrid');
      } finally {
        rl.close();
      }
    });
  } catch (error) {
    console.error('❌ Failed to update .env file:', error.message);
    rl.close();
  }
});