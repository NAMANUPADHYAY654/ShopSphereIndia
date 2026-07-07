const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  googleAuthUser,
  verifyOtp,
  resendOtp,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/login', authUser);
router.post('/google', googleAuthUser);
router.post('/otp/verify', verifyOtp);
router.post('/otp/resend', resendOtp);
router.post('/logout', logoutUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

module.exports = router;
