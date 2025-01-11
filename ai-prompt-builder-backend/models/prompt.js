const mongoose = require('mongoose');

const PromptSchema = new mongoose.Schema({
    title: { type: String, required: true },
    template: { type: String, required: true },
    category: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Prompt', PromptSchema);
