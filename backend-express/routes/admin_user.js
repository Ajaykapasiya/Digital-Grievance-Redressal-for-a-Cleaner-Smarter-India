// File: /backend-express/routes/admin.js

const express = require('express');
const { reviewComplaint, getPendingReviews } = require('../controllers/adminController');
const router = express.Router();

// Admin review routes
router.put('/review-complaint/:complaintId', reviewComplaint);
router.get('/pending-reviews', getPendingReviews);

module.exports = router;