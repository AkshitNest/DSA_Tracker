import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST() {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: 9900, // 99 rupees in paise
      currency: 'INR',
      receipt: `coffee_${Date.now()}`,
      notes: { purpose: 'Buy Me a Coffee' },
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('Razorpay error:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
