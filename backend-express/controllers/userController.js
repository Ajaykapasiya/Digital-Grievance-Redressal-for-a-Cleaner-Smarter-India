const User = require('../models/User');

// User Signup
exports.userSignup = async (req, res) => {
  const { name, contact, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'error', error_message: 'Email already exists' });
    }

    const user = new User({ name, contact, email, password });
    await user.save();
    res.json({ status: 'success', user });
  } catch (err) {
    res.status(500).json({ status: 'error', error_message: err.message });
  }
};

// Update Password
exports.updateUserPassword = async (req, res) => {
  const { old_password, new_password } = req.body;
  const { email } = req.headers;

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== old_password) {
      return res.status(400).json({ status: 'error', error_message: 'Invalid credentials' });
    }

    user.password = new_password;
    await user.save();
    res.json({ status: 'success', message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', error_message: err.message });
  }
};