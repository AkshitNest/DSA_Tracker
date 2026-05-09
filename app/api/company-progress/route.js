import { NextResponse } from 'next/server';
export const forceDynamic = 'force-dynamic';
import dbConnect from '../../../lib/mongodb';
import CompanyProgress from '../../../models/CompanyProgress';
import { auth0 } from '../../../lib/auth0';
import jwt from 'jsonwebtoken';

const TOPICS = ["Array", "String", "Tree", "Graph", "DP", "Dynamic Programming", "Heap", "Sort", "Search", "Binary", "List", "Stack", "Queue", "Matrix", "Math", "Hash", "Greedy", "Backtracking", "Bit", "Two Sum", "Palindrom", "Anagram", "Recursive", "Iterative"];

function guessTopic(title) {
  if (!title) return "General";
  for (const t of TOPICS) {
    if (title.toLowerCase().includes(t.toLowerCase())) return t;
  }
  return "General";
}

async function getSessionUser(req) {
  // Try manual JWT first
  const token = req.cookies.get('manual_auth_token')?.value;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      return { sub: decoded.userId, name: decoded.name, email: decoded.email };
    } catch (err) {}
  }
  // Fallback to Auth0
  const session = await auth0.getSession();
  return session?.user || null;
}

// GET: Fetch all solved question IDs for a company
export async function GET(req) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const company = searchParams.get('company');

    if (!company) return NextResponse.json({ error: 'Company is required' }, { status: 400 });

    const progress = await CompanyProgress.find({ userId: user.sub, company }).lean();
    console.log(`[GET Progress] ${company} for ${user.sub}: found ${progress.length} records`);
    const solvedMap = {};
    const needsRevisionMap = {};
    progress.forEach(p => { 
      const qid = p.questionId.toString();
      solvedMap[qid] = p.solved;
      needsRevisionMap[qid] = p.needsRevision || false;
    });

    return NextResponse.json({ solvedMap, needsRevisionMap });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Toggle a question as solved/unsolved
export async function POST(req) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await dbConnect();
    const { company, questionId, questionTitle, difficulty, solved, needsRevision } = await req.json();
    console.log(`[POST Progress] Saving:`, { company, questionId, solved, needsRevision, questionTitle });

    if (!company || questionId == null) {
      return NextResponse.json({ error: 'company and questionId are required' }, { status: 400 });
    }

    const existing = await CompanyProgress.findOne({ userId: user.sub, company, questionId });

    if (existing) {
      if (solved !== undefined) {
        existing.solved = solved;
        existing.solvedAt = solved ? new Date() : null;
      }
      if (needsRevision !== undefined) {
        existing.needsRevision = needsRevision;
        console.log(`[POST Progress] Setting needsRevision to ${needsRevision} for ${questionId}`);
      }
      // Update topic if missing
      if (!existing.topic || existing.topic === 'General') {
        existing.topic = guessTopic(questionTitle || existing.questionTitle);
      }
      await existing.save();
      console.log(`[POST Progress] Updated existing:`, { id: existing._id, needsRevision: existing.needsRevision, topic: existing.topic });
      return NextResponse.json({ success: true, solved: existing.solved, needsRevision: existing.needsRevision, topic: existing.topic });
    } else {
      const topic = guessTopic(questionTitle);
      const created = await CompanyProgress.create({
        userId: user.sub,
        company,
        questionId,
        questionTitle: questionTitle || '',
        difficulty: difficulty || 'Medium',
        solved: solved ?? false,
        solvedAt: solved ? new Date() : null,
        needsRevision: needsRevision ?? false,
        topic,
      });
      console.log(`[POST Progress] Created new:`, { id: created._id, needsRevision: created.needsRevision, topic: created.topic });
      return NextResponse.json({ success: true, solved: created.solved, needsRevision: created.needsRevision, topic: created.topic });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
