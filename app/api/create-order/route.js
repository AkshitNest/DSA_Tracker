import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { auth0 } from '../../../../lib/auth0.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const session = await auth0.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { amount, currency = 'INR' } = await req.json();

    // Validate amount (minimum 100 paise = 1 INR)
    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Minimum amount should be 100 paise' }, { status: 400 });
    }

    const options = {
      amount: Math.round(amount), // amount in the smallest currency unit (paise)
      currency,
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    return NextResponse.json({ error: 'Error creating Razorpay order' }, { status: 500 });
  }
}
