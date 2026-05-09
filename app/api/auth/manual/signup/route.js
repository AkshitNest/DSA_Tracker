import dbConnect from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `manual_${new mongoose.Types.ObjectId().toString()}`;

    const newUser = await User.create({
      userId,
      email,
      name: name || email.split('@')[0],
      password: hashedPassword,
    });

    const token = jwt.sign(
      { userId: newUser.userId, email: newUser.email, name: newUser.name },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({ message: 'User created successfully', user: { name: newUser.name, email: newUser.email, picture: newUser.picture } }, { status: 201 });
    response.cookies.set('manual_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
