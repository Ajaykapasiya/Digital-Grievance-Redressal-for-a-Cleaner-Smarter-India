// File: /backend-express/models/Complaint.js

const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  sub_category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  imageHash: {
    type: String
  },
  latitude: {
    type: String
  },
  longitude: {
    type: String
  },
  address: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String
  },
  urgency_level: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  // New fields for admin review
  admin_review: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'needs_verification'],
      default: 'pending'
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    review_date: Date,
    remarks: String,
    verification_needed: {
      type: Boolean,
      default: false
    },
    validation_warnings: [String]
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Add geospatial index for location-based queries
complaintSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);