import mongoose from 'mongoose';

const CompanyProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  company: { type: String, required: true },
  questionId: { type: Number, required: true },
  questionTitle: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  solved: { type: Boolean, default: false },
  solvedAt: { type: Date, default: null },
  needsRevision: { type: Boolean, default: false },
  topic: { type: String, default: 'General' },
}, { timestamps: true });

// Compound index for fast lookups
CompanyProgressSchema.index({ userId: 1, company: 1, questionId: 1 }, { unique: true });

export default mongoose.models.CompanyProgress || mongoose.model('CompanyProgress', CompanyProgressSchema);
