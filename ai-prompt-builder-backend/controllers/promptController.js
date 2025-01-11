const Prompt = require('../models/prompt');

// Get all prompts with optional filtering and sorting
const getPrompts = async (req, res) => {
    try {
        const { category, sort } = req.query; // Get query parameters

        // Build the query object for filtering based on category
        const filter = category ? { category} : {}; // Ensure you're querying by category

        // Determine sorting order
        const sortOption = sort === 'asc' ? { title: 1 } : sort === 'desc' ? { title: -1 } : {};

        // Fetch filtered and sorted prompts
        const prompts = await Prompt.find(filter).sort(sortOption);

        res.status(200).json(prompts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new prompt
const createPrompt = async (req, res) => {
    try {
        const { title, template, category } = req.body;
        const newPrompt = new Prompt({ title, template, category});
        await newPrompt.save();
        res.status(201).json(newPrompt);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single prompt by ID
const getPromptById = async (req, res) => {
    try {
      const { id } = req.params;
      const prompt = await Prompt.findById(id);
      if (!prompt) {
        return res.status(404).json({ error: "Prompt not found" });
      }
      res.status(200).json(prompt);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

// Fetch unique categories for the filter dropdown
const getPromptCateg = async (req, res) => {
  try {
      // Fetch unique categories and convert them to lowercase
      const categories = await Prompt.distinct('category');
      const lowercaseCategories = categories.map(category => category);
      
      res.status(200).json(lowercaseCategories); // Return lowercase categories
  } catch (error) {
      res.status(500).json({ error: error.message });
      console.error(error)
  }
};

  
module.exports = { getPrompts, createPrompt, getPromptById, getPromptCateg };
