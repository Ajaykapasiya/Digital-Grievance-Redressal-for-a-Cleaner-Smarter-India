const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ status: 'error', error_message: 'Access token is missing' });
  }

  try {
    const decoded = jwt.verify(token, 'your_secret_key');
    req.user = decoded; // Attach decoded user info to the request
    next();
  } catch (err) {
    return res.status(401).json({ status: 'error', error_message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;