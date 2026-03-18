const { Anthropic } = require('@anthropic-ai/sdk');
require('dotenv').config();
const { getModelById } = require('../config/models');

// Initialize Mistral client (using Anthropic SDK for compatibility)
const mistral = new Anthropic({ apiKey: process.env.MISTRAL_API_KEY });

/**
 * Generate response using Mistral model
 * @param {string} modelId - Model ID from configuration
 * @param {string} prompt - Prompt content
 * @param {object} customParams - Custom parameters
 * @returns {Promise<string>} - Generated response
 */
const generateResponse = async (modelId, prompt, customParams = {}) => {
    try {
        // Get model configuration
        const modelConfig = getModelById(modelId);
        if (!modelConfig || modelConfig.provider !== 'mistral') {
            throw new Error(`Invalid model ID: ${modelId}`);
        }

        // Merge default and custom parameters
        const params = {
            ...modelConfig.defaultParams,
            ...customParams,
            max_tokens: customParams.maxTokens || modelConfig.defaultParams.maxTokens
        };

        const message = await mistral.messages.create({
            model: modelConfig.model,
            max_tokens: params.max_tokens,
            messages: [{ role: "user", content: prompt }]
        });

        return message.content[0].text;
    } catch (error) {
        console.error("Error interacting with Mistral:", error.message);
        throw new Error(`Failed to generate response from Mistral: ${error.message}`);
    }
};

module.exports = { generateResponse };