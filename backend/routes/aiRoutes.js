const express = require('express');
const router = express.Router();
const { 
  generateListing, 
  summarizeReviews,
  adminCopilot,
  executeAdminAction,
  fraudRadar,
  pricingRadar,
  weeklyDigest,
  sellerHealth,
  draftRejection,
  supportTriage,
  sentimentRadar,
  securityCenter
} = require('../controllers/aiController');
const { protect, seller, admin } = require('../middleware/authMiddleware');

router.post('/generate-listing', protect, seller, generateListing);
router.post('/summarize-reviews', summarizeReviews); 

// Admin AI Routes
router.post('/admin/copilot', protect, admin, adminCopilot);
router.post('/admin/execute-action', protect, admin, executeAdminAction);
router.get('/admin/fraud-radar', protect, admin, fraudRadar);
router.get('/admin/security-center', protect, admin, securityCenter);
router.get('/admin/pricing-radar', protect, admin, pricingRadar);
router.get('/admin/weekly-digest', protect, admin, weeklyDigest);
router.get('/admin/seller-health', protect, admin, sellerHealth);
router.post('/admin/draft-rejection', protect, admin, draftRejection);
router.get('/admin/support-triage', protect, admin, supportTriage);
router.get('/admin/sentiment-radar', protect, admin, sentimentRadar);

// Seller AI Routes
const { onboardingCopilot, autoCategorize } = require('../controllers/aiController');
router.post('/seller/onboard-chat', onboardingCopilot);
router.post('/seller/auto-categorize', protect, seller, autoCategorize);

module.exports = router;
