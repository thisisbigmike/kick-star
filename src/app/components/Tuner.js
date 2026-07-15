'use client';
import { useState, useCallback } from 'react';

const comments = {
  low: [
    "Messi scores a goal. The shot was placed well in the corner.",
    "Defender scores an own goal. Clumsy clearance mistake.",
    "Referee reviews the play on the monitor. Goal disallowed."
  ],
  med: [
    "Messi does it again! What a brilliant bicycle kick to take the lead.",
    "Maguire scores a bullet header... straight into his own net. Oh no.",
    "VAR checking penalty. The referee has been staring at this TV screen for 5 minutes."
  ],
  high: [
    "Messi just broke gravity to score a bicycle kick, while the defender is still searching for his dignity.",
    "Maguire own goal alert! A masterclass in clinical finishing, wrong net though.",
    "VAR is checking. Grab some popcorn, the ref is making this a 3-act theatrical drama."
  ]
};

const subjects = ['Messi Bicycle Kick', 'Maguire Own Goal', 'VAR Review'];

export default function Tuner() {
  const [stiff, setStiff] = useState(320);
  const [damp, setDamp] = useState(24);
  const [sarc, setSarc] = useState(65);
  const [commentIdx, setCommentIdx] = useState(0);
  const [bump, setBump] = useState(false);

  const tone = sarc > 75 ? 'high' : sarc > 35 ? 'med' : 'low';
  const previewText = comments[tone][commentIdx];

  const cycleSubject = useCallback(() => {
    setCommentIdx(prev => (prev + 1) % subjects.length);
    setBump(true);
    setTimeout(() => setBump(false), 400);
  }, []);

  const handleSlider = (setter) => (e) => {
    setter(parseInt(e.target.value, 10));
    setBump(true);
    setTimeout(() => setBump(false), 400);
  };

  return (
    <section className="section" id="tuner">
      <div className="wrap">
        <div className="section-head" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2>Live Commentary Tuner</h2>
          <span className="tagline">Customize the live commentary feed. Adjust the pundit mood, tension, and hype levels to tune the AI match narrator.</span>
        </div>

        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div className="tuner-card">
            <div className="tuner-preview-label" style={{ marginBottom: 20, fontSize: 13, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
              Active Live Event: <span onClick={cycleSubject} style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--accent-cyan)', fontWeight: 700 }}>{subjects[commentIdx]}</span> <span style={{ color: 'var(--ink-dim)' }}>(Click to cycle)</span>
            </div>

            <div className="tuner-row">
              <label style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-secondary)' }}>Pundit Mood</label>
              <input type="range" min="0" max="100" value={sarc} onChange={handleSlider(setSarc)} />
              <span style={{ fontSize: 12, fontWeight: 700, textAlign: 'right', color: 'var(--accent-amber)' }}>
                {sarc <= 35 ? 'Chill' : sarc <= 75 ? 'Sassy' : 'Unhinged'}
              </span>
            </div>

            <div className="tuner-row">
              <label style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-secondary)' }}>Tension</label>
              <input type="range" min="5" max="50" value={damp} onChange={handleSlider(setDamp)} />
              <span style={{ fontSize: 12, fontWeight: 700, textAlign: 'right', color: 'var(--accent-amber)' }}>
                {damp <= 20 ? 'Relaxed' : damp <= 35 ? 'Moderate' : 'Intense'}
              </span>
            </div>

            <div className="tuner-row">
              <label style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-secondary)' }}>Hype Level</label>
              <input type="range" min="80" max="500" value={stiff} onChange={handleSlider(setStiff)} />
              <span style={{ fontSize: 12, fontWeight: 700, textAlign: 'right', color: 'var(--accent-amber)' }}>
                {stiff <= 200 ? 'Low' : stiff <= 380 ? 'High' : 'Max'}
              </span>
            </div>

            <div className="tuner-preview-box" style={{ marginTop: 24 }}>
              <div className={`tuner-preview-text${bump ? ' bump' : ''}`}>{previewText}</div>
              <div className="tuner-preview-label" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12, marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>Pundit: {sarc <= 35 ? 'Chill' : sarc <= 75 ? 'Sassy' : 'Unhinged'}</span>
                <span>Telemetry: Real-time Live Feed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
