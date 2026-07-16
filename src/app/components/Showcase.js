'use client';
import { useState, useEffect, useRef } from 'react';

export default function Showcase() {
  const [ttsActive, setTtsActive] = useState(false);
  const [activeTab, setActiveTab] = useState('standard');
  const [glassPillStyle, setGlassPillStyle] = useState({ left: 0, width: 0 });
  const glassTabsRef = useRef(null);

  useEffect(() => {
    if (glassTabsRef.current) {
      const activeBtn = glassTabsRef.current.querySelector('.active');
      if (activeBtn) {
        setGlassPillStyle({
          left: activeBtn.offsetLeft,
          width: activeBtn.offsetWidth
        });
      }
    }
  }, [activeTab]);

  const handleTtsToggle = () => {
    const newVal = !ttsActive;
    setTtsActive(newVal);
    if (newVal) {
      window.dispatchEvent(new CustomEvent('score-update', { detail: 5 }));
    }
  };

  return (
    <section className="section" id="showcase">
      <div className="wrap">
        <div className="component-showcase">
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 20, marginBottom: 24 }}>
            <div className="eyebrow">{'// DESIGN SYSTEM PRIMITIVES'}</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, textTransform: 'uppercase' }}>Kickstar UI Component Gallery</h3>
            <p style={{ fontSize: 13.5, color: 'var(--ink-secondary)', marginTop: 4 }}>Demonstrating accessible components, glassmorphism templates, and kinetic states used to craft the application layout.</p>
          </div>

          <div className="showcase-grid">
            {/* Component 1: Switches */}
            <div className="showcase-item">
              <span className="showcase-label">Switches / Toggles</span>
              <div className="showcase-box">
                <div className={`switch-control${ttsActive ? ' active' : ''}`} onClick={handleTtsToggle}>
                  <div className="switch-track"><span className="switch-thumb"></span></div>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-primary)' }}>Enable Audio TTS</span>
                </div>
              </div>
            </div>

            {/* Component 2: Tabs */}
            <div className="showcase-item">
              <span className="showcase-label">Glass Tabs / States</span>
              <div className="showcase-box">
                <div className="glass-tabs" ref={glassTabsRef} style={{ position: 'relative' }}>
                  <div 
                    className="glass-pill-slider" 
                    style={{ 
                      position: 'absolute', 
                      top: '4px', 
                      bottom: '4px', 
                      left: `${glassPillStyle.left}px`, 
                      width: `${glassPillStyle.width}px`, 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      borderRadius: '8px', 
                      transition: 'left 0.4s cubic-bezier(0.65, 0, 0.35, 1), width 0.4s cubic-bezier(0.65, 0, 0.35, 1)', 
                      zIndex: 0,
                      pointerEvents: 'none'
                    }}
                  />
                  <button 
                    className={`glass-tab-btn${activeTab === 'standard' ? ' active' : ''}`} 
                    onClick={() => setActiveTab('standard')}
                    style={{ position: 'relative', zIndex: 1, transition: 'color 0.4s cubic-bezier(0.65, 0, 0.35, 1)' }}
                  >
                    Standard
                  </button>
                  <button 
                    className={`glass-tab-btn${activeTab === 'toxic' ? ' active' : ''}`} 
                    onClick={() => setActiveTab('toxic')}
                    style={{ position: 'relative', zIndex: 1, transition: 'color 0.4s cubic-bezier(0.65, 0, 0.35, 1)' }}
                  >
                    Toxic Mode
                  </button>
                </div>
              </div>
            </div>

            {/* Component 3: Glowing Card */}
            <div className="showcase-item">
              <span className="showcase-label">Gradient Mesh Cards</span>
              <div className="showcase-box" style={{ padding: 12 }}>
                <div className="glowing-card">
                  <div className="mono" style={{ fontSize: 10, color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: 4 }}>LIVE MATCH FEED</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-primary)' }}>CONNECTED • 104 MATCHES</div>
                </div>
              </div>
            </div>

            {/* Component 4: Text Inputs */}
            <div className="showcase-item">
              <span className="showcase-label">Premium Text Fields</span>
              <div className="showcase-box">
                <input type="text" className="premium-input" placeholder="Type group command..." defaultValue="/predict team:ARG" />
              </div>
            </div>

            {/* Component 5: Buttons Kinetic States */}
            <div className="showcase-item">
              <span className="showcase-label">Kinetic Hover States</span>
              <div className="showcase-box" style={{ gap: 10 }}>
                <button className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: 12 }}>Hover Me</button>
                <button className="btn btn-cyan" style={{ padding: '10px 16px', fontSize: 12, boxShadow: 'none' }}>Cyan Dial</button>
              </div>
            </div>

            {/* Component 6: Signal Badges */}
            <div className="showcase-item">
              <span className="showcase-label">Signal Status Badges</span>
              <div className="showcase-box" style={{ gap: 8, flexWrap: 'wrap' }}>
                <span className="badge-glass active">Live Feed OK</span>
                <span className="badge-glass" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: 'var(--signal-success)' }}>Solana PWA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
