// File: /backend-express/routes/complaint.js

const express = require('express');
const {
  createComplaint,
  showUserComplaints,
  showComplaintById,
  getAllComplaintsAdmin,
  getAllComplaints,
  updateComplaintStatus,
  getComplaintsByDistrict,
  getValidationStatistics
} = require('../controllers/complaintController');
const { validateComplaint } = require('../middleware/complaintValidation');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('image');

const router = express.Router();

// Apply authentication middleware to all complaint routes
router.use(authMiddleware);

// Admin routes
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required'
    });
  }
  next();
}

// Admin routes must be defined BEFORE routes with path parameters to avoid conflicts
router.get('/admin/all', isAdmin, getAllComplaintsAdmin);
router.get('/admin/validation-stats', isAdmin, getValidationStatistics);
router.get('/district/:district', isAdmin, getComplaintsByDistrict);

// Public routes (with auth)
router.get('/user_complaints', showUserComplaints);

// Create complaint with validation (file upload handled in controller)
router.post('/create', validateComplaint, createComplaint);

// Parameter routes should come last to avoid conflicts
router.put('/:id/status', isAdmin, updateComplaintStatus);
router.get('/:id', showComplaintById);

module.exports = router;