const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: [wishlistItemSchema],
    totalItems: {
      type: Number,
      default: 0,
      min: [0, 'Total items cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

// ✅ Keep totalItems always updated
wishlistSchema.pre('save', function (next) {
  this.totalItems = this.items.length;
  next();
});

// ✅ Index for faster queries
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.product': 1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);
