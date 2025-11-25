const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AdminUser = require('../models/AdminUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Signup
router.post('/user_signup', async (req, res) => {
  try {
    console.log('=== SIGNUP REQUEST ===');
    console.log('Body:', req.body);

    const { name, email, password, contact } = req.body;

    if (!name || !email || !password || !contact) {
      return res.status(400).json({ status: 'error', error_message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'error', error_message: 'User already exists' });
    }

    // Hash password BEFORE saving
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Original password:', password);
    console.log('Hashed password:', hashedPassword);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      contact,
    });

    console.log('✅ User created:', user.email);

    return res.status(201).json({
      status: 'success',
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    return res.status(500).json({ status: 'error', error_message: 'Server error' });
  }
});

// User Login
router.post('/user_login', async (req, res) => {
  try {
    console.log('=== LOGIN REQUEST ===');
    console.log('Body:', req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', error_message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    console.log('User found:', user ? 'YES' : 'NO');

    if (!user) {
      console.log('❌ User not found');
      return res.status(400).json({ status: 'error', error_message: 'Invalid credentials' });
    }

    console.log('Stored password (hash):', user.password);
    console.log('Received password:', password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('bcrypt.compare result:', isMatch);

    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(400).json({ status: 'error', error_message: 'Invalid credentials' });
    }

    console.log('✅ Login successful');

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      status: 'success',
      token,
      user: { name: user.name, email: user.email, user_name: user.name },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({ status: 'error', error_message: 'Server error' });
  }
});

// Admin Login
router.post('/admin_login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', error_message: 'Email and password are required' });
    }

    const admin = await AdminUser.findOne({ email });

    if (!admin) {
      return res.status(400).json({ status: 'error', error_message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    console.log('Admin Login Attempt:');
    console.log('Email:', email);
    console.log('Received Password:', password);
    console.log('Stored Hash:', admin.password);
    console.log('Match Result:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ status: 'error', error_message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: admin._id, role: 'admin' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      status: 'success',
      token,
      user: { name: admin.name, email: admin.email, user_name: admin.name },
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    return res.status(500).json({ status: 'error', error_message: 'Server error' });
  }
});

module.exports = router;