const express = require('express');
const router = express.Router();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import model service
const ModelService = require('../services/modelService');

// Initialize model service
const modelService = new ModelService();

// @route   POST /api/test-prompt
// @desc    Send prompt content to an LLM and get response
// @access  Public (or Private if testing requires being logged in)
router.post('/', async (req, res) => {
  // Get prompt content, target model, and any variables from the frontend request body
  const { promptContent, modelId, customParams } = req.body;

  // Validate required inputs
  if (!promptContent || !modelId) {
      return res.status(400).json({ msg: 'Prompt content and model ID are required' });
  }

  try {
      // Use the unified model service
      const result = await modelService.generateResponse(modelId, promptContent, customParams);

      res.json(result);

  } catch (err) {
      console.error("Error processing prompt:", err.message);
      res.status(500).json({ 
          msg: 'Error processing prompt with LLM', 
          error: err.message 
      });
  }
});

module.exports = router;
