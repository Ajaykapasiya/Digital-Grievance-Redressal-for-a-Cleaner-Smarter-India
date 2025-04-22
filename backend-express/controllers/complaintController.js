const Complaint = require('../models/Complaint');

// Create a new complaint
exports.createComplaint = async (req, res) => {
  const { subject, sub_category, description, image, latitude, longitude, address, district, state, pincode } = req.body;

  try {
    const complaint = new Complaint({
      user_id: req.headers.user_id, // Assuming user_id is passed in headers
      subject,
      sub_category,
      description,
      image,
      latitude,
      longitude,
      address,
      district,
      state,
      pincode,
    });

    await complaint.save();
    res.json({ status: 'success', complaint });
  } catch (err) {
    res.status(500).json({ status: 'error', error_message: err.message });
  }
};

// Show complaints for a user
exports.showUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user_id: req.headers.user_id });
    res.json({ status: 'success', complaints });
  } catch (err) {
    res.status(500).json({ status: 'error', error_message: err.message });
  }
};

// Show complaint by ID
exports.showComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.query.id);
    if (!complaint) {
      return res.status(404).json({ status: 'error', error_message: 'Complaint not found' });
    }
    res.json({ status: 'success', complaint });
  } catch (err) {
    res.status(500).json({ status: 'error', error_message: err.message });
  }
};

// Get updates for a complaint
exports.getUpdates = async (req, res) => {
  try {
    const updates = []; // Replace with actual logic to fetch updates
    res.json({ status: 'success', updates });
  } catch (err) {
    res.status(500).json({ status: 'error', error_message: err.message });
  }
};