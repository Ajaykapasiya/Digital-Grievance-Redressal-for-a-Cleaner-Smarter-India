import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API = axios.create({ baseURL: BASE, withCredentials: true });

export const userSignup = (data) =>
  axios.post('http://localhost:8000/auth/user_signup', data);
export const userLogin = (data) => API.post('/auth/user_login', data);
export const adminLogin = (data) => API.post('/auth/admin_login', data);

// Add this export
export const createComplaint = (data) => API.post('/complaint/create', data);

export const getUserComplaints = () => API.get('/complaint/user_complaints');
export const getAllComplaints = () => API.get('/complaint/admin/all');
export const getUserProfile = () => API.get('/user/profile');
export const updateComplaintStatus = (complaintId, status, resolution_details) =>
  API.put(`/complaint/${complaintId}/status`, { status, resolution_details });

export const setAuthToken = (token) => {
  if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete API.defaults.headers.common['Authorization'];
};

export default API;
