"use client";
import React from 'react';
import useFetch from '../src/hooks/useFetch';

function ProgressBar({ value }: { value: number }) {
  return (
    <div style={{background:'var(--input-bg)', borderRadius:12, padding:6}}>
      <div style={{width: `${value}%`, background: 'linear-gradient(90deg,var(--heat-2),var(--heat-4))', height: 12, borderRadius:8}} />
    </div>
  );
}

export default function CompanyDashboard() {
  const { data, loading, error } = useFetch('/api/company/stats');

  if (loading) return <div className="glass-card">Loading company stats...</div>;
  if (error) return <div className="glass-card">Error: {error}</div>;

  const companies = data || {};

  return (
    <div className="dashboard-grid">
      {Object.entries(companies).map(([company, stats]: any) => (
        <div key={company} className="glass-card">
          <h2>{company} Prep</h2>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <h3 style={{margin:0}}>{stats.solved}/{stats.total} solved</h3>
              <div style={{color:'#64748b'}}>Remaining: {stats.remaining}</div>
            </div>
            <div style={{width:120}}>
              <ProgressBar value={stats.progress} />
              <div style={{textAlign:'right', marginTop:6}}>{stats.progress}%</div>
            </div>
          </div>

          <hr style={{margin: '1rem 0'}} />

          <h4>Weak Topics</h4>
          <div>
            {(stats.weaknesses || []).slice(0,5).map((w: any) => (
              <div key={w.topic} style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, marginBottom:8}}>
                <div style={{fontWeight:700}}>{w.topic}</div>
                <div style={{width:120}}>
                  <ProgressBar value={w.solvedPercent} />
                </div>
                <div style={{width:40, textAlign:'right'}}>{w.solvedPercent}%</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
