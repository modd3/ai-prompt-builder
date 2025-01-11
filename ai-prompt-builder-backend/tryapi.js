const OpenAI = require('openai');

// Load environment variables
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Can be omitted if already set in .env
});

async function run() {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4", // Replace "gpt-4o-mini" with "gpt-4" or another valid model
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user",
                    content: "Write a haiku about recursion in programming.",
                },
            ],
        });

        console.log(completion.choices[0].message.content);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

run();
