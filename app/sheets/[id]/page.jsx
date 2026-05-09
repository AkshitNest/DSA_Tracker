"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import sheetsData from '../../../data/sheets.json';
import questionsData from '../../../data/sheet-questions.json';

export default function SheetDetail() {
  const { id } = useParams();
  const [sheet, setSheet] = useState(null);
  const [topics, setTopics] = useState([]);
  const [solvedIds, setSolvedIds] = useState(new Set());
  const [expandedTopics, setExpandedTopics] = useState(new Set());

  useEffect(() => {
    const s = sheetsData.find(s => s.id === id);
    if (s) setSheet(s);
    
    const q = questionsData[id] || [];
    setTopics(q);
    
    // Load local progress
    const saved = localStorage.getItem(`sheet-progress-${id}`);
    if (saved) setSolvedIds(new Set(JSON.parse(saved)));

    // Expand first topic by default
    if (q.length > 0) setExpandedTopics(new Set([q[0].topic]));
  }, [id]);

  if (!sheet) return <div style={{textAlign:'center', marginTop:'5rem'}}>Sheet not found.</div>;

  const totalQuestions = topics.reduce((acc, t) => acc + t.questions.length, 0);
  const solvedCount = solvedIds.size;
  const progressPercent = totalQuestions === 0 ? 0 : Math.round((solvedCount / totalQuestions) * 100);

  const toggleSolved = (qId) => {
    const newSolved = new Set(solvedIds);
    if (newSolved.has(qId)) newSolved.delete(qId);
    else newSolved.add(qId);
    setSolvedIds(newSolved);
    localStorage.setItem(`sheet-progress-${id}`, JSON.stringify([...newSolved]));
  };

  const toggleTopic = (topicName) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicName)) newExpanded.delete(topicName);
    else newExpanded.add(topicName);
    setExpandedTopics(newExpanded);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
      {/* Header Section */}
      <div className="glass-card" style={{ padding: '3rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{sheet.category}</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>Popular</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>{sheet.title}</h1>
          <p style={{ color: '#64748b', maxWidth: '600px', lineHeight: 1.6 }}>{sheet.description}</p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
             <button className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Follow Sheet</button>
             <button className="btn btn-secondary" style={{ padding: '0.75rem 2rem' }}>Pick Random</button>
          </div>
        </div>

        {/* Circular Progress */}
        <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="transparent" stroke="var(--border)" strokeWidth="12" />
            <circle cx="80" cy="80" r="70" fill="transparent" stroke="var(--primary)" strokeWidth="12" 
              strokeDasharray={`${2 * Math.PI * 70}`} 
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - progressPercent / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900 }}>{solvedCount}</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b', borderTop: '1px solid var(--border)', marginTop: '4px', paddingTop: '4px' }}>{totalQuestions}</div>
          </div>
        </div>
      </div>

      {/* Topics Section */}
      <div className="topics-list" style={{ display: 'grid', gap: '1rem' }}>
        {topics.map(topic => {
          const isExpanded = expandedTopics.has(topic.topic);
          const topicSolvedCount = topic.questions.filter(q => solvedIds.has(q.id)).length;
          
          return (
            <div key={topic.topic} className="topic-group glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div 
                onClick={() => toggleTopic(topic.topic)}
                style={{ padding: '1.5rem 2rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isExpanded ? 'var(--hover-bg)' : 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{topic.topic}</h3>
                  <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>{topicSolvedCount} / {topic.questions.length}</span>
                </div>
                <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}>
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>

              {isExpanded && (
                <div className="questions-container" style={{ padding: '1rem 2rem 2rem 2rem', background: 'rgba(0,0,0,0.1)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {topic.questions.map(q => (
                        <tr key={q.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                          <td style={{ padding: '1rem 0', width: '50px' }}>
                            <input 
                              type="checkbox" 
                              checked={solvedIds.has(q.id)}
                              onChange={() => toggleSolved(q.id)}
                              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            />
                          </td>
                          <td style={{ padding: '1rem 0' }}>
                            <a href={q.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {q.title} <i className="fas fa-external-link-alt" style={{ fontSize: '0.7rem', opacity: 0.5 }}></i>
                            </a>
                          </td>
                          <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                            <span className="badge" style={{ fontSize: '0.7rem', background: q.difficulty === 'Easy' ? 'rgba(34,197,94,0.1)' : q.difficulty === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: q.difficulty === 'Easy' ? '#22c55e' : q.difficulty === 'Medium' ? '#f59e0b' : '#ef4444' }}>
                              {q.difficulty}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
