"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Sheets() {
  const [sheets, setSheets] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    // In a real app, this would be an API call
    const data = [
      {
        "id": "striver-a2z",
        "title": "Strivers A2Z DSA Sheet",
        "description": "The ultimate roadmap for mastering DSA from scratch to advanced.",
        "author": "Striver",
        "totalQuestions": 455,
        "category": "Complete DSA",
        "color": "#ff4d00"
      },
      {
        "id": "love-babbar",
        "title": "Love Babbar DSA Sheet",
        "description": "450 most important questions curated for cracking top companies.",
        "author": "Love Babbar",
        "totalQuestions": 445,
        "category": "Popular",
        "color": "#3b82f6"
      },
      {
        "id": "neetcode-150",
        "title": "NeetCode 150",
        "description": "A refined list of 150 LeetCode questions to master interview patterns.",
        "author": "NeetCode",
        "totalQuestions": 150,
        "category": "Topic Specific",
        "color": "#10b981"
      },
      {
        "id": "blind-75",
        "title": "Blind 75",
        "description": "The original curated list of 75 essential LeetCode questions.",
        "author": "Blind",
        "totalQuestions": 75,
        "category": "Quick Revision",
        "color": "#8b5cf6"
      }
    ];
    setSheets(data);
  }, []);

  const categories = ['All', 'Complete DSA', 'Popular', 'Topic Specific', 'Quick Revision'];

  const filtered = filter === 'All' ? sheets : sheets.filter(s => s.category === filter);

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Explore Coding Sheets</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Select a curated path to master Data Structures and Algorithms.</p>
      </header>

      <div className="filter-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`tab-btn ${filter === cat ? 'active' : ''}`}
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '9999px',
              border: filter === cat ? 'none' : '1px solid var(--border)',
              background: filter === cat ? 'var(--primary)' : 'transparent',
              color: filter === cat ? 'white' : 'var(--text-color)',
              cursor: 'pointer',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="sheets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {filtered.map(sheet => (
          <div key={sheet.id} className="sheet-card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: sheet.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem' }}>
                <i className="fas fa-list-check"></i>
              </div>
              <span className="badge" style={{ background: 'var(--border)', color: '#64748b', fontSize: '0.75rem' }}>{sheet.category}</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>{sheet.title}</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>{sheet.description}</p>
            
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{sheet.totalQuestions}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Questions</div>
              </div>
              <Link href={`/sheets/${sheet.id}`} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', textDecoration: 'none' }}>
                View Sheet <i className="fas fa-arrow-right" style={{ marginLeft: '5px' }}></i>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .sheet-card:hover { transform: translateY(-5px); }
        .tab-btn:hover { border-color: var(--primary); }
      `}</style>
    </div>
  );
}
