import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
});

// Auth APIs
export const userSignup = (data) => API.post('/auth/user_signup', data);
export const userLogin = (data) => API.post('/auth/user_login', data);
export const adminLogin = (data) => API.post('/auth/admin_login', data);

// User APIs
export const updateUserPassword = (data, headers) => API.post('/user/update_password', data, { headers });
export const getUserProfile = (headers) => API.get('/user/profile', { headers });
export const updateUserProfile = (data, headers) => API.put('/user/profile', data, { headers });

// Admin APIs
export const getAdminProfile = (headers) => API.get('/admin_user/profile', { headers });
export const updateAdminProfile = (data, headers) => API.put('/admin_user/profile', data, { headers });
export const getAllUsers = (headers) => API.get('/admin_user/users', { headers });

// Complaint APIs
export const createComplaint = (data, headers) => API.post('/complaint/create', data, { headers });
export const getUserComplaints = (headers) => API.get('/complaint/user_complaints', { headers });
export const getComplaintById = (id, headers) => API.get(`/complaint/${id}`, { headers });
export const updateComplaintStatus = (id, data, headers) => API.put(`/complaint/${id}/status`, data, { headers });
export const getAllComplaints = (headers) => API.get('/complaint/all', { headers });
export const getComplaintsByDistrict = (district, headers) => API.get(`/complaint/district/${district}`, { headers });
export const getComplaintsByState = (state, headers) => API.get(`/complaint/state/${state}`, { headers });