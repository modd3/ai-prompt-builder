# AI Prompt Builder - Model System Documentation

## Overview

This system provides a unified interface for testing and comparing multiple AI models from different providers. It supports free models for development and testing, with a focus on speed, variety, and large context windows.

## Supported Models

### **Groq Models (Fastest for Development)**
- **Llama-3.1-8B-Instant**: Fastest inference with LPU technology
- **Llama-3.1-70B-Versatile**: High-quality reasoning and versatility
- **Mixtral-8x7b-32768**: Mixture of experts model

### **Hugging Face Models (Variety of Open Models)**
- **Qwen2.5-Coder-32B-Instruct**: Excellent for code generation
- **Llama-3.1-8B-Instruct**: Standard all-rounder for general chat
- **Mistral-7B-v0.3**: Lightweight and follows instructions strictly
- **DeepSeek-Coder-V2-Lite**: Specialized for coding tasks

### **Google Gemini Models (Large Context)**
- **Gemini 1.5 Flash**: Massive 1M token context window

### **Mistral Models (Concise Outputs)**
- **Mistral Small**: Concise and structured outputs
- **Pixtral-12B**: Vision capabilities included

## Configuration

### **Environment Variables**

Create a `.env` file in the backend directory:

```env
# OpenAI API Key (for future use)
OPENAI_API_KEY=your_openai_api_key_here

# Hugging Face API Token
HUGGINGFACE_TOKEN=your_huggingface_token_here

# Groq API Key
GROQ_API_KEY=your_groq_api_key_here

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Mistral API Key
MISTRAL_API_KEY=your_mistral_api_key_here
```

### **Model Configuration**

Models are configured in `config/models.js` with the following structure:

```javascript
{
  id: 'model_id',           // Unique identifier
  name: 'Model Name',       // Display name
  provider: 'groq',         // Provider (groq, huggingface, gemini, mistral)
  model: 'model_name',      // Provider-specific model name
  description: 'Description',
  defaultParams: {          // Default parameters
    temperature: 0.7,
    maxTokens: 4000
  },
  maxTokens: 8000,          // Maximum tokens allowed
  supports: ['text', 'code'], // Supported content types
  freeTier: true,           // Whether it's free to use
  speed: 'fast',            // Speed category
  context: 'medium'         // Context window size
}
```

## API Endpoints

### **POST /api/test-prompt**

Test a prompt with any supported model.

**Request:**
```json
{
  "promptContent": "Your prompt here",
  "modelId": "groq_llamaInstant",
  "customParams": {
    "temperature": 0.7,
    "maxTokens": 4000
  },
  "variables": {
    "variableName": "value"
  }
}
```

**Response:**
```json
{
  "model": "Llama-3.1-8B-Instant",
  "response": "Generated response text",
  "responseTime": "123ms",
  "provider": "groq",
  "modelId": "groq_llamaInstant",
  "params": {
    "temperature": 0.7,
    "maxTokens": 4000
  }
}
```

## Frontend Integration

The frontend includes a model selection interface with:

- **Model Cards**: Display model information, provider, speed, and context
- **Custom Parameters**: Temperature sliders and token limits
- **Performance Metrics**: Response time and model info display
- **Comparison Interface**: Side-by-side model comparison

## Usage Examples

### **Basic Usage**
```javascript
const modelService = new ModelService();
const result = await modelService.generateResponse(
  'groq_llamaInstant',
  'Write a Python function to sort an array',
  { temperature: 0.7, maxTokens: 2000 }
);
```

### **Getting Model Information**
```javascript
const modelConfig = modelService.getModelInfo('groq_llamaInstant');
console.log(modelConfig.name); // "Llama-3.1-8B-Instant"
console.log(modelConfig.speed); // "fastest"
```

### **Getting Available Models**
```javascript
const freeModels = modelService.getFreeModels();
const groqModels = modelService.getModelsByProvider('groq');
```

## Error Handling

The system includes comprehensive error handling:

- **Provider Errors**: Graceful handling of API failures
- **Model Validation**: Validation of model IDs and parameters
- **Fallback Mechanisms**: Automatic fallback to alternative models
- **Performance Tracking**: Response time monitoring and error logging

## Performance Considerations

- **Groq**: Fastest for development (LPU technology)
- **Hugging Face**: Best variety of open models
- **Gemini**: Best for large context (1M tokens)
- **Mistral**: Best for concise, structured outputs

## Local Development

For offline development, you can use Ollama:

1. Install Ollama: `curl -fsSL https://ollama.ai/install.sh | sh`
2. Pull a model: `ollama pull llama3.2:1b`
3. Run locally: `ollama serve`
4. Update model configuration to use local endpoint: `http://localhost:11434/v1`

## Security Considerations

- API keys are stored in environment variables
- Rate limiting should be implemented for production
- Input validation for all model parameters
- Error messages should not expose sensitive information

## Future Enhancements

- **Rate Limiting**: Implement per-user rate limits
- **Cost Tracking**: Add cost estimation for paid models
- **Caching**: Implement response caching for frequently used prompts
- **Model Recommendations**: Add intelligent model suggestions based on prompt content
- **Batch Processing**: Support for testing multiple prompts simultaneously