const mongoose = require('mongoose');

const AdminUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  designation: { type: String, required: true },
  municipal_id: { type: String, required: true },
  department: { type: String, required: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AdminUser', AdminUserSchema);