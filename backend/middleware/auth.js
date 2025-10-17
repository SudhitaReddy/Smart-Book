const jwt = require("jsonwebtoken");
const User = require("../models/user");

/**
 * Protect middleware → requires valid JWT
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("❌ No Bearer token found");
    return res.status(401).json({
      success: false,
      message: "Not authorized, token missing",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    console.log("🔑 Decoded token payload:", decoded);

    if (!decoded.id) {
      return res.status(401).json({ success: false, message: "Invalid token payload" });
    }

    // ✅ Find user in DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: "User is deactivated" });
    }

    console.log(`👤 Authenticated user: ${user.email} (role=${user.role})`);

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Token error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Token invalid or expired",
    });
  }
};

/**
 * Authorize middleware → checks role(s)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      console.warn(`🚫 Role mismatch. Required: ${roles}, Got: ${req.user.role}`);
      return res.status(403).json({
        success: false,
        message: "Access denied: insufficient privileges",
      });
    }

    console.log(`✅ Role authorized: ${req.user.role}`);
    next();
  };
};

/**
 * Optional Auth → attaches user if token valid, else continue as guest
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

      if (decoded.id) {
        req.user = await User.findById(decoded.id);
        console.log("👤 Optional auth attached user:", req.user?.email);
      } else {
        req.user = null;
      }
    } catch (error) {
      console.warn("⚠️ Optional auth failed:", error.message);
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

module.exports = { protect, authorize, optionalAuth };
