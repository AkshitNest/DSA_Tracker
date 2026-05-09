import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
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
  lastRevised: {
    type: String, // Storing as YYYY-MM-DD
    required: true,
  },
  nextRevision: {
    type: String, // Storing as YYYY-MM-DD
    required: true,
  },
  mistakes: {
    type: String,
    default: '',
  }
}, { timestamps: true });

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
