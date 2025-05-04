const express = require('express');
const promptRoutes = require('./routes/prompts'); // Import prompt routes
const testRoutes = require('./routes/test'); // Import test routes
const authRoutes = require('./routes/auth'); // Import auth routes // Added import for auth routes
const cors = require('cors'); // Import CORS middleware to allow cross-origin requests
require('dotenv').config({ path: './.env' }); // Load environment variables from .env in the parent directory

const app = express(); // Create an Express application instance


// Init Middleware
// express.json() parses incoming requests with JSON payloads
app.use(express.json({ extended: false }));
// cors() enables Cross-Origin Resource Sharing for all routes, allowing your frontend to connect
app.use(cors());

// Define API Routes
// Use the imported route handlers for specific URL paths
app.use('/api/prompts', promptRoutes); // All routes defined in prompts.js will be under /api/prompts
app.use('/api/test-prompt', testRoutes); // All routes defined in test.js will be under /api/test-prompt
app.use('/api/auth', authRoutes); // All routes defined in auth.js will be under /api/auth // Added auth routes


// Basic root route for testing the server is running
app.get('/', (req, res) => res.send('PromptShare API Running'));


// Define the port the server will listen on
// Use the PORT environment variable if available, otherwise default to 5000
const PORT = process.env.PORT || 5000;

// Start the server and listen on the specified port
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
