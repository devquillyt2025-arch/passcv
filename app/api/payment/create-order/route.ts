import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const body = await req.json();
    const { plan } = body as { plan: 'single' | 'pro' };

    const amount = plan === 'pro' ? 29900 : 4900; // paise
    const currency = 'INR';

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: { plan },
    });

    return NextResponse.json({
      orderId: order.id,
      amount,
      currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('create-order error', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
