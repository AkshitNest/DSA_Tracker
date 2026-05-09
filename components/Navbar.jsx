"use client";

import Link from 'next/link';
import { useAppUser as useUser } from '../src/hooks/useAppUser';
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/manual/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error', err);
    }
    // Then redirect to Auth0 logout or standard logout
    window.location.href = '/api/auth/logout';
  };

  return (
    <header style={{ marginBottom: '2rem', position: 'relative' }}>
      <div className="logo">
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary-text)' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.transform = 'rotate(10deg) scale(1.15)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1)'}
          >
            <text x="0" y="22" fontFamily="monospace" fontSize="22" fontWeight="900" fill="currentColor" opacity="0.9">{'{'}</text>
            <text x="24" y="22" fontFamily="monospace" fontSize="22" fontWeight="900" fill="currentColor" opacity="0.9">{'}'}</text>
            <circle cx="16" cy="8" r="2.5" fill="currentColor" />
            <circle cx="10" cy="20" r="2.2" fill="currentColor" />
            <circle cx="22" cy="20" r="2.2" fill="currentColor" />
            <line x1="16" y1="10.5" x2="10.8" y2="17.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16" y1="10.5" x2="21.2" y2="17.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>

          <span style={{ fontWeight: 900, fontSize: '1.3rem', letterSpacing: '-0.5px', lineHeight: 1 }}>
            DSA<span style={{ opacity: 0.5, fontWeight: 700 }}>Tracker</span>
          </span>
        </Link>
      </div>

      <div className="header-actions">
        {user && (
          <nav className={`main-nav ${isMenuOpen ? 'nav-open' : ''}`}>
            {navLinks.map(link => (
              <div key={link.href} onClick={() => setIsMenuOpen(false)}>
                <NavLink {...link} pathname={pathname} />
              </div>
            ))}
            {user && (
              <div className="mobile-only-logout" style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%' }}>Logout</button>
              </div>
            )}
          </nav>
        )}

        <div className="user-controls">
          {!isLoading && !user && (
            <a href="/auth/login" className="btn btn-primary login-btn">Log In</a>
          )}

          {!isLoading && user && (
            <div className="desktop-user-info">
              <img src={user.picture || 'https://cdn.auth0.com/avatars/default.png'} alt="Avatar"
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border)', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              <button onClick={handleLogout} className="btn btn-secondary logout-btn">Logout</button>
            </div>
          )}

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            id="theme-toggle"
            title="Toggle Dark Mode"
          >
            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>

          {user && (
            <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .header-actions { display: flex; alignItems: center; gap: 1.5rem; }
        .main-nav { display: flex; gap: 0.25rem; alignItems: center; }
        .user-controls { display: flex; alignItems: center; gap: 0.5rem; }
        .desktop-user-info { display: flex; alignItems: center; gap: 1rem; }
        .menu-toggle { display: none; width: 40px; height: 40px; background: var(--border); color: var(--text-color); border-radius: 50%; font-size: 1.1rem; }
        .mobile-only-logout { display: none; }

        @media (max-width: 1024px) {
          .main-nav {
            position: absolute;
            top: 100%;
            right: 0;
            flex-direction: column;
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            padding: 1.5rem;
            border-radius: 24px;
            border: 1px solid var(--card-border);
            box-shadow: var(--card-shadow);
            z-index: 100;
            width: 250px;
            gap: 1rem;
            align-items: stretch;
            display: none;
            margin-top: 10px;
          }
          .main-nav.nav-open { display: flex; animation: slideDown 0.3s ease-out; }
          .menu-toggle { display: flex; align-items: center; justify-content: center; }
          .desktop-user-info .logout-btn { display: none; }
          .mobile-only-logout { display: block; }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}
