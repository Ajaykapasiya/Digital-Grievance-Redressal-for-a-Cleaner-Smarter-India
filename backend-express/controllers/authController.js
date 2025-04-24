const User = require('../models/User');
const AdminUser = require('../models/AdminUser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Make sure this matches exactly with what's in authMiddleware.js
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

exports.userSignup = async (req, res) => {
  console.log('Received signup request:', req.body); // Debug log
  
  const { name, email, password, contact } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password || !contact) {
      return res.status(400).json({
        status: 'error',
        error_message: 'All fields are required: name, email, password, contact'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        error_message: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      contact,
      aadhaar_verified: false,
      phone_no_verified: false
    });

    await user.save();
    console.log('User created successfully:', user); // Debug log

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (err) {
    console.error('Signup error:', err); // Debug log
    res.status(500).json({
      status: 'error',
      error_message: err.message
    });
  }
};

exports.userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: 'error',
        error_message: 'Invalid credentials'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        error_message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      status: 'success',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      error_message: err.message
    });
  }
};

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await AdminUser.findOne({ email });
    if (!admin) {
      return res.status(400).json({
        status: 'error',
        error_message: 'Invalid credentials'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        error_message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: admin._id, email: admin.email, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      status: 'success',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        isAdmin: true
      },
      token
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      error_message: err.message
    });
  }
};