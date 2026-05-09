import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get('handle');

  if (!handle) {
    return NextResponse.json({ error: 'Handle required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://www.codechef.com/users/${handle}`);
    if (!response.ok) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    const rating = $('.rating-number').first().text() || '0';
    const starsText = $('.rating-star span').first().text() || '1★';
    const stars = parseInt(starsText.replace('★', '')) || 1;
    
    const maxRatingText = $('.rating-header small').text() || '';
    const maxRatingMatch = maxRatingText.match(/\d+/);
    const maxRating = maxRatingMatch ? maxRatingMatch[0] : rating;

    // Fetch solved count
    let solved = 0;
    $('.problems-solved h3').each((i, el) => {
      const text = $(el).text();
      if (text.includes('Total Problems Solved')) {
        const match = text.match(/\d+/);
        if (match) solved = parseInt(match[0]);
      }
    });

    return NextResponse.json({
      rating: parseInt(rating),
      stars,
      maxRating: parseInt(maxRating),
      solved: solved
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch CodeChef profile' }, { status: 500 });
  }
}
