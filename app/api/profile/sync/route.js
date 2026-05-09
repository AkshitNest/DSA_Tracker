import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { auth0 } from '../../../../lib/auth0';

export async function POST(req) {
  try {
    const session = await auth0.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    const { handles } = await req.json();

    // 1. Fetch Stats from various platforms
    let leetcodeSolved = 0;
    let cfRating = 0;
    let ccRating = 0;
    let gfgSolved = 0;
    let cnLevel = 0;

    // --- LeetCode ---
    if (handles.leetcode) {
      try {
        const res = await fetch(`https://alfa-leetcode-api.onrender.com/${handles.leetcode}/solved`);
        const data = await res.json();
        leetcodeSolved = data.solvedProblem || 0;
      } catch (e) { console.error('LC Sync failed', e); }
    }

    // --- Codeforces ---
    if (handles.codeforces) {
      try {
        const res = await fetch(`https://codeforces.com/api/user.info?handles=${handles.codeforces}`);
        const data = await res.json();
        if (data.status === 'OK') cfRating = data.result[0].rating || 0;
      } catch (e) { console.error('CF Sync failed', e); }
    }

    // --- GFG ---
    if (handles.gfg) {
      try {
        // Note: Using existing internal scraper API or mock for demo
        const res = await fetch(`${process.env.AUTH0_BASE_URL}/api/gfg?handle=${handles.gfg}`);
        const data = await res.json();
        gfgSolved = data.problems || 0;
      } catch (e) { console.error('GFG Sync failed', e); }
    }

    // 2. Calculate Total Solved (Main Leaderboard Metric)
    const totalSolved = leetcodeSolved + gfgSolved; 

    // 3. Upsert User in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { userId: session.user.sub },
      {
        userId: session.user.sub,
        name: session.user.name,
        email: session.user.email,
        picture: session.user.picture,
        handles,
        stats: {
          leetcodeSolved,
          codeforcesRating: cfRating,
          codechefRating: ccRating,
          gfgSolved,
          codingninjasLevel: cnLevel,
          totalSolved
        },
        lastSynced: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
