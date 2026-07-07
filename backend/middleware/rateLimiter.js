let authLimiter;

if (process.env.NODE_ENV === 'development') {
  authLimiter = (req, res, next) => next();
} else {
  const rateLimit = require('express-rate-limit');
  authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

module.exports = { authLimiter };