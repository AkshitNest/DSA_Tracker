import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get('handle');

  if (!handle) {
    return NextResponse.json({ error: 'Handle required' }, { status: 400 });
  }

  try {
    // We try the common public GFG user API used internally by their profile page
    // Using a simple fetch strategy. GFG SSR is dynamic, so we try scraping the main profile.
    const response = await fetch(`https://www.geeksforgeeks.org/user/${handle}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });
    if (!response.ok) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Try primary selectors
    let score = parseInt($('.score_card_value').first().text()) || 0;
    let problems = parseInt($('.score_card_value').eq(1).text()) || 0;

    // Fallback: Check for data in script tags (common in Next.js/React SSR)
    if (score === 0 || problems === 0) {
      const scriptContent = $('script').map((i, el) => $(el).html()).get().join(' ');
      const scoreMatch = scriptContent.match(/\"score\":(\d+)/);
      const problemsMatch = scriptContent.match(/\"total_problems_solved\":(\d+)/);
      if (scoreMatch) score = parseInt(scoreMatch[1]);
      if (problemsMatch) problems = parseInt(problemsMatch[1]);
    }

    return NextResponse.json({ score, problems });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch GFG profile' }, { status: 500 });
  }
}
