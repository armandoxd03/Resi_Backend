// frontend-api-diagnostic.js
// This script helps diagnose API connection issues between your frontend and backend
// Add this to your frontend project and run it to check your configuration

/**
 * HOW TO USE:
 * 1. Add this file to your frontend project
 * 2. Import and call the function in a component or page
 *    Example: `diagnoseBrowserApiConnection()`
 * 3. Check the browser console for detailed results
 */

function diagnoseBrowserApiConnection() {
  console.log('=======================================');
  console.log('FRONTEND-BACKEND CONNECTION DIAGNOSTICS');
  console.log('=======================================');

  // Get API URL environment variable (format will depend on your framework)
  let apiBaseUrl;
  
  // For Next.js
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL) {
    apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log('✅ Found Next.js environment variable: NEXT_PUBLIC_API_URL');
  } 
  // For Vite/React
  else if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    apiBaseUrl = import.meta.env.VITE_API_URL;
    console.log('✅ Found Vite environment variable: VITE_API_URL');
  } 
  // For Create React App
  else if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    apiBaseUrl = process.env.REACT_APP_API_URL;
    console.log('✅ Found React environment variable: REACT_APP_API_URL');
  }
  
  // Check if API URL is properly set
  if (!apiBaseUrl) {
    console.error('❌ API URL environment variable not found');
    console.error('The following variables should be set in your .env file:');
    console.error('- NEXT_PUBLIC_API_URL (for Next.js)');
    console.error('- VITE_API_URL (for Vite)');
    console.error('- REACT_APP_API_URL (for Create React App)');
    console.error('\nCurrently defaulting to localhost:5000');
    apiBaseUrl = 'http://localhost:5000';
  }
  
  console.log(`🌐 API Base URL: ${apiBaseUrl}`);
  
  // Check if API URL is localhost (which won't work in production)
  if (window.location.hostname !== 'localhost' && apiBaseUrl.includes('localhost')) {
    console.error('❌ ERROR: Using localhost API URL in production environment!');
    console.error('This will cause connection errors because the browser cannot connect to localhost on the server.');
    console.error('Set your environment variable to your Render backend URL: https://resilinked-backend.onrender.com');
  }
  
  // Test API health endpoint
  console.log('\n🔍 Testing API health endpoint...');
  fetch(`${apiBaseUrl}/health`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('✅ API health check successful!');
      console.log('📊 Health check response:', data);
    })
    .catch(error => {
      console.error(`❌ API health check failed: ${error.message}`);
      console.error('This could be due to:');
      console.error('1. Backend server is not running');
      console.error('2. CORS is not properly configured');
      console.error('3. Network connectivity issues');
      console.error('4. Incorrect API URL');
    });
  
  // Test CORS configuration
  console.log('\n🔍 Checking CORS configuration...');
  const corsTestUrl = `${apiBaseUrl}/api/auth/verify`;
  
  fetch(corsTestUrl, {
    method: 'OPTIONS',
    headers: {
      'Origin': window.location.origin,
      'Access-Control-Request-Method': 'GET'
    }
  })
    .then(response => {
      if (response.ok || response.status === 204) {
        console.log('✅ CORS preflight request successful');
        
        // Now try a real request
        return fetch(corsTestUrl, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        throw new Error(`CORS preflight failed: ${response.status}`);
      }
    })
    .then(response => {
      // Even if we get a 401 Unauthorized, that's expected without a token
      // We're just testing if the request goes through CORS
      console.log(`✅ CORS actual request completed with status: ${response.status}`);
      console.log('CORS is properly configured!');
    })
    .catch(error => {
      console.error(`❌ CORS test failed: ${error.message}`);
      console.error('Make sure your backend has the following environment variables:');
      console.error(`CLIENT_URL=https://resi-frontend.vercel.app,https://resilinked.vercel.app`);
      console.error('And that CORS middleware is properly configured in your app.js');
    });
  
  // Display browser information
  console.log('\n📱 Browser Information:');
  console.log(`User Agent: ${navigator.userAgent}`);
  console.log(`Current URL: ${window.location.href}`);
  console.log(`Origin: ${window.location.origin}`);
  
  console.log('\n🔄 If you\'re seeing connection errors, try:');
  console.log('1. Updating your frontend environment variables');
  console.log('2. Ensuring your backend is running');
  console.log('3. Checking CORS settings in your backend');
  console.log('4. Clearing your browser cache');
  console.log('=======================================');
}

// Export the function
export default diagnoseBrowserApiConnection;