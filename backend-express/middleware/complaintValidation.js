// File: /backend-express/middleware/complaintValidation.js

const axios = require('axios');
const crypto = require('crypto');
const Complaint = require('../models/Complaint');

// Simple haversine distance calculation
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

const validateComplaintData = async (complaintData, complaintId = null) => {
  const validationResults = {
    riskLevel: 'low',
    riskFactors: [],
    gpsValidation: {
      isValid: false,
      distance: null,
      reportedAddress: complaintData.address,
      verifiedAddress: null
    },
    imageValidation: {
      isDuplicate: false,
      similarComplaints: [],
      similarityScore: 0
    },
    needsManualReview: false,
    validatedAt: new Date()
  };

  try {
    const { latitude, longitude, address, image, district, state } = complaintData;

    // 1. GPS Validation
    if (latitude && longitude) {
      try {
        // Using OpenStreetMap Nominatim for reverse geocoding
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          {
            headers: {
              'User-Agent': 'Digital-Grievance-Redressal/1.0'
            }
          }
        );
        
        const geocodedAddress = response.data.display_name;
        validationResults.gpsValidation.verifiedAddress = geocodedAddress;

        // Calculate distance between reported and actual coordinates
        if (response.data.lat && response.data.lon) {
          const distance = calculateDistance(
            latitude,
            longitude,
            parseFloat(response.data.lat),
            parseFloat(response.data.lon)
          );
          validationResults.gpsValidation.distance = distance;
          validationResults.gpsValidation.isValid = distance <= 1000; // Within 1km
        }

        if (!validationResults.gpsValidation.isValid) {
          validationResults.riskFactors.push('GPS location does not match provided address');
          validationResults.needsManualReview = true;
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        validationResults.riskFactors.push('Failed to validate GPS location');
        validationResults.needsManualReview = true;
      }
    } else {
      validationResults.riskFactors.push('No GPS coordinates provided');
      validationResults.needsManualReview = true;
    }

    // 2. Check for similar complaints in the area
    const similarComplaints = await Complaint.find({
      _id: { $ne: complaintId },
      district,
      state,
      status: { $ne: 'resolved' },
      created_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      latitude: { $exists: true },
      longitude: { $exists: true }
    }).select('_id latitude longitude subject description status');

    // Check for nearby complaints
    if (latitude && longitude) {
      const nearbyComplaints = similarComplaints.filter(complaint => {
        const distance = calculateDistance(
          latitude,
          longitude,
          complaint.latitude,
          complaint.longitude
        );
        return distance <= 500; // Within 500m
      });

      if (nearbyComplaints.length > 0) {
        validationResults.riskFactors.push(`${nearbyComplaints.length} similar complaints found nearby`);
        validationResults.imageValidation.similarComplaints = nearbyComplaints.map(c => c._id);
        validationResults.needsManualReview = true;
      }
    }

    // 3. Image Validation
    if (image) {
      // Generate image hash
      const imageHash = crypto.createHash('sha256').update(image).digest('hex');
      
      // Check for duplicate images
      const duplicateComplaints = await Complaint.find({
        _id: { $ne: complaintId },
        imageHash,
        created_at: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
      }).select('_id');

      if (duplicateComplaints.length > 0) {
        validationResults.imageValidation.isDuplicate = true;
        validationResults.imageValidation.similarComplaints.push(...duplicateComplaints.map(c => c._id));
        validationResults.riskFactors.push('Duplicate image detected');
        validationResults.needsManualReview = true;
      }

      // Store the hash for future reference
      complaintData.imageHash = imageHash;
    }

    // 4. Determine overall risk level
    const riskFactorCount = validationResults.riskFactors.length;
    if (riskFactorCount >= 3 || validationResults.imageValidation.isDuplicate) {
      validationResults.riskLevel = 'high';
    } else if (riskFactorCount >= 1) {
      validationResults.riskLevel = 'medium';
    }

  } catch (error) {
    console.error('Validation error:', error);
    validationResults.riskFactors.push('Error during validation');
    validationResults.needsManualReview = true;
  }

  return validationResults;
};

// Middleware function
const validateComplaint = async (req, res, next) => {
  try {
    // Extract form data
    const formData = {};
    
    // Handle FormData or JSON
    if (req.body instanceof Object) {
      Object.keys(req.body).forEach(key => {
        formData[key] = req.body[key];
      });
    }
    
    // Validate required fields
    const requiredFields = ['subject', 'description', 'address', 'district', 'state'];
    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      // Check if value is undefined, null, or an empty string (if it's a string)
      return value === undefined || value === null || 
             (typeof value === 'string' && value.trim() === '');
    });
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate GPS coordinates if provided
    if (formData.latitude !== undefined && formData.longitude !== undefined) {
      const isValidNumber = (num) => !isNaN(parseFloat(num)) && isFinite(num);
      if (!isValidNumber(formData.latitude) || !isValidNumber(formData.longitude)) {
        throw new Error('Invalid GPS coordinates');
      }
    }

    // Validate image if provided
    if (req.file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error('Invalid image type. Only JPG, PNG and GIF are allowed');
      }
      if (req.file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Image size must be less than 5MB');
      }
    }

    // Add validation results to request
    req.validationResults = {
      riskLevel: 'low',
      riskFactors: [],
      needsManualReview: false
    };
 
    // Add GPS validation if coordinates are provided
    if (formData.latitude !== undefined && formData.longitude !== undefined) {
      req.gpsValidation = {
        isValid: true,
        distance: null,
        reportedAddress: formData.address,
        verifiedAddress: null
      };
    }

    // Add image validation if image is provided
    if (req.file) {
      req.imageValidation = {
        isDuplicate: false,
        similarComplaints: [],
        similarityScore: 0
      };
    }

    next();
  } catch (error) {
    console.error('Validation error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message,
      error: error.message
    });
  }
};

module.exports = { validateComplaint, validateComplaintData };