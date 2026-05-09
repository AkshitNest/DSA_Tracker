import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { auth0 } from '../../../../lib/auth0';
import jwt from 'jsonwebtoken';
import * as cheerio from 'cheerio';

export async function POST(req) {
  try {
    let sessionUser = null;
    
    // First try manual JWT token
    const token = req.cookies.get('manual_auth_token')?.value;
    if (token) {
      try {
        sessionUser = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        // Map decoded JWT user (userId) to sub so the rest of the code works
        sessionUser.sub = sessionUser.userId;
      } catch (err) {
        console.error('Invalid JWT token:', err);
      }
    }

    // If no valid manual token, try Auth0 session
    if (!sessionUser) {
      const session = await auth0.getSession();
      if (session && session.user) {
        sessionUser = session.user;
      }
    }

    if (!sessionUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    const { handles: providedHandles } = await req.json();
    
    // Find existing user to get stored handles if none provided
    const existingUser = await User.findOne({ userId: sessionUser.sub });
    
    const handles = {
      leetcode: (providedHandles?.leetcode || existingUser?.handles?.leetcode || '').trim(),
      codechef: (providedHandles?.codechef || existingUser?.handles?.codechef || '').trim(),
      gfg: (providedHandles?.gfg || existingUser?.handles?.gfg || '').trim(),
      codingninjas: (providedHandles?.codingninjas || existingUser?.handles?.codingninjas || '').trim()
    };

    // 1. Fetch Stats from various platforms
    let leetcodeSolved = 0;
    let leetcodeEasy = 0;
    let leetcodeMedium = 0;
    let leetcodeHard = 0;
    let ccSolved = 0;
    let ccRating = 0;
    let ccMaxRating = 0;
    let ccStars = 1;
    let gfgSolved = 0;
    let cnSolved = 0;

    // --- LeetCode ---
    if (handles.leetcode) {
      try {
        const res = await fetch(`https://alfa-leetcode-api.onrender.com/${handles.leetcode}/solved`);
        const data = await res.json();
        leetcodeSolved = data.solvedProblem || 0;
        leetcodeEasy = data.easySolved || 0;
        leetcodeMedium = data.mediumSolved || 0;
        leetcodeHard = data.hardSolved || 0;
      } catch (e) { console.error('LC Sync failed', e); }
    }

    // --- GFG ---
    if (handles.gfg) {
      try {
        const res = await fetch(`${process.env.AUTH0_BASE_URL}/api/gfg?handle=${handles.gfg}`);
        const data = await res.json();
        gfgSolved = data.problems || 0;
      } catch (e) { console.error('GFG Sync failed', e); }
    }

    // --- CodeChef ---
    if (handles.codechef) {
      try {
        const res = await fetch(`${process.env.AUTH0_BASE_URL}/api/codechef?handle=${handles.codechef}`);
        const data = await res.json();
        ccSolved = data.solved || 0;
        ccRating = data.rating || 0;
        ccMaxRating = data.maxRating || 0;
        ccStars = data.stars || 1;
      } catch (e) { console.error('CodeChef Sync failed', e); }
    }

    // --- Coding Ninjas (Mock/Proxy) ---
    if (handles.codingninjas) {
      try {
        const res = await fetch(`${process.env.AUTH0_BASE_URL}/api/codingninjas?handle=${handles.codingninjas}`);
        const data = await res.json();
        cnSolved = data.solved || 0;
      } catch (e) { console.error('CN Sync failed', e); }
    }

    // 2. Calculate Final Total Solved (Main Leaderboard Metric)
    const totalSolved = leetcodeSolved + gfgSolved + ccSolved + cnSolved; 

    // 3. Upsert User in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { userId: sessionUser.sub },
      {
        userId: sessionUser.sub,
        name: sessionUser.name,
        email: sessionUser.email,
        picture: sessionUser.picture,
        handles,
        stats: {
          leetcodeSolved,
          leetcodeEasy,
          leetcodeMedium,
          leetcodeHard,
          codechefRating: ccRating,
          codechefMaxRating: ccMaxRating,
          codechefStars: ccStars,
          codechefSolved: ccSolved,
          gfgSolved,
          codingninjasSolved: cnSolved,
          totalSolved
        },
        lastSynced: new Date(),
        lastVisited: new Date(),
      },
      { 
        upsert: true, 
        new: true,
        $inc: { visitCount: 1 } 
      }
    );

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
