const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

// Initialize Hugging Face Inference API
const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

const generateResponse = async (prompt) => {
    try {
        const response = await hf.textGeneration({
            model: "mistralai/Mistral-7B-Instruct-v0.3", // Replace with your chosen model
            inputs: prompt,
            parameters: {
                max_new_tokens: 300, // Limit the response length
                temperature: 0.7, // Adjust creativity
            },
        }, );
        return response.generated_text;
    } catch (error) {
        console.error("Error interacting with Hugging Face:", error.message);
        throw new Error("Failed to generate response from Hugging Face: " + error.message);
    }
};

module.exports = { generateResponse };
