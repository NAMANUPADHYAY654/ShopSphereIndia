const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  maxDiscountAmount: {
    type: Number,
    required: true
  },
  minOrderAmount: {
    type: Number,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageLimit: {
    type: Number,
    default: null // null means unlimited until expiry
  },
  usedCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
