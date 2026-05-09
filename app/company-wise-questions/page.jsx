"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppUser as useUser } from '../../src/hooks/useAppUser';
import { redirect } from 'next/navigation';

export default function CompanyWiseQuestions() {
  const { user, isLoading } = useUser();
  const [data, setData] = useState(null);
  const [activeSolveQuestion, setActiveSolveQuestion] = useState(null);
  const [activeCompany, setActiveCompany] = useState('');
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState('All');
  const [fetchError, setFetchError] = useState(false);
  const [solvedMap, setSolvedMap] = useState({});
  const [needsRevisionMap, setNeedsRevisionMap] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // Fetch company question data
  useEffect(() => {
    fetch('/api/companies', { cache: 'no-store' })
      .then(res => res.json())
      .then(json => {
        if (!json || json.error) return;
        setData(json);
        const saved = sessionStorage.getItem('active_company');
        if (saved && json[saved]) {
          setActiveCompany(saved);
        } else {
          const first = Object.keys(json).filter(c => json[c].length > 30).sort()[0];
          if (first) setActiveCompany(first);
        }
      })
      .catch(() => setFetchError(true));
  }, []);

  useEffect(() => {
    if (activeCompany) {
      sessionStorage.setItem('active_company', activeCompany);
    }
  }, [activeCompany]);

  // Fetch progress when company changes
  const fetchProgress = useCallback(async (company) => {
    if (!company) return;
    setLoadingProgress(true);
    try {
      const res = await fetch(`/api/company-progress?company=${encodeURIComponent(company)}`, { cache: 'no-store' });
      const json = await res.json();
      setSolvedMap(json.solvedMap || {});
      setNeedsRevisionMap(json.needsRevisionMap || {});
    } catch (e) {
      console.error('Failed to fetch progress', e);
    }
    setLoadingProgress(false);
  }, []);

  useEffect(() => {
    if (activeCompany && user) fetchProgress(activeCompany);
  }, [activeCompany, user, fetchProgress]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const url = activeCompany 
        ? `/api/company-analytics?company=${encodeURIComponent(activeCompany)}` 
        : '/api/company-analytics';
      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json();
      setAnalytics(json);
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    }
  }, [activeCompany]);

  useEffect(() => {
    if (user) fetchAnalytics();
  }, [user, fetchAnalytics]);

  // Toggle question solved
  const toggleSolved = async (q, newState) => {
    setTogglingId(q.id);
    // Optimistic update
    setSolvedMap(prev => ({ ...prev, [q.id]: newState }));
    try {
      await fetch('/api/company-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: activeCompany,
          questionId: q.id,
          questionTitle: q.title,
          difficulty: q.difficulty,
          solved: newState,
        })
      });
      // Refresh analytics in background
      fetchAnalytics();
    } catch (e) {
      // Revert on error
      setSolvedMap(prev => ({ ...prev, [q.id]: !newState }));
      console.error('Toggle failed', e);
    }
    setTogglingId(null);
  };

  // Toggle revision needed
  const toggleRevision = async (q, newState) => {
    setTogglingId(q.id + '_rev');
    // Optimistic update
    setNeedsRevisionMap(prev => ({ ...prev, [q.id]: newState }));
    try {
      await fetch('/api/company-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: activeCompany,
          questionId: q.id,
          questionTitle: q.title,
          difficulty: q.difficulty,
          needsRevision: newState,
        })
      });
      fetchAnalytics();
    } catch (e) {
      setNeedsRevisionMap(prev => ({ ...prev, [q.id]: !newState }));
      console.error('Revision toggle failed', e);
    }
    setTogglingId(null);
  };

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

  // Stats for current company
  const companyStats = useMemo(() => {
    if (!data || !activeCompany || !data[activeCompany]) return { total: 0, solved: 0, easy: 0, easySolved: 0, medium: 0, mediumSolved: 0, hard: 0, hardSolved: 0 };
    const qs = data[activeCompany];
    const total = qs.length;
    const solved = qs.filter(q => solvedMap[q.id]).length;
    const easy = qs.filter(q => q.difficulty === 'Easy').length;
    const easySolved = qs.filter(q => q.difficulty === 'Easy' && solvedMap[q.id]).length;
    const medium = qs.filter(q => q.difficulty === 'Medium').length;
    const mediumSolved = qs.filter(q => q.difficulty === 'Medium' && solvedMap[q.id]).length;
    const hard = qs.filter(q => q.difficulty === 'Hard').length;
    const hardSolved = qs.filter(q => q.difficulty === 'Hard' && solvedMap[q.id]).length;
    return { total, solved, easy, easySolved, medium, mediumSolved, hard, hardSolved };
  }, [data, activeCompany, solvedMap]);

  const progressPercent = companyStats.total > 0 ? Math.round((companyStats.solved / companyStats.total) * 100) : 0;

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

  const ProgressBar = ({ value, color, height = 8 }) => (
    <div style={{ background: 'var(--border)', borderRadius: 999, overflow: 'hidden', height }}>
      <div style={{
        width: `${Math.min(value, 100)}%`,
        background: color || 'var(--primary)',
        height: '100%',
        borderRadius: 999,
        transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }} />
    </div>
  );

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Header */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem' }}>
          <i className="fas fa-building" style={{ marginRight: '10px' }}></i> Company-Wise Preparation
        </h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Top LeetCode questions by <strong style={{ color: 'var(--text-color)' }}>200+ companies</strong>. Track your progress, identify weak areas, and ace the interview.
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
          <button
            className="btn btn-secondary"
            onClick={() => setShowAnalytics(!showAnalytics)}
            style={{ borderRadius: '9999px', padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
          >
            <i className={`fas ${showAnalytics ? 'fa-table' : 'fa-chart-bar'}`}></i>
            {showAnalytics ? ' Questions' : ' My Analytics'}
          </button>
          {data && (
            <span style={{ color: '#64748b', fontSize: '0.9rem', marginLeft: 'auto' }}>
              {companiesList.length} companies
            </span>
          )}
        </div>
      </div>

      {/* Analytics View */}
      {showAnalytics && analytics && (
        <div style={{ marginBottom: '1.5rem' }}>
          {/* Overall Stats */}
          <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1.5rem' }}>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-text)' }}>{analytics.totalSolved}</div>
              <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Solved</div>
            </div>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--danger)' }}>{analytics.totalNeedsRevision}</div>
              <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Needs Revision</div>
            </div>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--success)' }}>
                {analytics.totalAttemptedAvailable > 0 ? Math.round((analytics.totalSolved / analytics.totalAttemptedAvailable) * 100) : 0}%
              </div>
              <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Complete %</div>
            </div>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--warning)' }}>{Object.keys(analytics.companies || {}).length}</div>
              <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Companies Attempted</div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Difficulty Breakdown */}
            <div className="glass-card">
              <h4>Difficulty Breakdown</h4>
              {['Easy', 'Medium', 'Hard'].map(diff => {
                const d = analytics.difficultyBreakdown?.[diff] || { solved: 0, total: 0, needsRevision: 0 };
                const pct = d.total > 0 ? Math.round((d.solved / d.total) * 100) : 0;
                const color = diff === 'Easy' ? 'var(--success)' : diff === 'Medium' ? 'var(--warning)' : 'var(--danger)';
                return (
                  <div key={diff} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 700, color, fontSize: '0.9rem' }}>{diff}</span>
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        {d.solved}/{d.total} ({pct}%) — {d.needsRevision} in revision
                      </span>
                    </div>
                    <ProgressBar value={pct} color={color} height={10} />
                  </div>
                );
              })}
            </div>

            {/* Strengths */}
            <div className="glass-card">
              <h4><i className="fas fa-trophy" style={{ color: 'var(--success)', marginRight: '0.5rem' }}></i>Strengths</h4>
              {(analytics.strengths || []).length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Keep solving to unlock your strengths!</p>
              ) : (
                analytics.strengths.sort((a,b) => b.percent - a.percent).map((s, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <span style={{ fontWeight: 700, display: 'block', fontSize: '0.95rem' }}>
                        {s.name}
                        <span style={{ fontWeight: 500, fontSize: '0.7rem', color: '#64748b', marginLeft: '8px', textTransform: 'uppercase' }}>{s.type}</span>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>Dominating this area 🔥</span>
                    </div>
                    <span className="badge badge-strong">{s.percent}% SOLVED</span>
                  </div>
                ))
              )}
            </div>

            {/* Weaknesses */}
            <div className="glass-card">
              <h4><i className="fas fa-exclamation-triangle" style={{ color: 'var(--danger)', marginRight: '0.5rem' }}></i>Weak Areas</h4>
              {(analytics.weaknesses || []).length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No weak areas detected yet. Keep solving!</p>
              ) : (
                analytics.weaknesses.sort((a,b) => b.needsRevision - a.needsRevision).map((w, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <span style={{ fontWeight: 700, display: 'block', fontSize: '0.95rem' }}>
                        {w.name} 
                        <span style={{ fontWeight: 500, fontSize: '0.7rem', color: '#64748b', marginLeft: '8px', textTransform: 'uppercase' }}>{w.type}</span>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {w.needsRevision > 0 
                          ? `${w.needsRevision} marked for revision ↺` 
                          : w.percent < 50 ? 'Struggling with accuracy' : 'Needs more practice'}
                      </span>
                    </div>
                    <span className={`badge ${w.needsRevision > 0 ? 'badge-weak' : 'badge-tag'}`}>{w.percent}% solved</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Per-Company Progress */}
          {Object.keys(analytics.companies || {}).length > 0 && (
            <div className="glass-card">
              <h4>Company-wise Progress</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {Object.entries(analytics.companies).sort((a, b) => b[1].solved - a[1].solved).map(([company, stats]) => {
                  const pct = stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0;
                  return (
                    <div key={company} style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 700, textTransform: 'capitalize', fontSize: '0.95rem' }}>{company.replace(/_/g, ' ')}</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>{pct}%</span>
                      </div>
                      <ProgressBar value={pct} color={pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)'} height={8} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Grid */}
      {!showAnalytics && (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Sidebar */}
          <div className="glass-card" style={{ padding: '1rem', height: 'fit-content', maxHeight: '80vh', overflowY: 'auto', position: 'sticky', top: '1rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', padding: '0 0.5rem' }}>Companies</p>

            {fetchError && (
              <p style={{ color: 'var(--danger)', padding: '0.5rem', fontSize: '0.9rem' }}>
                <i className="fas fa-exclamation-triangle"></i> Failed to load.
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

          {/* Main Content */}
          <div>
            {activeCompany && (
              <>
                {/* Progress Header */}
                <div className="glass-card" style={{ marginBottom: '1rem', padding: '1.5rem 2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.3rem', textTransform: 'capitalize', margin: 0 }}>
                      {activeCompany.replace(/_/g, ' ')}
                    </h3>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-color)' }}>{progressPercent}%</span> complete
                      </span>
                      <span style={{ fontSize: '0.85rem' }}>
                        <span className="badge badge-strong">{companyStats.easySolved}/{companyStats.easy} Easy</span>
                        <span className="badge badge-medium">{companyStats.mediumSolved}/{companyStats.medium} Med</span>
                        <span className="badge badge-weak">{companyStats.hardSolved}/{companyStats.hard} Hard</span>
                      </span>
                    </div>
                  </div>
                  <ProgressBar
                    value={progressPercent}
                    color={progressPercent >= 70 ? 'var(--success)' : progressPercent >= 40 ? 'var(--warning)' : 'var(--danger)'}
                    height={12}
                  />
                </div>

                {/* Questions Table */}
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
                            <th style={{ width: '50px', textAlign: 'center' }}>Done</th>
                            <th style={{ width: '50px', textAlign: 'center' }} title="Mark for Revision">Revise</th>
                            <th style={{ width: '50px', textAlign: 'center' }}>Solve</th>
                            <th style={{ width: '60px' }}>#</th>
                            <th>Title</th>
                            <th style={{ width: '130px' }}>Acceptance</th>
                            <th style={{ width: '120px' }}>Difficulty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentQuestions.map((q, i) => {
                            const isSolved = !!solvedMap[q.id];
                            const isToggling = togglingId === q.id;
                            return (
                              <tr
                                key={i}
                                style={{
                                  opacity: isSolved ? 0.6 : 1,
                                  transition: 'opacity 0.3s, background 0.2s',
                                }}
                              >
                                <td style={{ textAlign: 'center' }}>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleSolved(q, !isSolved); }}
                                    disabled={isToggling}
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '8px',
                                      border: isSolved ? 'none' : '2px solid var(--border)',
                                      background: isSolved ? 'var(--success)' : 'transparent',
                                      color: isSolved ? '#fff' : 'var(--text-color)',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.8rem',
                                      transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                      transform: isSolved ? 'scale(1.05)' : 'scale(1)',
                                      padding: 0,
                                    }}
                                  >
                                    {isToggling ? (
                                      <i className="fas fa-spinner fa-spin" style={{ fontSize: '0.7rem' }}></i>
                                    ) : isSolved ? (
                                      <i className="fas fa-check"></i>
                                    ) : null}
                                  </button>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleRevision(q, !needsRevisionMap[q.id]); }}
                                    disabled={togglingId === q.id + '_rev'}
                                    title={needsRevisionMap[q.id] ? "Mark as understood" : "Mark for revision"}
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '8px',
                                      border: needsRevisionMap[q.id] ? 'none' : '2px solid var(--border)',
                                      background: needsRevisionMap[q.id] ? 'var(--danger)' : 'transparent',
                                      color: needsRevisionMap[q.id] ? '#fff' : 'var(--text-color)',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.7rem',
                                      transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                      transform: needsRevisionMap[q.id] ? 'scale(1.05)' : 'scale(1)',
                                      padding: 0,
                                    }}
                                  >
                                    {togglingId === q.id + '_rev' ? (
                                      <i className="fas fa-spinner fa-spin"></i>
                                    ) : (
                                      <i className="fas fa-redo-alt"></i>
                                    )}
                                  </button>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setActiveSolveQuestion(q); }}
                                    title="Solve in online compiler"
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '8px',
                                      border: '1px solid var(--primary)',
                                      background: 'rgba(99, 102, 241, 0.1)',
                                      color: 'var(--primary)',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.75rem',
                                      transition: 'all 0.2s ease',
                                    }}
                                  >
                                    <i className="fas fa-code"></i>
                                  </button>
                                </td>
                                <td style={{ color: '#64748b', fontWeight: 600 }}>{q.id}</td>
                                <td>
                                  <a
                                    href={leetcodeLink(q.title)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontWeight: 600,
                                      color: 'var(--text-color)',
                                      opacity: isSolved ? 0.8 : 1,
                                    }}
                                    onClick={e => e.stopPropagation()}
                                  >
                                    {q.title}
                                    <i className="fas fa-external-link-alt" style={{ marginLeft: '8px', opacity: 0.3, fontSize: '0.75rem' }}></i>
                                  </a>
                                </td>
                                <td><span className="badge badge-tag">{q.acceptance}</span></td>
                                <td><span className={`badge ${diffBadge(q.difficulty)}`}>{q.difficulty}</span></td>
                              </tr>
                            );
                          })}
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
              </>
            )}
          </div>
        </div>
      )}

      {/* Online Compiler Overlay */}
      {activeSolveQuestion && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                <i className="fas fa-terminal" style={{ marginRight: '10px', color: 'var(--primary)' }}></i>
                {activeSolveQuestion.title}
              </h2>
              <span className={`badge ${diffBadge(activeSolveQuestion.difficulty)}`} style={{ marginTop: '5px' }}>{activeSolveQuestion.difficulty}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => {
                  const newState = !solvedMap[activeSolveQuestion.id];
                  toggleSolved(activeSolveQuestion, newState);
                }}
                className={`btn ${solvedMap[activeSolveQuestion.id] ? 'btn-secondary' : 'btn-primary'}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                {solvedMap[activeSolveQuestion.id] ? 'Solved ✓' : 'Mark as Solved'}
              </button>
              <button 
                onClick={() => setActiveSolveQuestion(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--danger)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#1e1e1e' }}>
            <iframe
              src={`https://onecompiler.com/embed/cpp?hideLanguageSelection=false&theme=dark`}
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 'none' }}
              title="Online Compiler"
            ></iframe>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
