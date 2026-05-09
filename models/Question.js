import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  // Backwards-compatible: `name` was previously used. New canonical field is `title`.
  name: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    required: true,
    enum: ['LeetCode', 'GFG', 'Codeforces', 'Other'],
  },
  tags: {
    type: [String],
    default: [],
  },
  approach: {
    type: String,
    default: '',
  },
  timeComplexity: {
    type: String,
    default: '',
  },
  confidence: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  // Smart revision fields
  lastRevisionDate: {
    type: Date,
    default: null,
  },
  nextRevisionDate: {
    type: Date,
    default: null,
  },
  solvedAt: {
    type: Date,
    default: null,
  },
  mistakes: {
    type: String,
    default: '',
  }
}, { timestamps: true });

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
