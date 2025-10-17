const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email, password);

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Your account is deactivated. Contact support." });
    }

    const isMatch = await user.comparePassword(password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment");
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      expiresIn: "7d",
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    console.error("🔥 Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
