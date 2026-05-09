"use client";

import { useState } from 'react';
import Link from 'next/link';

const sheetsData = [
  {
    title: "Strivers A2Z DSA Sheet",
    source: "Striver (TUF)",
    followers: "29962",
    questions: 455,
    description: "The most comprehensive A-Z roadmap for mastering DSA. Perfectly structured for beginners to advanced learners.",
    link: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
    category: "Complete DSA"
  },
  {
    title: "Striver SDE Sheet",
    source: "Striver (TUF)",
    followers: "11710",
    questions: 191,
    description: "The gold standard for SDE interviews. Curated list of top 191 problems asked in product-based companies.",
    link: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/",
    category: "Popular"
  },
  {
    title: "Love Babbar Sheet",
    source: "Love Babbar",
    followers: "7410",
    questions: 450,
    description: "The famous 450 DSA Cracker sheet. Covers all major topics with high-quality GeeksforGeeks problems.",
    link: "https://www.geeksforgeeks.org/love-babbar-dsa-sheet-solutions/",
    category: "Popular"
  },
  {
    title: "Neetcode 150",
    source: "Neetcode",
    followers: "4857",
    questions: 150,
    description: "A finely tuned version of Blind 75. Excellent video explanations and categorized by difficulty/topic.",
    link: "https://neetcode.io/practice",
    category: "Popular"
  },
  {
    title: "Top Interview 150",
    source: "LeetCode Official",
    followers: "4389",
    questions: 150,
    description: "LeetCode's official pick of the 150 most essential questions for technical interviews.",
    link: "https://leetcode.com/studyplan/top-interview-150/",
    category: "Popular"
  },
  {
    title: "Blind 75",
    source: "Tech Interview Handbook",
    followers: "3718",
    questions: 75,
    description: "The original list of 75 LeetCode questions that started it all. High ROI for short-term preparation.",
    link: "https://www.techinterviewhandbook.org/grind75",
    category: "Popular"
  },
  {
    title: "DP Mastery Sheet",
    source: "Striver (TUF)",
    followers: "2448",
    questions: 67,
    description: "Master Dynamic Programming with this focused series. Includes recursion, memoization, and tabulation.",
    link: "https://takeuforward.org/dynamic-programming/striver-dp-series-notes-pro-checklist/",
    category: "Topic Specific"
  },
  {
    title: "Apna College DSA Sheet",
    source: "Shradha Didi & Aman Bhaiya",
    followers: "2268",
    questions: 403,
    description: "A complete placement preparation guide with 403 hand-picked questions from basic to advanced.",
    link: "https://www.apnacollege.in/course/dsa-sheet",
    category: "Complete DSA"
  },
  {
    title: "Code Army Sheet",
    source: "Rohit Negi",
    followers: "1873",
    questions: 726,
    description: "Extensive practice sheet by Rohit Negi (ex-Uber). Covers 700+ problems for deep mastery.",
    link: "https://www.geeksforgeeks.org/rohit-negi-dsa-sheet/",
    category: "Complete DSA"
  },
  {
    title: "CP-31 Ladder (800-1200)",
    source: "Priyansh Agarwal",
    followers: "1382",
    questions: 155,
    description: "The ultimate roadmap for Competitive Programming. Curated problems to improve your CF rating.",
    link: "https://www.tle-eliminators.com/cp-31-sheets",
    category: "Competitive"
  },
  {
    title: "Fraz DSA Sheet",
    source: "Fraz Bhaiya",
    followers: "1331",
    questions: 279,
    description: "Well-organized collection of LeetCode problems categorized by patterns and difficulty.",
    link: "https://leetcode.com/discuss/general-discussion/1154562/fraz-dsa-sheet-curated-problems-list-for-beginners-to-intermediate",
    category: "Popular"
  },
  {
    title: "CSES Problem Set",
    source: "CSES.fi",
    followers: "994",
    questions: 300,
    description: "Standard algorithmic problems used for training in competitive programming worldwide.",
    link: "https://cses.fi/problemset/",
    category: "Competitive"
  },
  {
    title: "Striver 79 (SDE Core)",
    source: "Raj Vikramaditya",
    followers: "857",
    questions: 79,
    description: "A compact version of the SDE sheet for quick revision before major interviews.",
    link: "https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/",
    category: "Quick Revision"
  },
  {
    title: "Arsh DSA Sheet",
    source: "Arsh Goyal",
    followers: "794",
    questions: 287,
    description: "Curated by Arsh Goyal (Goldman Sachs). Features high-frequency interview questions.",
    link: "https://www.proclub.tech/sheets/arsh-dsa-sheet",
    category: "Popular"
  },
  {
    title: "AlgoMaster 150",
    source: "Ashish Pratap Singh",
    followers: "315",
    questions: 150,
    description: "Premium selection of 150 problems for targeted interview preparation.",
    link: "https://algomaster.io/practice/dsa-patterns",
    category: "Complete DSA"
  },
  {
    title: "6 Companies 30 Days",
    source: "Arsh Goyal",
    followers: "581",
    questions: 90,
    description: "Focus on 90 must-solve questions from the top 6 product companies (MAANG).",
    link: "https://www.proclub.tech/sheets/6-companies-30-days",
    category: "Popular"
  },
  {
    title: "20 DSA Patterns",
    source: "Kushal Vijay",
    followers: "539",
    questions: 180,
    description: "Learn how to identify patterns in problems. 180 questions across 20 core algorithmic patterns.",
    link: "https://www.geeksforgeeks.org/kushal-vijay-dsa-sheet/",
    category: "Topic Specific"
  },
  {
    title: "Graph Mastery",
    source: "Striver (TUF)",
    followers: "687",
    questions: 29,
    description: "Master Graph theory, BFS, DFS, and shortest path algorithms with this expert guide.",
    link: "https://takeuforward.org/graph/striver-graph-series-detailed-content/",
    category: "Topic Specific"
  },
  {
    title: "DSA Pattern Recognition",
    source: "Whimsical / Community",
    followers: "1200",
    questions: 100,
    description: "A highly visual and interactive mental map for identifying DSA patterns. One of the best resources for pattern-based learning.",
    link: "https://whimsical.com/dsa-patterns-47DQdVg8MiLZ1idPyveWFr",
    category: "Topic Specific"
  }
];

export default function SheetsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ["All", "Popular", "Quick Revision", "Complete DSA", "Topic Specific", "Competitive"];

  const filteredSheets = sheetsData.filter(sheet => {
    const matchesSearch = sheet.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || sheet.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="sheets-container">
      <div className="sheets-header">
        <div className="header-content">
          <h1>DSA Sheets Explorer</h1>
          <p>Master algorithms with curated collections from top creators</p>
        </div>
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Search for a sheet (e.g. Striver, Love Babbar)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="filters">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="sheets-grid">
        {filteredSheets.map((sheet, index) => (
          <div key={index} className="sheet-card">
            <div className="card-top">
              <span className="category-badge">{sheet.category}</span>
              <div className="followers">
                <i className="fas fa-users"></i>
                {sheet.followers}
              </div>
            </div>
            
            <h3>{sheet.title}</h3>
            <div className="source-label">
              <i className="fas fa-certificate"></i>
              {sheet.source}
            </div>
            <p className="description">{sheet.description}</p>
            
            <div className="card-footer">
              <div className="questions-count">
                <i className="fas fa-list-check"></i>
                {sheet.questions} questions
              </div>
              <a href={sheet.link} target="_blank" rel="noopener noreferrer" className="view-btn">
                Official Link
                <i className="fas fa-external-link-alt"></i>
              </a>
            </div>
            
            <div className="progress-bar-placeholder">
              <div className="progress" style={{ width: '0%' }}></div>
              <span className="progress-text">0% Done</span>
            </div>
          </div>
        ))}
      </div>

      {filteredSheets.length === 0 && (
        <div className="no-results">
          <i className="fas fa-search" style={{ fontSize: '3rem', opacity: 0.2, marginBottom: '1rem' }}></i>
          <p>No sheets found matching your criteria.</p>
        </div>
      )}

      <style jsx>{`
        .sheets-container {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          min-height: 100vh;
        }

        .sheets-header {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-bottom: 3rem;
          text-align: center;
        }

        .header-content h1 {
          font-size: 2.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #fff 0%, #6366f1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .header-content p {
          color: var(--secondary-text);
          opacity: 0.8;
          font-size: 1.1rem;
        }

        .search-box {
          position: relative;
          max-width: 600px;
          margin: 0 auto;
          width: 100%;
        }

        .search-box i {
          position: absolute;
          left: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .search-box input {
          width: 100%;
          padding: 1.2rem 1.5rem 1.2rem 3.5rem;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          color: #fff;
          font-size: 1rem;
          transition: all 0.3s;
          box-shadow: var(--card-shadow);
        }

        .search-box input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
          background: rgba(255,255,255,0.05);
        }

        .filters {
          display: flex;
          gap: 0.8rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .filter-btn {
          padding: 0.7rem 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--card-border);
          background: var(--card-bg);
          color: var(--secondary-text);
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          background: rgba(255,255,255,0.05);
          color: #fff;
        }

        .filter-btn.active {
          background: #fff;
          color: #000;
          border-color: #fff;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
        }

        .sheets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        .sheet-card {
          background: rgba(30, 41, 59, 0.5);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 1.8rem;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          overflow: hidden;
        }

        .sheet-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: rgba(99, 102, 241, 0.4);
          background: rgba(30, 41, 59, 0.8);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 
                      0 0 20px rgba(99, 102, 241, 0.1);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .category-badge {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 800;
          padding: 0.4rem 0.8rem;
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          border-radius: 8px;
        }

        .followers {
          font-size: 0.8rem;
          color: var(--secondary-text);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .sheet-card h3 {
          font-size: 1.3rem;
          font-weight: 800;
          margin: 0;
          color: var(--primary-text);
          line-height: 1.3;
        }

        .source-label {
          font-size: 0.75rem;
          color: var(--primary);
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: -0.5rem;
          opacity: 0.9;
        }

        .description {
          font-size: 0.9rem;
          color: var(--secondary-text);
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }

        .questions-count {
          font-size: 0.85rem;
          color: var(--secondary-text);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .view-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 1.2rem;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .view-btn:hover {
          background: var(--primary);
          border-color: var(--primary);
          transform: translateX(3px);
        }

        .progress-bar-placeholder {
          height: 30px;
          background: rgba(0,0,0,0.2);
          border-radius: 10px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background: var(--primary);
          opacity: 0.3;
        }

        .progress-text {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--primary);
          z-index: 1;
        }

        .no-results {
          text-align: center;
          padding: 5rem 0;
          color: var(--secondary-text);
        }

        @media (max-width: 768px) {
          .sheets-grid {
            grid-template-columns: 1fr;
          }
          .header-content h1 {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
}
