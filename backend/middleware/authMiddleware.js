const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// User must be authenticated
const protect = async (req, res, next) => {
  let token;

  // Read JWT from the 'jwt' cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      next(new Error('Not authorized, token failed'));
    }
  } else {
    res.status(401);
    next(new Error('Not authorized, no token'));
  }
};

// User must be an admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401);
    next(new Error('Not authorized as an admin'));
  }
};

// User must be a seller
const seller = (req, res, next) => {
  if (req.user && req.user.role === 'seller') {
    next();
  } else {
    res.status(401);
    next(new Error('Not authorized as a seller'));
  }
};

module.exports = { protect, admin, seller };
