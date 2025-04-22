const express = require('express');
const { createAdminUser, updateAdminPassword, fetchComplaints, fetchStatistics } = require('../controllers/adminController');

const router = express.Router();

router.post('/create', createAdminUser);
router.post('/update_password', updateAdminPassword);
router.get('/fetch_complaints', fetchComplaints);
router.get('/fetch_statistics', fetchStatistics);

module.exports = router;