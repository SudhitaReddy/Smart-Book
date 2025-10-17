const express = require("express");
const { body, validationResult } = require("express-validator");
const Cart = require("../models/cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");

const router = express.Router();

// ===============================
// Helper: build cart response
// ===============================
async function buildCartResponse(userId) {
  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "title author price images stock isActive"
  );

  if (!cart) {
    return { items: [], subtotal: 0, discount: 0, totalItems: 0, finalAmount: 0 };
  }

  // filter out inactive products
  cart.items = cart.items.filter((item) => item.product && item.product.isActive);

  const subtotal = cart.items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const totalItems = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const discount = cart.discount || 0;
  const finalAmount = Math.max(0, subtotal - discount);

  return {
    _id: cart._id,
    items: cart.items,
    subtotal,
    discount,
    totalItems,
    finalAmount,
  };
}

// ===============================
// GET /api/cart – Get user cart
// ===============================
router.get("/", protect, async (req, res) => {
  try {
    const cart = await buildCartResponse(req.user._id);
    res.json({ success: true, data: { cart } });
  } catch (err) {
    console.error("GET /cart error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===============================
// GET /api/cart/count – Item count
// ===============================
router.get("/count", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.json({ success: true, count: 0 });

    const totalItems = cart.items.reduce((sum, i) => sum + (i.quantity || 0), 0);
    res.json({ success: true, count: totalItems });
  } catch (err) {
    console.error("GET /cart/count error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===============================
// POST /api/cart/items – Add to cart
// ===============================
router.post(
  "/items",
  protect,
  [
    body("productId").isMongoId().withMessage("Invalid product ID"),
    body("quantity").isInt({ min: 1, max: 10 }).withMessage("Quantity must be 1–10"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { productId, quantity } = req.body;
      const product = await Product.findById(productId);

      if (!product || !product.isActive) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ success: false, message: "Insufficient stock" });
      }

      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        cart = new Cart({ user: req.user._id, items: [], discount: 0 });
      }

      const idx = cart.items.findIndex((i) => i.product.toString() === productId);

      if (idx > -1) {
        const newQty = cart.items[idx].quantity + quantity;
        if (newQty > 10 || newQty > product.stock) {
          return res.status(400).json({ success: false, message: "Quantity exceeds limit" });
        }
        cart.items[idx].quantity = newQty;
        cart.items[idx].price = product.price;
      } else {
        cart.items.push({ product: productId, quantity, price: product.price });
      }

      await cart.save();
      const updated = await buildCartResponse(req.user._id);
      res.json({ success: true, message: "Item added", data: { cart: updated } });
    } catch (err) {
      console.error("POST /cart/items error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// ===============================
// POST /api/cart/apply-coupon
// ===============================
router.post("/apply-coupon", protect, async (req, res) => {
  try {
    const { code } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const subtotal = cart.items.reduce(
      (sum, i) => sum + (i.price || 0) * (i.quantity || 1),
      0
    );

    let discount = 0;
    if (code === "DISCOUNT50") {
      discount = Math.floor(subtotal * 0.5);
    } else if (code === "NEWUSER100") {
      discount = 100;
    } else if (code === "FREESHIP") {
      discount = 0; // shipping handled separately
    }

    cart.discount = discount;
    cart.finalAmount = Math.max(0, subtotal - discount);
    await cart.save();

    const updated = await buildCartResponse(req.user._id);
    res.json({
      success: true,
      message: "Coupon applied",
      data: { cart: updated }
    });
  } catch (err) {
    console.error("apply-coupon error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===============================
// PUT /api/cart/items/:productId – Update qty
// ===============================
router.put(
  "/items/:productId",
  protect,
  [body("quantity").isInt({ min: 1, max: 10 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { productId } = req.params;
      const { quantity } = req.body;

      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      if (quantity > product.stock) {
        return res.status(400).json({ success: false, message: "Insufficient stock" });
      }

      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

      const idx = cart.items.findIndex((i) => i.product.toString() === productId);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: "Item not in cart" });
      }

      cart.items[idx].quantity = quantity;
      cart.items[idx].price = product.price;

      await cart.save();
      const updated = await buildCartResponse(req.user._id);
      res.json({ success: true, message: "Quantity updated", data: { cart: updated } });
    } catch (err) {
      console.error("PUT /cart/items error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// ===============================
// DELETE /api/cart/items/:productId – Remove item
// ===============================
router.delete("/items/:productId", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();

    const updated = await buildCartResponse(req.user._id);
    res.json({ success: true, message: "Item removed", data: { cart: updated } });
  } catch (err) {
    console.error("DELETE /cart/items error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===============================
// DELETE /api/cart – Clear cart
// ===============================
router.delete("/", protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.discount = 0;
      cart.finalAmount = 0;
      await cart.save();
    }
    res.json({
      success: true,
      message: "Cart cleared",
      data: { cart: { items: [], subtotal: 0, discount: 0, totalItems: 0, finalAmount: 0 } }
    });
  } catch (err) {
    console.error("DELETE /cart error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
