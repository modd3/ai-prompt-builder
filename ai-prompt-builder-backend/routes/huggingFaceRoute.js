const express = require('express');
const router = express.Router();
const { generateResponse } = require('../services/huggingFaceService');

// POST /api/openai - Generate a response based on user input
router.post('/', async (req, res) => {
    try {
        const { prompt } = req.body; // Extract the prompt from the request body
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const response = await generateResponse(prompt); // Call the Huggingface service
        res.status(200).json({ response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

