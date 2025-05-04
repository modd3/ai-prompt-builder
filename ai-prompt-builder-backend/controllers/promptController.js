const Prompt = require('../models/prompt'); // Ensure correct path to your Prompt model
// If implementing user authentication, you might need access to the User model or user data from req

// Controller function to get all prompts with optional filtering, sorting, and pagination
// This function is intended to be used by a GET route, e.g., router.get('/', getPrompts);
const getPrompts = async (req, res) => {
    try {
        // Extract query parameters for filtering, sorting, pagination, and search
        // Using 'targetModel' and 'tags' for filtering, aligning with the Prompt model
        const { targetModel, tags, sort, page = 1, limit = 10, isPublic = 'true', search } = req.query; // Added 'search'

        // Build filter object
        const filter = {};
        if (targetModel && targetModel !== 'All') { // Added check for 'All' filter
            filter.targetModel = targetModel;
        }
        if (tags) {
            // Assuming tags query param is a comma-separated string
            filter.tags = { $in: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) }; // Filter out empty tags
        }
        // Filter by public status unless explicitly requested otherwise
        if (isPublic === 'true') { // Explicitly check for 'true' string
             filter.isPublic = true;
        } else if (isPublic === 'false') { // Explicitly check for 'false' string
             filter.isPublic = false;
             // In a real app, add authentication here to ensure only the owner can see their private prompts.
             // filter.author = req.user.id; // Example if using auth
        }
        // If isPublic is not provided or is something else, it won't be added to the filter,
        // which might return both public and private depending on the find() query.
        // It's safer to explicitly handle the default or require isPublic.


        // Add search filter if search term is provided
        if (search) {
             // Using $text search requires a text index on your Prompt model
             // Ensure PromptSchema.index({ title: 'text', content: 'text', tags: 'text' }); is in your model
             filter.$text = { $search: search };

             // Alternatively, for simpler substring matching (less efficient on large data):
             // const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex
             // filter.$or = [
             //     { title: searchRegex },
             //     { content: searchRegex },
             //     { tags: { $in: [searchRegex] } } // Search within tags array
             // ];
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
// Requires authentication (authMiddleware) and the user ID will be in req.user.id
const createPrompt = async (req, res) => {
    // Extract prompt data from the request body, aligning with the Prompt model
    const { title, content, targetModel, tags, isPublic } = req.body;

    // Basic input validation
    if (!title || !content || !targetModel) {
        return res.status(400).json({ msg: 'Please include title, content, and targetModel' });
    }

    try {
        // Get the author's ID from the authenticated user provided by the authMiddleware
        const authorId = req.user.id;

        // Create a new Prompt instance using the data from the request body
        const newPrompt = new Prompt({
            title,
            content,
            targetModel,
            // Split the comma-separated tags string into an array and trim/filter empty tags
            tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
            isPublic: isPublic || false, // Default to false if not provided
            author: authorId // Set the author to the authenticated user's ID
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
// Access is Public, but you might add logic to check ownership for private prompts.
const getPromptById = async (req, res) => {
    try {
        // Extract the prompt ID from the request parameters
        const { id } = req.params;

        // Find the prompt by its ID
        // Use .populate('author') if you have a User model and are using .populate()
        const prompt = await Prompt.findById(id);

        // If no prompt is found, return a 404 Not Found error
        if (!prompt) {
            return res.status(404).json({ error: "Prompt not found" });
        }

        // TODO: Add logic here to check if the prompt is private and if the requesting user (if authenticated) is the author.
        // If prompt.isPublic === false && (!req.user || prompt.author.toString() !== req.user.id) {
        //     return res.status(403).json({ msg: 'Not authorized to view this private prompt' });
        // }


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
// Requires authentication (authMiddleware) and authorization (user must be the author)
const editPrompt = async (req, res) => {
  try {
    // Extract prompt ID from parameters and updated data from body
    const { id } = req.params;
    // Extract fields aligning with the Prompt model
    const { title, content, targetModel, tags, isPublic } = req.body;

    // Find the prompt first to check authorization
    const promptToUpdate = await Prompt.findById(id);

    // If no prompt is found, return 404
    if (!promptToUpdate) {
         return res.status(404).json({ error: 'Prompt not found' });
    }

    // Check if the authenticated user is the author of the prompt
    // req.user.id is available because of the authMiddleware
    if (promptToUpdate.author.toString() !== req.user.id) {
        // Use 403 Forbidden if the user is authenticated but not authorized to edit this prompt
        return res.status(403).json({ msg: 'Not authorized to edit this prompt' });
    }


    // Build the update object
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (content !== undefined) updateFields.content = content;
    if (targetModel !== undefined) updateFields.targetModel = targetModel;
    if (tags !== undefined) updateFields.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0); // Process tags if provided
    if (isPublic !== undefined) updateFields.isPublic = isPublic;
    updateFields.updated_at = Date.now(); // Set update timestamp

    // Find the prompt by ID and update it
    // Use findByIdAndUpdate with the ID and update fields
    const updatedPrompt = await Prompt.findByIdAndUpdate(id, updateFields, { new: true }); // { new: true } returns the updated document

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

// Placeholder controller function for deleting a prompt
// This function needs to be implemented to handle the DELETE /api/prompts/:id route
// Requires authentication (authMiddleware) and authorization (user must be the author)
const deletePrompt = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the prompt first to check authorization
        const promptToDelete = await Prompt.findById(id);

        // If no prompt is found, return 404
        if (!promptToDelete) {
            return res.status(404).json({ error: 'Prompt not found' });
        }

        // Check if the authenticated user is the author of the prompt
        // req.user.id is available because of the authMiddleware
        if (promptToDelete.author.toString() !== req.user.id) {
            // Use 403 Forbidden if the user is authenticated but not authorized to delete this prompt
            return res.status(403).json({ msg: 'Not authorized to delete this prompt' });
        }

        // If authorized, delete the prompt
        await Prompt.findByIdAndDelete(id);

        // Respond with a success message or the deleted prompt's ID
        res.status(200).json({ msg: 'Prompt removed' });

    } catch (err) {
        console.error('Error deleting prompt:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ error: 'Prompt not found' });
        }
        res.status(500).json({ error: 'Failed to delete prompt' });
    }
};

// Placeholder controller function for rating a prompt
// This function needs to be implemented to handle the POST /api/prompts/:id/rate route
// Requires authentication (authMiddleware)
const ratePrompt = async (req, res) => {
    // TODO: Implement logic to receive rating (e.g., 1-5 stars) in req.body
    // Find the prompt by ID, update its rating and ratingsCount
    // Ensure a user can only rate a prompt once (requires tracking user ratings)
    res.status(501).json({ msg: 'Rate prompt functionality not yet implemented' }); // 501 Not Implemented
};

// Placeholder controller function for bookmarking a prompt
// This function needs to be implemented to handle the POST /api/prompts/:id/bookmark route
// Requires authentication (authMiddleware)
const bookmarkPrompt = async (req, res) => {
    // TODO: Implement logic to add/remove the prompt ID to the authenticated user's bookmarks list
    // You might need to update the User model to have a bookmarks array
    res.status(501).json({ msg: 'Bookmark prompt functionality not yet implemented' }); // 501 Not Implemented
};


// Export the controller functions to be used in route definitions
module.exports = {
    getPrompts,
    createPrompt,
    getPromptById,
    getPromptTags, // Exporting the renamed function
    editPrompt,
    deletePrompt, // Export the new deletePrompt function
    ratePrompt,   // Export the placeholder ratePrompt function
    bookmarkPrompt // Export the placeholder bookmarkPrompt function
};
// Note: Ensure to implement the ratePrompt and bookmarkPrompt functions
// in the future, as they are currently placeholders.