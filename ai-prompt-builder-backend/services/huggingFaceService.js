const { HfInference } = require('@huggingface/inference');
require('dotenv').config();
const { getModelById } = require('../config/models');

// Initialize Hugging Face Inference API
const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

/**
 * Generate response using Hugging Face model with custom parameters
 * @param {string} modelId - Model ID from configuration
 * @param {string} prompt - Prompt content
 * @param {object} customParams - Custom parameters (temperature, maxTokens, etc.)
 * @returns {Promise<string>} - Generated response
 */
const generateResponse = async (modelId, prompt, customParams = {}) => {
    try {
        // Get model configuration
        const modelConfig = getModelById(modelId);
        if (!modelConfig || modelConfig.provider !== 'huggingface') {
            throw new Error(`Invalid model ID: ${modelId}`);
        }

        // Merge default and custom parameters
        const params = {
            ...modelConfig.defaultParams,
            ...customParams,
            max_new_tokens: customParams.maxTokens || modelConfig.defaultParams.maxTokens
        };

        const response = await hf.textGeneration({
            model: modelConfig.model,
            inputs: prompt,
            parameters: params
        });

        return response.generated_text;
    } catch (error) {
        console.error("Error interacting with Hugging Face:", error.message);
        throw new Error(`Failed to generate response from Hugging Face: ${error.message}`);
    }
};

module.exports = { generateResponse };
