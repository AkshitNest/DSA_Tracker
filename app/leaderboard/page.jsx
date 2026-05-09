"use client";

import { useState, useEffect } from 'react';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch leaderboard:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{textAlign:'center', marginTop:'4rem'}}>Loading Leaderboard...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--primary), #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Global Leaderboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Ranks based on total solved questions across platforms.</p>
      </header>

      <div className="leaderboard-grid">
        {/* Podium Section */}
        <div className="podium" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '1rem', marginBottom: '4rem' }}>
          {users[1] && (
            <div className="podium-rank rank-2 glass-card" style={{ width: '180px', height: '220px', textAlign: 'center', padding: '1.5rem', position: 'relative' }}>
              <div className="medal-icon">🥈</div>
              <img src={users[1].picture} alt={users[1].name} style={{ width: '60px', height: '60px', borderRadius: '50%', marginBottom: '1rem', border: '2px solid silver' }} />
              <div style={{ fontWeight: 'bold' }}>{users[1].name}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{users[1].stats.totalSolved}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Solved</div>
            </div>
          )}
          {users[0] && (
            <div className="podium-rank rank-1 glass-card" style={{ width: '220px', height: '280px', textAlign: 'center', padding: '2rem', border: '2px solid gold', position: 'relative' }}>
              <div className="medal-icon" style={{ fontSize: '2.5rem' }}>🥇</div>
              <img src={users[0].picture} alt={users[0].name} style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '1rem', border: '4px solid gold' }} />
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{users[0].name}</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{users[0].stats.totalSolved}</div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Solved</div>
            </div>
          )}
          {users[2] && (
            <div className="podium-rank rank-3 glass-card" style={{ width: '180px', height: '200px', textAlign: 'center', padding: '1.5rem', position: 'relative' }}>
              <div className="medal-icon">🥉</div>
              <img src={users[2].picture} alt={users[2].name} style={{ width: '60px', height: '60px', borderRadius: '50%', marginBottom: '1rem', border: '2px solid #cd7f32' }} />
              <div style={{ fontWeight: 'bold' }}>{users[2].name}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{users[2].stats.totalSolved}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Solved</div>
            </div>
          )}
        </div>

        {/* List Section */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--border)', color: '#64748b' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Rank</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>User</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>LC</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>GFG</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>CF</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>CC</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>CN</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Total Solved</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>#{i + 1}</td>
                  <td style={{ padding: '1rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={u.picture} alt={u.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>{u.stats.leetcodeSolved || 0}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>{u.stats.gfgSolved || 0}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>{u.stats.codeforcesSolved || 0}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>{u.stats.codechefSolved || 0}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>{u.stats.codingninjasSolved || 0}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 900, color: 'var(--primary)', fontSize: '1.1rem' }}>{u.stats.totalSolved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .podium-rank { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .podium-rank:hover { transform: translateY(-10px); }
        .medal-icon { position: absolute; top: -1.5rem; left: 50%; transform: translateX(-50%); font-size: 2rem; }
        tr:hover { background: var(--hover-bg); }
      `}</style>
    </div>
  );
}
