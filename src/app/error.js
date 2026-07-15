'use client';
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log error to an external logging service (e.g. Sentry)
    console.error('Aether Predict Client Error:', error);
  }, [error]);

  return (
    <div style={{
      background: '#0B0A10',
      color: '#f3f1f6',
      fontFamily: '"Inter", sans-serif',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '24px'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: '16px',
        display: 'grid',
        placeItems: 'center',
        marginBottom: '24px'
      }}>
        <svg viewBox="0 0 24 24" style={{ width: '28px', height: '28px', fill: '#ef4444' }}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      </div>
      <h2 style={{
        fontFamily: '"Archivo", sans-serif',
        fontSize: '28px',
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        marginBottom: '10px'
      }}>Something went wrong!</h2>
      <p style={{
        fontSize: '14.5px',
        color: '#9a95ad',
        maxWidth: '440px',
        marginBottom: '32px',
        lineHeight: 1.6
      }}>
        Aether Predict encountered an unexpected rendering error. Please try refreshing or reloading the console tuner dashboard.
      </p>
      <button
        onClick={() => reset()}
        style={{
          background: '#8b5cf6',
          color: '#f3f1f6',
          fontFamily: 'inherit',
          fontSize: '13.5px',
          fontWeight: 700,
          padding: '12px 28px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 20px -8px #8b5cf6',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        Try Again
      </button>
    </div>
  );
}
