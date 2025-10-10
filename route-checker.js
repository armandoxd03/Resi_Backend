// route-checker.js - Find and fix malformed Express routes
const fs = require('fs');
const path = require('path');
const express = require('express');

// Directory containing route files
const routesDir = path.join(__dirname, 'routes');

console.log('🔍 Checking routes for URL patterns and malformed paths...');

// Function to scan a route file for potential issues
function scanRouteFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileRelativePath = path.relative(__dirname, filePath);
    
    // Look for URLs in route paths
    const urlInRoutePattern = /router\.(get|post|put|delete|patch|use)\(['"]https?:/g;
    const urlMatches = content.match(urlInRoutePattern);
    
    if (urlMatches && urlMatches.length > 0) {
      console.log(`⚠️  WARNING: Found URL pattern in route path in ${fileRelativePath}:`);
      console.log(`    ${urlMatches.join(', ')}`);
    }
    
    // Look for unusual route path characters that might cause issues
    const unusualRouteChars = /router\.(get|post|put|delete|patch|use)\(['"][^'"]*[<>:$?#{}|\\^[\]`][^'"]*['"],/g;
    const unusualMatches = content.match(unusualRouteChars);
    
    if (unusualMatches && unusualMatches.length > 0) {
      console.log(`⚠️  WARNING: Found unusual characters in route path in ${fileRelativePath}:`);
      console.log(`    ${unusualMatches.join(', ')}`);
    }
  } catch (err) {
    console.error(`❌ Error scanning ${filePath}: ${err.message}`);
  }
}

// Scan all route files in the routes directory
fs.readdirSync(routesDir).forEach(file => {
  if (file.endsWith('.js')) {
    scanRouteFile(path.join(routesDir, file));
  }
});

// Also check app.js for direct route definitions
scanRouteFile(path.join(__dirname, 'app.js'));

// Create a temporary Express app to check routes
const app = express();
const router = express.Router();

console.log('\n🔧 Testing route patterns with Express...');

// Test potentially problematic route patterns
const testRoutes = [
  '/',
  '/api/auth',
  '/api/users/:id',
  '/users/https://example.com', // This will fail
  '/help?q=test',
  '/reports/download.pdf',
  'https://git.new/pathToRegexpError' // This will fail
];

let issueCaught = false;

testRoutes.forEach(route => {
  try {
    router.get(route, (req, res) => res.send('ok'));
    console.log(`✅ Valid route: ${route}`);
  } catch (err) {
    issueCaught = true;
    console.log(`❌ Invalid route detected: ${route}`);
    console.log(`   Error: ${err.message}`);
  }
});

if (!issueCaught) {
  console.log('\n⚠️ No issues detected with test routes. The problem may be in middleware or a more complex route setup.');
} else {
  console.log('\n🔍 One or more test routes failed. Check your routes for similar patterns.');
}

console.log('\n✅ Route check completed.');