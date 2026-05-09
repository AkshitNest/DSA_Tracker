"use client";

import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/profile', label: 'Dashboard' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/tracker', label: 'DSA Tracker' },
  { href: '/company-wise-questions', label: 'Companies' },
  { href: '/support', label: '☕ Support', special: true },
];

function NavLink({ href, label, pathname, special }) {
  const isActive = pathname === href;
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`nav-link ${isActive ? 'nav-active' : ''} ${special ? 'nav-coffee' : ''}`}
      style={{
        color: isActive
          ? 'var(--primary-text)'
          : special
            ? '#f59e0b'
            : 'var(--text-color)',
      }}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const { user, isLoading } = useUser();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = localStorage.getItem('dsa-tracker-theme');
    if (savedTheme === 'light') setIsDarkMode(false);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
      localStorage.setItem('dsa-tracker-theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      localStorage.setItem('dsa-tracker-theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <header style={{ marginBottom: '2rem' }}>
      <div className="logo">
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary-text)' }}>
          {/* Custom SVG Logo Mark - graph nodes in code brackets */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.transform = 'rotate(10deg) scale(1.15)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1)'}
          >
            {/* Code brackets */}
            <text x="0" y="22" fontFamily="monospace" fontSize="22" fontWeight="900" fill="currentColor" opacity="0.9">{'{'}</text>
            <text x="24" y="22" fontFamily="monospace" fontSize="22" fontWeight="900" fill="currentColor" opacity="0.9">{'}'}</text>
            {/* Graph nodes */}
            <circle cx="16" cy="8" r="2.5" fill="currentColor" />
            <circle cx="10" cy="20" r="2.2" fill="currentColor" />
            <circle cx="22" cy="20" r="2.2" fill="currentColor" />
            {/* Graph edges */}
            <line x1="16" y1="10.5" x2="10.8" y2="17.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16" y1="10.5" x2="21.2" y2="17.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>

          <span style={{ fontWeight: 900, fontSize: '1.3rem', letterSpacing: '-0.5px', lineHeight: 1 }}>
            DSA<span style={{ opacity: 0.5, fontWeight: 700 }}>Tracker</span>
          </span>
        </Link>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {user && (
          <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            {navLinks.map(link => (
              <NavLink key={link.href} {...link} pathname={pathname} />
            ))}
          </nav>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {!isLoading && !user && (
            <a href="/auth/login" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', textDecoration: 'none' }}>Log In</a>
          )}

          {!isLoading && user && (
            <>
              <img src={user.picture || 'https://cdn.auth0.com/avatars/default.png'} alt="Avatar"
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border)', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              <a href="/auth/logout" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', textDecoration: 'none' }}>Logout</a>
            </>
          )}

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            id="theme-toggle"
            style={{ marginLeft: '8px', transition: 'transform 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'rotate(20deg) scale(1.15)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0) scale(1)'}
          >
            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>
      </div>
    </header>
  );
}
