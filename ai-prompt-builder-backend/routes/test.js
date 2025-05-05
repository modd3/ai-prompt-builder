const express = require('express');
const router = express.Router();

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });


// Import LLM libraries
const { OpenAI } = require('openai'); // For ChatGPT integration
const { HfInference } = require('@huggingface/inference'); // For Hugging Face integration
const Anthropic = require('@anthropic-ai/sdk'); // For Claude integration
const { GoogleGenerativeAI } = require('@google/generative-ai'); // For Gemini integration


// Initialize LLM clients (outside the route handler for efficiency)
// Ensure API keys are loaded from environment variables (.env file)

// OpenAI Client
// Ensure OPENAI_API_KEY is set in your .env file
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // This is the line that throws the error
});

// Hugging Face Client
// Ensure HUGGINGFACE_TOKEN is set in your .env file
const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

// Anthropic Client
// Ensure ANTHROPIC_API_KEY is set in your .env file
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Google Generative AI Client
// Ensure GEMINI_API_KEY is set in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// @route   POST /api/test-prompt
// @desc    Send prompt content to an LLM and get response
// @access  Public (or Private if testing requires being logged in)
router.post('/', async (req, res) => {
  // Get prompt content, target model, and any variables from the frontend request body
  const { promptContent, targetModel, variables } = req.body; // 'variables' is received but not directly used in API calls here

  // Validate required inputs
  if (!promptContent || !targetModel) {
      return res.status(400).json({ msg: 'Prompt content and target model are required' });
  }

  let modelResponse = '';
  const startTime = Date.now(); // Start timing the response

  try {
      // ** INTEGRATE WITH SPECIFIC LLM APIs BASED ON targetModel **
      switch (targetModel) {
          case 'ChatGPT':
              // Ensure OpenAI API key is configured
              if (!process.env.OPENAI_API_KEY) {
                  // This check is redundant if the client initialization already failed,
                  // but kept for clarity/future proofing.
                  throw new Error("OpenAI API key not configured in environment variables.");
              }
              // Call the OpenAI API using the provided snippet logic
              const openaiResponse = await openai.chat.completions.create({
                  model: 'gpt-3.5-turbo', // Using GPT-3.5-turbo as per provided snippet, can change to gpt-4o etc.
                  messages: [
                      { role: 'system', content: 'You are a helpful assistant.' }, // System message from snippet
                      { role: 'user', content: promptContent }, // User's prompt content
                  ],
                  max_tokens: 300, // Using max_tokens from Hugging Face snippet example (can adjust)
                  temperature: 0.9, // Using temperature from OpenAI snippet
              });
              modelResponse = openaiResponse.choices[0].message.content.trim(); // Get and trim the response text
              break;

          case 'Gemini':
              // Example integration with Google AI API
              // Ensure Gemini API key is configured
              if (!process.env.GEMINI_API_KEY) {
                   throw new Error("Gemini API key not configured in environment variables.");
               }
              // Use the specified Gemini model
              const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" }); // Using the specified model

              // Define generation configuration, including max output tokens
              const generationConfig = {
                maxOutputTokens: 500, // Set the maximum number of output tokens here (adjust as needed)
                // You can add other parameters like temperature, topP, topK here if needed
                // temperature: 0.9,
                // topP: 1,
                // topK: 1,
              };

              const result = await model.generateContent(promptContent, generationConfig); // Pass the generationConfig
              const response = result.response;
              modelResponse = response.text();
              break;

          case 'Claude':
              // Example integration with Anthropic API
              if (!process.env.ANTHROPIC_API_KEY) {
                   throw new Error("Anthropic API key not configured in environment variables.");
               }
              const message = await anthropic.messages.create({
                  max_tokens: 1024, // Example max tokens (adjust as needed)
                  messages: [{ role: "user", content: promptContent }],
                  model: "claude-3-opus-20240229", // Specify model
              });
              modelResponse = message.content[0].text;
              break;

          case 'HuggingFace': // Assuming 'HuggingFace' or a specific model name like 'Mistral-7B' is passed
              // Ensure Hugging Face token is configured
               if (!process.env.HUGGINGFACE_TOKEN) {
                   throw new Error("Hugging Face token not configured in environment variables.");
               }
              // Call the Hugging Face Inference API
              const hfResponse = await hf.textGeneration({
                  model: "mistralai/Mistral-7B-Instruct-v0.3", // Using the model from the provided snippet (adjust as needed)
                  inputs: promptContent, // User's prompt content
                  parameters: {
                      max_new_tokens: 300, // Limit the response length (adjust as needed)
                      temperature: 0.7, // Adjust creativity (adjust as needed)
                  },
              });
              modelResponse = hfResponse.generated_text; // Get the generated text
              break;

          // TODO: Add cases for 'Llama', 'Midjourney' (if applicable via API), and 'Other'
          // For models like Midjourney which are primarily image generation,
          // the API call and response handling will be different.

          default:
              // Handle unsupported models
              return res.status(400).json({ msg: `Unsupported target model for testing: ${targetModel}` });
      }

      const endTime = Date.now();
      const responseTime = `${endTime - startTime}ms`; // Calculate response time

      // Send the LLM's response back to the frontend
      res.json({
          model: targetModel, // Echo the model used
          response: modelResponse,
          responseTime: responseTime,
          // You might include token usage, cost estimates, etc. here if the API provides them
      });

  } catch (err) {
      console.error("Error calling LLM API:", err.message);
      // Send an error response back to the frontend
      res.status(500).json({ msg: 'Error processing prompt with LLM', error: err.message });
  }
});

module.exports = router;
