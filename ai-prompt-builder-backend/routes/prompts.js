const express = require('express');
const router = express.Router();
// Import controller functions, including placeholders for new ones
const {
    getPrompts,
    createPrompt,
    getPromptById,
    getUserPrompts,
    getPromptTags,
    editPrompt,
    deletePrompt, // Placeholder for delete controller
    ratePrompt,   // Placeholder for rate controller
    bookmarkPrompt // Placeholder for bookmark controller
} = require('../controllers/promptController');
// Import the authentication middleware
const authMiddleware = require('../middleware/auth');

// @route   GET /api/prompts
// @desc    Fetch all prompts (with optional filtering/sorting/pagination/search)
// @access  Public
// This route remains public, allowing anyone to view prompts.
router.get('/', getPrompts);

// @route   POST /api/prompts
// @desc    Create a new prompt
// @access  Private (requires authentication)
// Add authMiddleware here to protect the create route
router.post('/', authMiddleware, createPrompt);

// @route   GET /api/prompts/tags
// @desc    Get unique prompt tags
// @access  Public
// This route can remain public as it provides general tag information.
router.get('/tags', getPromptTags);

// @route   GET /api/prompts/mine
// @desc    Get this user's prompts
// @access  private
router.get('/mine', authMiddleware, getUserPrompts);

// @route   GET /api/prompts/:id
// @desc    Get a single prompt by ID
// @access  Public (Note: You might want to add logic in the controller
// to check if a private prompt belongs to the authenticated user if accessed by ID)
// This route can remain public to view public prompts by ID.
router.get('/:id', getPromptById);



// @route   PUT /api/prompts/:id
// @desc    Update a prompt by ID
// @access  Private (requires auth and authorization - user must be the author)
// Add authMiddleware here to protect the edit route
// You will also need authorization logic inside the controller to ensure the user
// is the author of the prompt they are trying to edit.
router.put('/:id', authMiddleware, editPrompt);

// @route   DELETE /api/prompts/:id
// @desc    Delete a prompt by ID
// @access  Private (requires auth and authorization - user must be the author)
// Protected with authMiddleware. Authorization check needed in controller.
router.delete('/:id', authMiddleware, deletePrompt); // Added DELETE route

// @route   POST /api/prompts/:id/rate
// @desc    Rate a prompt
// @access  Private (requires authentication)
// Protected with authMiddleware. Logic for rating needed in controller.
router.post('/:id/rate', authMiddleware, ratePrompt); // Added POST route for rating

// @route   POST /api/prompts/:id/bookmark
// @desc    Bookmark a prompt
// @access  Private (requires authentication)
// Protected with authMiddleware. Logic for bookmarking needed in controller.
router.post('/:id/bookmark', authMiddleware, bookmarkPrompt); // Added POST route for bookmarking

// TODO: Add routes for getting a user's bookmarked prompts, prompts created by a user, etc.


module.exports = router;
