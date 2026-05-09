"use client";

import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0';

export default function BuyMeCoffee() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create order on backend
      const res = await fetch('/api/payment', { method: 'POST' });
      const { orderId, amount, currency, error } = await res.json();

      if (error) throw new Error(error);

      // 2. Load Razorpay script dynamically
      await new Promise((resolve, reject) => {
        if (window.Razorpay) { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      // 3. Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: 'DSA Tracker',
        description: '☕ Buy Me a Coffee – Support the Project',
        order_id: orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#000000' },
        handler: function (response) {
          setPaid(true);
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        alert('Payment failed. Please try again.');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Could not initiate payment. Please try again.');
      setLoading(false);
    }
  };

  if (paid) {
    return (
      <div style={{
        textAlign: 'center', padding: '4rem 2rem',
        background: 'var(--card-bg)', borderRadius: '24px',
        border: '1px solid var(--card-border)', maxWidth: '500px', margin: '0 auto'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontWeight: 900, fontSize: '2rem', marginBottom: '1rem' }}>Thank You!</h2>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
          Your support keeps DSA Tracker running. You're amazing! ☕
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1rem' }}>
      <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 3rem' }}>
        {/* Coffee Cup Animation */}
        <div style={{
          fontSize: '5rem', marginBottom: '1.5rem',
          animation: 'coffeeBounce 2s ease-in-out infinite'
        }}>☕</div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-1px' }}>
          Buy Me a Coffee
        </h1>

        <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          DSA Tracker is free and open to all. If it helped you crack an interview or stick to your revision schedule, consider supporting with a coffee — it keeps the servers running and features coming!
        </p>

        {/* Features you get */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '3rem', textAlign: 'left' }}>
          {[
            '🚀 Supports ongoing development & new features',
            '☁️ Keeps the cloud servers alive',
            '💡 Motivates adding more company questions',
            '❤️ Huge thank you from the developer!',
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              background: 'var(--input-bg)', padding: '0.75rem 1rem',
              borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.95rem'
            }}>
              {item}
            </div>
          ))}
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            background: 'var(--primary)', color: 'var(--btn-text)',
            border: 'none', borderRadius: '9999px',
            padding: '1.2rem 3rem', fontSize: '1.2rem', fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%', transition: 'all 0.2s',
            opacity: loading ? 0.7 : 1,
            letterSpacing: '-0.5px'
          }}
        >
          {loading ? '⏳ Opening Razorpay...' : '☕ Support with ₹99'}
        </button>

        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '1.5rem' }}>
          Secure payment powered by Razorpay. UPI, Cards & Net Banking supported.
        </p>
      </div>

      <style jsx>{`
        @keyframes coffeeBounce {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
