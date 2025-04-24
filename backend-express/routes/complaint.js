// File: /backend-express/routes/complaint.js

const express = require('express');
const { createComplaint, showUserComplaints, showComplaintById } = require('../controllers/complaintController');
const { validateComplaint } = require('../middleware/complaintValidation');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all complaint routes
router.use(authMiddleware);

// Apply validation middleware to the create complaint route
router.post('/create', validateComplaint, createComplaint);
router.get('/user_complaints', showUserComplaints);
router.get('/:id', showComplaintById);

module.exports = router;// In routes/complaint.js
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all complaint routes
router.use(authMiddleware);