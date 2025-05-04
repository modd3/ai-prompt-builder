const jwt = require('jsonwebtoken'); // For verifying JWTs
const User = require('../models/User'); // Import the User model

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check for the 'Authorization' header and if it starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (remove 'Bearer ')
      token = req.headers.authorization.split(' ')[1];

      // Verify token using your JWT secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by the ID in the token payload and attach it to the request object
      // We exclude the password field
      req.user = await User.findById(decoded.id).select('-password');

      // If user is not found, return an error
      if (!req.user) {
          return res.status(401).json({ msg: 'Not authorized, user not found' });
      }

      next(); // Proceed to the next middleware or route handler

    } catch (error) {
      console.error('Error in auth middleware:', error.message);
      res.status(401).json({ msg: 'Not authorized, token failed' }); // Return 401 for invalid token
    }
  }

  // If no token is provided in the header
  if (!token) {
    res.status(401).json({ msg: 'Not authorized, no token' }); // Return 401 if no token is present
  }
};

module.exports = protect;
