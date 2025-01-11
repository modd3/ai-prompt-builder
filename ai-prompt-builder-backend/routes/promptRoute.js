const express = require('express');
const router = express.Router();
const { getPrompts, createPrompt, getPromptById } = require('../controllers/promptController');

router.get('/', getPrompts);
router.post('/', createPrompt);
router.get('/:id', getPromptById); // New route

module.exports = router;
