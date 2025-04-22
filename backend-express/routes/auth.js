const express = require('express');
const { userLogin, adminLogin } = require('../controllers/authController');

const router = express.Router();

router.post('/user_login', userLogin);
router.post('/admin_login', adminLogin);

module.exports = router;