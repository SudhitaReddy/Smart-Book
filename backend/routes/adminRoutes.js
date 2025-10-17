const express = require("express");
const router = express.Router();

// ✅ Middleware imports
const { protect, authorize } = require("../middleware/auth");

// Controllers
const productController = require("../controllers/productController");
const orderController = require("../controllers/orderController");
const userController = require("../controllers/userController");
const sellerController = require("../controllers/sellerController");

/* ===========================
   📌 DASHBOARD ROUTES
=========================== */
router.get("/dashboard", protect, authorize("admin"), async (req, res) => {
  try {
    const User = require("../models/user");
    const Product = require("../models/Product");
    const Order = require("../models/order");
    const Seller = require("../models/seller");
    const SellerRequest = require("../models/sellerRequest"); // if using separate model

    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // ✅ Adjust according to your real schema fields
    const revenueAgg = await Order.aggregate([
      { $match: { status: "completed" } }, // or paymentStatus: "paid"
      { $group: { _id: null, total: { $sum: "$amount" } } } // or totalAmount
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email");

    const summary = {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      totalSellers: await Seller.countDocuments(),
      pendingSellerRequests: await SellerRequest.countDocuments({ status: "pending" }),
      recentOrders
    };

    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard",
      error: err.message
    });
  }
});


/* ===========================
   📌 PRODUCT ROUTES
=========================== */
router.get("/products", protect, authorize("admin"), productController.getAll);
router.get("/products/:id", protect, authorize("admin"), productController.getById);
router.post("/products", protect, authorize("admin"), productController.create);
router.put("/products/:id", protect, authorize("admin"), productController.update);
router.delete("/products/:id", protect, authorize("admin"), productController.remove);

/* ===========================
   📌 ORDER ROUTES
=========================== */
router.get("/orders", protect, authorize("admin"), orderController.getAll);
router.get("/orders/recent", protect, authorize("admin"), orderController.getRecent);
router.get("/orders/:id", protect, authorize("admin"), orderController.getById);
router.put("/orders/:id/status", protect, authorize("admin"), orderController.updateStatus);
router.put("/orders/:id/payment", protect, authorize("admin"), orderController.updatePaymentStatus);

/* ===========================
   📌 USER ROUTES
=========================== */
router.get("/users", protect, authorize("admin"), userController.getAll);
router.get("/users/:id", protect, authorize("admin"), userController.getById);
router.put("/users/:id/role", protect, authorize("admin"), userController.updateRole);
router.put("/users/:id/toggle", protect, authorize("admin"), userController.toggleActive);
router.delete("/users/:id", protect, authorize("admin"), userController.remove);

/* ===========================
   📌 SELLER ROUTES
=========================== */
router.get("/sellers", protect, authorize("admin"), sellerController.getAll);
router.get("/sellers/:id", protect, authorize("admin"), sellerController.getById);
router.put("/sellers/:id/status", protect, authorize("admin"), sellerController.updateStatus);
router.put("/sellers/:id/commission", protect, authorize("admin"), sellerController.updateCommission);
router.put("/sellers/:id/toggle", protect, authorize("admin"), sellerController.toggleActive);


// Seller requests (pending sellers)
router.get("/seller/requests", protect, authorize("admin"), sellerController.getRequests);
router.put("/seller/requests/:id/approve", protect, authorize("admin"), sellerController.approveRequest);
router.put("/seller/requests/:id/reject", protect, authorize("admin"), sellerController.rejectRequest);

module.exports = router;
