const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { addOrderItems, getMyOrders, getOrderById, getOrderTracking, getRazorpayConfig, createRazorpayOrder, verifyPayment } = require('../controllers/orderController');

// Razorpay payment routes
router.get('/razorpay/config', protect, getRazorpayConfig);
router.post('/razorpay/create', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyPayment);

router.route('/').post(protect, addOrderItems);
router.get('/my', protect, getMyOrders);
router.get('/:id/tracking', protect, getOrderTracking);
router.get('/:id', protect, getOrderById);

module.exports = router;
