import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Question from '../../../../models/Question';
import { auth0 } from '../../../../lib/auth0';

export async function PUT(req, { params }) {
  try {
    const session = await auth0.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    await dbConnect();

    // Find and update, ensuring it belongs to the user
    const updatedQuestion = await Question.findOneAndUpdate(
      { _id: id, userId: session.user.sub },
      { $set: body },
      { new: true } // Return the updated document
    );

    if (!updatedQuestion) {
      return NextResponse.json({ error: 'Question not found or unauthorized' }, { status: 404 });
    }

    const { _id, ...rest } = updatedQuestion.toObject();
    return NextResponse.json({ id: _id.toString(), ...rest });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await auth0.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    await dbConnect();

    // Find and delete, ensuring it belongs to the user
    const deletedQuestion = await Question.findOneAndDelete({ _id: id, userId: session.user.sub });

    if (!deletedQuestion) {
      return NextResponse.json({ error: 'Question not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
