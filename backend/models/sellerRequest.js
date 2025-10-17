const mongoose = require('mongoose');

const sellerRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
    required: [true, 'Business description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  businessAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    website: String
  },
  documents: {
    panNumber: {
      type: String,
      required: true
    },
    gstNumber: String,
    bankAccount: {
      accountNumber: {
        type: String,
        required: true
      },
      ifscCode: {
        type: String,
        required: true
      },
      accountHolderName: {
        type: String,
        required: true
      },
      bankName: {
        type: String,
        required: true
      }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String,
  rejectionReason: String,
  documentsVerified: {
    pan: {
      type: Boolean,
      default: false
    },
    gst: {
      type: Boolean,
      default: false
    },
    bank: {
      type: Boolean,
      default: false
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for efficient queries
sellerRequestSchema.index({ user: 1 });
sellerRequestSchema.index({ status: 1 });
sellerRequestSchema.index({ createdAt: -1 });
sellerRequestSchema.index({ priority: 1, createdAt: -1 });

module.exports = mongoose.model('SellerRequest', sellerRequestSchema);
