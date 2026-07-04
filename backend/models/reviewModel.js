const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  images: [{
    url: String,
    public_id: String
  }]
}, {
  timestamps: true
});

// Prevent user from submitting more than one review per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
