// File: /backend-express/middleware/complaintValidation.js

const axios = require('axios');
const crypto = require('crypto');
const Complaint = require('../models/Complaint');
const fs = require('fs');
const path = require('path');

// 1. Cross-check GPS coordinates with the reported address
const validateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, address, district, state } = req.body;
    
    // Skip validation if coordinates or address not provided
    if (!latitude || !longitude || !address) {
      return next();
    }
    
    // For now, just log the coordinates and address for debugging
    console.log('Validating location:', { latitude, longitude, address, district, state });
    
    // In production, you would use Google Maps API:
    // const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    // const response = await axios.get(
    //   `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    // );
    
    // Simple validation for now - just flag it as validated
    req.locationValidated = true;
    next();
  } catch (error) {
    console.error('Location validation error:', error);
    // Don't block submission on validation failure, just flag it
    req.locationValidated = false;
    next();
  }
};

// 2. Check if images are stock photos or previously submitted
const validateImage = async (req, res, next) => {
  try {
    // Skip if no image
    if (!req.file) {
      return next();
    }
    
    console.log('Validating image:', req.file.path);
    
    // For now, just set a placeholder hash
    req.imageHash = 'placeholder-hash';
    req.imageDuplicate = false;
    
    next();
  } catch (error) {
    console.error('Image validation error:', error);
    next();
  }
};

// 3. Check for similar complaints in the same area
const checkDuplicateComplaints = async (req, res, next) => {
  try {
    const { latitude, longitude, sub_category, district } = req.body;
    
    // Skip if location not provided
    if (!latitude || !longitude || !district) {
      return next();
    }
    
    console.log('Checking for duplicate complaints in:', { district, sub_category });
    
    // For now, just continue without checking
    req.similarComplaints = [];
    
    next();
  } catch (error) {
    console.error('Duplicate complaint check error:', error);
    next();
  }
};

// Combine all validations into a middleware array
const validateComplaint = [
  validateLocation,
  validateImage,
  checkDuplicateComplaints
];

module.exports = {
  validateComplaint,
  validateLocation,
  validateImage,
  checkDuplicateComplaints
};