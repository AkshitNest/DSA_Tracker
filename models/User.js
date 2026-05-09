import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: String,
  email: String,
  picture: String,
  
  // Platform Handles
  handles: {
    leetcode: { type: String, default: '' },
    codeforces: { type: String, default: '' },
    codechef: { type: String, default: '' },
    gfg: { type: String, default: '' },
    codingninjas: { type: String, default: '' },
  },
  
  // Solved Stats (Aggregated for Leaderboard)
  stats: {
    leetcodeSolved: { type: Number, default: 0 },
    codeforcesRating: { type: Number, default: 0 },
    codeforcesMaxRating: { type: Number, default: 0 },
    codeforcesRank: { type: String, default: 'unrated' },
    codeforcesSolved: { type: Number, default: 0 },
    codechefRating: { type: Number, default: 0 },
    codechefMaxRating: { type: Number, default: 0 },
    codechefStars: { type: Number, default: 1 },
    codechefSolved: { type: Number, default: 0 },
    gfgSolved: { type: Number, default: 0 },
    codingninjasSolved: { type: Number, default: 0 },
    totalSolved: { type: Number, default: 0 }, 
  },
  
  lastSynced: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
