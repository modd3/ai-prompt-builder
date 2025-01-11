const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('./config/db');
const promptRoutes = require('./routes/promptRoute');
const openaiRoutes = require('./routes/openaiRoute');
const hugFaceRoutes = require('./routes/huggingFaceRoute');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/prompts', promptRoutes);
app.use('/api/openai', openaiRoutes);
app.use('/api/hugface', hugFaceRoutes);

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
