const Complaint = require('../models/Complaint');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('image');

// Create a new complaint with file upload
exports.createComplaint = (req, res) => {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({ status: 'error', error_message: `Upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred
      return res.status(400).json({ status: 'error', error_message: err.message });
    }
    
    try {
      // Extract data from request
      const { subject, sub_category, description, latitude, longitude, address, district, state, pincode, urgency_level } = req.body;
      
      // Get user ID from token (assuming it's extracted in middleware)
      const user_id = req.headers.user_id || req.user?.id;
      
      console.log('Headers received:', req.headers);
      console.log('User ID from headers:', user_id);
      
      if (!user_id) {
        return res.status(401).json({ status: 'error', error_message: 'User not authenticated' });
      }

      // Create new complaint object
      const complaint = new Complaint({
        user_id,
        subject,
        sub_category,
        description,
        // Save image path if uploaded
        image: req.file ? `/uploads/${req.file.filename}` : null,
        latitude,
        longitude,
        address,
        district,
        state,
        pincode,
        urgency_level,
        status: 'pending', // Default status
      });

      await complaint.save();
      res.json({ status: 'success', complaint });
    } catch (err) {
      console.error('Complaint creation error:', err);
      res.status(500).json({ status: 'error', error_message: err.message });
    }
  });
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