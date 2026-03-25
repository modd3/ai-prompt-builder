const express = require('express');
const path = require('path');
// This line requires the db.js file - check this path!
const connectDB = require('./config/db'); // <-- Potential issue here
const promptRoutes = require('./routes/prompts'); // Import prompt routes
const testRoutes = require('./routes/test'); // Import test routes
const authRoutes = require('./routes/auth'); // Import auth routes
const cors = require('cors'); // Import CORS middleware to allow cross-origin requests
const rateLimit = require('express-rate-limit'); // Rate limiting for security

// Load environment variables from .env file
// Try multiple paths to support both local and Docker environments
const envPaths = [
  path.resolve(__dirname, '../.env'),      // Parent directory (local development)
  path.resolve(__dirname, './.env'),       // Current directory (Docker)
  path.resolve(process.cwd(), '.env'),     // Working directory
];

for (const envPath of envPaths) {
  try {
    require('dotenv').config({ path: envPath });
    console.log(`✓ Loaded environment from: ${envPath}`);
    break;
  } catch (err) {
    // Continue to next path if file doesn't exist
  }
}

const app = express(); // Create an Express application instance

// Connect Database
connectDB();

// Init Middleware
// express.json() parses incoming requests with JSON payloads
app.use(express.json({ extended: false }));
// cors() enables Cross-Origin Resource Sharing for all routes, allowing your frontend to connect
const allowedOrigins = [
  'https://ai-prompt-builder.onrender.com', // First allowed origin
  'http://localhost:3000', // Second allowed origin
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl, mobile apps) or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Block the request
    }
  },
  credentials: true, // Allow cookies and credentials
}));

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    msg: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter limiter for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per windowMs
  message: {
    msg: 'Too many authentication attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);

// Define API Routes
// Use the imported route handlers for specific URL paths
app.use('/api/prompts', promptRoutes); // All routes defined in prompts.js will be under /api/prompts
app.use('/api/test-prompt', testRoutes); // All routes defined in test.js will be under /api/test-prompt
app.use('/api/auth', authRoutes); // All routes defined in auth.js will be under /api/auth


// Basic root route for testing the server is running
app.get('/', (req, res) => res.send('PromptShare API Running'));


// Define the port the server will listen on
// Use the PORT environment variable if available, otherwise default to 5000
const PORT = process.env.PORT || 5000;

// Start the server and listen on the specified port
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
