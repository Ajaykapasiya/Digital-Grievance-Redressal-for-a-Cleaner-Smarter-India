// File: /backend-express/controllers/complaintController.js

// Add this near the top of your file
const { validateComplaint } = require('../middleware/complaintValidation');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Complaint = require('../models/Complaint');

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

// Update your createComplaint function to handle validation warnings
exports.createComplaint = (req, res) => {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ status: 'error', error_message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ status: 'error', error_message: err.message });
    }
    
    try {
      // Extract data from request
      const { subject, sub_category, description, latitude, longitude, address, district, state, pincode, urgency_level, user_id: formUserId } = req.body;
      
      // Get user ID from multiple possible sources
      // 1. From form data (added by frontend)
      // 2. From request headers (set by interceptor)
      // 3. From decoded JWT token (set by authMiddleware)
      const user_id = formUserId || req.headers.user_id || req.user?.id;
      
      console.log('Headers received:', req.headers);
      console.log('Form data user_id:', formUserId);
      console.log('User ID resolved:', user_id);
      
      if (!user_id) {
        return res.status(401).json({ status: 'error', error_message: 'User not authenticated' });
      }

      // Create new complaint object
      const complaint = new Complaint({
        user_id,
        subject,
        sub_category,
        description,
        image: req.file ? `/uploads/${req.file.filename}` : null,
        imageHash: req.imageHash, // From image validation middleware
        latitude,
        longitude,
        address,
        district,
        state,
        pincode,
        urgency_level,
        status: 'pending',
        admin_review: {
          status: 'pending',
          validation_warnings: req.validationWarnings || []
        }
      });

      await complaint.save();
      
      // Return validation warnings to the client if any
      const response = {
        status: 'success',
        complaint,
      };
      
      if (req.validationWarnings && req.validationWarnings.length > 0) {
        response.warnings = req.validationWarnings;
      }
      
      res.json(response);
    } catch (err) {
      console.error('Complaint creation error:', err);
      res.status(500).json({ status: 'error', error_message: err.message });
    }
  });
};

// Show complaints for a user
exports.showUserComplaints = async (req, res) => {
  try {
    console.log('showUserComplaints headers:', req.headers);
    console.log('showUserComplaints user from token:', req.user);
    
    // Get user ID from multiple possible sources
    // 1. From decoded JWT token (set by authMiddleware)
    // 2. From request headers
    const user_id = req.user?.userId || req.headers.user_id;
    
    console.log('User ID for fetching complaints:', user_id);
    
    if (!user_id) {
      return res.status(401).json({ status: 'error', error_message: 'User not authenticated' });
    }
    
    const complaints = await Complaint.find({ userId: user_id }).sort({ created_at: -1 });
    res.json({ status: 'success', complaints });
  } catch (err) {
    console.error('Error fetching user complaints:', err);
    res.status(500).json({ status: 'error', error_message: err.message });
  }
};

// Show complaint by ID
exports.showComplaintById = async (req, res) => {
  try {
    const complaintId = req.params.id;
    
    if (!complaintId) {
      return res.status(400).json({ status: 'error', error_message: 'Complaint ID is required' });
    }
    
    const complaint = await Complaint.findById(complaintId);
    
    if (!complaint) {
      return res.status(404).json({ status: 'error', error_message: 'Complaint not found' });
    }
    
    res.json({ status: 'success', complaint });
  } catch (err) {
    console.error('Error fetching complaint by ID:', err);
    res.status(500).json({ status: 'error', error_message: err.message });
  }
};