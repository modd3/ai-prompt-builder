const express = require('express');
const router = express.Router();
const { getPrompts, createPrompt, getPromptById, getPromptCateg, editPrompt } = require('../controllers/promptController');

router.get('/', getPrompts);
router.post('/', createPrompt);
router.get('/categories', getPromptCateg); //prompt categories
router.get('/:id', getPromptById); // New route
router.put("/:id", editPrompt)


module.exports = router;
