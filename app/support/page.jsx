"use client";

import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import RazorpayCheckout from '../components/RazorpayCheckout';

export default function BuyMeCoffee() {
  const { user } = useUser();
  const [paid, setPaid] = useState(false);

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

        <RazorpayCheckout 
          amount={9900} 
          label="Support with ₹99" 
          onSuccess={() => setPaid(true)} 
        />

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
