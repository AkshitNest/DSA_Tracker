"use client";
import React, { useState } from 'react';
import useFetch from '../src/hooks/useFetch';

function formatDate(d?: string | Date | null) {
  if (!d) return '-';
  const dt = new Date(d);
  return dt.toLocaleDateString();
}

export default function RevisionDashboard() {
  const [topic, setTopic] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);

  const qs = new URLSearchParams();
  if (topic) qs.set('topic', topic);
  if (difficulty) qs.set('difficulty', difficulty);

  const { data, loading, error } = useFetch(`/api/revision?${qs.toString()}`);

  if (loading) return <div className="glass-card">Loading revisions...</div>;
  if (error) return <div className="glass-card">Error: {error}</div>;

  const dueToday = data?.dueToday || [];
  const overdue = data?.overdue || [];
  const upcoming = data?.upcoming || [];
  const completion = data?.completion ?? 0;

  return (
    <div className="codolio-dashboard">
      <aside className="glass-card">
        <h2>Revision Overview</h2>
        <div className="stats-layout">
          <div>
            <h4>Completion</h4>
            <div style={{display:'flex', alignItems:'center', gap: '1rem'}}>
              <div style={{width:100,height:100,display:'grid',placeItems:'center',borderRadius:9999,background:'var(--input-bg)'}}>
                <strong style={{fontSize: '1.4rem'}}>{completion}%</strong>
              </div>
              <div>
                <div><strong>{dueToday.length}</strong> due today</div>
                <div><strong>{overdue.length}</strong> overdue</div>
                <div><strong>{upcoming.length}</strong> upcoming</div>
              </div>
            </div>
          </div>

          <div>
            <h4>Filters</h4>
            <select onChange={e => setTopic(e.target.value || null)}>
              <option value="">All Topics</option>
              <option value="Dynamic Programming">Dynamic Programming</option>
              <option value="Graphs">Graphs</option>
              <option value="Trees">Trees</option>
              <option value="Array">Array</option>
            </select>
            <select style={{marginTop: '0.5rem'}} onChange={e => setDifficulty(e.target.value || null)}>
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </aside>

      <section className="glass-card">
        <h2>Notifications</h2>
        <div style={{display: 'grid', gap: '0.75rem'}}>
          {dueToday.slice(0,5).map((q: any) => (
            <div key={q._id} style={{padding:'0.8rem', borderRadius:12, background:'var(--input-bg)'}}>
              <strong>Revise {q.title || q.name} today</strong>
              <div style={{color: 'var(--primary)', marginTop:4}}>{q.topic} • {q.difficulty}</div>
            </div>
          ))}
          {overdue.slice(0,5).map((q: any) => {
            const days = Math.ceil((new Date().getTime() - new Date(q.nextRevisionDate).getTime()) / (1000 * 60 * 60 * 24));
            return (
              <div key={q._id} style={{padding:'0.8rem', borderRadius:12, background:'rgba(255,240,240,0.6)'}}>
                <strong>{q.title || q.name} overdue by {days} day{days>1?'s':''}</strong>
                <div style={{color:'#b91c1c', marginTop:4}}>{q.topic} • {q.difficulty}</div>
              </div>
            );
          })}
        </div>

        <hr style={{margin: '1rem 0'}} />

        <h2>Upcoming Revisions</h2>
        <table>
          <thead>
            <tr><th>Problem</th><th>Topic</th><th>Difficulty</th><th>Next Revision</th><th>Revisions</th></tr>
          </thead>
          <tbody>
            {upcoming.concat(dueToday).map((q: any) => (
              <tr key={q._id}>
                <td>{q.title || q.name}</td>
                <td>{q.topic || 'General'}</td>
                <td>{q.difficulty}</td>
                <td>{formatDate(q.nextRevisionDate)}</td>
                <td>{q.revisionCount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <aside className="glass-card">
        <h2>Analytics</h2>
        <div style={{marginTop: '1rem'}}>
          <h4>Revisions Heat</h4>
          <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6}}>
            {[...Array(7)].map((_, i) => <div key={i} className="heat-cell" />)}
          </div>
        </div>
      </aside>
    </div>
  );
}
