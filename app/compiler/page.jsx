"use client";

import { useState } from 'react';
import Head from 'next/head';

export default function CompilerPage() {
  return (
    <div className="compiler-container">
      <div className="compiler-header">
        <div className="title-section">
          <i className="fas fa-code-branch" style={{ color: 'var(--primary)', fontSize: '1.5rem' }}></i>
          <div>
            <h1>Online IDE</h1>
            <p>Write, Compile, and Execute your DSA logic</p>
          </div>
        </div>
      </div>

      <div className="compiler-frame-wrapper">
        <iframe
          src={`https://onecompiler.com/embed/cpp?hideLanguageSelection=false&theme=dark`}
          width="100%"
          height="100%"
          frameBorder="0"
          title="Online Compiler"
          style={{ borderRadius: '16px' }}
        ></iframe>
      </div>

      <style jsx>{`
        .compiler-container {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          height: calc(100vh - 120px);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .compiler-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--card-bg);
          padding: 1.5rem 2rem;
          border-radius: 20px;
          border: 1px solid var(--card-border);
          box-shadow: var(--card-shadow);
        }

        .title-section {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }

        .title-section h1 {
          font-size: 1.4rem;
          margin: 0;
          font-weight: 800;
          color: var(--primary-text);
        }

        .title-section p {
          margin: 0;
          font-size: 0.85rem;
          color: var(--secondary-text);
          opacity: 0.7;
        }

        .compiler-frame-wrapper {
          flex: 1;
          background: #1e1e1e;
          border-radius: 24px;
          padding: 10px;
          border: 1px solid var(--card-border);
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          overflow: hidden;
        }

        @media (max-width: 900px) {
          .compiler-header {
            flex-direction: column;
            gap: 1.5rem;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
