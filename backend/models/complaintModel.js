const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  order: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Order' },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Product Quality', 'Delivery Issue', 'Refund', 'Payment', 'Other', 'Product Issue', 'Delivery Problem', 'Payment Issue', 'Refund Request', 'Account Issue'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  messages: [{
    sender: { type: String, enum: ['user', 'admin'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  resolution: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
