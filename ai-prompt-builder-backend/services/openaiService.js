const OpenAI = require('openai');

// Load environment variables
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Can be omitted if already set in .env
});

/**
 * Send a prompt to the GPT model.
 * @param {string} prompt - The prompt to send to the GPT model.
 * @returns {Promise<string>} - The model's response.
 */
const generateResponse = async (prompt) => {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Using GPT-4 model
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' }, // System message
                { role: 'user', content: prompt }, // User message
            ],
            max_tokens: 100, // Limit the response length
            temperature: 0.7, // Adjust creativity (0.0 = conservative, 1.0 = creative)
        });
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error interacting with OpenAI:', error.message);
        throw new Error('Failed to generate response from OpenAI: ' + error.message);
    }
};

module.exports = { generateResponse };
