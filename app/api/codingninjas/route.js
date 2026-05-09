import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get('handle');

  if (!handle) {
    return NextResponse.json({ error: 'Handle required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.codingninjas.com/api/v3/public_section/profile/user_details?uuid=${handle}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.data) {
        return NextResponse.json({
          level: data.data.level || 1,
          exp: data.data.experience || 0
        });
      }
    }
    
    // Fallback if exact API path changes or CORS blocks server side too (less likely)
    return NextResponse.json({
      level: 1,
      exp: 0,
      note: 'Could not fetch exact CN data, profile might be private or handle is incorrect.'
    });
  } catch (error) {
    return NextResponse.json({ level: 1, exp: 0 }, { status: 200 });
  }
}
