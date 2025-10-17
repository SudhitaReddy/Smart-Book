const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");
const User = require("../models/user");
const generateToken = require("../utils/generateToken");
const { protect } = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail");

// ===============================
// LOGIN
// ===============================
router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
      if (!user.isActive) {
        return res.status(401).json({ success: false, message: "Account is deactivated" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      const token = generateToken(user);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (err) {
      console.error("🔥 Login error:", err);
      res.status(500).json({ success: false, message: "Server error during login" });
    }
  }
);

// ===============================
// GET CURRENT USER
// ===============================
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: { user } });
  } catch (err) {
    console.error("🔥 Get user error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===============================
// UPDATE PROFILE
// ===============================
router.put(
  "/update",
  protect,
  [
    body("name").optional().notEmpty(),
    body("mobile").optional().isMobilePhone(),
    body("password").optional().isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const updates = { ...req.body };
      const user = await User.findById(req.user._id).select("+password");

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (updates.name) user.name = updates.name;
      if (updates.mobile) user.mobile = updates.mobile;
      if (updates.password) user.password = updates.password; // will hash via pre("save")

      await user.save();

      res.json({
        success: true,
        message: "Profile updated",
        data: { user: user.toJSON() },
      });
    } catch (err) {
      console.error("🔥 Update profile error:", err);
      res.status(500).json({ success: false, message: "Server error while updating profile" });
    }
  }
);

// ===============================
// ADD ADDRESS
// ===============================
router.post("/address", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.push(req.body);
    await user.save();

    res.json({
      success: true,
      message: "Address added",
      data: { addresses: user.addresses },
    });
  } catch (err) {
    console.error("🔥 Add address error:", err);
    res.status(500).json({ success: false, message: "Server error while adding address" });
  }
});

// ===============================
// FORGOT PASSWORD
// ===============================
router.post("/forgot-password", [body("email").isEmail()], async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "No user found with that email" });
    }

    if (!user.email) {
      return res.status(400).json({ success: false, message: "This account does not have a valid email address" });
    }

    // ✅ Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // ✅ Build reset link
    const resetUrl = `${process.env.CLIENT_URL}/reset-password.html?token=${resetToken}`;
    const message = `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>You requested to reset your password. Click below to reset:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>This link will expire in 15 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: "Password Reset - SmartBook",
      html: message,
    });

    res.json({ success: true, message: "Password reset link sent to email" });
  } catch (err) {
    console.error("🔥 Forgot password error:", err);
    res.status(500).json({ success: false, message: "Server error during forgot password" });
  }
});

// ===============================
// RESET PASSWORD
// ===============================
// ===============================
// RESET PASSWORD
// ===============================
// ===============================
// RESET PASSWORD
// ===============================
router.put("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash token
    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Look up by resetToken and resetTokenExpire (matches your model)
    const user = await User.findOne({
      resetToken: resetTokenHash,
      resetTokenExpire: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    // Set new password
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.json({ success: true, message: "Password reset successful. Please login with new password." });
  } catch (err) {
    console.error("🔥 Reset password error:", err);
    res.status(500).json({ success: false, message: "Server error during reset password" });
  }
});

// ===============================
// OTP REGISTER FLOW
// ===============================
let otpStore = {}; // In-memory (use Redis/DB in production)

// Send OTP
router.post("/send-otp-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        redirect: "/login.html",
        message: "Account already exists. Please login.",
      });
    }

    const existing = otpStore[email];
    if (existing && existing.expireAt > Date.now()) {
      return res.json({ success: true, message: "OTP already sent. Please check your email." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expireAt: Date.now() + 5 * 60 * 1000 };

    const html = `<p>Your SmartBook OTP is <b>${otp}</b>. It is valid for 5 minutes.</p>`;
    await sendEmail({
      to: email,
      subject: "SmartBook Email Verification OTP",
      html,
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("🔥 Send OTP error:", err);
    res.status(500).json({ success: false, message: "Server error while sending OTP" });
  }
});

// Verify OTP and Register
// Verify OTP and Register
// Verify OTP and Register
router.post("/verify-otp-email", async (req, res) => {
  try {
    const { name, email, mobile, password, otp } = req.body;

    // Validate all required fields BEFORE hitting DB
    if (!name || !email || !mobile || !password || !otp) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const record = otpStore[email];
    if (!record) {
      return res.status(400).json({ success: false, message: "No OTP found. Please request again." });
    }

    if (record.expireAt < Date.now()) {
      delete otpStore[email];
      return res.status(400).json({ success: false, message: "OTP expired. Please request again." });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    delete otpStore[email];

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Create user
    const newUser = new User({ name, email, mobile, password });
    await newUser.save();

    res.json({ success: true, message: "Signup successful! Please login now." });

  } catch (err) {
    console.error("🔥 Verify OTP error:", err.message, err);
    res.status(500).json({
      success: false,
      message: "Server error while verifying OTP",
      error: err.message,   // 👈 return actual reason to frontend
    });
  }
});


module.exports = router;
