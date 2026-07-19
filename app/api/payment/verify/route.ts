import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = body;

    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const { createClient } = await import('@/utils/supabase/server');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: existingCredit } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (plan === 'single') {
        const currentCount = existingCredit?.ai_rewrites_remaining || 0;
        await supabase
          .from('user_credits')
          .upsert({ 
            user_id: user.id, 
            ai_rewrites_remaining: currentCount + 1,
            is_pro: existingCredit?.is_pro || false
          });
      } else if (plan === 'pro') {
        await supabase
          .from('user_credits')
          .upsert({ 
            user_id: user.id, 
            ai_rewrites_remaining: existingCredit?.ai_rewrites_remaining || 0,
            is_pro: true 
          });
      }
    }

    return NextResponse.json({ success: true, paymentId: razorpay_payment_id });
  } catch (err) {
    console.error('verify error', err);
    return NextResponse.json({ error: 'Verification error' }, { status: 500 });
  }
}
