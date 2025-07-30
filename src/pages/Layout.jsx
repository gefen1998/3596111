
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
          border-radius: 18px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 500;
          line-height: 1;
          transition: all 0.2s ease-in-out;
          border: 1.5px solid transparent;
        }

        .btn-primary {
          color: var(--foreground);
          border-color: var(--foreground);
        }
        
        .btn-primary:hover {
          background-color: var(--btn-bg-hover);
        }
        
        .btn-secondary {
          color: var(--secondary);
          border-color: var(--secondary);
        }

        .btn-secondary:hover {
          background-color: var(--btn-bg-hover);
          color: var(--foreground);
          border-color: var(--foreground);
        }
        
        .btn-selected {
          background-color: var(--btn-bg-hover);
          color: var(--foreground);
          border-color: var(--foreground);
        }
      `}</style>
      <main className="min-h-screen" style={{ backgroundColor: '#1F1F1E' }}>
        {children}
      </main>
    </>
  );
}
