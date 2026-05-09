"use client";

import { useUser } from '@auth0/nextjs-auth0';
import { useEffect } from 'react';

export default function Home() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div style={{textAlign:'center', marginTop:'4rem'}}>Loading...</div>;

  return (
    <div className="hero-section" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div className="glass-card" style={{ maxWidth: '800px', padding: '4rem 3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-1px', lineHeight: 1.2 }}>
          Master Data Structures<br/>
          <span style={{ color: 'var(--primary-text)' }}>& Conquer Interviews.</span>
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--text-color)', opacity: 0.8, marginBottom: '2.5rem', lineHeight: 1.6 }}>
          The ultimate all-in-one dashboard for competitive programmers and software engineers. Sync your profiles from LeetCode, CodeChef, GFG, and more. Track your DSA revisions and never forget a pattern again.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <a href="/profile" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none', borderRadius: '9999px' }}>
              Go to Dashboard
            </a>
          ) : (
            <a href="/profile" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none', borderRadius: '9999px' }}>
              Get Started Free
            </a>
          )}
          <a href="#features" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none', borderRadius: '9999px' }}>
            View Features
          </a>
        </div>
      </div>

      <div id="features" style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1200px' }}>
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'left' }}>
          <i className="fas fa-link" style={{ fontSize: '2.5rem', color: 'var(--primary-text)', marginBottom: '1.5rem' }}></i>
          <h3 style={{ marginBottom: '1rem', fontWeight: 800, fontSize: '1.4rem' }}>Multi-Platform Sync</h3>
          <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.6 }}>Connect LeetCode, CodeChef, GFG, and Coding Ninjas into one unified dashboard. Stop jumping between tabs to see your stats.</p>
        </div>
        
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'left' }}>
          <i className="fas fa-brain" style={{ fontSize: '2.5rem', color: 'var(--primary-text)', marginBottom: '1.5rem' }}></i>
          <h3 style={{ marginBottom: '1rem', fontWeight: 800, fontSize: '1.4rem' }}>Smart Revision</h3>
          <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.6 }}>Log your solved questions, tag them, write your approach, and let our spaced-repetition algorithm schedule your exact next revision date.</p>
        </div>

        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'left' }}>
          <i className="fas fa-chart-pie" style={{ fontSize: '2.5rem', color: 'var(--primary-text)', marginBottom: '1.5rem' }}></i>
          <h3 style={{ marginBottom: '1rem', fontWeight: 800, fontSize: '1.4rem' }}>Deep Analytics</h3>
          <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.6 }}>Visualize your performance with dynamic GitHub-style heatmaps, topic frequency bars, and global ranking metrics from multiple platforms.</p>
        </div>
      </div>

      <div id="how-it-works" style={{ marginTop: '8rem', marginBottom: '8rem', width: '100%', maxWidth: '1000px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '3rem' }}>How it works</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', textAlign: 'left', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ background: 'var(--primary-text)', color: 'var(--bg-color)', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>1</div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>Solve and Document</h3>
              <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.6 }}>Whenever you solve a tricky problem on any platform, don't just move on. Log it in the Tracker with your time complexity, tags, and approach.</p>
            </div>
            <div className="glass-card" style={{ flex: 1, minWidth: '300px', padding: '3rem', display: 'flex', justifyContent: 'center' }}>
              <i className="fas fa-laptop-code" style={{ fontSize: '6rem', color: 'var(--primary-text)' }}></i>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', textAlign: 'left', flexWrap: 'wrap-reverse' }}>
            <div className="glass-card" style={{ flex: 1, minWidth: '300px', padding: '3rem', display: 'flex', justifyContent: 'center' }}>
              <i className="fas fa-calendar-check" style={{ fontSize: '6rem', color: 'var(--primary-text)' }}></i>
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ background: 'var(--primary-text)', color: 'var(--bg-color)', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>2</div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>Spaced Repetition</h3>
              <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.6 }}>Rate your confidence level from 1 to 5. The lower your confidence, the sooner we will schedule that problem for your next revision.</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', textAlign: 'left', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ background: 'var(--primary-text)', color: 'var(--bg-color)', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>3</div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>Crush Interviews</h3>
              <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.6 }}>By following the dashboard's recommended schedule, you build long-term memory for essential patterns and easily ace technical interviews.</p>
            </div>
            <div className="glass-card" style={{ flex: 1, minWidth: '300px', padding: '3rem', display: 'flex', justifyContent: 'center' }}>
              <i className="fas fa-rocket" style={{ fontSize: '6rem', color: 'var(--primary-text)' }}></i>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ padding: '5rem 0', width: '100%', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Ready to optimize your DSA journey?</h2>
        <a href="/profile" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '9999px', textDecoration: 'none' }}>Start Tracking Free</a>
      </div>
    </div>
  );
}
