const mongoose = require('mongoose');

// Image schema
const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String },
  isPrimary: { type: Boolean, default: false }
});

// Product schema
const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  author: { type: String, default: 'Unknown Author', trim: true, maxlength: 100 },
  description: { type: String, default: 'No description available', maxlength: 2000 },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  stock: { type: Number, default: 10, min: 0 },
  category: { 
    type: String, 
    default: 'general', 
    enum: ['fiction', 'non-fiction', 'education', 'children', 'biography', 'self-help', 'business', 'technology', 'general'] 
  },
  images: [imageSchema],

  // Ratings & reviews
  rating: { type: Number, default: 0, min: 0, max: 5 },  // average rating
  reviewsCount: { type: Number, default: 0 },            // ✅ number of reviews only

  // Relations
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Metadata
  viewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);
