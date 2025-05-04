const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

// Define the schema for a User document in MongoDB
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // User's name is mandatory
    trim: true,
  },
  email: {
    type: String,
    required: true, // Email is mandatory
    unique: true, // Ensure email is unique across users
    trim: true,
    lowercase: true, // Store email in lowercase
    // Basic email format validation (can be more robust)
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: true, // Password is mandatory
    minlength: 6, // Minimum password length
  },
  created_at: {
    type: Date,
    default: Date.now, // Set creation date by default
  },
  // You might add fields like:
  avatar: { type: String }, // URL to user's avatar
  bio: { type: String },
  prompts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prompt' }] // Optional: Array of prompts created by this user
});

// Mongoose middleware to hash the password before saving the user
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  try {
    // Generate a salt with 10 rounds
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the generated salt
    this.password = await bcrypt.hash(this.password, salt);
    next(); // Proceed to save
  } catch (err) {
    next(err); // Pass any errors to the next middleware/error handler
  }
});

// Method to compare a provided password with the hashed password in the database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  // Compare the entered password with the hashed password using bcrypt
  return await bcrypt.compare(enteredPassword, this.password);
};


// Create the Mongoose model from the schema
const User = mongoose.model('User', UserSchema);

module.exports = User;
