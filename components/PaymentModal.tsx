'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';

declare global {
  interface Window {
    Razorpay: new (opts: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface Props {
  plan: 'single' | 'pro';
  open: boolean;
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
}

export default function PaymentModal({ plan, open, onSuccess, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [open]);

  const handlePay = async () => {
    setLoading(true);
    setError('');

    try {
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const order = await orderRes.json();

      if (!orderRes.ok) throw new Error(order.error || 'Failed to create order');

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'TailorCV',
        description: plan === 'single' ? '1 Resume Rewrite' : 'Pro Monthly Subscription',
        order_id: order.orderId,
        handler: async (response: RazorpayResponse) => {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const verify = await verifyRes.json();
          if (verify.success) {
            onSuccess(verify.paymentId);
          } else {
            setError('Payment verification failed. Please contact support.');
          }
        },
        theme: { color: '#4f46e5' },
        modal: { ondismiss: () => { setLoading(false); onClose(); } },
      });

      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const isPro = plan === 'pro';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className={clsx('px-6 py-5', isPro ? 'bg-indigo-900' : 'bg-indigo-600')}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                {isPro ? 'Pro Plan' : 'Single Rewrite'}
              </h2>
              <p className="text-indigo-200 text-sm mt-1">
                {isPro ? 'Unlimited rewrites + history + Naukri text' : '1 full AI rewrite + DOCX download'}
              </p>
            </div>
            <button onClick={onClose} className="text-indigo-300 hover:text-white mt-0.5">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white">₹{isPro ? '299' : '49'}</span>
            <span className="text-indigo-300">{isPro ? '/month' : '/rewrite'}</span>
          </div>
        </div>

        {/* Features */}
        <div className="px-6 py-4 space-y-2.5">
          {(isPro
            ? ['Unlimited resume rewrites', 'DOCX + PDF download', 'Naukri profile text', 'Rewrite history', 'Priority support']
            : ['1 full AI-powered rewrite', 'ATS-safe DOCX download', 'Naukri profile text block', 'Side-by-side diff view']
          ).map((feat, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {feat}
            </div>
          ))}
        </div>

        {error && (
          <div className="mx-6 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="px-6 pb-6 pt-3 flex flex-col gap-2">
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing…
              </span>
            ) : `Pay ₹${isPro ? '299' : '49'} via UPI / Card`}
          </button>
          <p className="text-center text-xs text-gray-400">Secured by Razorpay · UPI, Cards, Net Banking</p>
        </div>
      </div>
    </div>
  );
}
