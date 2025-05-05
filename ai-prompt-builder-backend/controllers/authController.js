const User = require('../models/User'); // Import the User model
const jwt = require('jsonwebtoken'); // For generating JWTs
// You'll need to install jsonwebtoken: npm install jsonwebtoken

// Helper function to generate a JWT
const generateToken = (id) => {
  // Sign the token with the user's ID and your JWT secret from environment variables
  // Ensure JWT_SECRET is set in your .env file
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days (adjust as needed)
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by the pre-save middleware in the User model
    });

    // If user creation is successful
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id), // Generate and return a JWT
      });
    } else {
      res.status(400).json({ msg: 'Invalid user data' });
    }

  } catch (err) {
    console.error('Error registering user:', err.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// @desc    Authenticate user and get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter email and password' });
  }

  try {
    // Check for user email
    const user = await User.findOne({ email });

    // Check password using the method defined in the User model
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id), // Generate and return a JWT
      });
    } else {
      res.status(401).json({ msg: 'Invalid credentials' }); // Use 401 for unauthorized
    }

  } catch (err) {
    console.error('Error logging in user:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// @desc    Get logged in user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    // The authMiddleware will have added the user object to the request (req.user)
    // We select specific fields to return, excluding the password
    res.status(200).json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        // Include other user fields you want to expose
    });
};


module.exports = {
  registerUser,
  loginUser,
  getMe,
};
