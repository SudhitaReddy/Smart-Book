// routes/seller.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getAll,
  getById,
  updateStatus,
  updateCommission,
  toggleActive,
} = require("../controllers/sellerController");

const Seller = require("../models/seller");
const Product = require("../models/product");
const Order = require("../models/order");

/* ===============================
   ADMIN CONTROLS (MANAGE SELLERS)
================================ */

// 👑 Get all sellers
router.get("/", protect, authorize("admin"), getAll);

// 👑 Get specific seller by ID
router.get("/:id", protect, authorize("admin"), getById);

// 👑 Update seller status (active, inactive, etc.)
router.put("/:id/status", protect, authorize("admin"), updateStatus);

// 👑 Update commission rate
router.put("/:id/commission", protect, authorize("admin"), updateCommission);

// 👑 Toggle seller active/inactive
router.put("/:id/toggle", protect, authorize("admin"), toggleActive);

/* ===============================
   SELLER DASHBOARD (SELF)
================================ */

// 📊 Get seller stats
router.get("/dashboard", protect, authorize("seller", "admin"), async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller)
      return res.status(404).json({ success: false, message: "Seller profile not found" });

    res.json({
      success: true,
      data: {
        businessName: seller.businessName,
        totalProducts: seller.stats?.totalProducts || 0,
        totalSales: seller.stats?.totalSales || 0,
        totalRevenue: seller.stats?.totalRevenue || 0,
        averageRating: seller.stats?.averageRating || 0,
      },
    });
  } catch (err) {
    console.error("❌ Dashboard error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ===============================
   SELLER PRODUCT MANAGEMENT
================================ */

// ➕ Add product
router.post("/products", protect, authorize("seller", "admin"), async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller)
      return res.status(404).json({ success: false, message: "Seller profile not found" });

    const product = await Product.create({
      ...req.body,
      seller: seller._id,
      imageUrl: req.body.imageUrl || null,
    });

    seller.stats.totalProducts = (seller.stats.totalProducts || 0) + 1;
    await seller.save();

    res.json({ success: true, message: "Product added", data: { product } });
  } catch (err) {
    console.error("❌ Add product error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📦 Get all seller products
router.get("/products", protect, authorize("seller", "admin"), async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller)
      return res.status(404).json({ success: false, message: "Seller profile not found" });

    const products = await Product.find({ seller: seller._id });
    res.json({ success: true, data: { products } });
  } catch (err) {
    console.error("❌ Get products error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✏️ Update product
router.put("/products/:id", protect, authorize("seller", "admin"), async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller)
      return res.status(404).json({ success: false, message: "Seller profile not found" });

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: seller._id },
      req.body,
      { new: true }
    );

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product updated", data: { product } });
  } catch (err) {
    console.error("❌ Update product error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ❌ Delete product
router.delete("/products/:id", protect, authorize("seller", "admin"), async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller)
      return res.status(404).json({ success: false, message: "Seller profile not found" });

    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      seller: seller._id,
    });

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    seller.stats.totalProducts = Math.max((seller.stats.totalProducts || 1) - 1, 0);
    await seller.save();

    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("❌ Delete product error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ===============================
   SELLER ORDERS
================================ */
router.get("/orders", protect, authorize("seller", "admin"), async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller)
      return res.status(404).json({ success: false, message: "Seller profile not found" });

    const orders = await Order.find({ "items.seller": seller._id }).populate(
      "user",
      "name email"
    );

    res.json({ success: true, data: { orders } });
  } catch (err) {
    console.error("❌ Orders error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
