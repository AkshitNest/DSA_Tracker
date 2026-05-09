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
    codechefRating: { type: Number, default: 0 },
    gfgSolved: { type: Number, default: 0 },
    codingninjasLevel: { type: Number, default: 0 },
    totalSolved: { type: Number, default: 0 }, // Main metric for leaderboard
  },
  
  lastSynced: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
