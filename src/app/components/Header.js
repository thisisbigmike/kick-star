'use client';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [score, setScore] = useState(240);
  
  // Auth & Connection States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [username, setUsername] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // Tab State inside Modal ('signin' | 'signup')
  const [authTab, setAuthTab] = useState('signin');
  const [authPillStyle, setAuthPillStyle] = useState({ left: 0, width: 0 });
  const authTabsRef = useRef(null);

  // Update sliding pill position for Auth Modal
  useEffect(() => {
    if (authModalOpen && authTabsRef.current) {
      const timer = setTimeout(() => {
        const activeBtn = authTabsRef.current.querySelector('.active');
        if (activeBtn) {
          setAuthPillStyle({
            left: activeBtn.offsetLeft,
            width: activeBtn.offsetWidth,
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [authTab, authModalOpen]);

  // Modal state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [signupStep, setSignupStep] = useState(1); // 1 = email, 2 = password

  const headerRef = useRef(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('matchsass-user-auth');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        
        // Defer state updates to prevent synchronous setState cascading render warnings
        const timer = setTimeout(() => {
          setAuthenticated(true);
          setUserEmail(parsed.email || '');
          setUsername(parsed.username || 'SassFan');
          setWalletConnected(parsed.walletConnected || false);
          setWalletAddress(parsed.walletAddress || '');
          if (parsed.points) setScore(parsed.points);
        }, 0);

        return () => clearTimeout(timer);
      } catch (e) {
        console.error("Failed to parse auth storage", e);
      }
    }
  }, []);

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
    setUserEmail('');
    setUsername('');
    setWalletConnected(false);
    setWalletAddress('');
    setProfileDropdownOpen(false);
    // Dispatch auth state change event
    window.dispatchEvent(new CustomEvent('auth-state-change', { detail: null }));
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();

    // Step 1: validate email, advance to step 2
    if (signupStep === 1) {
      if (!emailInput) {
        setErrorMsg('Please enter your email address.');
        return;
      }
      setErrorMsg('');
      setSignupStep(2);
      return;
    }

    // Sign In requires both fields; Sign Up step 2 requires password
    if (!emailInput || !passwordInput) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedUsername = authTab === 'signup' 
        ? `SassFan#${Math.floor(Math.random() * 900 + 100)}`
        : emailInput.split('@')[0];

      const pointsReward = authTab === 'signup' ? 50 : 0;
      const finalPoints = score + pointsReward;
      if (pointsReward > 0) setScore(finalPoints);

      const authData = {
        email: emailInput,
        username: generatedUsername,
        walletConnected: false,
        walletAddress: '',
        points: finalPoints
      };

      localStorage.setItem('matchsass-user-auth', JSON.stringify(authData));
      setAuthenticated(true);
      setUserEmail(emailInput);
      setUsername(generatedUsername);
      setAuthModalOpen(false);
      setIsSubmitting(false);
      setSignupStep(1); // reset for next time

      // Dispatch auth change event
      window.dispatchEvent(new CustomEvent('auth-state-change', { detail: authData }));
    }, 1000);
  };

  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const generatedUsername = `G_Pundit#${Math.floor(Math.random() * 900 + 100)}`;
      const authData = {
        email: 'pundit@gmail.com',
        username: generatedUsername,
        walletConnected: false,
        walletAddress: '',
        points: score
      };

      localStorage.setItem('matchsass-user-auth', JSON.stringify(authData));
      setAuthenticated(true);
      setUserEmail('pundit@gmail.com');
      setUsername(generatedUsername);
      setAuthModalOpen(false);
      setIsSubmitting(false);

      // Dispatch auth change event
      window.dispatchEvent(new CustomEvent('auth-state-change', { detail: authData }));
    }, 800);
  };

  const handleSolanaConnect = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const generatedUsername = 'SolPundit';
      const authData = {
        email: 'solana@wallet.com',
        username: generatedUsername,
        walletConnected: true,
        walletAddress: 'Fx2a...9R7',
        points: score + 10
      };

      setScore(prev => prev + 10);
      localStorage.setItem('matchsass-user-auth', JSON.stringify(authData));
      setAuthenticated(true);
      setUserEmail('solana@wallet.com');
      setUsername(generatedUsername);
      setWalletConnected(true);
      setWalletAddress('Fx2a...9R7');
      setAuthModalOpen(false);
      setIsSubmitting(false);

      // Dispatch auth change event
      window.dispatchEvent(new CustomEvent('auth-state-change', { detail: authData }));
    }, 800);
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
            <a href="#commands">Commands</a>
            <a href="#demo">Chat Simulator</a>
            <a href="#tuner">TxLINE Tuner</a>
            
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
                      {userEmail || 'pundit@gmail.com'}
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
                <a href="#commands">Commands</a>
                <a href="#demo">Chat Simulator</a>
                <a href="#tuner">TxLINE Tuner</a>
                
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

      {/* Auth Modal Overlay */}
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
              Your ultimate football companion and reward portal powered by TxLINE &amp; Solana.
            </p>

            <div className="auth-tabs" ref={authTabsRef} style={{ position: 'relative', marginTop: '16px' }}>
              <div 
                className="auth-pill-slider" 
                style={{ 
                  position: 'absolute', 
                  top: '4px', 
                  bottom: '4px', 
                  left: `${authPillStyle.left}px`, 
                  width: `${authPillStyle.width}px`, 
                  background: 'rgba(255, 255, 255, 0.08)', 
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '100px', 
                  transition: 'left 0.4s cubic-bezier(0.65, 0, 0.35, 1), width 0.4s cubic-bezier(0.65, 0, 0.35, 1)', 
                  zIndex: 0,
                  pointerEvents: 'none'
                }}
              />
              <button 
                className={`auth-tab-btn ${authTab === 'signin' ? 'active' : ''}`} 
                onClick={() => { setAuthTab('signin'); setSignupStep(1); setErrorMsg(''); }}
                style={{ position: 'relative', zIndex: 1, transition: 'color 0.4s cubic-bezier(0.65, 0, 0.35, 1)' }}
              >
                Sign In
              </button>
              <button 
                className={`auth-tab-btn ${authTab === 'signup' ? 'active' : ''}`} 
                onClick={() => { setAuthTab('signup'); setSignupStep(1); setErrorMsg(''); }}
                style={{ position: 'relative', zIndex: 1, transition: 'color 0.4s cubic-bezier(0.65, 0, 0.35, 1)' }}
              >
                Sign Up
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button className="auth-social-btn" onClick={handleGoogleSignIn} disabled={isSubmitting} style={{ flex: 1, justifyContent: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" style={{ width: 15, height: 15 }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.62-1.09-1.34-1.39-2.12z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Google
              </button>
              
              <button className="auth-social-btn solana-btn" onClick={handleSolanaConnect} disabled={isSubmitting} style={{ flex: 1, justifyContent: 'center', gap: '8px' }}>
                <svg viewBox="0 0 72 64" style={{ width: 15, height: 13 }} fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_solana_logo)">
                    <path d="M70.6648 50.1769L58.9393 62.775C58.6844 63.0486 58.376 63.2668 58.0332 63.4159C57.6905 63.5651 57.3208 63.6419 56.9472 63.6417H1.36128C1.09605 63.6417 0.836598 63.5641 0.614804 63.4184C0.393011 63.2727 0.218536 63.0652 0.112817 62.8215C0.00709765 62.5779 -0.0252603 62.3085 0.0197186 62.0467C0.0646974 61.7848 0.185054 61.5418 0.366 61.3476L12.1006 48.7496C12.3548 48.4766 12.6623 48.2589 13.0039 48.1098C13.3455 47.9607 13.714 47.8834 14.0866 47.8828H69.6695C69.9348 47.8828 70.1942 47.9604 70.416 48.1062C70.6378 48.2519 70.8123 48.4593 70.918 48.703C71.0237 48.9467 71.0561 49.216 71.0111 49.4778C70.9661 49.7397 70.8458 49.9827 70.6648 50.1769V50.1769ZM58.9393 24.8081C58.6844 24.5345 58.376 24.3163 58.0332 24.1672C57.6905 24.0181 57.3208 23.9412 56.9472 23.9414H1.36128C1.09605 23.9414 0.836598 24.019 0.614804 24.1647C0.393011 24.3105 0.218536 24.5179 0.112817 24.7616C0.00709765 25.0053 -0.0252603 25.2746 0.0197186 25.5364C0.0646974 25.7983 0.185054 26.0413 0.366 26.2355L12.1006 38.8336C12.3548 39.1065 12.6623 39.3242 13.0039 39.4733C13.3455 39.6224 13.714 39.6997 14.0866 39.7003H69.6695C69.9348 39.7003 70.1942 39.6227 70.416 39.477C70.6378 39.3313 70.8123 39.1238 70.918 38.8801C71.0237 38.6365 71.0561 38.3671 71.0111 38.1053C70.9661 37.8434 70.8458 37.6004 70.6648 37.4062L58.9393 24.8081ZM1.36128 15.7589H56.9472C57.3208 15.7591 57.6905 15.6822 58.0332 15.5331C58.376 15.384 58.6844 15.1658 58.9393 14.8922L70.6648 2.29413C70.8458 2.09986 70.9661 1.85688 71.0111 1.59502C71.0561 1.33317 71.0237 1.06385 70.918 0.820169C70.8123 0.576485 70.6378 0.369047 70.416 0.223341C70.1942 0.0776352 69.9348 8.97308e-06 69.6695 0L14.0866 0C13.714 0.000635258 13.3455 0.077888 13.0039 0.226975C12.6623 0.376063 12.3548 0.593811 12.1006 0.866739L0.369025 13.4648C0.188254 13.6588 0.0679503 13.9016 0.0228694 14.1631C-0.0222115 14.4247 0.00988974 14.6938 0.115236 14.9373C0.220583 15.1809 0.394595 15.3884 0.615931 15.5343C0.837268 15.6802 1.09631 15.7583 1.36128 15.7589V15.7589Z" fill="url(#solana_logo_grad)"/>
                  </g>
                  <defs>
                    <linearGradient id="solana_logo_grad" x1="5.99583" y1="65.1585" x2="64.404" y2="-0.566497" gradientUnits="userSpaceOnUse">
                      <stop offset="0.08" stopColor="#9945FF"/>
                      <stop offset="0.3" stopColor="#8752F3"/>
                      <stop offset="0.5" stopColor="#5497D5"/>
                      <stop offset="0.6" stopColor="#43B4CA"/>
                      <stop offset="0.72" stopColor="#28E0B9"/>
                      <stop offset="0.97" stopColor="#19FB9B"/>
                    </linearGradient>
                    <clipPath id="clip0_solana_logo">
                      <rect width="71.0308" height="63.6417" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
                Solana
              </button>
            </div>

            <div className="auth-divider" style={{ marginBlock: '16px' }}>or continue with email</div>

            <form onSubmit={handleAuthSubmit}>
              {errorMsg && (
                <div style={{ fontSize: '11px', color: 'var(--signal-error)', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 12px', borderRadius: '6px', marginBottom: '16px', textAlign: 'center' }}>
                  {errorMsg}
                </div>
              )}

              {/* Back button + email summary for step 2 (both signin and signup) */}
              {signupStep === 2 && (
                <div style={{ marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={() => { setSignupStep(1); setErrorMsg(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', padding: 0, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    ← Back
                  </button>
                  <div className="mono" style={{ fontSize: '11px', color: 'var(--ink-secondary)', background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                    {authTab === 'signup' ? 'Creating account for' : 'Signing in as'} <span style={{ color: 'var(--ink-primary)', fontWeight: 700 }}>{emailInput}</span>
                  </div>
                </div>
              )}

              {/* Email field: show on step 1 */}
              {signupStep === 1 && (
                <div className="auth-form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="auth-input" 
                    placeholder="name@domain.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Password field: show on step 2 */}
              {signupStep === 2 && (
                <div className="auth-form-group" style={{ marginBottom: '24px' }}>
                  <label htmlFor="password">{authTab === 'signup' ? 'Create Password' : 'Password'}</label>
                  <input 
                    type="password" 
                    id="password" 
                    className="auth-input" 
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                  />
                </div>
              )}

              <div style={{
                maxHeight: (signupStep === 2 || emailInput.length > 0) ? '80px' : '0px',
                opacity: (signupStep === 2 || emailInput.length > 0) ? 1 : 0,
                transform: (signupStep === 2 || emailInput.length > 0) ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden',
                marginTop: (signupStep === 2 || emailInput.length > 0) ? '16px' : '0px',
                pointerEvents: (signupStep === 2 || emailInput.length > 0) ? 'auto' : 'none'
              }}>
                <button 
                  type="submit" 
                  className="btn btn-cyan" 
                  disabled={isSubmitting}
                  style={{ width: '100%', fontSize: '13px', padding: '12px', borderRadius: 'var(--radius-md)' }}
                >
                  {isSubmitting ? 'Processing...' : signupStep === 1 ? 'Next' : authTab === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
