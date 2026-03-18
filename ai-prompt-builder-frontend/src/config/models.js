// Frontend model configuration for display purposes
// This mirrors the backend model configuration but is used for UI display

const models = {
  // Groq Models
  groq: {
    llamaInstant: {
      id: 'groq_llamaInstant',
      name: 'Llama-3.1-8B-Instant',
      provider: 'Groq',
      description: 'Fastest inference with LPU technology',
      speed: 'Fastest',
      context: 'Medium',
      icon: 'fast_forward',
      color: '#10b981'
    },
    llama70b: {
      id: 'groq_llama70b',
      name: 'Llama-3.1-70B-Versatile',
      provider: 'Groq',
      description: 'High-quality reasoning and versatility',
      speed: 'Fast',
      context: 'Large',
      icon: 'psychology',
      color: '#6366f1'
    },
    mixtral: {
      id: 'groq_mixtral',
      name: 'Mixtral-8x7b-32768',
      provider: 'Groq',
      description: 'Mixture of experts model',
      speed: 'Medium',
      context: 'XL',
      icon: 'engineering',
      color: '#f59e0b'
    }
  },

  // Hugging Face Models
  huggingface: {
    qwenCoder: {
      id: 'hf_qwenCoder',
      name: 'Qwen2.5-Coder-32B-Instruct',
      provider: 'Hugging Face',
      description: 'Excellent for code generation',
      speed: 'Medium',
      context: 'XL',
      icon: 'code',
      color: '#ef4444'
    },
    llama3_1_8b: {
      id: 'hf_llama3_1_8b',
      name: 'Llama-3.1-8B-Instruct',
      provider: 'Hugging Face',
      description: 'Standard all-rounder for general chat',
      speed: 'Medium',
      context: 'Large',
      icon: 'chat',
      color: '#3b82f6'
    },
    mistral7b: {
      id: 'hf_mistral7b',
      name: 'Mistral-7B-v0.3',
      provider: 'Hugging Face',
      description: 'Lightweight and follows instructions strictly',
      speed: 'Fast',
      context: 'Medium',
      icon: 'lightbulb',
      color: '#8b5cf6'
    },
    deepseekCoder: {
      id: 'hf_deepseekCoder',
      name: 'DeepSeek-Coder-V2-Lite',
      provider: 'Hugging Face',
      description: 'Specialized for coding tasks',
      speed: 'Medium',
      context: 'Large',
      icon: 'code',
      color: '#10b981'
    }
  },

  // Google Gemini Models
  gemini: {
    flash: {
      id: 'gemini_flash',
      name: 'Gemini 1.5 Flash',
      provider: 'Google',
      description: 'Massive 1M token context window',
      speed: 'Fast',
      context: 'XL',
      icon: 'globe',
      color: '#ea580c'
    }
  },

  // Mistral Models
  mistral: {
    small: {
      id: 'mistral_small',
      name: 'Mistral Small',
      provider: 'Mistral',
      description: 'Concise and structured outputs',
      speed: 'Fast',
      context: 'Medium',
      icon: 'text_snippet',
      color: '#8b5cf6'
    },
    pixtral: {
      id: 'mistral_pixtral',
      name: 'Pixtral-12B',
      provider: 'Mistral',
      description: 'Vision capabilities included',
      speed: 'Medium',
      context: 'XL',
      icon: 'photo',
      color: '#3b82f6'
    }
  }
};

// Helper functions
const getModelById = (modelId) => {
  for (const provider in models) {
    for (const modelKey in models[provider]) {
      if (models[provider][modelKey].id === modelId) {
        return models[provider][modelKey];
      }
    }
  }
  return null;
};

const getModelsByProvider = (provider) => {
  return models[provider] || {};
};

const getAllModels = () => {
  const allModels = [];
  for (const provider in models) {
    for (const modelKey in models[provider]) {
      allModels.push(models[provider][modelKey]);
    }
  }
  return allModels;
};

const getFreeModels = () => {
  return getAllModels().filter(model => model.freeTier !== false);
};

module.exports = {
  models,
  getModelById,
  getModelsByProvider,
  getAllModels,
  getFreeModels
};