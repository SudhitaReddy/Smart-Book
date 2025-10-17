const express = require("express");
const { body, validationResult } = require("express-validator");
const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");
const User = require("../models/user");
const { protect } = require("../middleware/auth");
const sendMail = require("../utils/sendEmail");

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order from the user's cart
 * @access  Private
 */
router.post(
  "/",
  protect,
  [
    body("shippingAddress").isObject().withMessage("Shipping address is required"),
    body("shippingAddress.street").notEmpty().withMessage("Street is required"),
    body("shippingAddress.city").notEmpty().withMessage("City is required"),
    body("shippingAddress.state").notEmpty().withMessage("State is required"),
    body("shippingAddress.zipCode").notEmpty().withMessage("Zip code is required"),
    body("paymentMethod")
      .isIn(["cod", "card", "upi", "netbanking", "wallet"])
      .withMessage("Invalid payment method"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { shippingAddress, paymentMethod, notes } = req.body;

      // ✅ Find user's cart
      const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: "Cart is empty" });
      }

      // ✅ Build order items & calculate totals
      let subtotal = 0;
      const orderItems = [];

      for (const item of cart.items) {
        const product = item.product;
        if (!product) continue;

        // Stock check
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.title}`,
          });
        }

        orderItems.push({
          product: product._id,
          seller: product.seller,
          title: product.title,
          author: product.author,
          image: product.images?.[0]?.url || "https://via.placeholder.com/200x300?text=No+Image",
          quantity: item.quantity,
          price: item.price,
        });

        subtotal += item.price * item.quantity;

        // Reduce stock
        await Product.findByIdAndUpdate(product._id, {
          $inc: { stock: -item.quantity, salesCount: item.quantity },
        });
      }

      // ✅ Totals
      const discount = cart.discount || 0;
      const shippingCost = subtotal >= 500 ? 0 : 50;
      const tax = Math.round((subtotal - discount) * 0.18);
      const totalAmount = subtotal - discount + shippingCost + tax;

      // ✅ Create order
      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        subtotal,
        discount,
        shippingCost,
        tax,
        totalAmount,
        notes,
      });

      // ✅ Fetch user for email
      const user = await User.findById(req.user._id).select("name email");

      if (user?.email) {
        try {
          await sendMail({
            to: user.email,
            subject: "Your Order Confirmation",
            html: `
              <h2>Hi ${user.name},</h2>
              <p>🎉 Thank you for your order!</p>
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
              <p>We’ll notify you once your order is shipped.</p>
            `,
          });
        } catch (mailErr) {
          console.error("❌ Order email not sent:", mailErr);
        }
      }

      // ✅ Clear cart
      cart.items = [];
      cart.discount = 0;
      cart.totalItems = 0;
      cart.totalAmount = 0;
      cart.finalAmount = 0;
      await cart.save();

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: { order },
      });
    } catch (err) {
      console.error("❌ Order creation error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/**
 * @route   GET /api/orders
 * @desc    Get all orders for logged-in user (with pagination)
 * @access  Private
 */
router.get("/", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments({ user: req.user._id });

    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "title author images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      success: true,
      data: {
        orders,
        totalPages,
        currentPage: page,
      },
    });
  } catch (err) {
    console.error("❌ Get orders error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get a single order
 * @access  Private
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "title author images")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, data: { order } });
  } catch (err) {
    console.error("❌ Get order error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   GET /api/orders/track/:orderNumber
 * @desc    Track order by orderNumber
 * @access  Private
 */
router.get("/track/:orderNumber", protect, async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // ✅ Only allow the owner or admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to track this order" });
    }

    res.json({ success: true, data: { order } });
  } catch (err) {
    console.error("❌ Track order error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
