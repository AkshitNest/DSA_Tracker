import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Question from '../../../models/Question';
import { auth0 } from '../../../lib/auth0';

const scheduleDays = [0, 1, 3, 7, 15, 30];

function addDays(d, days) {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + days);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

export async function GET(req) {
  try {
    const session = await auth0.getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await dbConnect();

    const url = new URL(req.url);
    const topic = url.searchParams.get('topic');
    const difficulty = url.searchParams.get('difficulty');
    const company = url.searchParams.get('company');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const baseQuery = { userId: session.user.sub };
    if (topic) baseQuery.topic = topic;
    if (difficulty) baseQuery.difficulty = difficulty;
    if (company) baseQuery.companies = company;

    const all = await Question.find(baseQuery).lean();

    const dueToday = all.filter(q => q.nextRevisionDate && new Date(q.nextRevisionDate).toDateString() === today.toDateString());
    const overdue = all.filter(q => q.nextRevisionDate && new Date(q.nextRevisionDate) < today);
    const upcoming = all.filter(q => q.nextRevisionDate && new Date(q.nextRevisionDate) > today);

    const revisedToday = all.filter(q => q.lastRevisionDate && new Date(q.lastRevisionDate).toDateString() === today.toDateString());

    const completion = dueToday.length === 0 ? 100 : Math.round((revisedToday.length / dueToday.length) * 100);

    return NextResponse.json({ dueToday, overdue, upcoming, completion });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth0.getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await req.json();
    const { action, id } = body;
    if (!action || !id) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    await dbConnect();

    const q = await Question.findOne({ _id: id, userId: session.user.sub });
    if (!q) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

    if (action === 'markRevised') {
      const nextCount = Math.min((q.revisionCount || 0) + 1, 5);
      q.revisionCount = nextCount;
      q.lastRevisionDate = new Date();
      const days = scheduleDays[nextCount] ?? scheduleDays[scheduleDays.length - 1];
      q.nextRevisionDate = addDays(new Date(), days);
      await q.save();
      return NextResponse.json({ success: true, question: q });
    }

    if (action === 'markSolved') {
      q.solvedAt = new Date();
      q.revisionCount = 0;
      q.lastRevisionDate = new Date();
      q.nextRevisionDate = addDays(new Date(), 1);
      await q.save();
      return NextResponse.json({ success: true, question: q });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
