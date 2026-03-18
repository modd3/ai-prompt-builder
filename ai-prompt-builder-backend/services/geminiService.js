const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const { getModelById } = require('../config/models');

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate response using Gemini model
 * @param {string} modelId - Model ID from configuration
 * @param {string} prompt - Prompt content
 * @param {object} customParams - Custom parameters
 * @returns {Promise<string>} - Generated response
 */
const generateResponse = async (modelId, prompt, customParams = {}) => {
    try {
        // Get model configuration
        const modelConfig = getModelById(modelId);
        if (!modelConfig || modelConfig.provider !== 'gemini') {
            throw new Error(`Invalid model ID: ${modelId}`);
        }

        // Merge default and custom parameters
        const params = {
            ...modelConfig.defaultParams,
            ...customParams,
            maxOutputTokens: customParams.maxTokens || modelConfig.defaultParams.maxTokens
        };

        // Get the specific model
        const model = genAI.getGenerativeModel({ model: modelConfig.model });

        const result = await model.generateContent(prompt, params);
        const response = result.response;

        return response.text();
    } catch (error) {
        console.error("Error interacting with Gemini:", error.message);
        throw new Error(`Failed to generate response from Gemini: ${error.message}`);
    }
};

module.exports = { generateResponse };