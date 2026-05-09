"use client";

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Loader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 600); // Smooth 600ms loader on route change

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'var(--bg-color)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      animation: 'fadeOut 0.6s ease-out forwards', animationDelay: '0.4s'
    }}>
      <div className="loader-spinner" style={{
        width: '50px', height: '50px',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeOut { 100% { opacity: 0; visibility: hidden; } }
      `}</style>
    </div>
  );
}
