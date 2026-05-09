import { NextResponse } from 'next/server';
export const forceDynamic = 'force-dynamic';
import dbConnect from '../../../lib/mongodb';
import CompanyProgress from '../../../models/CompanyProgress';
import { auth0 } from '../../../lib/auth0';
import jwt from 'jsonwebtoken';

async function getSessionUser(req) {
  const token = req.cookies.get('manual_auth_token')?.value;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      return { sub: decoded.userId, name: decoded.name, email: decoded.email };
    } catch (err) {}
  }
  const session = await auth0.getSession();
  return session?.user || null;
}

// GET: Returns full analytics for a user across all companies
export async function GET(req) {
  try {
    const user = await getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const filterCompany = searchParams.get('company');

    const db = (await dbConnect()).connection.db;

    // Fetch available questions
    let allCompaniesQuery = {};
    if (filterCompany) allCompaniesQuery = { name: filterCompany };
    const allCompanies = await db.collection('company_questions').find(allCompaniesQuery).toArray();
    
    let totalAvailable = 0;
    allCompanies.forEach(c => {
      totalAvailable += (c.questions || []).length;
    });

    let progressQuery = { userId: user.sub };
    if (filterCompany) progressQuery.company = filterCompany;
    const allProgress = await CompanyProgress.find(progressQuery).lean();

    // Per-company stats
    const companyMap = {};
    const difficultyCount = { 
      Easy: { solved: 0, total: 0, needsRevision: 0 }, 
      Medium: { solved: 0, total: 0, needsRevision: 0 }, 
      Hard: { solved: 0, total: 0, needsRevision: 0 } 
    };
    const topicCount = {};

    // Pre-initialize companyMap with true totals for all companies found in allCompanies
    allCompanies.forEach(c => {
      companyMap[c.name] = { 
        total: (c.questions || []).length, 
        solved: 0, 
        easy: (c.questions || []).filter(q => q.difficulty === 'Easy').length, 
        easySolved: 0, 
        medium: (c.questions || []).filter(q => q.difficulty === 'Medium').length, 
        mediumSolved: 0, 
        hard: (c.questions || []).filter(q => q.difficulty === 'Hard').length, 
        hardSolved: 0, 
        needsRevision: 0 
      };
    });

    allProgress.forEach(p => {
      const c = companyMap[p.company];
      if (!c) return; // Should not happen if allProgress is consistent with allCompanies

      if (p.difficulty === 'Easy') { if (p.solved) c.easySolved++; }
      if (p.difficulty === 'Medium') { if (p.solved) c.mediumSolved++; }
      if (p.difficulty === 'Hard') { if (p.solved) c.hardSolved++; }
      if (p.solved) c.solved++;
      if (p.needsRevision) c.needsRevision++;

      // Global difficulty
      if (difficultyCount[p.difficulty]) {
        difficultyCount[p.difficulty].total++;
        if (p.solved) difficultyCount[p.difficulty].solved++;
        if (p.needsRevision) difficultyCount[p.difficulty].needsRevision++;
      }

      // Topic stats
      const t = p.topic || 'General';
      if (!topicCount[t]) topicCount[t] = { solved: 0, total: 0, needsRevision: 0 };
      topicCount[t].total++;
      if (p.solved) topicCount[t].solved++;
      if (p.needsRevision) topicCount[t].needsRevision++;
    });

    // Re-calculating true totals for each difficulty using the true totals from attempted companies
    const attemptedCompanyNames = Object.keys(companyMap);
    const totalAttemptedAvailable = allCompanies
      .filter(c => attemptedCompanyNames.includes(c.name))
      .reduce((acc, c) => acc + (c.questions || []).length, 0);

    // Update difficultyCount with true totals from attempted companies
    allCompanies
      .filter(c => attemptedCompanyNames.includes(c.name))
      .forEach(c => {
        (c.questions || []).forEach(q => {
          if (difficultyCount[q.difficulty]) {
            difficultyCount[q.difficulty].total = (difficultyCount[q.difficulty].total || 0); // Initialize if needed
          } else {
            // This shouldn't happen based on our difficultyCount initialization
          }
        });
      });

    // Actually I should just reset the 'total' part of difficultyCount and re-sum it from allCompanies
    difficultyCount.Easy.total = 0;
    difficultyCount.Medium.total = 0;
    difficultyCount.Hard.total = 0;

    allCompanies
      .filter(c => attemptedCompanyNames.includes(c.name))
      .forEach(c => {
        (c.questions || []).forEach(q => {
          if (difficultyCount[q.difficulty]) {
            difficultyCount[q.difficulty].total++;
          }
        });
      });

    const totalSolved = allProgress.filter(p => p.solved).length;
    const totalNeedsRevision = allProgress.filter(p => p.needsRevision).length;
    const totalTracked = allProgress.length;

    // Identify strong and weak areas
    const strengths = [];
    const weaknesses = [];
    // Identify strong and weak areas (Difficulties)
    for (const [diff, vals] of Object.entries(difficultyCount)) {
      if (vals.total === 0) continue;
      const pct = Math.round((vals.solved / vals.total) * 100);
      const entry = { type: 'Difficulty', name: diff, solved: vals.solved, total: vals.total, percent: pct, needsRevision: vals.needsRevision };
      if (pct >= 75 && vals.needsRevision === 0) strengths.push(entry);
      else weaknesses.push(entry);
    }

    // Identify weak areas (Topics)
    for (const [topic, vals] of Object.entries(topicCount)) {
      if (vals.total === 0) continue;
      const pct = Math.round((vals.solved / vals.total) * 100);
      const entry = { type: 'Topic', name: topic, solved: vals.solved, total: vals.total, percent: pct, needsRevision: vals.needsRevision };
      if (vals.needsRevision > 0 || pct < 70) {
        // Only add specific topics to weakness if they are actually weak
        weaknesses.push(entry);
      } else if (pct >= 85) {
        strengths.push(entry);
      }
    }

    return NextResponse.json({
      totalSolved,
      totalNeedsRevision,
      totalTracked,
      totalAvailable,
      totalAttemptedAvailable,
      companies: companyMap,
      difficultyBreakdown: difficultyCount,
      strengths,
      weaknesses,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
