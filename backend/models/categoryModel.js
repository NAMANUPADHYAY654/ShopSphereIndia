const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  image: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
