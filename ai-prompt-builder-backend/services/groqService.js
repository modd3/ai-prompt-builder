const OpenAI = require('openai');
require('dotenv').config();
const { getModelById } = require('../config/models');

// Initialize Groq client (uses OpenAI SDK format)
const groq = new OpenAI({
    baseURL: 'https://api.groq.com/v1',
    apiKey: process.env.GROQ_API_KEY
});

/**
 * Generate response using Groq model
 * @param {string} modelId - Model ID from configuration
 * @param {string} prompt - Prompt content
 * @param {object} customParams - Custom parameters
 * @returns {Promise<string>} - Generated response
 */
const generateResponse = async (modelId, prompt, customParams = {}) => {
    try {
        // Get model configuration
        const modelConfig = getModelById(modelId);
        if (!modelConfig || modelConfig.provider !== 'groq') {
            throw new Error(`Invalid model ID: ${modelId}`);
        }

        // Merge default and custom parameters
        const params = {
            ...modelConfig.defaultParams,
            ...customParams,
            max_tokens: customParams.maxTokens || modelConfig.defaultParams.maxTokens
        };

        const response = await groq.chat.completions.create({
            model: modelConfig.model,
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: prompt }
            ],
            ...params
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error interacting with Groq:", error.message);
        throw new Error(`Failed to generate response from Groq: ${error.message}`);
    }
};

module.exports = { generateResponse };