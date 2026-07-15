'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function Features() {
  const [sassText, setSassText] = useState("Messi just broke gravity to score a bicycle kick, while the defender is still searching for his dignity.");
  const [sassIdx, setSassIdx] = useState(0);
  const [sassAnimating, setSassAnimating] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [predictLocked, setPredictLocked] = useState(false);
  const [showPcts, setShowPcts] = useState(false);
  const [correctChoice, setCorrectChoice] = useState(null);
  const [caricatureActive, setCaricatureActive] = useState(true);
  const [wobbling, setWobbling] = useState(false);

  const backupSass = [
    "Messi just scores a bicycle kick like he's playing in the back garden. Unfair.",
    "A textbook header from Maguire! Unfortunate that it was into his own net.",
    "Ref is checking VAR monitor. Safe to assume he is browsing for new whistles."
  ];

  const regenSass = () => {
    const next = (sassIdx + 1) % backupSass.length;
    setSassIdx(next);
    setSassText(backupSass[next]);
    setSassAnimating(true);
    setTimeout(() => setSassAnimating(false), 400);
  };

  const handlePredict = (choice) => {
    if (predictLocked) return;
    setPredictLocked(true);
    setSelectedPrediction(choice);
    setTimeout(() => {
      setCorrectChoice('barca');
      setShowPcts(true);
      if (choice === 'barca') {
        window.dispatchEvent(new CustomEvent('score-update', { detail: 50 }));
      }
    }, 800);
  };

  const predictionClass = (choice) => {
    let cls = 'predict-option';
    if (selectedPrediction === choice && !correctChoice) cls += ' selected';
    if (correctChoice === choice) cls += ' correct';
    return cls;
  };

  const handleCaricature = () => {
    setCaricatureActive(!caricatureActive);
    setWobbling(true);
    setTimeout(() => setWobbling(false), 800);
  };

  const [activePlatforms, setActivePlatforms] = useState({ telegram: true, twitter: false, instagram: false });
  const togglePlatform = (p) => {
    setActivePlatforms(prev => ({ ...prev, [p]: !prev[p] }));
  };

  return (
    <section className="section" id="features">
      <div className="wrap">
        <div className="section-head">
          <h2>Fan Influence &amp; Staking Mechanics</h2>
          <span className="tagline">Leveraging the high-performance TxLINE data layer to fuel on-chain fan voting, predictive games, and exclusive rewards.</span>
        </div>

        <div className="features-grid">
          {/* Card 1: Live Commentary */}
          <div className="feature-card">
            <div className="card-stage">
              <div className="card-tag">feed: txline-live-events</div>
              <div className="live-sass-panel">
                <div className={`live-sass-text${sassAnimating ? ' bump' : ''}`}>{sassText}</div>
                <div className="live-sass-actions">
                  <button className="live-sass-btn" onClick={regenSass}>Regen Sass</button>
                </div>
              </div>
            </div>
            <div className="card-foot">
              <div className="name">TxLINE Fan Voting Pools</div>
              <div className="desc">Stake $SASS Fan Tokens to vote in binding, real-time polls matching live match events (e.g. caricature style or referee call ratings).</div>
            </div>
          </div>

          {/* Card 2: Predictions */}
          <div className="feature-card">
            <div className="card-stage">
              <div className="card-tag">solana program: predict-earn</div>
              <div className="prediction-box">
                <div className="predict-title">Predict Barca vs Real Madrid Result</div>
                {[['barca', 'Barca Wins', '64%'], ['draw', 'Draw', '12%'], ['madrid', 'Madrid Wins', '24%']].map(([choice, label, pct]) => (
                  <button key={choice} className={predictionClass(choice)} onClick={() => handlePredict(choice)}>
                    {label} {showPcts && <span className="pct">{pct}</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="card-foot">
              <div className="name">Predict-to-Earn (P2E)</div>
              <div className="desc">Predict match outcomes powered by real-time TxLINE consensus odds to earn reward points. Staking more $SASS boosts your voting weight.</div>
            </div>
          </div>

          {/* Card 3: Leaderboard */}
          <div className="feature-card">
            <div className="card-stage">
              <div className="card-tag">contract: score-leaderboard</div>
              <div className="card-leaderboard">
                {[['1.', '@SassMaster', '1,480 pts'], ['2.', '@El_Pundit', '1,210 pts'], ['3.', '@GoonerWitty', '980 pts']].map(([rank, user, score]) => (
                  <div className="leader-row" key={user}>
                    <div className="leader-user"><span className="leader-rank">{rank}</span> {user}</div>
                    <div className="leader-score">{score}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-foot">
              <div className="name">SSU Fan Loyalty Leaderboard</div>
              <div className="desc">A web3-native leaderboard pulling scores on-chain, encouraging competition to unlock VIP match experiences and signed kits.</div>
            </div>
          </div>

          {/* Card 4: Caricature */}
          <div className="feature-card">
            <div className="card-stage">
              <div className="card-tag">engine: caricature-diffusion</div>
              <div className="caricature-stage" onClick={handleCaricature}>
                <Image className={`caricature-img${caricatureActive ? ' active' : ''}`} src="/images/messi_kick.jpg" alt="Messi Caricature" width={125} height={125} style={{ animation: wobbling ? 'demo-jelly-wobble 0.8s var(--spring-bouncy)' : 'none', objectFit: 'cover' }} />
                <span className="caricature-hint">Click to wobble</span>
              </div>
            </div>
            <div className="card-foot">
              <div className="name">Collectible AI Memorabilia</div>
              <div className="desc">Redeem loyalty points to generate and claim custom AI caricature cards of key match highlights as digital collectibles.</div>
            </div>
          </div>

          {/* Card 5: Platform Broadcast */}
          <div className="feature-card">
            <div className="card-stage">
              <div className="card-tag">engine: platform-broadcast</div>
              <div className="platform-circles">
                <div className={`platform-icon-wrap${activePlatforms.telegram ? ' active' : ''}`} title="Telegram" onClick={() => togglePlatform('telegram')}>
                  <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.27-2.03-.49-.82-.27-1.47-.41-1.41-.87.03-.24.36-.49.98-.74 3.82-1.66 6.37-2.75 7.64-3.28 3.64-1.53 4.4-1.8 4.89-1.8.11 0 .35.03.5.15.13.1.17.24.18.35-.01.07 0 .15-.02.24z" /></svg>
                </div>
                <div className={`platform-icon-wrap${activePlatforms.twitter ? ' active' : ''}`} title="X (Twitter)" onClick={() => togglePlatform('twitter')}>
                  <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </div>
                <div className={`platform-icon-wrap${activePlatforms.instagram ? ' active' : ''}`} title="Instagram" onClick={() => togglePlatform('instagram')}>
                  <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </div>
              </div>
            </div>
            <div className="card-foot">
              <div className="name">Social Broadcast Syndication</div>
              <div className="desc">Instantly sync your club&apos;s poll results, caricature cards, and prediction scores across Telegram, Discord, and X (Twitter) in real time.</div>
            </div>
          </div>

          {/* Card 6: Live Match Tracker */}
          <div className="feature-card">
            <div className="card-stage">
              <div className="card-tag">feed: txline-match-state</div>
              <div className="tracker-container">
                <div className="match-field">
                  <div className="field-attack-zone">danger zone</div>
                  <div className="field-ball"></div>
                </div>
                <div className="broadcaster-badge">Streaming: FOX Sports / BBC</div>
              </div>
            </div>
            <div className="card-foot">
              <div className="name">Live Hub &amp; Check-ins</div>
              <div className="desc">Track live match telemetry from TxLINE, get stream listings, and participate in in-play check-ins to earn SSU loyalty points.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
