const express = require('express');
const router = express.Router();
const { getPrompts, createPrompt, getPromptById, getPromptCateg } = require('../controllers/promptController');

router.get('/', getPrompts);
router.post('/', createPrompt);
router.get('/categories', getPromptCateg); //prompt categories
router.get('/:id', getPromptById); // New route


module.exports = router;
