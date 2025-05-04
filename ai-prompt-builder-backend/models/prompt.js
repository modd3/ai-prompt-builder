const mongoose = require('mongoose');

// Define the schema for a Prompt document in MongoDB
const PromptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Title is mandatory
    trim: true, // Remove leading/trailing whitespace
  },
  content: {
    type: String,
    required: true, // Prompt content is mandatory
  },
  targetModel: {
    type: String,
    required: true, // The target LLM model is mandatory
    // Define allowed values for targetModel. Add more as you integrate them.
    enum: ['ChatGPT', 'Claude', 'Gemini', 'Llama', 'Midjourney', 'Other'],
  },
  tags: {
    type: [String], // Store tags as an array of strings
    default: [], // Default to an empty array if no tags are provided
    lowercase: true, // Store tags in lowercase
    trim: true, // Remove leading/trailing whitespace from each tag
  },
  isPublic: {
    type: Boolean,
    default: false, // Prompts are private by default
  },
  // If implementing user authentication, uncomment and use the 'ref' to the User model
  author: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User',
     required: true // Make author required if users must be logged in to create
   },
   
  // Optional: If you want to track the number of times a prompt has been tested
  created_at: {
    type: Date,
    default: Date.now, // Set the creation date to the current date/time by default
  },
  updated_at: {
    type: Date,
    // updated_at will be set manually when a prompt is updated
  },
  rating: { // Store the average rating
    type: Number,
    default: 0,
  },
  ratingsCount: { // Store the number of ratings received
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0, // Track how many times the prompt has been viewed
  }
  // Add fields for test results or references to test results if you store them separately
  // testResults: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TestResult' }]
});

// Optional: Add a text index for efficient searching across title, content, and tags
PromptSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Create the Mongoose model from the schema
const Prompt = mongoose.model('Prompt', PromptSchema);

module.exports = Prompt;
