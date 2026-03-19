const mongoose = require('mongoose');

const PromptVoteSchema = new mongoose.Schema(
  {
    prompt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prompt',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    value: {
      type: Number,
      enum: [-1, 1],
      required: true,
    },
  },
  { timestamps: true }
);

PromptVoteSchema.index({ prompt: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('PromptVote', PromptVoteSchema);
