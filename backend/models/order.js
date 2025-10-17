const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true }, // ✅ Track seller per item
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  title: String,
  author: String,
  image: String
});

const shippingAddressSchema = new mongoose.Schema({
  type: { type: String, enum: ["home", "work", "other"], default: "home" },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, default: "India" },
  phone: String
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"],
    default: "pending"
  },
  timestamp: { type: Date, default: Date.now },
  note: String
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // buyer
    items: [orderItemSchema], // ✅ each item tied to a seller

    shippingAddress: { type: shippingAddressSchema, required: true },

    paymentMethod: {
      type: String,
      enum: ["cod", "card", "upi", "netbanking", "wallet"],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending"
    },

    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"],
      default: "pending"
    },
    statusHistory: { type: [statusHistorySchema], default: [{ status: "pending" }] },

    notes: String,
    trackingNumber: String,
    trackingUrl: String,
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
    estimatedDelivery: Date
  },
  { timestamps: true }
);

// Generate unique order number
orderSchema.pre("save", function (next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    this.orderNumber = `ORD${timestamp.slice(-6)}${random}`;
  }
  next();
});

// Push status history on status change
orderSchema.pre("save", function (next) {
  if (this.isModified("orderStatus")) {
    this.statusHistory.push({ status: this.orderStatus });
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ "items.seller": 1 }); // ✅ optimize seller queries

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
