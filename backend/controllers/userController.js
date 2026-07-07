const crypto = require('crypto');
const User = require('../models/userModel');
const OtpSession = require('../models/otpSessionModel');
const generateToken = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');
const {
  generateOtpCode,
  hashOtpCode,
  deliverOtp,
} = require('../utils/otpService');

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

const normalizeEmail = (value) => (value || '').trim().toLowerCase();
const normalizePhone = (value) => (value || '').replace(/[^\d+]/g, '').trim();

const maskDestination = (destination, channel) => {
  if (!destination) return '';

  if (channel === 'phone') {
    const digits = destination.replace(/\D/g, '');
    return digits.length <= 4 ? '****' : `****${digits.slice(-4)}`;
  }

  const [localPart, domainPart] = destination.split('@');
  if (!domainPart) return '***';

  return `${localPart.slice(0, 2)}***@${domainPart}`;
};

const buildUserPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  phone: user.phone,
  isVerified: user.isVerified,
  googleId: user.googleId,
});

const getGoogleClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }

  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
};

const createOtpSession = async ({ user, purpose, channel, destination }) => {
  const otpCode = generateOtpCode();
  const otpHash = await hashOtpCode(otpCode);

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  const session = await OtpSession.create({
    user: user._id,
    purpose,
    channel,
    destination,
    otpHash,
    expiresAt,
  });

  const delivery = await deliverOtp({
    channel,
    destination,
    otpCode,
    name: user.name,
    purpose,
  });

  return { session, delivery };
};

// @desc    Auth user & start OTP flow
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res, next) => {
  try {
    const { email, password, otpChannel } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = password ? password.trim() : '';
    const requestedChannel = otpChannel === 'phone' ? 'phone' : 'email';

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await user.matchPassword(normalizedPassword))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    if (user.isVerified === false) {
      res.status(403);
      throw new Error('Please verify your account before signing in');
    }

    const destination = requestedChannel === 'phone' && user.phone ? user.phone : user.email;
    const channel = requestedChannel === 'phone' && user.phone ? 'phone' : 'email';

    const { session, delivery } = await createOtpSession({
      user,
      purpose: 'login',
      channel,
      destination,
    });

    res.status(200).json({
      otpRequired: true,
      otpSessionId: session._id,
      channel,
      destination: maskDestination(destination, channel),
      deliveryMethod: delivery.deliveryMethod,
      message: `We sent a one-time code to your ${channel === 'phone' ? 'mobile number' : 'email address'}.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user and start OTP verification
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, otpChannel } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);
    const requestedChannel = otpChannel === 'phone' ? 'phone' : 'email';

    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      phone: normalizedPhone || null,
      isVerified: false,
      verifiedAt: null,
    });

    const destination = requestedChannel === 'phone' && normalizedPhone ? normalizedPhone : normalizedEmail;
    const channel = requestedChannel === 'phone' && normalizedPhone ? 'phone' : 'email';

    const { session, delivery } = await createOtpSession({
      user,
      purpose: 'register',
      channel,
      destination,
    });

    res.status(201).json({
      otpRequired: true,
      otpSessionId: session._id,
      channel,
      destination: maskDestination(destination, channel),
      deliveryMethod: delivery.deliveryMethod,
      message: `We sent a verification code to your ${channel === 'phone' ? 'mobile number' : 'email address'}.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sign in or register with Google
// @route   POST /api/users/google
// @access  Public
const googleAuthUser = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400);
      throw new Error('Google credential is required');
    }

    const googleClient = getGoogleClient();
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      res.status(400);
      throw new Error('Google account details could not be verified');
    }

    const normalizedEmail = normalizeEmail(payload.email);
    const googleId = payload.sub;
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name: payload.name || 'Google User',
        email: normalizedEmail,
        password: crypto.randomBytes(32).toString('hex'),
        googleId,
        avatar: payload.picture || null,
        phone: null,
        isVerified: true,
        verifiedAt: new Date(),
      });
    } else {
      user.googleId = user.googleId || googleId;
      user.name = user.name || payload.name || user.name;
      user.avatar = user.avatar || payload.picture || user.avatar;
      if (user.isVerified === false) {
        user.isVerified = true;
        user.verifiedAt = new Date();
      }
      await user.save();
    }

    generateToken(res, user._id);

    res.json({
      ...buildUserPayload(user),
      provider: 'google',
      verified: true,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and issue auth cookie
// @route   POST /api/users/otp/verify
// @access  Public
const verifyOtp = async (req, res, next) => {
  try {
    const { otpSessionId, otp } = req.body;
    const trimmedOtp = (otp || '').trim();

    if (!otpSessionId || !trimmedOtp) {
      res.status(400);
      throw new Error('OTP session and code are required');
    }

    const session = await OtpSession.findById(otpSessionId);

    if (!session || session.consumed) {
      res.status(400);
      throw new Error('OTP session is invalid or already used');
    }

    if (session.expiresAt.getTime() < Date.now()) {
      res.status(400);
      throw new Error('OTP has expired. Please request a new code.');
    }

    if (session.attempts >= MAX_OTP_ATTEMPTS) {
      res.status(429);
      throw new Error('Too many incorrect attempts. Please request a new code.');
    }

    const bcrypt = require('bcryptjs');
    const isValidOtp = await bcrypt.compare(trimmedOtp, session.otpHash);

    session.attempts += 1;

    if (!isValidOtp) {
      await session.save();
      res.status(401);
      throw new Error('Invalid OTP');
    }

    const user = await User.findById(session.user);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    session.consumed = true;
    await session.save();

    if (user.isVerified === false) {
      user.isVerified = true;
      user.verifiedAt = new Date();
      await user.save();
    }

    generateToken(res, user._id);

    res.json({
      ...buildUserPayload(user),
      verified: true,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP for an existing session
// @route   POST /api/users/otp/resend
// @access  Public
const resendOtp = async (req, res, next) => {
  try {
    const { otpSessionId } = req.body;

    if (!otpSessionId) {
      res.status(400);
      throw new Error('OTP session is required');
    }

    const session = await OtpSession.findById(otpSessionId);

    if (!session || session.consumed) {
      res.status(400);
      throw new Error('OTP session is invalid or already used');
    }

    const user = await User.findById(session.user);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const otpCode = generateOtpCode();
    session.otpHash = await hashOtpCode(otpCode);
    session.attempts = 0;
    session.expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await session.save();

    const delivery = await deliverOtp({
      channel: session.channel,
      destination: session.destination,
      otpCode,
      name: user.name,
      purpose: session.purpose,
    });

    res.json({
      otpRequired: true,
      otpSessionId: session._id,
      channel: session.channel,
      destination: maskDestination(session.destination, session.channel),
      deliveryMethod: delivery.deliveryMethod,
      message: 'A new verification code has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses,
        gstNumber: user.gstNumber,
        walletBalance: user.walletBalance,
        loyaltyPoints: user.loyaltyPoints,
        isVerified: user.isVerified,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.avatar = req.body.avatar || user.avatar;
      user.gstNumber = req.body.gstNumber || user.gstNumber;

      if (req.body.password) {
        user.password = req.body.password;
      }

      if (req.body.addresses) {
        user.addresses = req.body.addresses;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
        addresses: updatedUser.addresses,
        isVerified: updatedUser.isVerified,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authUser,
  registerUser,
  googleAuthUser,
  verifyOtp,
  resendOtp,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
};
