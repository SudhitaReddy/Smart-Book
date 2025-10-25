// routes/sellerRequest.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createRequest,
  getRequests,
  approveRequest,
  rejectRequest,
} = require("../controllers/sellerController");

/* ===============================
   SELLER REQUEST ROUTES
================================ */

// 🧾 User sends a request to become a seller
router.post("/request", protect, createRequest);

// 👑 Admin fetches all pending/under_review requests
router.get("/requests", protect, authorize("admin"), getRequests);

// ✅ Admin approves a seller request (from email button or dashboard)
router.get("/approve/:id", approveRequest);

// ❌ Admin rejects a seller request (from email button or dashboard)
router.get("/reject/:id", rejectRequest);

module.exports = router;
