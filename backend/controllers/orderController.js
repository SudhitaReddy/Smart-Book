const Order = require("../models/order");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const orderTemplate = require("../templates/orderConfirmationTemplate");

// Place new order (user side)
exports.placeOrder = async (req, res) => {
  try {
    const { userId, items, shippingAddress, paymentMethod, subtotal, shippingCost, tax, discount, totalAmount, notes } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const order = await Order.create({
      user: userId,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      discount,
      totalAmount,
      orderStatus: "confirmed",
      notes
    });

    const emailContent = orderTemplate(order, user);
    await sendEmail(user.email, "Your SmartBook Order Confirmation", emailContent);

    res.json({ success: true, data: { order } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all orders (admin)
exports.getAll = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json({ success: true, data: { orders } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get recent 5 orders
exports.getRecent = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email");
    res.json({ success: true, data: { orders } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get order by ID
exports.getById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email").populate("items.product");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, data: { order } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    order.orderStatus = status;
    order.statusHistory.push({ status });
    await order.save();
    res.json({ success: true, data: { order } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, data: { order } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
