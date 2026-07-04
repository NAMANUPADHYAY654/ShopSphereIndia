const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password']
  },
  googleId: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'seller', 'admin'],
    default: 'user'
  },
  storeName: {
    type: String,
    default: null
  },
  isVerifiedSeller: {
    type: Boolean,
    default: false
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  addresses: [{
    street: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  gstNumber: {
    type: String,
    default: null
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  viewedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  favoriteCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }]
}, {
  timestamps: true
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
