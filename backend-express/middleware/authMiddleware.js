const jwt = require('jsonwebtoken');

// Use the same JWT_SECRET as in authController.js
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const authMiddleware = (req, res, next) => {
  console.log('Auth middleware called');
  console.log('Headers received:', req.headers);

  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    console.log('No authorization header found');
    return res.status(401).json({ status: 'error', error_message: 'Access token is missing' });
  }

  // Extract token from "Bearer TOKEN" format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.log('Authorization header is not in the correct Bearer format');
    return res.status(401).json({ status: 'error', error_message: 'Invalid authorization header format' });
  }
  const token = parts[1];


  console.log('Token received:', token);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded successfully:', decoded);

    // Extract user ID from token
    const userId = decoded.userId;
    if (!userId) {
      console.log('No userId found in decoded token');
      return res.status(401).json({ status: 'error', error_message: 'Invalid token: missing user ID' });
    }

    console.log('User ID from token:', userId);
    req.user = decoded; // Attach decoded user info to the request
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(401).json({ status: 'error', error_message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;