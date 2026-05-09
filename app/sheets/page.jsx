"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import sheetsData from '../../data/sheets.json';

export default function Sheets() {
  const [sheets, setSheets] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    setSheets(sheetsData);
  }, []);

  const categories = ['All', ...new Set(sheetsData.map(s => s.category))];

  const filtered = filter === 'All' ? sheets : sheets.filter(s => s.category === filter);

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', background: 'linear-gradient(to right, var(--primary), #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Explore Coding Sheets
        </h1>
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
              background: filter === cat ? 'var(--primary)' : 'var(--input-bg)',
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

      <div className="sheets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {filtered.map(sheet => (
          <div key={sheet.id} className="sheet-card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: sheet.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.4rem', boxShadow: `0 4px 12px ${sheet.color}44` }}>
                <i className="fas fa-list-check"></i>
              </div>
              <span className="badge" style={{ background: 'var(--border)', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px' }}>{sheet.category}</span>
            </div>
            
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>{sheet.title}</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>{sheet.description}</p>
            
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
               <a href={sheet.officialUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                 <i className="fas fa-external-link-alt"></i> Official Sheet
               </a>
               <Link href={`/sheets/${sheet.id}`} className="btn btn-primary" style={{ flex: 1.2, textAlign: 'center', fontSize: '0.85rem', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                 Track Here <i className="fas fa-arrow-right"></i>
               </Link>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Curated by <strong>{sheet.author}</strong></div>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary)' }}>{sheet.totalQuestions} Questions</div>
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
