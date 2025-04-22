const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin_user');
const complaintRoutes = require('./routes/complaint');

const app = express();


connectDB();


app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true 
}));


app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin_user', adminRoutes);
app.use('/complaint', complaintRoutes);


const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
