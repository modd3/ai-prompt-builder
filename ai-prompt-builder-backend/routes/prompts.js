const express = require('express');
const router = express.Router();
const { getPrompts, createPrompt, getPromptById, getPromptTags, editPrompt } = require('../controllers/promptController');

router.get('/', getPrompts);
router.post('/', createPrompt);
router.get('/tags', getPromptTags); //prompt tags
router.get('/:id', getPromptById); // New route
router.put("/:id", editPrompt)


module.exports = router;
