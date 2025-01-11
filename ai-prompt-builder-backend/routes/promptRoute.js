const express = require('express');
const router = express.Router();
const { getPrompts, createPrompt, getPromptById, getPromptCateg } = require('../controllers/promptController');

router.get('/', getPrompts);
router.post('/', createPrompt);
router.get('/:id', getPromptById); // New route
router.post('/categories', getPromptCateg); //prompt categories

module.exports = router;
