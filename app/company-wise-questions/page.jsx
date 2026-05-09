"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAppUser as useUser } from '../../src/hooks/useAppUser';
import { redirect } from 'next/navigation';

export default function CompanyWiseQuestions() {
  const { user, isLoading } = useUser();
  const [data, setData] = useState(null); // null = not loaded yet
  const [activeCompany, setActiveCompany] = useState('');
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState('All');
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetch('/api/companies', { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then(json => {
        if (!json || json.error) throw new Error('Bad data');
        setData(json);
        // Set first company alphabetically as default
        const first = Object.keys(json).sort()[0];
        if (first) setActiveCompany(first);
      })
      .catch(() => setFetchError(true));
  }, []);

  // All hooks MUST come before any conditional returns (Rules of Hooks)
  const companiesList = useMemo(() => {
    if (!data) return [];
    return Object.keys(data)
      .filter(c => data[c].length > 30)
      .sort()
      .filter(c => c.toLowerCase().replace(/_/g, ' ').includes(search.toLowerCase()));
  }, [data, search]);

  const currentQuestions = useMemo(() => {
    if (!data || !activeCompany || !data[activeCompany]) return [];
    let qs = data[activeCompany];
    if (diffFilter !== 'All') qs = qs.filter(q => q.difficulty === diffFilter);
    return qs;
  }, [data, activeCompany, diffFilter]);

  // Now safe to do early returns after all hooks are declared
  if (isLoading) return <div style={{ textAlign: 'center', marginTop: '4rem', fontSize: '1.2rem' }}>Loading...</div>;
  if (!user) { redirect('/'); return null; }

  const diffBadge = (d) => {
    if (d === 'Easy') return 'badge-strong';
    if (d === 'Medium') return 'badge-medium';
    return 'badge-weak';
  };

  const leetcodeLink = (title) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
    return `https://leetcode.com/problems/${slug}/`;
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Header */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem' }}>
          <i className="fas fa-building" style={{ marginRight: '10px' }}></i> Company-Wise Questions
        </h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Top 50 most asked LeetCode questions by <strong style={{ color: 'var(--text-color)' }}>200+ companies</strong>. Click any row to open on LeetCode.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="🔍  Search company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: '1', minWidth: '200px', maxWidth: '360px' }}
          />
          <select
            value={diffFilter}
            onChange={e => setDiffFilter(e.target.value)}
            style={{ minWidth: '160px' }}
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          {data && (
            <span style={{ color: '#64748b', fontSize: '0.9rem', marginLeft: 'auto' }}>
              {companiesList.length} companies (30+ questions)
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Sidebar: Company List */}
        <div className="glass-card" style={{ padding: '1rem', height: 'fit-content', maxHeight: '80vh', overflowY: 'auto', position: 'sticky', top: '1rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', padding: '0 0.5rem' }}>Companies</p>

          {fetchError && (
            <p style={{ color: 'var(--danger)', padding: '0.5rem', fontSize: '0.9rem' }}>
              <i className="fas fa-exclamation-triangle"></i> Failed to load. Try refreshing.
            </p>
          )}

          {!data && !fetchError && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[...Array(12)].map((_, i) => (
                <div key={i} style={{ height: '36px', background: 'var(--border)', borderRadius: '8px', animation: 'pulse 1.5s infinite', opacity: 0.5 }}></div>
              ))}
            </div>
          )}

          {companiesList.length === 0 && data && (
            <p style={{ color: '#64748b', padding: '0.5rem', fontSize: '0.9rem' }}>No companies found.</p>
          )}

          {companiesList.map(company => (
            <button
              key={company}
              onClick={() => setActiveCompany(company)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.6rem 0.75rem',
                borderRadius: '8px',
                fontWeight: activeCompany === company ? 700 : 500,
                fontSize: '0.9rem',
                textTransform: 'capitalize',
                background: activeCompany === company ? 'var(--primary)' : 'transparent',
                color: activeCompany === company ? 'var(--btn-text)' : 'var(--text-color)',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '2px',
                transition: 'all 0.15s ease',
                display: 'block',
              }}
            >
              {company.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Main: Questions Table */}
        <div>
          {activeCompany && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.3rem', textTransform: 'capitalize' }}>
                {activeCompany.replace(/_/g, ' ')}
                <span style={{ color: '#64748b', fontWeight: 400, fontSize: '1rem', marginLeft: '0.5rem' }}>
                  — {currentQuestions.length} questions
                </span>
              </h3>
            </div>
          )}

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            {!data && !fetchError ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
                <p>Loading questions...</p>
              </div>
            ) : (
              <div className="table-container" style={{ borderRadius: '24px' }}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>#</th>
                      <th>Title</th>
                      <th style={{ width: '130px' }}>Acceptance</th>
                      <th style={{ width: '120px' }}>Difficulty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentQuestions.map((q, i) => (
                      <tr
                        key={i}
                        className="clickable-row"
                        onClick={() => window.open(leetcodeLink(q.title), '_blank')}
                        title={`Open "${q.title}" on LeetCode`}
                      >
                        <td style={{ color: '#64748b', fontWeight: 600 }}>{q.id}</td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{q.title}</span>
                          <i className="fas fa-external-link-alt" style={{ marginLeft: '8px', opacity: 0.3, fontSize: '0.75rem' }}></i>
                        </td>
                        <td><span className="badge badge-tag">{q.acceptance}</span></td>
                        <td><span className={`badge ${diffBadge(q.difficulty)}`}>{q.difficulty}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {currentQuestions.length === 0 && !fetchError && (
                  <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No questions match your filters.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
