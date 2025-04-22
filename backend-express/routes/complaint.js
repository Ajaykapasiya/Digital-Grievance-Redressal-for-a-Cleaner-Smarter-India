const express = require('express');
const { createComplaint, showUserComplaints, showComplaintById, getUpdates } = require('../controllers/complaintController');

const router = express.Router();

router.post('/create', createComplaint);
router.get('/show_user_complaints', showUserComplaints);
router.get('/show_complaint_by_id', showComplaintById);
router.get('/get_updates', getUpdates);

module.exports = router;