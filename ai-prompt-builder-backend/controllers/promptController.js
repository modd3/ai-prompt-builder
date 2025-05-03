const Prompt = require('../models/prompt');

// Get all prompts with optional filtering, sorting and pagination/infinite scroll
const getPrompts = async (req, res) => {
    try {
      const { category, sort, page = 1, limit = 10 } = req.query;
  
      // Build filter and sort options
      const filter = category ? { category } : {};
      const sortOption = sort === 'asc' ? { title: 1 } : sort === 'desc' ? { title: -1 } : {};
  
      // Pagination calculations
      const pageNumber = parseInt(page, 10);
      const pageSize = parseInt(limit, 10);
      const skip = (pageNumber - 1) * pageSize;
  
      // Fetch filtered, sorted, and paginated prompts
      const prompts = await Prompt.find(filter)
        .sort(sortOption)
        .skip(skip)
        //.limit(pageSize);
  
      // Count total documents for pagination info
      const total = await Prompt.countDocuments(filter);
  
      res.status(200).json({
        prompts,
        total,
        page: pageNumber,
        totalPages: Math.ceil(total / pageSize),
      });
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
      lower_categories = categories.map((item) => item.toLowerCase());
      res.status(200).json(lower_categories); // Return lowercase categories
  } catch (error) {
      res.status(500).json({ error: error.message });
      console.error(error)
  }
};

const editPrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, template, category } = req.body;
    const updatedPrompt = await Prompt.findByIdAndUpdate(id, { title, template, category }, { new: true });
    res.json(updatedPrompt);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update prompt' });
  }
};
  
module.exports = { getPrompts, createPrompt, getPromptById, getPromptCateg, editPrompt };
