import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

export async function GET(req) {
  try {
    await dbConnect();
    
    // Fetch all users sorted by totalSolved in descending order
    const users = await User.find({ 'stats.totalSolved': { $gt: 0 } })
      .sort({ 'stats.totalSolved': -1 })
      .select('name picture stats') // Never expose password, email, handles, etc.
      .limit(50);

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
