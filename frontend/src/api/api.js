import axios from 'axios';

// ✅ 1. Create the axios instance first
const API = axios.create({
  baseURL: 'http://localhost:8000',
});

// ✅ 2. Add interceptor after API is created
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // fetch token when request is made
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ 3. Export your API calls
// Auth APIs
export const userSignup = (data) => API.post('/auth/user_signup', data);
export const userLogin = (data) => API.post('/auth/user_login', data);
export const adminLogin = (data) => API.post('/auth/admin_login', data);

// User APIs
export const updateUserPassword = (data) => API.post('/user/update_password', data);
export const getUserProfile = () => API.get('/user/profile');
export const updateUserProfile = (data) => API.put('/user/profile', data);

// Admin APIs
export const getAdminProfile = () => API.get('/admin_user/profile');
export const updateAdminProfile = (data) => API.put('/admin_user/profile', data);
export const getAllUsers = () => API.get('/admin_user/users');

// Complaint APIs
export const createComplaint = (data) => API.post('/complaint/create', data);
export const getUserComplaints = () => API.get('/complaint/user_complaints');
export const getComplaintById = (id) => API.get(`/complaint/${id}`);
export const updateComplaintStatus = (id, data) => API.put(`/complaint/${id}/status`, data);
export const getAllComplaints = () => API.get('/complaint/all');
export const getComplaintsByDistrict = (district) => API.get(`/complaint/district/${district}`);
export const getComplaintsByState = (state) => API.get(`/complaint/state/${state}`);
