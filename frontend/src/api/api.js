import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000', // Backend base URL
});

// User APIs
export const userSignup = (data) => API.post('/user/signup', data);
export const userLogin = (data) => API.post('/auth/user_login', data);
export const updateUserPassword = (data, headers) => API.post('/user/update_password', data, { headers });

// Complaint APIs
export const createComplaint = (data, headers) => API.post('/complaint/create', data, { headers });
export const getUserComplaints = (headers) => API.get('/complaint/show_user_complaints', { headers });
export const getComplaintById = (id, headers) => API.get(`/complaint/show_complaint_by_id?id=${id}`, { headers });