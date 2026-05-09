import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get('handle');

  if (!handle) {
    return NextResponse.json({ error: 'Handle required' }, { status: 400 });
  }

  try {
    // We try the common public GFG user API used internally by their profile page
    // Using a simple fetch strategy. GFG SSR is dynamic, so we try scraping the main profile.
    const response = await fetch(`https://www.geeksforgeeks.org/user/${handle}/`);
    if (!response.ok) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const html = await response.text();
    
    // Quick regex extraction to avoid heavy cheerio parsing if possible
    const scoreMatch = html.match(/Overall Coding Score[^>]*>\s*<[^>]+>(\d+)</);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
    
    const problemMatch = html.match(/Problem Solved[^>]*>\s*<[^>]+>(\d+)</);
    const problems = problemMatch ? parseInt(problemMatch[1]) : 0;

    return NextResponse.json({
      score,
      problems
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch GFG profile' }, { status: 500 });
  }
}
