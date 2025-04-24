const express = require('express');
const { userSignup, updateUserPassword } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', userSignup);
router.post('/update_password', updateUserPassword);

// Add profile route
router.get('/profile', authMiddleware, (req, res) => {
  try {
    // The user data is already attached to req.user by the authMiddleware
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ status: 'error', error_message: 'User not authenticated' });
    }
    
    // Return user data from the token
    res.json({
      status: 'success',
      user: {
        id: req.user.userId,
        email: req.user.email
      }
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ status: 'error', error_message: 'Server error' });
  }
});

module.exports = router;