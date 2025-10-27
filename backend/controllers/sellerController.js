const Seller = require("../models/seller");
const SellerRequest = require("../models/sellerRequest");
const User = require("../models/user");
const sendMail = require("../utils/sendEmail");

/* ===============================
   Get all sellers (Admin)
================================ */
const getAll = async (req, res) => {
  try {
    const sellers = await Seller.find()
      .populate("user", "name email mobile role isActive")
      .populate("verificationStatus.verifiedBy", "name email");

    res.json({ success: true, data: { sellers } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===============================
   Get seller by ID
================================ */
const getById = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id)
      .populate("user", "name email mobile role isActive")
      .populate("verificationStatus.verifiedBy", "name email");

    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });

    res.json({ success: true, data: { seller } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===============================
   Create seller request (User)
================================ */
const createRequest = async (req, res) => {
  try {
    // Check if already has pending/under review
    const existing = await SellerRequest.findOne({
      user: req.user._id,
      status: { $in: ["pending", "under_review"] },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request",
      });
    }

    // Create new request
    const request = new SellerRequest({
      user: req.user._id,
      status: "pending",
      ...req.body,
    });
    await request.save();

    const user = await User.findById(req.user._id).select("name email");

    // Notify user
    if (user?.email) {
      await sendMail({
        to: user.email,
        subject: "📩 Seller Request Received",
        html: `
          <h3>Hi ${user.name},</h3>
          <p>Thank you for applying to become a seller.</p>
          <p>Your request is <b>pending review</b>.</p>
        `,
      });
    }

    // Notify admin
    if (process.env.ADMIN_EMAIL) {
      const approveUrl = `${process.env.REACT_APP_API_URL}/api/seller-requests/requests/${request._id}/approve`;
      const rejectUrl = `${process.env.REACT_APP_API_URL}/api/seller-requests/requests/${request._id}/reject`;

      await sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: "⚡ New Seller Request Submitted",
        html: `
          <h3>New Seller Request</h3>
          <p><b>User:</b> ${user?.name} (${user?.email})</p>
          <p><b>Business:</b> ${req.body.businessName || "-"}</p>
          <p>Status: <b>Pending</b></p>
          <div style="margin-top:10px;">
            <a href="${approveUrl}" style="background:#4CAF50;color:white;padding:8px 12px;text-decoration:none;border-radius:5px;">✅ Approve</a>
            <a href="${rejectUrl}" style="background:#F44336;color:white;padding:8px 12px;text-decoration:none;border-radius:5px;margin-left:10px;">❌ Reject</a>
          </div>
          <p style="margin-top:10px;">Click one of the buttons above to process the request instantly.</p>
        `,
      });
    }

    res.json({
      success: true,
      message: "Seller request submitted successfully",
      data: request,
    });
  } catch (err) {
    console.error("❌ Seller request error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error while submitting request",
    });
  }
};

/* ===============================
   Get all pending/under review requests (Admin)
================================ */
const getRequests = async (req, res) => {
  try {
    const requests = await SellerRequest.find({
      status: { $in: ["pending", "under_review"] },
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { requests } });
  } catch (err) {
    console.error("❌ Get seller requests error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===============================
   Approve seller request (Admin)
================================ */
const approveRequest = async (req, res) => {
  try {
    const request = await SellerRequest.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Seller request not found" });

    // Mark as approved
    request.status = "approved";
    request.reviewedAt = new Date();
    await request.save();

    // Create seller profile
    await Seller.create({
      user: request.user._id,
      businessName: request.businessName,
      businessType: request.businessType,
      description: request.description,
      businessAddress: request.businessAddress,
      contactInfo: request.contactInfo,
      documents: request.documents,
      status: "approved",
    });

    // Notify user
    if (request.user?.email) {
      await sendMail({
        to: request.user.email,
        subject: "✅ Seller Request Approved",
        html: `
          <h3>Hello ${request.user.name},</h3>
          <p>Your seller request has been <b>approved</b>.</p>
          <p>You can now access your <a href="${process.env.CLIENT_URL}/seller-dashboard.html">Seller Dashboard</a>.</p>
        `,
      });
    }

    res.json({
      success: true,
      message: "Seller request approved successfully",
      data: request,
    });
  } catch (err) {
    console.error("❌ Approve seller request error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===============================
   Reject seller request (Admin)
================================ */
const rejectRequest = async (req, res) => {
  try {
    const request = await SellerRequest.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Seller request not found" });

    request.status = "rejected";
    request.reviewNotes = req.body.reason || "Rejected by admin";
    await request.save();

    // Notify user
    if (request.user?.email) {
      await sendMail({
        to: request.user.email,
        subject: "❌ Seller Request Rejected",
        html: `
          <h3>Hello ${request.user.name},</h3>
          <p>Unfortunately, your seller request was <b>rejected</b>.</p>
          <p>Reason: ${req.body.reason || "Not specified"}</p>
        `,
      });
    }

    res.json({
      success: true,
      message: "Seller request rejected successfully",
      data: request,
    });
  } catch (err) {
    console.error("❌ Reject seller request error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===============================
   Admin Utility: Update Status, Commission, Active
================================ */
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    res.json({ success: true, data: { seller } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateCommission = async (req, res) => {
  try {
    const { commissionRate } = req.body;
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { commissionRate },
      { new: true }
    );
    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    res.json({ success: true, data: { seller } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const toggleActive = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    seller.isActive = !seller.isActive;
    await seller.save();
    res.json({ success: true, data: { seller } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===============================
   Exports
================================ */
module.exports = {
  getAll,
  getById,
  createRequest,
  getRequests,
  approveRequest,
  rejectRequest,
  updateStatus,
  updateCommission,
  toggleActive,
};
