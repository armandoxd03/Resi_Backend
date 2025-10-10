// port-cleaner.js - Use this script to free up a port that's already in use
// Run with: node port-cleaner.js 5000

const { execSync } = require('child_process');

// Get the port from command line arguments
const port = process.argv[2];

if (!port) {
  console.error('❌ Please provide a port number: node port-cleaner.js PORT');
  process.exit(1);
}

console.log(`🔍 Checking for processes using port ${port}...`);

try {
  // For Windows
  if (process.platform === 'win32') {
    // Find the PID using the port
    const findCommand = `netstat -ano | findstr :${port}`;
    console.log(`Running: ${findCommand}`);
    
    const result = execSync(findCommand, { encoding: 'utf-8' });
    console.log('Results:');
    console.log(result);
    
    // Extract PIDs - this is a simple extraction and might need refinement
    const lines = result.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      console.log(`✅ No process found using port ${port}`);
      process.exit(0);
    }
    
    // Extract PIDs (last column in netstat output)
    const pids = [...new Set(lines.map(line => {
      const parts = line.trim().split(/\s+/);
      return parts[parts.length - 1];
    }).filter(pid => pid !== '0'))];
    
    if (pids.length === 0) {
      console.log(`✅ No active process found using port ${port}`);
      process.exit(0);
    }
    
    console.log(`Found ${pids.length} process(es) using port ${port}: ${pids.join(', ')}`);
    
    // Kill each PID
    pids.forEach(pid => {
      try {
        console.log(`Killing process with PID ${pid}...`);
        execSync(`taskkill /F /PID ${pid}`, { encoding: 'utf-8' });
        console.log(`✅ Process ${pid} terminated successfully`);
      } catch (killError) {
        console.error(`❌ Failed to kill process ${pid}:`, killError.message);
      }
    });
  } 
  // For Unix-like systems (Linux, macOS)
  else {
    const findCommand = `lsof -i :${port} -t`;
    console.log(`Running: ${findCommand}`);
    
    const result = execSync(findCommand, { encoding: 'utf-8' });
    const pids = result.split('\n').filter(pid => pid.trim().length > 0);
    
    if (pids.length === 0) {
      console.log(`✅ No process found using port ${port}`);
      process.exit(0);
    }
    
    console.log(`Found ${pids.length} process(es) using port ${port}: ${pids.join(', ')}`);
    
    // Kill each PID
    pids.forEach(pid => {
      try {
        console.log(`Killing process with PID ${pid}...`);
        execSync(`kill -9 ${pid}`, { encoding: 'utf-8' });
        console.log(`✅ Process ${pid} terminated successfully`);
      } catch (killError) {
        console.error(`❌ Failed to kill process ${pid}:`, killError.message);
      }
    });
  }
  
  console.log(`✅ Port ${port} should now be free`);
  
} catch (error) {
  if (error.status === 1 && process.platform !== 'win32') {
    console.log(`✅ No process found using port ${port}`);
  } else {
    console.error(`❌ Error checking port ${port}:`, error.message);
  }
}