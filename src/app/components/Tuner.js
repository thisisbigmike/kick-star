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

const payloads = [
  // Messi Bicycle Kick
  {
    event: "goal",
    match_id: "wc_2026_m48",
    time_elapsed: "72:14",
    scorer: {
      name: "Lionel Messi",
      team: "ARG",
      method: "bicycle_kick"
    },
    market_state: {
      odds_provider: "Consensus odds",
      probability: {
        ARG_win: 0.82,
        draw: 0.12,
        FRA_win: 0.06
      },
      odds_shift: {
        ARG_win: "+22%",
        FRA_win: "-20%"
      }
    }
  },
  // Maguire Own Goal
  {
    event: "own_goal",
    match_id: "wc_2026_m12",
    time_elapsed: "87:41",
    scorer: {
      name: "Harry Maguire",
      team: "ENG",
      against: "USA"
    },
    market_state: {
      odds_provider: "Consensus odds",
      probability: {
        ENG_win: 0.31,
        draw: 0.15,
        USA_win: 0.54
      },
      odds_shift: {
        ENG_win: "-38%",
        USA_win: "+35%"
      }
    }
  },
  // VAR Review
  {
    event: "var_review",
    match_id: "wc_2026_m64",
    time_elapsed: "45+3:20",
    detail: {
      reason: "possible_penalty",
      team_affected: "ESP",
      status: "in_progress"
    },
    market_state: {
      odds_provider: "Consensus odds",
      probability: {
        ESP_win: 0.45,
        draw: 0.35,
        GER_win: 0.20
      },
      odds_shift: {
        ESP_win: "-2%",
        draw: "+2%"
      }
    }
  }
];

const subjects = ['Messi Bicycle Kick', 'Maguire Own Goal', 'VAR Review'];

export default function Tuner() {
  const [stiff, setStiff] = useState(320);
  const [damp, setDamp] = useState(24);
  const [sarc, setSarc] = useState(65);
  const [commentIdx, setCommentIdx] = useState(0);
  const [bump, setBump] = useState(false);

  const tone = sarc > 75 ? 'high' : sarc > 35 ? 'med' : 'low';
  const previewText = comments[tone][commentIdx];

  // Deep clone payload to avoid mutations
  const payload = JSON.parse(JSON.stringify(payloads[commentIdx]));
  payload.market_state.stiffness = stiff;
  payload.market_state.damping = damp;
  payload.market_state.sarcasm = sarc;

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
        <div className="section-head">
          <h2>TxLINE Payload &amp; Tone Tuner</h2>
          <span className="tagline">Interact with raw TxLINE event structures. Adjust sass, stiffness, and watch the AI commentary render with spring physics.</span>
        </div>

        <div className="tuner-grid">
          {/* Left: Tuner Controls */}
          <div className="tuner-card">
            <div className="tuner-preview-label" style={{ marginBottom: 12 }}>
              Active Live Event: <span onClick={cycleSubject} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{subjects[commentIdx]}</span> (Click to cycle)
            </div>

            <div className="tuner-row">
              <label>stiffness</label>
              <input type="range" min="80" max="500" value={stiff} onChange={handleSlider(setStiff)} />
              <span>{stiff}</span>
            </div>

            <div className="tuner-row">
              <label>damping</label>
              <input type="range" min="5" max="50" value={damp} onChange={handleSlider(setDamp)} />
              <span>{damp}</span>
            </div>

            <div className="tuner-row">
              <label>sarcasm</label>
              <input type="range" min="0" max="100" value={sarc} onChange={handleSlider(setSarc)} />
              <span>{sarc}</span>
            </div>

            <div className="tuner-preview-box">
              <div className={`tuner-preview-text${bump ? ' bump' : ''}`}>{previewText}</div>
              <div className="tuner-preview-label">
                <span>tone: critically-damped sass</span>
                <span>180ms integration</span>
              </div>
            </div>
          </div>

          {/* Right: Raw TxLINE JSON Payload */}
          <div className="tuner-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="tuner-preview-label" style={{ color: 'var(--accent-cyan)', display: 'flex', justifyContent: 'space-between', alignSid: 'center', alignItems: 'center' }}>
              <span>⚡ Live TxLINE JSON Event</span>
              <span className="mono" style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: 4, border: '1px solid rgba(6, 182, 212, 0.2)' }}>txline-ws://</span>
            </div>
            <div className="tuner-preview-box" style={{ background: '#08070b', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#a9b2c3', lineHeight: 1.5, padding: 16, height: 260, overflowY: 'auto' }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(payload, null, 2)}</pre>
            </div>
            <div className="tuner-preview-label" style={{ fontSize: 10, color: 'var(--ink-dim)' }}>
              <span>Normalised schema matching all 104 matches</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
