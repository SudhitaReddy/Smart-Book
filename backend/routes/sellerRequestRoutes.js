const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const SellerRequest = require("../models/sellerRequest");
const User = require("../models/user");
const sendMail = require("../utils/sendEmail");

// ================================
// Create Seller Request
// ================================
router.post("/request", protect, async (req, res) => {
  try {
    // Check if already pending
    const existing = await SellerRequest.findOne({ 
      user: req.user._id, 
      status: { $in: ["pending", "under_review"] } 
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "You already have a pending request" });
    }

    // Create new request
    const request = new SellerRequest({
      user: req.user._id,
      ...req.body
    });
    await request.save();

    // Fetch user info
    const user = await User.findById(req.user._id).select("name email");

    // ✅ Send confirmation email to user
    if (user?.email) {
      await sendMail({
        to: user.email,
        subject: "Seller Request Received",
        html: `
          <h3>Hi ${user.name},</h3>
          <p>Thank you for your interest in becoming a seller.</p>
          <p>Your request has been received and is currently <b>pending review</b>.</p>
          <p>You will receive another email once it has been reviewed by our admin team.</p>
        `
      });
    }

    // ✅ Optional: Send notification email to admin
    if (process.env.ADMIN_EMAIL) {
      await sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: "New Seller Request Submitted",
        html: `
          <h3>New Seller Request Submitted</h3>
          <p><b>User:</b> ${user?.name} (${user?.email})</p>
          <p><b>Business Name:</b> ${req.body.businessName}</p>
          <p>Status: Pending</p>
          <p>Login to your admin dashboard to review the request.</p>
        `
      });
    }

    res.json({ success: true, message: "Seller request submitted", data: request });
  } catch (err) {
    console.error("❌ Seller request error:", err);
    res.status(500).json({ success: false, message: "Server error while submitting request" });
  }
});

// ================================
// Get current user's seller request
// ================================
router.get("/my-request", protect, async (req, res) => {
  try {
    const request = await SellerRequest.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: request });
  } catch (err) {
    console.error("❌ Get my request error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
