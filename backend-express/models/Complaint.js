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
  description: {
    type: String,
    required: true
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
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  image: {
    type: String
  },
  imageHash: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  urgency_level: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  resolution_details: {
    type: String
  },
  validation: {
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    riskFactors: [{
      type: String
    }],
    gpsValidation: {
      isValid: {
        type: Boolean,
        default: false
      },
      distance: {
        type: Number
      },
      reportedAddress: {
        type: String
      },
      verifiedAddress: {
        type: String
      }
    },
    imageValidation: {
      isDuplicate: {
        type: Boolean,
        default: false
      },
      similarComplaints: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint'
      }],
      similarityScore: {
        type: Number
      }
    },
    needsManualReview: {
      type: Boolean,
      default: false
    },
    validatedAt: {
      type: Date
    }
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Add indexes for faster queries
complaintSchema.index({ user_id: 1, created_at: -1 });
complaintSchema.index({ district: 1, state: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ 'validation.riskLevel': 1 });
complaintSchema.index({ imageHash: 1 });
complaintSchema.index({ latitude: 1, longitude: 1 });

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;