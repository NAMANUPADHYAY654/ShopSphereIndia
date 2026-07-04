const User = require('../models/userModel');
const Product = require('../models/productModel');

// @desc    Register as a seller
// @route   POST /api/sellers/onboard
// @access  Private
const onboardSeller = async (req, res) => {
  const { storeName, bankDetails } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.role = 'seller';
      user.storeName = storeName;
      user.bankDetails = bankDetails;
      user.isVerifiedSeller = true; // Auto-verify for demo purposes

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        storeName: updatedUser.storeName
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get seller's products
// @route   GET /api/sellers/products
// @access  Private/Seller
const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).populate('category');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  onboardSeller,
  getSellerProducts
};
