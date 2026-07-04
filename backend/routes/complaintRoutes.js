const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { createComplaint, getMyComplaints, getAllComplaints, updateComplaint, addMessage } = require('../controllers/complaintController');

router.post('/', protect, createComplaint);
router.get('/my', protect, getMyComplaints);
router.get('/', protect, admin, getAllComplaints);
router.put('/:id', protect, admin, updateComplaint);
router.post('/:id/message', protect, addMessage);

module.exports = router;
