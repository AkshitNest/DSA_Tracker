import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { auth0 } from '../../../../lib/auth0';
import * as cheerio from 'cheerio';

export async function POST(req) {
  try {
    const session = await auth0.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    const { handles: rawHandles } = await req.json();
    const handles = {
      leetcode: rawHandles.leetcode?.trim() || '',
      codeforces: rawHandles.codeforces?.trim() || '',
      codechef: rawHandles.codechef?.trim() || '',
      gfg: rawHandles.gfg?.trim() || '',
      codingninjas: rawHandles.codingninjas?.trim() || ''
    };

    // 1. Fetch Stats from various platforms
    let leetcodeSolved = 0;
    let cfSolved = 0;
    let cfRating = 0;
    let cfMaxRating = 0;
    let cfRank = 'unrated';
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
      } catch (e) { console.error('LC Sync failed', e); }
    }

    // --- Codeforces (Solved Count + Rating) ---
    if (handles.codeforces) {
      try {
        const [infoRes, statusRes] = await Promise.all([
          fetch(`https://codeforces.com/api/user.info?handles=${handles.codeforces}`),
          fetch(`https://codeforces.com/api/user.status?handle=${handles.codeforces}`)
        ]);
        
        const infoData = await infoRes.json();
        if (infoData.status === 'OK') {
          cfRating = infoData.result[0].rating || 0;
          cfMaxRating = infoData.result[0].maxRating || 0;
          cfRank = infoData.result[0].rank || 'unrated';
        }

        const statusData = await statusRes.json();
        if (statusData.status === 'OK') {
          // Count unique solved problems (Contest + Gym)
          const solved = new Set();
          statusData.result.forEach(sub => {
            if (sub.verdict === 'OK' && sub.problem) {
              const problemId = sub.problem.contestId 
                ? `${sub.problem.contestId}-${sub.problem.index}`
                : `${sub.problem.problemsetName || 'gym'}-${sub.problem.index}`;
              solved.add(problemId);
            }
          });
          cfSolved = solved.size;
        }

        // Fallback: If API returns 0 or fails, scrape the profile page
        if (cfSolved === 0) {
          try {
            const profileRes = await fetch(`https://codeforces.com/profile/${handles.codeforces}`, {
              headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
              }
            });
            const profileHtml = await profileRes.text();
            const solvedMatch = profileHtml.match(/(\d+)\s+problems\s+solved/i) || 
                               profileHtml.match(/solved\s+problems\s*:\s*(\d+)/i) ||
                               profileHtml.match(/(\d+)\s+Solved/i);
            if (solvedMatch) {
              cfSolved = parseInt(solvedMatch[1] || solvedMatch[2]);
            }
          } catch (e) { console.error('CF Scrape fallback failed', e); }
        }
      } catch (e) { console.error('CF Sync failed', e); }
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
    const totalSolved = leetcodeSolved + gfgSolved + cfSolved + ccSolved + cnSolved; 

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
          codeforcesMaxRating: cfMaxRating,
          codeforcesRank: cfRank,
          codeforcesSolved: cfSolved,
          codechefRating: ccRating,
          codechefMaxRating: ccMaxRating,
          codechefStars: ccStars,
          codechefSolved: ccSolved,
          gfgSolved,
          codingninjasSolved: cnSolved,
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
