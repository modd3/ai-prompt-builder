const mongoose = require('mongoose');
const path = require('path'); // Import path module

// Load environment variables from .env if not already loaded
// This supports both local and Docker environments
const envPaths = [
  path.resolve(__dirname, '../.env'),      // Current directory (Docker)
  path.resolve(__dirname, '../../.env'),   // Parent directory (local development)
];

for (const envPath of envPaths) {
  try {
    require('dotenv').config({ path: envPath });
    break;
  } catch (err) {
    // Continue to next path if file doesn't exist
  }
}


const connectDB = async () => {
  try {
    // Added logging before the connection attempt
    console.log('Attempting to connect to MongoDB...');
    // Check if MONGO_URI is loaded
    console.log('MONGO_URI loaded:', process.env.MONGO_URI ? 'Yes' : 'No');

    // Attempt to connect to MongoDB using the URI from environment variables
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Remove useCreateIndex and useFindAndModify as they are deprecated in recent Mongoose versions
      // useCreateIndex: true, // Deprecated
      // useFindAndModify: false, // Deprecated
    });

    console.log('MongoDB connected successfully'); // This is the success log

  } catch (err) {
    console.error('MongoDB connection error:', err.message); // This is the error log
    // Exit process with failure if database connection fails
    process.exit(1);
  }
};

// Call the connectDB function to initiate the connection when the module is required
connectDB();

// Export mongoose instance if needed elsewhere
module.exports = mongoose;
