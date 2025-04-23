const express = require('express');
const { userLogin, adminLogin, userSignup } = require('../controllers/authController');

const router = express.Router();

// User routes
router.post('/user_signup', userSignup);
router.post('/user_login', userLogin);

// Admin routes
router.post('/admin_login', adminLogin);

module.exports = router;