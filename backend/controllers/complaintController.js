const Complaint = require('../models/complaintModel');
const Order = require('../models/orderModel');

const createComplaint = async (req, res, next) => {
  try {
    const { orderId, subject, description, category, priority } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to file complaint for this order');
    }

    const complaint = await Complaint.create({
      user: req.user._id,
      order: orderId,
      subject,
      description,
      category: category || 'Other',
      priority: priority || 'Medium',
      messages: [{
        sender: 'user',
        text: description,
        timestamp: new Date()
      }]
    });

    res.status(201).json(complaint);
  } catch (error) {
    next(error);
  }
};

const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id })
      .populate('order', '_id orderStatus')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    next(error);
  }
};

const getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({})
      .populate('user', 'name email')
      .populate('order', '_id orderStatus')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    next(error);
  }
};

const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }

    complaint.status = req.body.status || complaint.status;
    complaint.priority = req.body.priority || complaint.priority;
    if (req.body.resolution) {
      complaint.resolution = req.body.resolution;
      complaint.status = 'Resolved';
    }

    const updatedComplaint = await complaint.save();
    res.json(updatedComplaint);
  } catch (error) {
    next(error);
  }
};

const addMessage = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }

    // Determine sender based on role
    const sender = req.user.role === 'admin' ? 'admin' : 'user';

    // If user is adding message, make sure they own the complaint
    if (sender === 'user' && complaint.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this complaint');
    }

    complaint.messages.push({
      sender,
      text: req.body.text,
      timestamp: new Date()
    });
    
    // Automatically set status to in-progress when admin replies
    if (sender === 'admin' && complaint.status === 'Open') {
      complaint.status = 'In Progress';
    }

    const updatedComplaint = await complaint.save();
    res.json(updatedComplaint);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaint,
  addMessage
};
