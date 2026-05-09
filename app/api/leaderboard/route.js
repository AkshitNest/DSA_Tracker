import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';

export async function GET(req) {
  try {
    await dbConnect();
    
    // Fetch all users sorted by totalSolved in descending order
    const users = await User.find({})
      .sort({ 'stats.totalSolved': -1 })
      .limit(50); // Limit to top 50 users

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
