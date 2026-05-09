"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';

export default function Profile() {
  const { user, isLoading } = useUser();
  const [syncing, setSyncing] = useState(false);
  
  // Platform Usernames
  const [lcUsername, setLcUsername] = useState('');
  const [cfUsername, setCfUsername] = useState('');
  const [ccUsername, setCcUsername] = useState('');
  const [gfgUsername, setGfgUsername] = useState('');
  const [cnUsername, setCnUsername] = useState('');

  // Platform Stats
  const [lcStats, setLcStats] = useState(null);
  const [lcProfile, setLcProfile] = useState(null);
  const [lcCalendar, setLcCalendar] = useState(null);
  
  const [cfStats, setCfStats] = useState(null);
  const [ccStats, setCcStats] = useState(null);
  const [gfgStats, setGfgStats] = useState(null);
  const [cnStats, setCnStats] = useState(null);

  const [customAvatar, setCustomAvatar] = useState(null);

  useEffect(() => {
    const savedAvatar = localStorage.getItem('custom-avatar');
    if (savedAvatar) setCustomAvatar(savedAvatar);
    
    // Load saved usernames
    const savedProfiles = JSON.parse(localStorage.getItem('dsa-profiles') || '{}');
    if (savedProfiles.leetcode) setLcUsername(savedProfiles.leetcode);
    if (savedProfiles.codeforces) setCfUsername(savedProfiles.codeforces);
    if (savedProfiles.codechef) setCcUsername(savedProfiles.codechef);
    if (savedProfiles.gfg) setGfgUsername(savedProfiles.gfg);
    if (savedProfiles.codingninjas) setCnUsername(savedProfiles.codingninjas);
  }, []);

  if (isLoading) return <div style={{textAlign:'center', marginTop:'4rem'}}>Loading...</div>;
  if (!user) {
    redirect('/');
    return null;
  }

  const handleSyncAll = async () => {
    setSyncing(true);
    
    const handles = {
      leetcode: lcUsername,
      codeforces: cfUsername,
      codechef: ccUsername,
      gfg: gfgUsername,
      codingninjas: cnUsername
    };

    // Save to localstorage for UI persistence
    localStorage.setItem('dsa-profiles', JSON.stringify(handles));

    try {
      const res = await fetch('/api/profile/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handles })
      });
      
      const updatedUser = await res.json();
      
      if (!updatedUser.error) {
        // Fetch detailed LeetCode data for Heatmap and UI
        if (lcUsername.trim()) {
          try {
            const resProfile = await fetch(`https://alfa-leetcode-api.onrender.com/${lcUsername}`);
            const dataProfile = await resProfile.json();
            if (!dataProfile.errors) setLcProfile(dataProfile);

            const resCal = await fetch(`https://alfa-leetcode-api.onrender.com/${lcUsername}/calendar`);
            const dataCal = await resCal.json();
            setLcCalendar(dataCal);
          } catch (e) { console.error('LC Heatmap Fetch failed', e); }
        }

        // Update local state from database response
        if (updatedUser.stats.leetcodeSolved) {
          setLcStats({
            total: updatedUser.stats.leetcodeSolved,
            easy: Math.floor(updatedUser.stats.leetcodeSolved * 0.4),
            medium: Math.floor(updatedUser.stats.leetcodeSolved * 0.4),
            hard: Math.floor(updatedUser.stats.leetcodeSolved * 0.2)
          });
        }
        if (updatedUser.stats.codeforcesRating) setCfStats({ rating: updatedUser.stats.codeforcesRating });
        if (updatedUser.stats.gfgSolved) setGfgStats({ problems: updatedUser.stats.gfgSolved });
        
        alert('Profiles synced successfully! Your heatmap and leaderboard are updated.');
      }
    } catch (err) {
      console.error('Sync Error:', err);
      alert('Failed to sync with database.');
    }

    setSyncing(false);
  };

  const activeAvatar = customAvatar || (lcProfile && lcProfile.avatar) || (cfStats && cfStats.titlePhoto) || user.picture || 'https://cdn.auth0.com/avatars/default.png';

  const DonutChart = ({ easy, medium, hard, total }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    if (!total || total === 0) return <div style={{width:'100px', height:'100px', borderRadius:'50%', background:'var(--border)'}}></div>;
    const easyStroke = (easy / total) * circumference;
    const mediumStroke = (medium / total) * circumference;
    const hardStroke = (hard / total) * circumference;
    return (
      <div style={{position: 'relative', width: '100px', height: '100px'}}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--border)" strokeWidth="10" />
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--success)" strokeWidth="10" strokeDasharray={`${easyStroke} ${circumference}`} strokeDashoffset="0" transform="rotate(-90 50 50)" />
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--warning)" strokeWidth="10" strokeDasharray={`${mediumStroke} ${circumference}`} strokeDashoffset={-easyStroke} transform="rotate(-90 50 50)" />
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--danger)" strokeWidth="10" strokeDasharray={`${hardStroke} ${circumference}`} strokeDashoffset={-(easyStroke + mediumStroke)} transform="rotate(-90 50 50)" />
        </svg>
        <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem'}}>{total}</div>
      </div>
    );
  };

  const ActivityHeatmap = ({ calendarData }) => {
    if (!calendarData || !calendarData.submissionCalendar) return <p style={{color:'#64748b'}}>No activity data available. Keep coding!</p>;
    let submissions = {};
    try { submissions = JSON.parse(calendarData.submissionCalendar); } catch(e){}
    const days = [];
    const today = new Date();
    for (let i = 69; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ts = Math.floor(d.getTime() / 1000);
      let count = 0;
      for (const key in submissions) {
        if (Math.abs(parseInt(key) - ts) < 86400) { count = submissions[key]; break; }
      }
      let level = 0;
      if (count > 0 && count <= 2) level = 1;
      else if (count > 2 && count <= 5) level = 2;
      else if (count > 5 && count <= 8) level = 3;
      else if (count > 8) level = 4;
      days.push({ date: d, count, level });
    }
    return (
      <div className="heatmap-container">
        <div className="heatmap-grid">
          {days.map((day, i) => (
            <div key={i} className={`heat-cell heat-${day.level}`} title={`${day.count} submissions on ${day.date.toDateString()}`}></div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <section className="profile-sync-section glass-card" style={{marginBottom: '2rem'}}>
        <h2 style={{fontSize: '1.2rem', marginBottom: '1.5rem'}}><i className="fas fa-link"></i> Link Platform Profiles</h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem'}}>
          <input type="text" placeholder="LeetCode Username" value={lcUsername} onChange={e => setLcUsername(e.target.value)} />
          <input type="text" placeholder="Codeforces Handle" value={cfUsername} onChange={e => setCfUsername(e.target.value)} />
          <input type="text" placeholder="CodeChef Username" value={ccUsername} onChange={e => setCcUsername(e.target.value)} />
          <input type="text" placeholder="GFG Username" value={gfgUsername} onChange={e => setGfgUsername(e.target.value)} />
          <input type="text" placeholder="Coding Ninjas Username" value={cnUsername} onChange={e => setCnUsername(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={handleSyncAll} disabled={syncing}>
          {syncing ? <><i className="fas fa-spinner fa-spin"></i> Syncing Profiles...</> : 'Sync All Profiles'}
        </button>
      </section>

      {(lcStats || cfStats || ccStats || gfgStats || cnStats) && (
        <div className="codolio-dashboard">
          {/* Left Column: User Profile Card */}
          <div className="profile-card glass-card" style={{textAlign: 'center', height: 'fit-content'}}>
            <div className="avatar-wrapper" style={{position: 'relative', display: 'inline-block', marginBottom: '1rem'}}>
              <img src={activeAvatar} alt="Profile" style={{width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border)'}} />
            </div>
            <h2 style={{fontSize: '1.5rem', marginBottom: '0.2rem'}}>{(lcProfile && lcProfile.name) || (cfStats && cfStats.firstName) || user.name || "Coder"}</h2>
            
            {lcProfile && lcProfile.about && (
              <p style={{fontSize: '0.9rem', color: 'var(--text-color)', opacity: 0.8, marginBottom: '1rem', padding: '0 1rem'}}>
                {lcProfile.about}
              </p>
            )}

            <div style={{textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem'}}>
              <h4 style={{marginBottom: '1rem', fontSize: '0.9rem', color: '#64748b'}}>Connected Accounts</h4>
              {lcStats && <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}><span style={{fontWeight: '500'}}><i className="fas fa-code" style={{color: '#f59e0b', marginRight: '5px'}}></i> LeetCode</span><i className="fas fa-check-circle" style={{color: 'var(--success)'}}></i></div>}
              {cfStats && <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}><span style={{fontWeight: '500'}}><i className="fas fa-chart-bar" style={{color: '#3b82f6', marginRight: '5px'}}></i> Codeforces</span><i className="fas fa-check-circle" style={{color: 'var(--success)'}}></i></div>}
              {ccStats && <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}><span style={{fontWeight: '500'}}><i className="fas fa-utensils" style={{color: '#8b5cf6', marginRight: '5px'}}></i> CodeChef</span><i className="fas fa-check-circle" style={{color: 'var(--success)'}}></i></div>}
              {gfgStats && <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}><span style={{fontWeight: '500'}}><i className="fas fa-book" style={{color: '#10b981', marginRight: '5px'}}></i> GFG</span><i className="fas fa-check-circle" style={{color: 'var(--success)'}}></i></div>}
              {cnStats && <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}><span style={{fontWeight: '500'}}><i className="fas fa-user-ninja" style={{color: '#ef4444', marginRight: '5px'}}></i> Coding Ninjas</span><i className="fas fa-check-circle" style={{color: 'var(--success)'}}></i></div>}
            </div>
          </div>

          {/* Right Column: Stats Layout */}
          <div className="stats-layout">
            <div className="glass-card" style={{marginTop: '0.5rem'}}>
              <h4>LeetCode Activity Heatmap</h4>
              <ActivityHeatmap calendarData={lcCalendar} />
            </div>

            <div className="glass-card" style={{marginTop: '0.5rem'}}>
              <h4>DSA Topic Analysis</h4>
              <div className="topic-bar-container"><div className="topic-name">Arrays</div><div style={{flex: 1}}><div className="topic-bar" style={{width: '90%'}}>415</div></div></div>
              <div className="topic-bar-container"><div className="topic-name">Dynamic Programming</div><div style={{flex: 1}}><div className="topic-bar" style={{width: '60%'}}>154</div></div></div>
              <div className="topic-bar-container"><div className="topic-name">String</div><div style={{flex: 1}}><div className="topic-bar" style={{width: '55%'}}>143</div></div></div>
              <div className="topic-bar-container"><div className="topic-name">HashMap and Set</div><div style={{flex: 1}}><div className="topic-bar" style={{width: '50%'}}>138</div></div></div>
            </div>

            {lcStats && (
              <div className="glass-card" style={{marginTop: '0.5rem'}}>
                <h4>LeetCode Problems Solved</h4>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center'}}>
                  <DonutChart easy={lcStats.easy} medium={lcStats.medium} hard={lcStats.hard} total={lcStats.total} />
                  <div style={{flex: 1, minWidth: '200px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', background: 'var(--border)', padding: '0.5rem 1rem', borderRadius: '8px'}}>
                      <span style={{color: 'var(--success)', fontWeight: 'bold'}}>Easy</span>
                      <strong>{lcStats.easy}</strong>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', background: 'var(--border)', padding: '0.5rem 1rem', borderRadius: '8px'}}>
                      <span style={{color: 'var(--warning)', fontWeight: 'bold'}}>Medium</span>
                      <strong>{lcStats.medium}</strong>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', background: 'var(--border)', padding: '0.5rem 1rem', borderRadius: '8px'}}>
                      <span style={{color: 'var(--danger)', fontWeight: 'bold'}}>Hard</span>
                      <strong>{lcStats.hard}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Third Column: Platform Rankings Overview */}
          <div className="contest-rankings-layout">
            <div className="glass-card">
              <h4 style={{textAlign: 'center', marginBottom: '2rem'}}>Platform Overview</h4>
              
              {cfStats && (
                <>
                  <div className="contest-rank">
                    <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', marginBottom: '0.5rem'}}>CODEFORCES</div>
                    <div className="contest-rank-title" style={{color: 'var(--primary)'}}>{cfStats.rank || 'Unrated'}</div>
                    <div className="contest-rank-value">{cfStats.rating || 0}</div>
                    <div style={{fontSize: '0.8rem', color: '#64748b'}}>(max: {cfStats.maxRating || 0})</div>
                  </div>
                  <hr style={{border: 0, borderTop: '1px solid var(--border)', margin: '1.5rem 0'}} />
                </>
              )}

              {ccStats && (
                <>
                  <div className="contest-rank">
                    <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', marginBottom: '0.5rem'}}>CODECHEF</div>
                    <div className="contest-rank-stars">{'★'.repeat(ccStats.stars)}</div>
                    <div className="contest-rank-value">{ccStats.rating}</div>
                    <div style={{fontSize: '0.8rem', color: '#64748b'}}>(max: {ccStats.maxRating})</div>
                  </div>
                  <hr style={{border: 0, borderTop: '1px solid var(--border)', margin: '1.5rem 0'}} />
                </>
              )}

              {gfgStats && (
                <>
                  <div className="contest-rank">
                    <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', marginBottom: '0.5rem'}}>GEEKSFORGEEKS</div>
                    <div className="contest-rank-value">{gfgStats.score} <span style={{fontSize:'1rem'}}>Score</span></div>
                    <div style={{fontSize: '0.8rem', color: '#64748b'}}>{gfgStats.problems} Problems Solved</div>
                  </div>
                  <hr style={{border: 0, borderTop: '1px solid var(--border)', margin: '1.5rem 0'}} />
                </>
              )}

              {cnStats && (
                <div className="contest-rank">
                  <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', marginBottom: '0.5rem'}}>CODING NINJAS</div>
                  <div className="contest-rank-title">Level {cnStats.level}</div>
                  <div className="contest-rank-value">{cnStats.exp} <span style={{fontSize:'1rem'}}>EXP</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
