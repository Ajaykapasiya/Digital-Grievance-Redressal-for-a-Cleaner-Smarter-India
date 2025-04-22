const express = require('express');
const { userSignup, updateUserPassword } = require('../controllers/userController');

const router = express.Router();

router.post('/signup', userSignup);
router.post('/update_password', updateUserPassword);

module.exports = router;