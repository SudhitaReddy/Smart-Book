const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot be more than 100 characters']
  },
  businessType: {
    type: String,
    enum: ['individual', 'company', 'publisher', 'bookstore'],
    required: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  businessAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String
  },
  documents: {
    panNumber: String,
    gstNumber: String,
    bankAccount: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
      bankName: String
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  verificationStatus: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  commissionRate: {
    type: Number,
    default: 10,
    min: [0, 'Commission rate cannot be negative'],
    max: [50, 'Commission rate cannot be more than 50%']
  },
  stats: {
    totalProducts: {
      type: Number,
      default: 0,
      min: [0, 'Total products cannot be negative']
    },
    totalSales: {
      type: Number,
      default: 0,
      min: [0, 'Total sales cannot be negative']
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: [0, 'Total revenue cannot be negative']
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Average rating cannot be negative'],
      max: [5, 'Average rating cannot be more than 5']
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, 'Total reviews cannot be negative']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: Date,
  notes: String
}, {
  timestamps: true
});

// Index for efficient queries
sellerSchema.index({ user: 1 });
sellerSchema.index({ status: 1 });
sellerSchema.index({ 'stats.totalSales': -1 });
sellerSchema.index({ 'stats.averageRating': -1 });

module.exports = mongoose.model('Seller', sellerSchema);
