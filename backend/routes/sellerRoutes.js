const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const Seller = require("../models/seller");
const SellerRequest = require("../models/sellerRequest");
const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");
const sendMail = require("../utils/sendEmail");

// ===============================
// SELLER REQUEST (Become a Seller)
// ===============================
router.post("/request", protect, async (req, res) => {
  try {
    const existingRequest = await SellerRequest.findOne({
      user: req.user._id,
      status: { $in: ["pending", "under_review"] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending seller request"
      });
    }

    const request = new SellerRequest({
      user: req.user._id,
      businessName: req.body.businessName,
      businessType: req.body.businessType,
      description: req.body.description,
      businessAddress: req.body.businessAddress,
      contactInfo: req.body.contactInfo,
      documents: req.body.documents
    });

    await request.save();

    // Notify user via email
    const user = await User.findById(req.user._id).select("name email");
    if (user?.email) {
      await sendMail({
        to: user.email,
        subject: "Seller Request Submitted",
        html: `<h3>Hi ${user.name},</h3>
               <p>Your seller request has been submitted and is pending review.</p>
               <p>You will be notified once approved or rejected.</p>`
      });
    }

    res.json({ success: true, message: "Seller request submitted", data: request });
  } catch (err) {
    console.error("❌ Seller request error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===============================
// USER: View my seller request
// ===============================
router.get("/my-request", protect, async (req, res) => {
  try {
    const request = await SellerRequest.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: request });
  } catch (err) {
    console.error("❌ Get my request error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===============================
// SELLER DASHBOARD + STATS
// ===============================
async function getSellerStats(req, res) {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller profile not found" });
    }

    res.json({
      success: true,
      data: {
        businessName: seller.businessName,
        totalProducts: seller.stats?.totalProducts || 0,
        totalSales: seller.stats?.totalSales || 0,
        totalRevenue: seller.stats?.totalRevenue || 0,
        averageRating: seller.stats?.averageRating || 0
      }
    });
  } catch (err) {
    console.error("❌ Seller stats error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Dashboard routes
router.get("/dashboard", protect, authorize("seller", "admin"), getSellerStats);
router.get("/stats", protect, authorize("seller", "admin"), getSellerStats);

// ===============================
// MANAGE PRODUCTS
// ===============================

// ➕ Add Product
router.post("/products", protect, authorize("seller", "admin"), async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) return res.status(404).json({ success: false, message: "Seller profile not found" });

    const product = await Product.create({
      ...req.body,
      seller: seller._id,
      imageUrl: req.body.imageUrl || null
    });

    seller.stats.totalProducts = (seller.stats.totalProducts || 0) + 1;
    await seller.save();

    res.json({ success: true, message: "Product added", data: { product } });
  } catch (err) {
    console.error("❌ Add product error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📦 Get all products for seller
router.get("/products", protect, authorize("seller", "admin"), async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) return res.status(404).json({ success: false, message: "Seller profile not found" });

    const products = await Product.find({ seller: seller._id });
    res.json({ success: true, data: { products } });
  } catch (err) {
    console.error("❌ Get products error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📖 Get single product
router.get("/products/:id", protect, authorize("seller", "admin"), async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) return res.status(404).json({ success: false, message: "Seller profile not found" });

    const product = await Product.findOne({ _id: req.params.id, seller: seller._id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, data: { product } });
  } catch (err) {
    console.error("❌ Get single product error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✏️ Update Product
router.put("/products/:id", protect, authorize("seller", "admin"), async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) return res.status(404).json({ success: false, message: "Seller profile not found" });

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: seller._id },
      { ...req.body, imageUrl: req.body.imageUrl || undefined },
      { new: true }
    );

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product updated", data: { product } });
  } catch (err) {
    console.error("❌ Update product error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ❌ Delete Product
router.delete("/products/:id", protect, authorize("seller", "admin"), async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) return res.status(404).json({ success: false, message: "Seller profile not found" });

    const product = await Product.findOneAndDelete({ _id: req.params.id, seller: seller._id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    seller.stats.totalProducts = Math.max((seller.stats.totalProducts || 1) - 1, 0);
    await seller.save();

    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("❌ Delete product error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===============================
// VIEW ORDERS
// ===============================
router.get("/orders", protect, authorize("seller", "admin"), async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) return res.status(404).json({ success: false, message: "Seller profile not found" });

    const orders = await Order.find({ "items.seller": seller._id })
      .populate("user", "name email");

    res.json({ success: true, data: { orders } });
  } catch (err) {
    console.error("❌ Seller orders error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



module.exports = router;
