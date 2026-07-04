const express = require('express');
const router = express.Router();
const { onboardSeller, getSellerProducts } = require('../controllers/sellerController');
const { protect, seller } = require('../middleware/authMiddleware');

router.post('/onboard', protect, onboardSeller);
router.get('/products', protect, seller, getSellerProducts);

module.exports = router;
