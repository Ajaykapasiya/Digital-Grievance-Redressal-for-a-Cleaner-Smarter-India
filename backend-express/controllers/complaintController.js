// File: /backend-express/controllers/complaintController.js

// Add this near the top of your file
const { validateComplaint } = require('../middleware/complaintValidation');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Simplified multer configuration
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Create a safe filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Create a simple multer instance without complex options
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('image');

// Create a new complaint
exports.createComplaint = async (req, res) => {
  try {
    // Check if the request is multipart/form-data or application/json
    const contentType = req.headers['content-type'] || '';
    const isMultipart = contentType.startsWith('multipart/form-data');
    
    // Handle file upload only if it's multipart/form-data
    if (isMultipart) {
      try {
        await new Promise((resolve, reject) => {
          upload(req, res, function(err) {
            if (err) {
              console.error('Upload error:', err);
              return reject(err);
            }
            resolve();
          });
        });
      } catch (uploadError) {
        console.error('Error during file upload:', uploadError);
        // Continue without file upload
      }
    }

    console.log('Request body:', req.body);
    console.log('User from token:', req.user);

    // Ensure we have a user ID from the token or form data
    const userId = req.user?.userId || req.body.user_id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User ID not found. Please log in again.'
      });
    }

    // Create complaint with validation results
    const complaint = new Complaint({
      subject: req.body.subject,
      sub_category: req.body.sub_category,
      description: req.body.description,
      address: req.body.address,
      district: req.body.district,
      state: req.body.state,
      pincode: req.body.pincode,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      urgency_level: req.body.urgency_level,
      user_id: userId,
      validation: {
        riskLevel: req.validationResults?.riskLevel || 'low',
        riskFactors: req.validationResults?.riskFactors || [],
        needsManualReview: req.validationResults?.needsManualReview || false,
        gpsValidation: req.gpsValidation || null,
        imageValidation: req.imageValidation || null
      }
    });

    // If image was uploaded, update the image path
    if (req.file) {
      complaint.image = `/uploads/${req.file.filename}`;
    }

    await complaint.save();

    return res.status(201).json({
      status: 'success',
      data: {
        complaint,
        validationResults: req.validationResults
      }
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message,
      stack: error.stack
    });
  }
};

// Get all complaints with validation info
exports.getAllComplaints = async (req, res) => {
  try {
    console.log('Admin requesting all complaints');
    
    // Fetch all complaints with user information
    const complaints = await Complaint.find()
      .populate('user_id', 'name email phone')
      .sort({ created_at: -1 });
    
    console.log(`Found ${complaints.length} complaints`);
    
    // Return the complaints directly without additional validation
    return res.status(200).json({
      status: 'success',
      complaints: complaints
    });
  } catch (error) {
    console.error('Error fetching all complaints:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch complaints',
      error: error.message
    });
  }
};

// Update complaint status with admin review
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionDetails, adminRemarks } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        status: 'error',
        message: 'Complaint not found'
      });
    }

    // Update complaint status and admin review
    complaint.status = status;
    complaint.admin_review = {
      status: status === 'rejected' ? 'rejected' : 'approved',
      reviewed_by: req.user.userId,
      review_date: new Date(),
      remarks: adminRemarks || resolutionDetails,
      verification_needed: complaint.validation?.needsManualReview || false
    };

    if (status === 'resolved') {
      complaint.resolution_details = resolutionDetails;
      complaint.resolved_at = new Date();
    }

    await complaint.save();

    res.status(200).json({
      status: 'success',
      data: {
        complaint
      }
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update complaint'
    });
  }
};

// Get complaints by district with validation summary
exports.getComplaintsByDistrict = async (req, res) => {
  try {
    const { district } = req.params;
    const complaints = await Complaint.find({ district })
      .populate('user_id', 'name email')
      .sort({ created_at: -1 });

    // Generate validation summary
    const validationSummary = {
      total: complaints.length,
      highRisk: complaints.filter(c => c.validation?.riskLevel === 'high').length,
      mediumRisk: complaints.filter(c => c.validation?.riskLevel === 'medium').length,
      lowRisk: complaints.filter(c => c.validation?.riskLevel === 'low').length,
      needsReview: complaints.filter(c => c.validation?.needsManualReview).length
    };

    res.status(200).json({
      status: 'success',
      data: {
        complaints,
        validationSummary
      }
    });
  } catch (error) {
    console.error('Error fetching complaints by district:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch complaints'
    });
  }
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
    
    // Find complaints by user_id and populate validation info
    const complaints = await Complaint.find({ user_id })
      .sort({ created_at: -1 })
      .populate('user_id', 'name email');
    
    // Run validation on each complaint if not already done
    for (let complaint of complaints) {
      if (!complaint.validation) {
        const validationResults = await validateComplaint(complaint);
        complaint.validation = {
          riskLevel: validationResults.riskLevel,
          riskFactors: validationResults.riskFactors,
          gpsValidation: validationResults.gpsValidation,
          imageValidation: validationResults.imageValidation
        };
        await complaint.save();
      }
    }
    
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

// Get all complaints for admin
exports.getAllComplaintsAdmin = async (req, res) => {
  try {
    console.log('Admin requesting all complaints - getAllComplaintsAdmin function');
    
    // Simple find query with lean() for better performance
    const complaints = await Complaint.find()
      .sort({ created_at: -1 })
      .lean();
    
    console.log(`Found ${complaints.length} complaints in database`);
    
    // Log each complaint for debugging
    complaints.forEach((complaint, index) => {
      console.log(`Complaint ${index + 1}:`, {
        id: complaint._id,
        subject: complaint.subject,
        status: complaint.status
      });
    });
    
    // Return a simple array directly
    return res.status(200).json(complaints);
  } catch (err) {
    console.error('Error fetching all complaints:', err);
    return res.status(500).json([]);
  }
};

// Get validation statistics for admin dashboard
exports.getValidationStatistics = async (req, res) => {
  try {
    const complaints = await Complaint.find();
    
    // Calculate validation statistics
    const stats = {
      total: complaints.length,
      highRisk: complaints.filter(c => c.validation?.riskLevel === 'high').length,
      mediumRisk: complaints.filter(c => c.validation?.riskLevel === 'medium').length,
      lowRisk: complaints.filter(c => c.validation?.riskLevel === 'low' || !c.validation?.riskLevel).length,
      needsReview: complaints.filter(c => c.validation?.needsManualReview).length,
      
      // Status statistics
      pending: complaints.filter(c => c.status === 'pending').length,
      inProgress: complaints.filter(c => c.status === 'in_progress').length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
      
      // Validation type statistics
      gpsValidationFailed: complaints.filter(c => c.validation?.gpsValidation?.isValid === false).length,
      imageValidationFailed: complaints.filter(c => c.validation?.imageValidation?.isValid === false).length,
      
      // Recent complaints (last 7 days)
      recentComplaints: complaints.filter(c => {
        const complaintDate = new Date(c.created_at);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return complaintDate >= sevenDaysAgo;
      }).length
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching validation statistics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch validation statistics'
    });
  }
};