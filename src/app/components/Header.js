'use client';
import { useState, useRef, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import ClubPicker from './onboarding/ClubPicker';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [score, setScore] = useState(240);

  // Auth & Connection States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [selectedClubId, setSelectedClubId] = useState(null);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const headerRef = useRef(null);
  const wallet = useWallet();
  // Derived directly from the real wallet-adapter connection — no
  // separate mirrored state, so there's nothing to desync.
  const walletConnected = wallet.connected;
  const walletAddress = wallet.publicKey ? wallet.publicKey.toBase58() : '';

  // Load state from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('matchsass-user-auth');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);

        // Defer state updates to prevent synchronous setState cascading render warnings
        const timer = setTimeout(() => {
          setAuthenticated(true);
          setUsername(parsed.username || 'Fan');
          setSelectedClubId(parsed.clubId || null);
          if (parsed.points) setScore(parsed.points);
        }, 0);

        return () => clearTimeout(timer);
      } catch (e) {
        console.error("Failed to parse auth storage", e);
      }
    }
  }, []);

  // Persist the real wallet-adapter connection into shared storage +
  // notify the dashboard, once it changes. Read-only w.r.t. this
  // component's own state — walletConnected/walletAddress above are
  // already derived, so this effect only touches the external store.
  useEffect(() => {
    if (!walletConnected) return;

    const savedAuth = localStorage.getItem('matchsass-user-auth');
    const parsed = savedAuth ? JSON.parse(savedAuth) : {};
    const authData = {
      ...parsed,
      walletConnected: true,
      walletAddress,
      points: parsed.points ?? score,
    };
    localStorage.setItem('matchsass-user-auth', JSON.stringify(authData));
    window.dispatchEvent(new CustomEvent('auth-state-change', { detail: authData }));
  }, [walletConnected, walletAddress, score]);

  // Close mobile nav & profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setMenuOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Sync points from other actions
  useEffect(() => {
    const handler = (e) => {
      setScore(prev => {
        const next = prev + (e.detail || 0);
        // Persist back to storage if authenticated
        const savedAuth = localStorage.getItem('matchsass-user-auth');
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          parsed.points = next;
          localStorage.setItem('matchsass-user-auth', JSON.stringify(parsed));
        }
        return next;
      });
    };
    window.addEventListener('score-update', handler);
    return () => window.removeEventListener('score-update', handler);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('matchsass-user-auth');
    setAuthenticated(false);
    setUsername('');
    setSelectedClubId(null);
    setProfileDropdownOpen(false);
    if (wallet.connected) wallet.disconnect();
    // Dispatch auth state change event
    window.dispatchEvent(new CustomEvent('auth-state-change', { detail: null }));
  };

  // One tap = fully onboarded. No typed fields anywhere.
  const handleClubSelect = (club) => {
    const pointsReward = authenticated ? 0 : 50;
    const finalPoints = score + pointsReward;
    if (pointsReward > 0) setScore(finalPoints);

    const authData = {
      username: `${club.label} Fan`,
      clubId: club.id,
      walletConnected,
      walletAddress,
      points: finalPoints,
    };

    localStorage.setItem('matchsass-user-auth', JSON.stringify(authData));
    setAuthenticated(true);
    setUsername(authData.username);
    setSelectedClubId(club.id);
    setAuthModalOpen(false);

    window.dispatchEvent(new CustomEvent('auth-state-change', { detail: authData }));
  };

  return (
    <>
      <header className={`site-header${menuOpen ? ' menu-open' : ''}`} ref={headerRef}>
        <div className="wrap">
          <div className="brand" onClick={() => window.location.href = '/'}>
            <img src="/images/logo.png" alt="Kickstar Logo" style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '8px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.1, letterSpacing: '0.05em', color: '#fff' }}>KICKSTAR</span>
              <span style={{ fontSize: 8.5, fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.15em', textTransform: 'uppercase', lineHeight: 1 }}>Football Companion</span>
            </div>
          </div>
          <button className="nav-toggle" type="button" aria-expanded={menuOpen} aria-controls="mobile-nav" aria-label="Open navigation menu" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}>
            <span></span><span></span><span></span>
          </button>
          
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#tuner">Commentary Tuner</a>
            
            {/* Authenticated State Display */}
            {authenticated ? (
              <div 
                className="profile-pill" 
                onClick={(e) => { e.stopPropagation(); setProfileDropdownOpen(!profileDropdownOpen); }}
                style={{ position: 'relative' }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--signal-success)', display: 'inline-block' }}></div>
                <span className="mono" style={{ fontSize: '12.5px', color: 'var(--ink-primary)', fontWeight: 600 }}>{username}</span>
                
                {profileDropdownOpen && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      background: 'var(--bg-surface-raised)',
                      border: '1px solid var(--border-line)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                      padding: '12px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      minWidth: '200px',
                      zIndex: 200,
                      textAlign: 'left'
                    }}
                  >
                    <div className="mono" style={{ fontSize: '10px', color: 'var(--ink-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Signed in as
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {username || 'Fan'}
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', marginBlock: '4px' }}></div>
                    <button 
                      onClick={handleSignOut}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                id="auth-trigger" 
                className="mono" 
                onClick={() => setAuthModalOpen(true)} 
                style={{ 
                  fontSize: '12.5px', 
                  color: 'var(--accent-cyan)', 
                  border: '1px solid rgba(6, 182, 212, 0.4)', 
                  padding: '6px 14px', 
                  borderRadius: '100px', 
                  background: 'rgba(6, 182, 212, 0.05)', 
                  fontWeight: 600, 
                  transition: 'all 0.2s ease', 
                  cursor: 'pointer' 
                }}
              >
                Sign In / Sign Up
              </button>
            )}

            <div className="mono" style={{ fontSize: 13, color: 'var(--ink-secondary)', border: '1px solid var(--border-line)', padding: '6px 12px', borderRadius: '100px', background: 'var(--bg-surface-raised)' }}>
              Pts: <span style={{ color: 'var(--accent-amber)', fontWeight: 700, fontFamily: 'var(--font-score)' }}>{score}</span>
            </div>
          </nav>

          {/* Mobile Navigation Drawer */}
          {menuOpen && (
            <div className="mobile-nav" id="mobile-nav">
              <nav className="nav-links-mobile" aria-label="Mobile">
                <a href="#features">Features</a>
                <a href="#tuner">Commentary Tuner</a>
                
                {authenticated ? (
                  <div className="mono" style={{ fontSize: 13, color: 'var(--ink-secondary)', padding: '10px 14px', background: 'var(--bg-surface-raised)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    User: <span>{username}</span>
                    <button onClick={handleSignOut} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}>Sign Out</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setAuthModalOpen(true); setMenuOpen(false); }}
                    style={{ 
                      width: '100%',
                      fontSize: '13px', 
                      color: 'var(--accent-cyan)', 
                      border: '1px solid rgba(6, 182, 212, 0.4)', 
                      padding: '10px', 
                      borderRadius: 'var(--radius-sm)', 
                      background: 'rgba(6, 182, 212, 0.05)', 
                      fontWeight: 600, 
                      cursor: 'pointer',
                      marginBottom: 8
                    }}
                  >
                    Sign In / Sign Up
                  </button>
                )}

                <div className="mono" style={{ fontSize: 13, color: 'var(--ink-secondary)', padding: '10px 14px', background: 'var(--bg-surface-raised)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-line)', display: 'flex', justifyContent: 'space-between' }}>
                  My Points <span style={{ fontFamily: 'var(--font-score)', fontWeight: 700 }}>Pts: {score}</span>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Onboarding Modal — zero typed input. Tap a badge, tap connect wallet. */}
      {authModalOpen && (
        <div className="auth-overlay" onClick={() => setAuthModalOpen(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="auth-close" onClick={() => setAuthModalOpen(false)} aria-label="Close modal">
              <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}>
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>

            <h2 className="mono" style={{ fontSize: '18px', color: 'var(--ink-primary)', letterSpacing: '-0.01em', fontWeight: 800, textAlign: 'center' }}>
              Welcome to Kickstar
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', textAlign: 'center', marginTop: '6px', marginBottom: '0' }}>
              Tap your team. That&apos;s it.
            </p>

            <div style={{ marginTop: '20px' }}>
              <ClubPicker
                selectedClubId={selectedClubId}
                onSelect={handleClubSelect}
              />
            </div>

            <div className="auth-divider" style={{ marginBlock: '16px' }}>connect your wallet</div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <WalletMultiButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
