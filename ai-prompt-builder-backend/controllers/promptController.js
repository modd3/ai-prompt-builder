const Prompt = require('../models/prompt'); // Ensure correct path to your Prompt model
const User = require('../models/User'); // Import the User model to update the user's prompts array
const mongoose = require('mongoose'); // Import mongoose for ObjectId comparison


// Controller function to get all prompts with optional filtering, sorting, and pagination
// This function is intended to be used by a GET route, e.g., router.get('/', getPrompts);
const getPrompts = async (req, res) => {
    try {
        // Extract query parameters for filtering, sorting, pagination, and search
        // Using 'targetModel' and 'tags' for filtering, aligning with the Prompt model
        const { targetModel, tags, sort, page = 1, limit = 10, isPublic = 'true', search, author } = req.query; // Added 'author' query param

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
             // If fetching private prompts, ensure the user is authenticated and is the author
             // This assumes the 'author' query param is being used to request user's private prompts
             if (author && req.user && author === req.user.id) {
                  filter.author = author;
             } else {
                  // If requesting private prompts without being the author, return empty or unauthorized
                  // For now, let's just ensure the filter is set correctly if the user is the author
                  // A more robust approach might return 403 if isPublic=false is requested without auth/ownership
                  if (!req.user || author !== req.user.id) {
                      // If private=false is requested but no author filter or wrong author,
                      // we might adjust the filter or return an error depending on desired behavior.
                      // For now, if isPublic=false is requested, we require the author filter to match the logged-in user.
                      // If it doesn't match or no user, the filter won't be applied, effectively showing no private prompts for others.
                  } else {
                      filter.author = author;
                  }
             }
        }
        // If isPublic is not provided or is something else, it won't be added to the filter,
        // which might return both public and private depending on the find() query.
        // It's safer to explicitly handle the default or require isPublic.

        // Add author filter if provided and not fetching public prompts
        if (author && isPublic !== 'true') { // Only apply author filter if explicitly requested and not public
             // Ensure the requesting user is the author if this route is protected
             // If this GET route is public, you'd only apply the author filter
             // For now, assuming this route is public and author filter is just for querying
             filter.author = author;
        }
console.log(author);

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
            .limit(pageSize)
            .populate('author', 'name'); // Populate author field, only include name

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

        // --- Start: Update the user's prompts array ---
        const user = await User.findById(authorId); // Find the authenticated user

        if (user) {
            user.prompts.push(prompt._id); // Add the new prompt's ID to the user's prompts array
            await user.save(); // Save the updated user document
            console.log(`Added prompt ${prompt._id} to user ${authorId}'s prompts array.`);
        } else {
            console.warn(`User with ID ${authorId} not found after creating prompt ${prompt._id}. Cannot update user's prompts array.`);
        }
        // --- End: Update the user's prompts array ---


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
        const prompt = await Prompt.findById(id).populate('author', 'name'); // Populate author field, only include name

        // If no prompt is found, return a 404 Not Found error
        if (!prompt) {
            return res.status(404).json({ error: "Prompt not found" });
        }

        // TODO: Add logic here to check if the prompt is private and if the requesting user (if authenticated) is the author.
        // If prompt.isPublic === false && (!req.user || prompt.author._id.toString() !== req.user.id) {
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
    const updatedPrompt = await Prompt.findByIdAndUpdate(id, updateFields, { new: true }).populate('author', 'name'); // { new: true } returns the updated document, populate author

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

// Controller function for deleting a prompt
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

        // --- Start: Remove prompt ID from the user's prompts array ---
        const user = await User.findById(req.user.id); // Find the authenticated user

        if (user) {
            // Remove the prompt ID from the user's prompts array
            user.prompts = user.prompts.filter(promptId => promptId.toString() !== id);
            await user.save(); // Save the updated user document
            console.log(`Removed prompt ${id} from user ${req.user.id}'s prompts array.`);
        } else {
             console.warn(`User with ID ${req.user.id} not found when deleting prompt ${id}. Cannot update user's prompts array.`);
        }
        // --- End: Remove prompt ID from the user's prompts array ---


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

// Controller function for rating a prompt
// This function needs to be implemented to handle the POST /api/prompts/:id/rate route
// Requires authentication (authMiddleware)
const ratePrompt = async (req, res) => {
    try {
        const { id } = req.params; // Prompt ID from URL
        const { rating } = req.body; // Rating value from request body (e.g., 1-5)
        const userId = req.user.id; // Authenticated user ID from authMiddleware

        // 1. Find the prompt
        const prompt = await Prompt.findById(id);

        // If prompt not found
        if (!prompt) {
            return res.status(404).json({ msg: 'Prompt not found' });
        }

        // --- Start: Check if the authenticated user is the author ---
        if (prompt.author.toString() === userId) {
            return res.status(400).json({ msg: 'You cannot rate your own prompt.' });
        }
        // --- End: Check if the authenticated user is the author ---


        // 2. Validate the rating value
        const ratingValue = parseInt(rating, 10);
        if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) { // Assuming 0-5 scale
            return res.status(400).json({ msg: 'Invalid rating value. Please provide a number between 0 and 5.' });
        }

        // 3. Check if the user has already rated this prompt
        // Convert userId string to ObjectId for comparison if prompt.ratedBy stores ObjectIds
        const hasRated = prompt.ratedBy.some(ratedById => ratedById.toString() === userId);

        if (hasRated) {
            return res.status(400).json({ msg: 'You have already rated this prompt.' });
        }

        // 4. Update the rating and ratingsCount
        // Calculate the new total sum of ratings
        const currentTotalRating = prompt.rating * prompt.ratingsCount;
        const newTotalRating = currentTotalRating + ratingValue;
        const newRatingsCount = prompt.ratingsCount + 1;

        // Calculate the new average rating
        const newAverageRating = newTotalRating / newRatingsCount;

        // Update the prompt document
        prompt.rating = newAverageRating;
        prompt.ratingsCount = newRatingsCount;
        prompt.ratedBy.push(userId); // Add the user's ID to the ratedBy array

        // 5. Save the updated prompt
        await prompt.save();

        // 6. Respond with the updated prompt (or just the new rating/count)
        res.status(200).json({
            _id: prompt._id,
            rating: prompt.rating,
            ratingsCount: prompt.ratingsCount,
            msg: 'Rating submitted successfully.'
        });

    } catch (err) {
        console.error('Error rating prompt:', err.message);
        if (err.kind === 'ObjectId') {
             return res.status(404).json({ error: 'Prompt not found' });
        }
        res.status(500).json({ error: 'Server error while rating prompt' });
    }
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
    ratePrompt,   // Export the implemented ratePrompt function
    bookmarkPrompt // Export the placeholder bookmarkPrompt function
};
