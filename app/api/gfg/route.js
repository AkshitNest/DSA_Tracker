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
    const response = await fetch(`https://www.geeksforgeeks.org/user/${handle}/`);
    if (!response.ok) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract score
    const scoreText = $('.score_card_value').first().text() || '0';
    const score = parseInt(scoreText) || 0;
    
    // Extract solved problems
    const solvedText = $('.score_card_value').eq(1).text() || '0';
    const problems = parseInt(solvedText) || 0;

    return NextResponse.json({
      score,
      problems
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch GFG profile' }, { status: 500 });
  }
}
