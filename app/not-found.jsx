"use client";

import { Suspense } from 'react';
import Link from 'next/link';

function NotFoundContent() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '6rem', fontWeight: 900, marginBottom: '1rem', opacity: 0.2 }}>404</h1>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Page Not Found</h2>
      <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '500px' }}>
        Oops! The page you're looking for doesn't exist or has been moved. 
        Let's get you back to tracking your progress.
      </p>
      <Link href="/" className="btn btn-primary" style={{ padding: '1rem 2.5rem', textDecoration: 'none' }}>
        <i className="fas fa-home" style={{ marginRight: '8px' }}></i> Return Home
      </Link>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={null}>
      <NotFoundContent />
    </Suspense>
  );
}
