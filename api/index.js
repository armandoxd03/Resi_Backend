// Vercel serverless function entry point
// TEMPORARY: Skip app.js loading to test if Vercel function works at all

module.exports = async (req, res) => {
  try {
    // Set CORS headers immediately
    const origin = req.headers.origin;
    if (origin && (origin.includes('localhost') || origin.includes('vercel.app'))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Cache-Control, Pragma');

    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Return test response
    return res.status(200).json({
      success: true,
      message: 'Vercel function is working!',
      path: req.url,
      method: req.method,
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Function error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};
