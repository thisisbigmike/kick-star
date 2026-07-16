'use client';
import { useEffect, useState } from 'react';

/**
 * Full-screen animated XP reward reveal. Replaces silent balance
 * bumps with a visual moment, per the PRD's "reveals are
 * visual/animated, not text notifications" requirement.
 *
 * Auto-dismisses after a short delay; also dismissible by tap.
 */
export default function XPReveal({ amount, onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 1800);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [onDone]);

  return (
    <div
      onClick={() => { setVisible(false); setTimeout(onDone, 300); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(21, 17, 31, 0.6)',
        backdropFilter: 'blur(4px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        cursor: 'pointer',
      }}
    >
      <div
        className="glowing-card"
        style={{
          padding: '32px 48px',
          textAlign: 'center',
          transform: visible ? 'scale(1)' : 'scale(0.7)',
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
        <div
          style={{
            fontFamily: 'var(--font-score)',
            fontSize: 36,
            fontWeight: 700,
            color: 'var(--accent-amber)',
          }}
        >
          +{amount} XP
        </div>
      </div>
    </div>
  );
}
