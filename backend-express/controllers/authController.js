const User = require('../models/User');
const AdminUser = require('../models/AdminUser');

exports.userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ status: 'error', error_message: 'Invalid credentials' });
    }
    res.json({ status: 'success', user_name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ status: 'error', error_message: err.message });
  }
};

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await AdminUser.findOne({ email, password });
    if (!admin) {
      return res.status(400).json({ status: 'error', error_message: 'Invalid credentials' });
    }
    res.json({ status: 'success', user_name: admin.name, email: admin.email });
  } catch (err) {
    res.status(500).json({ status: 'error', error_message: err.message });
  }
};