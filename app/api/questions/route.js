import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Question from '../../../models/Question';
import { auth0 } from '../../../lib/auth0';

export async function GET(req) {
  try {
    const session = await auth0.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    
    // Fetch all questions for the logged-in user
    const questions = await Question.find({ userId: session.user.sub }).sort({ createdAt: -1 });
    
    // Convert _id to id for the frontend
    const formattedQuestions = questions.map(q => {
      const { _id, ...rest } = q.toObject();
      return { id: _id.toString(), ...rest };
    });

    return NextResponse.json(formattedQuestions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth0.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    
    const body = await req.json();
    
    const newQuestion = new Question({
      ...body,
      userId: session.user.sub, // Ensure the question is linked to the authenticated user
    });

    const savedQuestion = await newQuestion.save();
    
    const { _id, ...rest } = savedQuestion.toObject();
    
    return NextResponse.json({ id: _id.toString(), ...rest }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
