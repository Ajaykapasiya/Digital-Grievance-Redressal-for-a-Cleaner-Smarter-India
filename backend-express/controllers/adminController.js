const AdminUser = require('../models/AdminUser');

// Create Admin User
exports.createAdminUser = async (req, res) => {
  const { name, email, phone, designation, municipal_id, department, password } = req.body;

  try {
    const existingAdmin = await AdminUser.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ status: 'error', error_message: 'Email already exists' });
    }

    const adminUser = new AdminUser({ name, email, phone, designation, municipal_id, department, password });
    await adminUser.save();
    res.json({ status: 'success', adminUser });
  } catch (err) {
    res.status(500).json({ status: 'error', error_message: err.message });
  }
};

// Update Admin Password
exports.updateAdminPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const adminUser = await AdminUser.findOne({ email });
    if (!adminUser) {
      return res.status(400).json({ status: 'error', error_message: 'Admin user not found' });
    }

    adminUser.password = password;
    await adminUser.save();
    res.json({ status: 'success', message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', error_message: err.message });
  }
};

// Fetch Complaints
exports.fetchComplaints = async (req, res) => {
  // Logic to fetch complaints for admin
  res.json({ status: 'success', complaints: [] });
};

// Fetch Statistics
exports.fetchStatistics = async (req, res) => {
  // Logic to fetch statistics for admin
  res.json({ status: 'success', stats: [] });
};