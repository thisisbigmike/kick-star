'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function Hero() {
  const chatRef = useRef(null);
  const [bubbles, setBubbles] = useState([]);
  const timeoutRef = useRef(null);

  const messages = [
    { type: 'bot', html: '🔌 <b>Kickstar Live Hub:</b> Successfully subscribed to the TxLINE event websocket feed. Parsing match telemetry...' },
    { type: 'bot-card', img: '/images/messi_kick.jpg', title: '⚽ GOAL OF THE DECADE', text: "Messi scores a bicycle kick! ARG win prob surged to 82% on TxLINE consensus. The defender is still searching for his dignity." },
    { type: 'bot', html: '📈 <b>Consensus Odds Shift:</b> Real Madrid win probability dropped by 18% after that own goal. My neural network says Maguire own goal incoming. Predict on-chain now!' },
    { type: 'bot', html: '🗳️ <b>Active Fan Vote:</b> Predict on-chain in the live prediction pools now to claim SSU loyalty points!' }
  ];

  useEffect(() => {
    let idx = 0;
    const addMessage = () => {
      if (idx >= messages.length) {
        timeoutRef.current = setTimeout(() => { setBubbles([]); idx = 0; timeoutRef.current = setTimeout(addMessage, 1000); }, 12000);
        return;
      }
      const msg = messages[idx];
      idx++;
      if (msg.type === 'user') {
        setBubbles(prev => [...prev, msg]);
        timeoutRef.current = setTimeout(addMessage, 2200);
      } else if (msg.type === 'bot') {
        setBubbles(prev => [...prev, { type: 'typing' }]);
        timeoutRef.current = setTimeout(() => { setBubbles(prev => prev.filter(b => b.type !== 'typing').concat(msg)); timeoutRef.current = setTimeout(addMessage, 2200); }, 1200);
      } else if (msg.type === 'bot-card') {
        setBubbles(prev => [...prev, { type: 'typing' }]);
        timeoutRef.current = setTimeout(() => { setBubbles(prev => prev.filter(b => b.type !== 'typing').concat(msg)); timeoutRef.current = setTimeout(addMessage, 2200); }, 1500);
      }
    };
    timeoutRef.current = setTimeout(addMessage, 1000);
    return () => clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [bubbles]);

  const handlePost = (e) => {
    const btn = e.currentTarget;
    if (btn.dataset.posted === 'true') return;
    btn.dataset.posted = 'true';
    btn.textContent = 'Syncing...';
    btn.style.background = 'var(--accent-cyan)';
    btn.style.color = '#031418';
    setTimeout(() => { btn.textContent = 'Posted ✓'; btn.style.background = 'var(--signal-success)'; btn.style.color = 'var(--bg-obsidian)'; window.dispatchEvent(new CustomEvent('score-update', { detail: 10 })); }, 1000);
  };

  return (
    <section className="hero" id="hero" style={{
      backgroundImage: "linear-gradient(rgba(13, 10, 22, 0.55) 0%, rgba(13, 10, 22, 0.8) 100%), url('/images/mythological_hero_bg.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      paddingTop: '100px',
      paddingBottom: '100px',
      textAlign: 'center'
    }}>
      <div className="wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, zIndex: 10 }}>
        {/* Headline */}
        <h1 style={{ lineHeight: 1.1, textAlign: 'center', margin: 0 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontStyle: 'italic', textTransform: 'none', color: '#fff', fontSize: 'min(9vw, 76px)', letterSpacing: '0.01em', display: 'block' }}>Fan Influence,</span>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 900, textTransform: 'uppercase', color: '#fff', fontSize: 'min(7.5vw, 60px)', letterSpacing: '-0.02em', display: 'block', marginTop: '4px' }}>Powered By TxLINE.</span>
        </h1>

        {/* Subtext */}
        <p style={{ maxWidth: '640px', margin: '24px auto 36px auto', fontSize: '15.5px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, fontWeight: 500 }}>
          Kickstar is a high-performance Web3 football companion &amp; predictive reward portal. We parse real-time match telemetry and consensus odds shifts from the high-performance <b>TxLINE data layer</b> into dynamic prediction pools, live scoring analytics, and custom caricatures.
        </p>

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <a href="/dashboard" className="btn" style={{ background: '#fff', color: '#040308', borderRadius: '100px', fontWeight: 800, padding: '14px 36px', border: 'none', textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(255,255,255,0.4)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; }}>Get Started</a>
          <a href="#features" style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '2px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>See how it works</a>
        </div>
      </div>

      {/* Bottom Corner Metadata */}
      <div className="hero-meta-left">
        <span className="hero-meta-label">Consensus Engine</span>
        <span className="hero-meta-val">TxLINE Data Integration / Live Telemetry</span>
      </div>

      <div className="hero-meta-right">
        <div className="hero-meta-avatars">
          <div className="avatar-circle"></div>
          <div className="avatar-circle"></div>
          <div className="avatar-circle"></div>
        </div>
        <div className="hero-meta-right-text">
          <span className="hero-meta-val">10k+ Fans</span>
          <span className="hero-meta-label">Staking &amp; Predicting</span>
        </div>
      </div>

      <div className="hero-scroll-chevron">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
      </div>
    </section>
  );
}

