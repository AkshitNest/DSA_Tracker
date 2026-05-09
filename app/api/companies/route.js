import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';

export const forceDynamic = 'force-dynamic';

export async function GET() {
  try {
    const conn = await dbConnect();
    const db = conn.connection.db;
    const collection = db.collection('company_questions');

    // Fetch all companies
    const companies = await collection.find({}).toArray();

    // Transform back to the { CompanyName: [questions] } format for the frontend
    const data = {};
    companies.forEach(company => {
      data[company.name] = company.questions;
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch company data' }, { status: 500 });
  }
}
