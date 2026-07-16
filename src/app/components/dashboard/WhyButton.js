'use client';
import { useEffect, useRef, useState } from 'react';
import { generatePidginText } from '../../lib/whyEngine/pidgin';
import { getTTSProvider, PIDGIN_VOICE_ID } from '../../lib/whyEngine/ttsProvider';

/**
 * One-tap "why" button: latest MatchEvent -> Pidgin caption -> TTS
 * audio. Pre-warms the TTS voice on mount (Abena's documented
 * ~10-15s cold start on first use per voice) so the actual tap stays
 * within the PRD's <3s target.
 */
export default function WhyButton({ latestEvent, matchContext }) {
  const [state, setState] = useState('idle'); // 'idle' | 'loading' | 'unavailable' | 'quota-exhausted'
  const [caption, setCaption] = useState('');
  const audioRef = useRef(null);
  const warmedRef = useRef(false);

  useEffect(() => {
    if (warmedRef.current) return;
    warmedRef.current = true;
    // Fire-and-forget pre-warm call — absorbs Abena's first-call
    // model-load latency before the user ever taps.
    getTTSProvider().speak('.', PIDGIN_VOICE_ID).catch(() => {});
  }, []);

  const handleTap = async () => {
    if (!latestEvent || state === 'loading') return;

    const text = generatePidginText(latestEvent, matchContext);
    setCaption(text);
    setState('loading');

    const tapStartedAt = Date.now();
    const result = await getTTSProvider().speak(text, PIDGIN_VOICE_ID);

    if (result.status === 'ok') {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(result.audioUrl);
      audioRef.current = audio;
      audio.play().catch(() => {});
      // Dev-only latency check against the PRD's <3s tap-to-audio target.
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[WhyEngine] tap-to-audio: ${Date.now() - tapStartedAt}ms`);
      }
      setState('idle');
    } else if (result.status === 'quota-exhausted') {
      setState('quota-exhausted');
    } else {
      setState('unavailable');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button
        className="glowing-card"
        onClick={handleTap}
        disabled={!latestEvent || state === 'loading'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '10px 18px',
          cursor: latestEvent ? 'pointer' : 'not-allowed',
          opacity: latestEvent ? 1 : 0.5,
          color: 'var(--accent-violet)',
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        {state === 'loading' ? '🔊 Loading...' : '🔊 Why?'}
      </button>

      {caption && (
        <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-secondary)', lineHeight: 1.4 }}>
          💬 {caption}
        </div>
      )}

      {state === 'quota-exhausted' && (
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--signal-warning)' }}>
          Voice quota reached for this demo session — text still works.
        </div>
      )}
      {state === 'unavailable' && (
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-dim)' }}>
          Voice unavailable right now — text still works.
        </div>
      )}
    </div>
  );
}
