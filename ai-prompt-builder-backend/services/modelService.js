const { getModelById } = require('../config/models');
const { generateResponse: generateHuggingFace } = require('./huggingFaceService');
const { generateResponse: generateGroq } = require('./groqService');
const { generateResponse: generateGemini } = require('./geminiService');
const { generateResponse: generateMistral } = require('./mistralService');

class ModelService {
  constructor() {
    this.providers = {
      groq: generateGroq,
      huggingface: generateHuggingFace,
      gemini: generateGemini,
      mistral: generateMistral
    };
  }

  /**
   * Generate response using any supported model
   * @param {string} modelId - Model ID from configuration
   * @param {string} prompt - Prompt content
   * @param {object} customParams - Custom parameters
   * @returns {Promise<object>} - Response with metadata
   */
  async generateResponse(modelId, prompt, customParams = {}) {
    try {
      // Get model configuration
      const modelConfig = getModelById(modelId);
      if (!modelConfig) {
        throw new Error(`Invalid model ID: ${modelId}`);
      }

      // Get provider function
      const providerFn = this.providers[modelConfig.provider];
      if (!providerFn) {
        throw new Error(`Provider ${modelConfig.provider} not supported`);
      }

      // Track performance
      const startTime = Date.now();

      // Generate response
      const response = await providerFn(modelId, prompt, customParams);

      const endTime = Date.now();
      const responseTime = `${endTime - startTime}ms`;

      return {
        model: modelConfig.name,
        response,
        responseTime,
        provider: modelConfig.provider,
        modelId,
        params: customParams
      };
    } catch (error) {
      console.error(`Error with ${modelId}:`, error.message);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Get model information
   * @param {string} modelId - Model ID
   * @returns {object} - Model configuration
   */
  getModelInfo(modelId) {
    return getModelById(modelId);
  }

  /**
   * Get all free models
   * @returns {array} - Array of free model configurations
   */
  getFreeModels() {
    const allModels = require('../config/models').getAllModels();
    return allModels.filter(model => model.freeTier);
  }

  /**
   * Get models by provider
   * @param {string} provider - Provider name
   * @returns {array} - Array of models for provider
   */
  getModelsByProvider(provider) {
    const allModels = require('../config/models').getAllModels();
    return allModels.filter(model => model.provider === provider);
  }
}

module.exports = ModelService;