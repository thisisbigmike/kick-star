'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function CommandConsole() {
  const [activeCmd, setActiveCmd] = useState('/predict');

  const commands = [
    { cmd: '/predict', label: 'GET /v1/predict?match_id=wc_m48' },
    { cmd: '/caricature', label: 'POST /v1/caricature/generate' },
    { cmd: '/odds', label: 'GET /v1/odds/consensus' },
    { cmd: '/leaderboard', label: 'GET /v1/leaderboard/scores' }
  ];

  return (
    <section className="section" id="commands">
      <div className="wrap">
        <div className="section-head">
          <h2>Developer API &amp; SDK console</h2>
          <span className="tagline">Explore how Aether Predict handles event triggers and on-chain payouts using our REST API and Web SDK.</span>
        </div>

        <div className="command-console-card">
          {/* Left: Commands Selector list */}
          <div className="console-left-col">
            <div className="eyebrow">{'// WEB API ENDPOINTS'}</div>
            {commands.map(c => (
              <button key={c.cmd} className={`btn btn-secondary cmd-btn${activeCmd === c.cmd ? ' active' : ''}`} onClick={() => setActiveCmd(c.cmd)}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Right: Interactive output window */}
          <div className="console-right-col">
            <div className="badge-glass active" style={{ position: 'absolute', top: 16, right: 16, fontSize: 9 }}>RESPONSE BODY</div>

            {/* Output /predict */}
            {activeCmd === '/predict' && (
              <div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--accent-cyan)', marginBottom: 6 }}>👉 request: GET /v1/predict?match_id=wc_m48</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-primary)' }}>
                  <b>🔮 Fan Prediction Poll: ARG vs FRA</b><br />
                  Submit your prediction on Solana. Correct entries earn +50 SSU Loyalty points. Staking $SASS Fan Tokens grants a rewards multiplier!<br /><br />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 12, padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-line)', background: 'var(--bg-surface-raised)', fontWeight: 700 }}>Argentina Wins (64%)</span>
                    <span style={{ fontSize: 12, padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-line)', background: 'var(--bg-surface-raised)', fontWeight: 700 }}>Draw (12%)</span>
                    <span style={{ fontSize: 12, padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-line)', background: 'var(--bg-surface-raised)', fontWeight: 700 }}>France Wins (24%)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Output /caricature */}
            {activeCmd === '/caricature' && (
              <div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--accent-cyan)', marginBottom: 6 }}>👉 request: POST /v1/caricature/generate</div>
                <div className="console-caricature-row" style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-primary)', display: 'flex', gap: 14, alignItems: 'center' }}>
                  <Image src="/images/messi_kick.jpg" alt="Messi Caricature" width={100} height={100} style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-line)' }} />
                  <div>
                    <b>🎨 Claim Collectible Memorabilia</b><br />
                    Lionel Messi&apos;s bicycle kick rendered into a caricature. Claim this digital collectible using 200 SSU Loyalty Points.<br />
                    <span className="mono" style={{ fontSize: 11, color: 'var(--accent-amber)', fontWeight: 700 }}>Engine: caricature-diffusion-v2</span>
                  </div>
                </div>
              </div>
            )}

            {/* Output /odds */}
            {activeCmd === '/odds' && (
              <div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--accent-cyan)', marginBottom: 6 }}>👉 request: GET /v1/odds/consensus?match_id=wc_m12</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-primary)' }}>
                  <b>📈 TxLINE Odds Shift Alert</b><br />
                  USA vs ENG consensus odds shifted. Use SSU points to buy protection or boost your prediction stakes.<br /><br />
                  <div className="mono" style={{ fontSize: 12, background: 'var(--bg-surface)', padding: '10px 14px', border: '1px solid var(--border-line)', borderRadius: 6, lineHeight: 1.45 }}>
                    ENG Probability: 54% ➔ 31% (-23%)<br />
                    USA Probability: 31% ➔ 54% (+23%)
                  </div>
                </div>
              </div>
            )}

            {/* Output /leaderboard */}
            {activeCmd === '/leaderboard' && (
              <div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--accent-cyan)', marginBottom: 6 }}>👉 request: GET /v1/leaderboard/scores</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-primary)' }}>
                  <b>🏆 Community Fan Standings</b><br />
                  Loyalty scores tracked and verified via Solana blockchain contracts.<br /><br />
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '6px 0' }}>1. @SassMaster</td><td style={{ textAlign: 'right', color: 'var(--accent-amber)' }}>1,480 Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '6px 0' }}>2. @El_Pundit</td><td style={{ textAlign: 'right', color: 'var(--accent-amber)' }}>1,210 Pts</td></tr>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '6px 0' }}>3. @GoonerWitty</td><td style={{ textAlign: 'right', color: 'var(--accent-amber)' }}>980 Pts</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
