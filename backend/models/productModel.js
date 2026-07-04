const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    default: 0
  },
  compareAtPrice: {
    type: Number,
    default: 0 // Original price for showing discount
  },
  images: [{
    url: { type: String, required: true },
    public_id: { type: String, required: true }
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  ratings: {
    type: Number,
    default: 0
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  tags: [String],
  isTrending: {
    type: Boolean,
    default: false
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create text index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
