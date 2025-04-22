const mongoose = require('mongoose');
const express = require('express');
const app = express();
const Joi = require('joi');
const router = express.Router();

const ComplaintSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  sub_category: { type: String },
  description: { type: String, required: true },
  image: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  address: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  status: { type: String, default: 'new' },
  priority: { type: String, default: 'new' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Complaint = mongoose.model('Complaint', ComplaintSchema);

app.use(express.json());

const complaintSchema = Joi.object({
  user_id: Joi.string().required(),
  subject: Joi.string().required(),
  sub_category: Joi.string(),
  description: Joi.string().required(),
  image: Joi.string(),
  latitude: Joi.number(),
  longitude: Joi.number(),
  address: Joi.string().required(),
  district: Joi.string().required(),
  state: Joi.string().required(),
  pincode: Joi.string().required(),
  status: Joi.string().default('new'),
  priority: Joi.string().default('new'),
});

router.post('/create', async (req, res) => {
  const { error } = complaintSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: 'error', error_message: error.details[0].message });
  }

  try {
    const complaint = new Complaint(req.body); // Create a new complaint document
    await complaint.save(); // Save it to MongoDB
    res.json({ status: 'success', complaint }); // Respond with the saved document
  } catch (err) {
    res.status(500).json({ status: 'error', error_message: err.message });
  }
});

app.use('/api', router);