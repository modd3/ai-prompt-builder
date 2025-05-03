const Prompt = require('../models/prompt'); // Ensure correct path to your Prompt model
// If implementing user authentication, you might need access to the User model or user data from req

// Controller function to get all prompts with optional filtering, sorting, and pagination
// This function is intended to be used by a GET route, e.g., router.get('/', getPrompts);
const getPrompts = async (req, res) => {
    try {
        // Extract query parameters for filtering, sorting, and pagination
        // Using 'targetModel' and 'tags' for filtering, aligning with the Prompt model
        const { targetModel, tags, sort, page = 1, limit = 10, isPublic = 'true' } = req.query;

        // Build filter object
        const filter = {};
        if (targetModel) {
            filter.targetModel = targetModel;
        }
        if (tags) {
            // Assuming tags query param is a comma-separated string
            filter.tags = { $in: tags.split(',').map(tag => tag.trim()) };
        }
        // Filter by public status unless explicitly requested otherwise
        if (isPublic !== 'false') {
             filter.isPublic = true;
        } else {
             // If isPublic is 'false', you might want to add authentication
             // to ensure only the owner can see their private prompts.
             // For now, this will fetch all (public and private) if isPublic=false is sent.
        }


        // Build sort option
        let sortOption = { created_at: -1 }; // Default sort by newest
        if (sort === 'oldest') {
            sortOption = { created_at: 1 };
        } else if (sort === 'rating') {
            sortOption = { rating: -1 }; // Sort by highest rating
        } else if (sort === 'views') {
             sortOption = { views: -1 }; // Sort by most viewed (trending)
        }
        // Add sorting by title if needed, as in the original controller
        else if (sort === 'title_asc') {
             sortOption = { title: 1 };
        } else if (sort === 'title_desc') {
             sortOption = { title: -1 };
        }


        // Pagination calculations
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);
        const skip = (pageNumber - 1) * pageSize;

        // Fetch filtered, sorted, and paginated prompts
        // Include author details if you have a User model and are using .populate()
        const prompts = await Prompt.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(pageSize); // Apply the limit for pagination

        // Count total documents matching the filter for pagination info
        const total = await Prompt.countDocuments(filter);

        // Respond with the fetched prompts and pagination metadata
        res.status(200).json({
            prompts,
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / pageSize),
        });

    } catch (err) {
        console.error('Error fetching prompts:', err.message);
        // Send a 500 status code for server errors
        res.status(500).json({ error: err.message });
    }
};

// Controller function to create a new prompt
// This function is intended to be used by a POST route, e.g., router.post('/', createPrompt);
const createPrompt = async (req, res) => {
    // Extract prompt data from the request body, aligning with the Prompt model
    const { title, content, targetModel, tags, isPublic } = req.body;

    // Basic input validation
    if (!title || !content || !targetModel) {
        return res.status(400).json({ msg: 'Please include title, content, and targetModel' });
    }

    try {
        // If using authentication, get the author's ID from the authenticated user (e.g., req.user.id)
        // const authorId = req.user.id;

        // Create a new Prompt instance using the data from the request body
        const newPrompt = new Prompt({
            title,
            content,
            targetModel,
            // Split the comma-separated tags string into an array and trim/filter empty tags
            tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
            isPublic: isPublic || false, // Default to false if not provided
            // author: authorId // Uncomment and set if using authentication
        });

        // Save the new prompt to the database
        const prompt = await newPrompt.save();

        // Respond with the newly created prompt object and a 201 status code
        res.status(201).json(prompt);

    } catch (err) {
        console.error('Error creating prompt:', err.message);
        // Send a 500 status code for server errors
        res.status(500).json({ error: err.message });
    }
};

// Controller function to get a single prompt by ID
// This function is intended to be used by a GET route with a parameter, e.g., router.get('/:id', getPromptById);
const getPromptById = async (req, res) => {
    try {
        // Extract the prompt ID from the request parameters
        const { id } = req.params;

        // Find the prompt by its ID
        // Use .populate('author') if you want to include author details
        const prompt = await Prompt.findById(id);

        // If no prompt is found, return a 404 Not Found error
        if (!prompt) {
            return res.status(404).json({ error: "Prompt not found" });
        }

        // Respond with the found prompt object
        res.status(200).json(prompt);

    } catch (err) {
        console.error('Error fetching prompt by ID:', err.message);
        // Handle potential Mongoose CastError if ID format is invalid
        if (err.kind === 'ObjectId') {
             return res.status(404).json({ error: 'Prompt not found' });
        }
        // Send a 500 status code for other server errors
        res.status(500).json({ error: err.message });
    }
};

// Controller function to fetch unique tags (used for filter dropdowns)
// This function is intended to be used by a GET route, e.g., router.get('/tags', getPromptTags);
const getPromptTags = async (req, res) => { // Renamed from getPromptCateg to reflect 'tags' field
  try {
      // Fetch unique values for the 'tags' field across all documents
      const tags = await Prompt.distinct('tags');
      // You might want to sort these alphabetically
      tags.sort();
      res.status(200).json(tags); // Return the unique tags
  } catch (error) {
      console.error('Error fetching unique tags:', error.message);
      res.status(500).json({ error: error.message });
  }
};

// Controller function to edit an existing prompt by ID
// This function is intended to be used by a PUT route with a parameter, e.g., router.put('/:id', editPrompt);
// Requires authentication and authorization (user must be the author) in a real app
const editPrompt = async (req, res) => {
  try {
    // Extract prompt ID from parameters and updated data from body
    const { id } = req.params;
    // Extract fields aligning with the Prompt model
    const { title, content, targetModel, tags, isPublic } = req.body;

    // Build the update object
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (content !== undefined) updateFields.content = content;
    if (targetModel !== undefined) updateFields.targetModel = targetModel;
    if (tags !== undefined) updateFields.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0); // Process tags if provided
    if (isPublic !== undefined) updateFields.isPublic = isPublic;
    updateFields.updated_at = Date.now(); // Set update timestamp

    // Find the prompt by ID and update it
    // In a real app, add a check here for authorization (e.g., findByIdAndUpdate(id, ..., { new: true, owner: req.user.id }))
    const updatedPrompt = await Prompt.findByIdAndUpdate(id, updateFields, { new: true }); // { new: true } returns the updated document

    // If no prompt is found, return 404
    if (!updatedPrompt) {
         return res.status(404).json({ error: 'Prompt not found' });
    }

    // Respond with the updated prompt document
    res.status(200).json(updatedPrompt);

  } catch (err) {
    console.error('Error updating prompt:', err.message);
     if (err.kind === 'ObjectId') {
         return res.status(404).json({ error: 'Prompt not found' });
     }
    res.status(500).json({ error: 'Failed to update prompt' });
  }
};

// TODO: Implement controller functions for:
// - Deleting a prompt (requires auth and authorization)
// - Rating a prompt (requires auth)
// - Bookmarking a prompt (requires auth)
// - Getting prompts by a specific user (requires auth)


// Export the controller functions to be used in route definitions
module.exports = {
    getPrompts,
    createPrompt,
    getPromptById,
    getPromptTags, // Exporting the renamed function
    editPrompt,
};
