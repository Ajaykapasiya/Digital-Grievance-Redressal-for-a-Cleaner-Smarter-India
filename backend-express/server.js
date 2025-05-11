const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin_user');
const complaintRoutes = require('./routes/complaint');
const path = require('path');
const multer = require('multer');
const { validateComplaint } = require('./middleware/complaintValidation');

const app = express();

// Set mongoose strictQuery to true to suppress deprecation warning
mongoose.set('strictQuery', true);

// Connect to MongoDB
connectDB();

// Middleware
// Use express.json() for JSON parsing
app.use(express.json());
// Use express.urlencoded() for URL-encoded form data
app.use(express.urlencoded({ extended: true }));

const upload = multer();
app.use(upload.any());

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (/^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin_user', adminRoutes);
app.use('/complaint', complaintRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    error_message: 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 8000;

// Improved server startup with error handling
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port or kill the process using this port.`);
  } else {
    console.error('Error starting server:', err);
  }
  process.exit(1);
});