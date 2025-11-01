import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const API = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

// Auth APIs
export const userSignup = (data) => API.post('/user/signup', data);
export const userLogin = (data) => API.post('/auth/user_login', data);

// User APIs
export const updateUserPassword = (data) => API.post('/user/update_password', data);
export const getUserProfile = () => API.get('/user/profile');
export const updateUserProfile = (data) => API.put('/user/profile', data);

// Admin APIs
export const getAdminProfile = () => API.get('/admin_user/profile');
export const updateAdminProfile = (data) => API.put('/admin_user/profile', data);
export const getAllUsers = () => API.get('/admin_user/users');
export const getAllComplaints = async () => {
  try {
    console.log('Fetching all complaints for admin');
    const response = await API.get('/complaint/admin/all');
    console.log('Admin complaints response:', response.data);
    
    // Return the raw data directly without wrapping
    return response.data;
  } catch (error) {
    console.error('Error fetching all complaints:', error);
    throw error;
  }
};
export const updateComplaintStatus = async (complaintId, status, resolutionDetails) => {
  try {
    console.log('Updating complaint status with:', {
      complaintId,
      status,
      resolutionDetails
    });
    
    const response = await API.put(`/complaint/${complaintId}/status`, {
      status,
      resolution_details: resolutionDetails
    });
    
    console.log('Update status response:', response.data);
    return response;
  } catch (error) {
    console.error('Error updating complaint status:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};
export const getValidationStatistics = async () => {
  try {
    const response = await API.get('/complaint/admin/validation-stats');
    return response;
  } catch (error) {
    throw error;
  }
};

// Complaint APIs
export const createComplaint = async (data) => {
  try {
    // Check if data is FormData or JSON
    const isFormData = data instanceof FormData;
    
    // Use appropriate content type based on data type
    const config = isFormData ? 
      { headers: { 'Content-Type': 'multipart/form-data' } } : 
      { headers: { 'Content-Type': 'application/json' } };
    
    const response = await API.post('/complaint/create', data, config);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getUserComplaints = async () => {
  try {
    const response = await API.get('/complaint/user_complaints');
    return response;
  } catch (error) {
    throw error;
  }
};

export const getComplaintById = async (id) => {
  try {
    const response = await API.get(`/complaint/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getComplaintsByDistrict = async (district) => {
  try {
    const response = await API.get(`/complaint/district/${district}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getComplaintsByState = async (state) => {
  try {
    const response = await API.get(`/complaint/state/${state}`);
    return response;
  } catch (error) {
    throw error;
  }
};
