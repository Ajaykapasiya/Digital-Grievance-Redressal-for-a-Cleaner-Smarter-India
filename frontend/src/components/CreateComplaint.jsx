import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createComplaint } from '../api/api';
import { useAuth } from '../context/AuthContext';

const URGENCY_LEVELS = {
  LOW: {
    value: 'low',
    label: 'Low',
    description: 'Issue needs attention but is not time-critical',
    color: 'bg-gray-100 text-gray-800'
  },
  MEDIUM: {
    value: 'medium',
    label: 'Medium',
    description: 'Issue requires attention within a few days',
    color: 'bg-yellow-100 text-yellow-800'
  },
  HIGH: {
    value: 'high',
    label: 'High',
    description: 'Urgent issue requiring immediate attention',
    color: 'bg-red-100 text-red-800'
  }
};

const CreateComplaint = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    sub_category: '',
    description: '',
    image: null,
    latitude: null,
    longitude: null,
    address: '',
    district: '',
    state: '',
    pincode: '',
    urgency_level: 'medium'  // Default to medium urgency
  });

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Current user:', user);
    console.log('Token:', token);
    
    if (!token) {
      navigate('/login', { state: { from: '/create-complaint' } });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setFormData(prev => ({ ...prev, image: file }));
      setError(null);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageRemove = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocationStatus('loading');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus('success');
        // Attempt to get address from coordinates using reverse geocoding
        fetchAddressFromCoordinates(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setLocationStatus('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError(
              'Location access was denied. Please enable location access in your browser settings or enter your address manually.'
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable. Please enter your address manually.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out. Please try again or enter your address manually.');
            break;
          default:
            setError('An unknown error occurred. Please enter your address manually.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const fetchAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      
      if (data.address) {
        setFormData(prev => ({
          ...prev,
          address: data.display_name || '',
          district: data.address.city || data.address.town || data.address.county || '',
          state: data.address.state || '',
          pincode: data.address.postcode || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      // Don't show error to user since this is a supplementary feature
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    const requiredFields = ['subject', 'description', 'address', 'district', 'state'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      // Create a regular JSON object instead of FormData
      const jsonData = {
        subject: formData.subject,
        sub_category: formData.sub_category || '',
        description: formData.description,
        address: formData.address,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode || '',
        urgency_level: formData.urgency_level || 'medium'
      };
      
      // Add coordinates if available
      if (formData.latitude !== null && formData.latitude !== undefined) {
        jsonData.latitude = formData.latitude;
      }
      if (formData.longitude !== null && formData.longitude !== undefined) {
        jsonData.longitude = formData.longitude;
      }

      // Add user ID from token
      const token = localStorage.getItem('token');
      if (token) {
        const base64Token = token.split('.')[1];
        const decodedToken = JSON.parse(atob(base64Token));
        jsonData.user_id = decodedToken.userId;
      }
      
      // Temporarily disable image upload
      // if (formData.image) {
      //   formDataToSend.append('image', formData.image);
      // }

      console.log('Sending complaint data:', jsonData);
      const response = await createComplaint(jsonData);
      console.log('Complaint submitted successfully:', response);
      navigate('/track-complaint');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setError(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Lodge a Complaint</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Category</label>
          <select
            name="sub_category"
            value={formData.sub_category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">Select a category</option>
            <option value="garbage">Garbage</option>
            <option value="water_supply">Water Supply</option>
            <option value="electricity">Electricity</option>
            <option value="road_maintenance">Roads</option>
            <option value="sewage">Sewage</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Location</label>
          <button
            type="button"
            onClick={handleLocationClick}
            disabled={locationStatus === 'loading'}
            className={`w-full mb-4 px-4 py-2 rounded-xl border font-medium transition-colors ${
              locationStatus === 'success'
                ? 'bg-success-light text-success border-success'
                : locationStatus === 'error'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-white text-primary border-primary hover:bg-primary-light'
            }`}
          >
            {locationStatus === 'loading' ? (
              'Getting your location...'
            ) : locationStatus === 'success' ? (
              'Location obtained ✓'
            ) : locationStatus === 'error' ? (
              'Location access denied ✗'
            ) : (
              'Get Current Location'
            )}
          </button>

          <div className="space-y-4">
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street Address"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="District"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="PIN Code"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>
        </div>

        {/* Urgency Level Section */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Urgency Level</label>
          <div className="grid grid-cols-3 gap-4">
            {Object.values(URGENCY_LEVELS).map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setFormData({ ...formData, urgency_level: level.value })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.urgency_level === level.value
                    ? `${level.color} border-current`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold mb-1">{level.label}</div>
                <div className="text-sm text-gray-600">{level.description}</div>
              </button>
            ))}
          </div>
        </div>
        

        {/* Image Upload Section */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Upload Image</label>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          
          <div className="mt-2 flex flex-col items-center">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-64 rounded-lg object-contain"
                />
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleImageClick}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="mt-2 block text-sm font-medium text-gray-600">
                  Click to upload an image
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  JPEG, PNG up to 5MB
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Submit Section */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 mt-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <button
              type="submit"
              disabled={loading || !formData.urgency_level}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center justify-center bg-blue-500 text-white">
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit Complaint
                </span>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/track-complaint')}
              className="ml-4 px-8 py-3 text-primary hover:bg-primary-light rounded-xl transition-colors flex items-center"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Track Complaints
            </button>
          </div>
          
          {!formData.urgency_level && (
            <p className="text-sm text-red-600 mt-2 text-center">
              Please select an urgency level to submit
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateComplaint;