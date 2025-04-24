// File: /backend-express/controllers/adminController.js

const Complaint = require('../models/Complaint');

// Admin review of complaints
exports.reviewComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, remarks, verification_needed } = req.body;
    
    // Validate admin user
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        status: 'error', 
        error_message: 'Unauthorized. Admin access required.' 
      });
    }
    
    // Find the complaint
    const complaint = await Complaint.findById(complaintId);
    
    if (!complaint) {
      return res.status(404).json({ 
        status: 'error', 
        error_message: 'Complaint not found' 
      });
    }
    
    // Update admin review
    complaint.admin_review = {
      status,
      reviewed_by: req.user._id,
      review_date: new Date(),
      remarks,
      verification_needed,
      validation_warnings: complaint.admin_review.validation_warnings
    };
    
    // Update complaint status based on review
    if (status === 'approved') {
      complaint.status = 'in_progress';
    } else if (status === 'rejected') {
      complaint.status = 'rejected';
    }
    
    complaint.updated_at = new Date();
    
    await complaint.save();
    
    res.json({ 
      status: 'success', 
      message: 'Complaint review updated',
      complaint 
    });
  } catch (err) {
    console.error('Admin review error:', err);
    res.status(500).json({ status: 'error', error_message: err.message });
  }
};

// Get complaints pending review
exports.getPendingReviews = async (req, res) => {
  try {
    // Validate admin user
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        status: 'error', 
        error_message: 'Unauthorized. Admin access required.' 
      });
    }
    
    // Find complaints pending review
    const complaints = await Complaint.find({
      'admin_review.status': 'pending'
    }).sort({ created_at: -1 });
    
    res.json({ 
      status: 'success', 
      complaints 
    });
  } catch (err) {
    console.error('Get pending reviews error:', err);
    res.status(500).json({ status: 'error', error_message: err.message });
  }
};