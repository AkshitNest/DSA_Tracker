"use client";

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';

export default function Tracker() {
  const { user, isLoading } = useUser();
  const [questions, setQuestions] = useState([]);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', platform: 'LeetCode', tags: '', approach: '',
    timeComplexity: '', confidence: '3', lastRevised: '', mistakes: ''
  });

  // Filter State
  const [search, setSearch] = useState('');
  const [filterConf, setFilterConf] = useState('All');
  const [filterPlat, setFilterPlat] = useState('All');
  const [sortAsc, setSortAsc] = useState(true);

  // Modal State
  const [modalData, setModalData] = useState(null);

  // Undo Delete State
  const [undoToast, setUndoToast] = useState(null);
  const undoTimeoutRef = useRef(null);

  // Clean up pending deletes on unmount
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        // If there's a pending delete when leaving page, execute it synchronously
        clearTimeout(undoTimeoutRef.current);
        if (undoToast?.pendingId) {
          fetch(`/api/questions/${undoToast.pendingId}`, { method: 'DELETE', keepalive: true }).catch(console.error);
        }
      }
    };
  }, [undoToast]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, lastRevised: new Date().toISOString().split('T')[0] }));
  }, []);

  useEffect(() => {
    if (user) {
      fetch('/api/questions')
        .then(res => res.json())
        .then(data => {
          if (!data.error) setQuestions(data);
        })
        .catch(err => console.error('Failed to fetch questions:', err));
    }
  }, [user]);

  if (isLoading) return <div style={{textAlign:'center', marginTop:'4rem'}}>Loading...</div>;
  if (!user) {
    redirect('/');
    return null;
  }

  const calculateNextRevision = (confidence, lastDate) => {
    const date = new Date(lastDate);
    const daysToAdd = { 1: 2, 2: 3, 3: 5, 4: 7, 5: 10 };
    date.setDate(date.getDate() + daysToAdd[parseInt(confidence)]);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newQuestion = {
      name: formData.name,
      platform: formData.platform,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      approach: formData.approach,
      timeComplexity: formData.timeComplexity,
      confidence: parseInt(formData.confidence),
      lastRevised: formData.lastRevised,
      mistakes: formData.mistakes,
      nextRevision: calculateNextRevision(formData.confidence, formData.lastRevised)
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/questions/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newQuestion)
        });
        const updated = await res.json();
        if (!updated.error) {
          setQuestions(questions.map(q => q.id === editingId ? updated : q));
        }
      } else {
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newQuestion)
        });
        const saved = await res.json();
        if (!saved.error) {
          setQuestions([saved, ...questions]);
        }
      }
    } catch (err) {
      console.error('Failed to save question:', err);
    }
    
    setEditingId(null);
    setFormData({
      name: '', platform: 'LeetCode', tags: '', approach: '',
      timeComplexity: '', confidence: '3', lastRevised: new Date().toISOString().split('T')[0], mistakes: ''
    });
  };

  const editQuestion = (id, e) => {
    e.stopPropagation();
    const q = questions.find(q => q.id === id);
    if (!q) return;
    setEditingId(q.id);
    setFormData({
      name: q.name, platform: q.platform, tags: q.tags.join(', '),
      approach: q.approach, timeComplexity: q.timeComplexity,
      confidence: q.confidence.toString(), lastRevised: q.lastRevised, mistakes: q.mistakes
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteQuestion = (id, e) => {
    e.stopPropagation();
    const qToDelete = questions.find(q => q.id === id);
    if (!qToDelete) return;

    // 1. Optimistically remove from UI
    setQuestions(questions.filter(q => q.id !== id));

    // 2. If there's an existing pending delete, execute it immediately
    if (undoToast && undoToast.pendingId) {
      fetch(`/api/questions/${undoToast.pendingId}`, { method: 'DELETE' }).catch(console.error);
      clearTimeout(undoTimeoutRef.current);
    }

    // 3. Show Undo Toast
    setUndoToast({
      message: `Deleted "${qToDelete.name}"`,
      pendingId: id,
      question: qToDelete
    });

    // 4. Schedule real database deletion after 6 seconds
    undoTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to delete question:', err);
      }
      setUndoToast(null);
    }, 6000);
  };

  const handleUndo = () => {
    if (undoToast && undoToast.question) {
      clearTimeout(undoTimeoutRef.current);
      setQuestions(prev => [undoToast.question, ...prev]);
      setUndoToast(null);
    }
  };

  const markRevised = async (id, e) => {
    e.stopPropagation();
    const today = new Date().toISOString().split('T')[0];
    const q = questions.find(q => q.id === id);
    if (!q) return;
    
    const { id: _, _id, ...restProps } = q;
    
    const updatedQuestion = {
      ...restProps,
      lastRevised: today,
      nextRevision: calculateNextRevision(q.confidence, today)
    };

    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQuestion)
      });
      const updated = await res.json();
      if (!updated.error) {
        setQuestions(questions.map(question => question.id === id ? updated : question));
        if (q.lastRevised === today) {
          alert('Question is already revised for today!');
        } else {
          alert('Successfully marked as revised!');
        }
      } else {
        alert('Failed to update: ' + updated.error);
      }
    } catch (err) {
      console.error('Failed to mark revised:', err);
      alert('Error connecting to database.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  let filtered = questions.filter(q => {
    const matchSearch = q.name.toLowerCase().includes(search.toLowerCase()) || q.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchPlat = filterPlat === 'All' || q.platform === filterPlat;
    let matchConf = true;
    if (filterConf === 'Weak') matchConf = q.confidence <= 2;
    if (filterConf === 'Medium') matchConf = q.confidence === 3;
    if (filterConf === 'Strong') matchConf = q.confidence >= 4;
    return matchSearch && matchPlat && matchConf;
  });

  filtered = filtered.sort((a, b) => {
    const d1 = new Date(a.nextRevision);
    const d2 = new Date(b.nextRevision);
    return sortAsc ? d1 - d2 : d2 - d1;
  });

  return (
    <>
      <div className="content-grid" style={{marginTop: '2rem'}}>
        <aside className="form-section glass-card">
          <h2>{editingId ? <><i className="fas fa-edit"></i> Edit Question</> : <><i className="fas fa-plus-circle"></i> Add Question</>}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Question Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g., Two Sum" />
            </div>
            <div className="form-group">
              <label>Platform</label>
              <select required value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})}>
                <option value="LeetCode">LeetCode</option>
                <option value="GFG">GeeksForGeeks</option>
                <option value="Codeforces">Codeforces</option>
                <option value="CodingNinjas">Coding Ninjas</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="Array, Hash Table" />
            </div>
            <div className="form-group">
              <label>Approach</label>
              <textarea rows="2" value={formData.approach} onChange={e => setFormData({...formData, approach: e.target.value})}></textarea>
            </div>
            <div className="form-group">
              <label>Time Complexity</label>
              <input type="text" value={formData.timeComplexity} onChange={e => setFormData({...formData, timeComplexity: e.target.value})} placeholder="O(n)" />
            </div>
            <div className="form-group">
              <label>Confidence Level (1-5)</label>
              <select required value={formData.confidence} onChange={e => setFormData({...formData, confidence: e.target.value})}>
                <option value="1">1 - Needs huge work</option><option value="2">2 - Poor</option>
                <option value="3">3 - Medium</option><option value="4">4 - Good</option><option value="5">5 - Strong</option>
              </select>
            </div>
            <div className="form-group">
              <label>Last Revised</label>
              <input type="date" required value={formData.lastRevised} onChange={e => setFormData({...formData, lastRevised: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Mistake Notes</label>
              <textarea rows="2" value={formData.mistakes} onChange={e => setFormData({...formData, mistakes: e.target.value})}></textarea>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> Save</button>
              {editingId && <button type="button" className="btn btn-secondary" onClick={() => {setEditingId(null); setFormData({...formData, name: '', approach: '', mistakes: ''})}}>Cancel</button>}
            </div>
          </form>
        </aside>

        <section className="list-section glass-card">
          <div className="list-header">
            <h2><i className="fas fa-list"></i> Question List</h2>
            <div className="filters">
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
              <select value={filterConf} onChange={e => setFilterConf(e.target.value)}>
                <option value="All">All Confidence</option><option value="Weak">Weak (1-2)</option><option value="Medium">Medium (3)</option><option value="Strong">Strong (4-5)</option>
              </select>
              <select value={filterPlat} onChange={e => setFilterPlat(e.target.value)}>
                <option value="All">All Platforms</option><option value="LeetCode">LeetCode</option><option value="GFG">GFG</option><option value="Codeforces">Codeforces</option><option value="CodingNinjas">Coding Ninjas</option><option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Question</th><th>Platform</th><th>Tags</th><th>Confidence</th><th>Last Revised</th>
                  <th className="sortable" onClick={() => setSortAsc(!sortAsc)}>Next Revision <i className="fas fa-sort"></i></th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(q => (
                  <tr key={q.id} className="clickable-row" onClick={() => setModalData(q)}>
                    <td><strong>{q.name}</strong></td>
                    <td>{q.platform}</td>
                    <td>{q.tags.map(t => <span key={t} className="badge badge-tag">{t}</span>)}</td>
                    <td><span className={`badge badge-${q.confidence <= 2 ? 'weak' : q.confidence >= 4 ? 'strong' : 'medium'}`}>Lvl {q.confidence}</span></td>
                    <td>{q.lastRevised}</td>
                    <td>{q.nextRevision} {q.nextRevision <= today && <span className="badge revise-now">Revise Now</span>}</td>
                    <td className="action-btns">
                      <button className="btn-icon check" onClick={(e) => markRevised(q.id, e)}><i className="fas fa-check-circle"></i></button>
                      <button className="btn-icon edit" onClick={(e) => editQuestion(q.id, e)}><i className="fas fa-edit"></i></button>
                      <button className="btn-icon delete" onClick={(e) => deleteQuestion(q.id, e)}><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p style={{textAlign: 'center', padding: '2rem', color: '#64748b'}}>No questions found. Add some!</p>}
          </div>
        </section>
      </div>

      {modalData && (
        <div className="modal" onClick={(e) => { if (e.target.className === 'modal') setModalData(null); }}>
          <div className="modal-content glass-card">
            <span className="close-btn" onClick={() => setModalData(null)}>&times;</span>
            <h2>{modalData.name}</h2>
            <div className="modal-body">
              <h3>Approach</h3><p>{modalData.approach || 'No approach notes.'}</p>
              <h3>Mistakes & Notes</h3><p>{modalData.mistakes || 'No mistake notes.'}</p>
              <h3>Time Complexity</h3><p>{modalData.timeComplexity || 'Not specified'}</p>
            </div>
          </div>
        </div>
      )}

      {undoToast && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--primary)', color: 'var(--btn-text)', padding: '1rem 2rem',
          borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', zIndex: 1000, animation: 'slideUp 0.3s ease-out'
        }}>
          <span>{undoToast.message}</span>
          <button onClick={handleUndo} style={{
            background: 'transparent', border: '1px solid var(--btn-text)', color: 'var(--btn-text)',
            padding: '0.4rem 1rem', borderRadius: '9999px', cursor: 'pointer', fontWeight: 'bold'
          }}>
            <i className="fas fa-undo"></i> Undo
          </button>
        </div>
      )}
    </>
  );
}
