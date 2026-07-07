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
  forgotPassword,
  resetPassword,
  deleteUserProfile,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/login', authLimiter, authUser);
router.post('/google', authLimiter, googleAuthUser);
router.post('/otp/verify', verifyOtp);
router.post('/otp/resend', resendOtp);
router.post('/logout', logoutUser);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile).delete(protect, deleteUserProfile);

module.exports = router;
