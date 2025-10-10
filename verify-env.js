// verify-env.js
// Script to check if environment variables are correctly configured
require('dotenv').config();

console.log('--------------------------------------');
console.log('ENVIRONMENT VARIABLES VERIFICATION');
console.log('--------------------------------------');

// Check critical environment variables
const criticalVars = [
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'SENDGRID_API_KEY',
  'EMAIL_FROM',
  'CLIENT_URL',
  'FRONTEND_URL'
];

const emailVars = [
  'EMAIL_SERVICE',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_SECURE',
  'EMAIL_USER',
  'EMAIL_PASS'
];

console.log('\n1. CHECKING CRITICAL VARIABLES:');
let allCriticalVarsPresent = true;
criticalVars.forEach(variable => {
  const value = process.env[variable];
  const isPresent = !!value;
  console.log(`${variable}: ${isPresent ? '✓ PRESENT' : '✗ MISSING'}`);
  
  if (!isPresent) {
    allCriticalVarsPresent = false;
  }
});

console.log('\n2. CHECKING EMAIL CONFIGURATION:');
let emailConfigPresent = true;
emailVars.forEach(variable => {
  const value = process.env[variable];
  const isPresent = !!value;
  console.log(`${variable}: ${isPresent ? '✓ PRESENT' : '✗ MISSING'}`);
  
  if (!isPresent) {
    emailConfigPresent = false;
  }
});

// Check SendGrid API key format
console.log('\n3. VALIDATING SENDGRID API KEY:');
const sendgridKey = process.env.SENDGRID_API_KEY;
if (!sendgridKey) {
  console.log('✗ SENDGRID_API_KEY is missing');
} else if (!sendgridKey.startsWith('SG.')) {
  console.log('✗ SENDGRID_API_KEY format is invalid - should start with "SG."');
} else if (sendgridKey.includes('your_') || sendgridKey === 'paste_your_sendgrid_api_key_here') {
  console.log('✗ SENDGRID_API_KEY contains placeholder text');
} else {
  console.log('✓ SENDGRID_API_KEY format appears valid');
}

// Check CORS configuration
console.log('\n4. VALIDATING CORS SETTINGS:');
const clientUrl = process.env.CLIENT_URL;
const frontendUrl = process.env.FRONTEND_URL;

if (!clientUrl) {
  console.log('✗ CLIENT_URL is missing');
} else {
  const clientUrls = clientUrl.split(',').map(url => url.trim());
  console.log(`✓ CLIENT_URL contains ${clientUrls.length} origin(s):`);
  clientUrls.forEach(url => console.log(`  - ${url}`));
}

if (!frontendUrl) {
  console.log('✗ FRONTEND_URL is missing');
} else {
  const frontendUrls = frontendUrl.split(',').map(url => url.trim());
  console.log(`✓ FRONTEND_URL contains ${frontendUrls.length} origin(s):`);
  frontendUrls.forEach(url => console.log(`  - ${url}`));
}

// Check for localhost in production
if (process.env.NODE_ENV === 'production') {
  if (clientUrl && clientUrl.includes('localhost')) {
    console.log('⚠ Warning: CLIENT_URL contains localhost URLs in production');
  }
  if (frontendUrl && frontendUrl.includes('localhost')) {
    console.log('⚠ Warning: FRONTEND_URL contains localhost URLs in production');
  }
}

console.log('\n5. SUMMARY:');
console.log(`Critical Variables: ${allCriticalVarsPresent ? '✓ ALL PRESENT' : '✗ SOME MISSING'}`);
console.log(`Email Configuration: ${emailConfigPresent ? '✓ ALL PRESENT' : '✗ SOME MISSING'}`);
console.log(`SendGrid API Key: ${sendgridKey && sendgridKey.startsWith('SG.') ? '✓ VALID FORMAT' : '✗ INVALID OR MISSING'}`);
console.log(`CORS Configuration: ${clientUrl && frontendUrl ? '✓ CONFIGURED' : '✗ INCOMPLETE'}`);

console.log('\nRun this script on Render to verify environment variables are correctly set.');
console.log('--------------------------------------');