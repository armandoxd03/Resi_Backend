// middleware/verifyAdmin.js
const User = require('../models/User');

/**
 * ✅ Verify Admin Middleware
 * Allows only users with userType === "admin"
 */
module.exports = async (req, res, next) => {
  // Ensure req.user exists from previous token verification
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized: no user info" });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.userType !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    next(); // user is admin, proceed
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({ message: "Authorization check failed", error: error.message });
  }
};
