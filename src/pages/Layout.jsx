
import React from 'react';

export default function Layout({ children }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap');
        
        :root {
          --background: #1F1F1E;
          --foreground: #FFFFFF;
          --secondary: #BBBBBB;
          --btn-bg-hover: rgba(255, 255, 255, 0.0784);
        }

        * {
          font-family: 'IBM Plex Sans', sans-serif !important;
        }
        
        body {
          background-color: var(--background) !important;
          color: var(--secondary);
          font-weight: 400;
        }
        
        h1, h2, h3, h4, h5, h6 {
          color: var(--foreground);
          font-weight: 400;
        }
        
        .btn-base {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 24px;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 500;
          line-height: 1;
          transition: all 0.2s ease-in-out;
          border: 1px solid rgba(255, 255, 255, 0.4);
          text-decoration: none;
          cursor: pointer;
          white-space: nowrap;
          background-color: transparent;
        }

        .btn-primary {
          color: var(--foreground);
          border-color: rgba(255, 255, 255, 0.6);
        }
        
        .btn-primary:hover {
          background-color: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.8);
        }
        
        .btn-secondary {
          color: var(--secondary);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .btn-secondary:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--foreground);
          border-color: rgba(255, 255, 255, 0.6);
        }
        
        .btn-selected {
          background-color: rgba(255, 255, 255, 0.08);
          color: var(--foreground);
          border-color: rgba(255, 255, 255, 0.8);
        }
        
        /* Additional Base44 button utilities */
        .btn-base:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
        }
        
        .btn-base:active {
          transform: scale(0.98);
        }
        
        .btn-base:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
      <main className="min-h-screen" style={{ backgroundColor: '#1F1F1E' }}>
        {children}
      </main>
    </>
  );
}
