const models = {
  // Groq Models (Fastest for development)
  groq: {
    llamaInstant: {
      id: 'groq_llamaInstant',
      name: 'Llama-3.1-8B-Instant',
      provider: 'groq',
      model: 'llama-3.1-8b-instant',
      description: 'Fastest inference with LPU technology',
      defaultParams: { temperature: 0.7, maxTokens: 4000 },
      maxTokens: 8000,
      supports: ['text', 'code'],
      freeTier: true,
      speed: 'fastest',
      context: 'medium'
    },
    llama70b: {
      id: 'groq_llama70b',
      name: 'Llama-3.1-70B-Versatile',
      provider: 'groq',
      model: 'llama-3.1-70b-versatile',
      description: 'High-quality reasoning and versatility',
      defaultParams: { temperature: 0.7, maxTokens: 8000 },
      maxTokens: 16000,
      supports: ['text', 'code'],
      freeTier: true,
      speed: 'fast',
      context: 'large'
    },
    mixtral: {
      id: 'groq_mixtral',
      name: 'Mixtral-8x7b-32768',
      provider: 'groq',
      model: 'mixtral-8x7b-32768',
      description: 'Mixture of experts model',
      defaultParams: { temperature: 0.7, maxTokens: 8000 },
      maxTokens: 32768,
      supports: ['text', 'code'],
      freeTier: true,
      speed: 'medium',
      context: 'xl'
    }
  },

  // Hugging Face Models (Variety of Open Models)
  huggingface: {
    qwenCoder: {
      id: 'hf_qwenCoder',
      name: 'Qwen2.5-Coder-32B-Instruct',
      provider: 'huggingface',
      model: 'Qwen/Qwen2.5-Coder-32B-Instruct',
      description: 'Excellent for code generation and technical tasks',
      defaultParams: { temperature: 0.3, maxTokens: 8000 },
      maxTokens: 32000,
      supports: ['code', 'text'],
      freeTier: true,
      speed: 'medium',
      context: 'xl'
    },
    llama3_1_8b: {
      id: 'hf_llama3_1_8b',
      name: 'Llama-3.1-8B-Instruct',
      provider: 'huggingface',
      model: 'meta-llama/Llama-3.1-8B-Instruct',
      description: 'Standard all-rounder for general chat',
      defaultParams: { temperature: 0.7, maxTokens: 4000 },
      maxTokens: 8000,
      supports: ['text', 'code'],
      freeTier: true,
      speed: 'medium',
      context: 'large'
    },
    mistral7b: {
      id: 'hf_mistral7b',
      name: 'Mistral-7B-v0.3',
      provider: 'huggingface',
      model: 'mistralai/Mistral-7B-v0.3',
      description: 'Lightweight and follows instructions strictly',
      defaultParams: { temperature: 0.7, maxTokens: 4000 },
      maxTokens: 8000,
      supports: ['text', 'code'],
      freeTier: true,
      speed: 'fast',
      context: 'medium'
    },
    deepseekCoder: {
      id: 'hf_deepseekCoder',
      name: 'DeepSeek-Coder-V2-Lite',
      provider: 'huggingface',
      model: 'THUDM/DeepSeek-Coder-V2-Lite-6.7B-Instruct',
      description: 'Specialized for coding tasks',
      defaultParams: { temperature: 0.3, maxTokens: 8000 },
      maxTokens: 16000,
      supports: ['code', 'text'],
      freeTier: true,
      speed: 'medium',
      context: 'large'
    }
  },

  // Google Gemini Models (Large Context)
  gemini: {
    flash: {
      id: 'gemini_flash',
      name: 'Gemini 1.5 Flash',
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      description: 'Massive 1M token context window',
      defaultParams: { temperature: 0.5, maxOutputTokens: 8000 },
      maxTokens: 1000000,
      supports: ['text', 'code', 'data'],
      freeTier: true,
      speed: 'fast',
      context: 'xl'
    }
  },

  // Mistral Models (Concise Outputs)
  mistral: {
    small: {
      id: 'mistral_small',
      name: 'Mistral Small',
      provider: 'mistral',
      model: 'mistral-small',
      description: 'Concise and structured outputs',
      defaultParams: { temperature: 0.3, maxTokens: 4000 },
      maxTokens: 8000,
      supports: ['text', 'json'],
      freeTier: true,
      speed: 'fast',
      context: 'medium'
    },
    pixtral: {
      id: 'mistral_pixtral',
      name: 'Pixtral-12B',
      provider: 'mistral',
      model: 'pixtral-12b',
      description: 'Vision capabilities included',
      defaultParams: { temperature: 0.5, maxTokens: 8000 },
      maxTokens: 24000,
      supports: ['text', 'vision', 'json'],
      freeTier: true,
      speed: 'medium',
      context: 'xl'
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
  return getAllModels().filter(model => model.freeTier);
};

module.exports = {
  models,
  getModelById,
  getModelsByProvider,
  getAllModels,
  getFreeModels
};