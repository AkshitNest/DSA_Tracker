import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Question from '../../../../../models/Question';
import { auth0 } from '../../../../../lib/auth0';

const COMPANIES = ['Google', 'Amazon', 'Microsoft', 'Walmart'];

export async function GET(req: Request) {
  try {
    const session = await auth0.getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await dbConnect();

    const userId = session.user.sub;

    const result: any = {};

    for (const company of COMPANIES) {
      const all = await Question.find({ userId, companies: company }).lean();
      const total = all.length;
      const solved = all.filter((q: any) => q.solvedAt).length;
      const remaining = total - solved;
      const progress = total === 0 ? 0 : Math.round((solved / total) * 100);

      // Topic weakness (solved percent per topic)
      const topicsMap: Record<string, { total: number; solved: number }> = {};
      for (const q of all) {
        const t = q.topic || 'General';
        if (!topicsMap[t]) topicsMap[t] = { total: 0, solved: 0 };
        topicsMap[t].total += 1;
        if (q.solvedAt) topicsMap[t].solved += 1;
      }

      const weaknesses = Object.entries(topicsMap).map(([topic, vals]) => ({
        topic,
        solvedPercent: vals.total === 0 ? 0 : Math.round((vals.solved / vals.total) * 100)
      })).sort((a, b) => a.solvedPercent - b.solvedPercent);

      result[company] = { total, solved, remaining, progress, weaknesses };
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
