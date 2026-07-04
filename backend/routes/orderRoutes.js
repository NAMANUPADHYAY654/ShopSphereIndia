const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getMyOrders, getOrderById, getOrderTracking } = require('../controllers/orderController');

router.get('/my', protect, getMyOrders);
router.get('/:id/tracking', protect, getOrderTracking);
router.get('/:id', protect, getOrderById);

module.exports = router;
