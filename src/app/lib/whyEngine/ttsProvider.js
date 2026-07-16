/**
 * TTS provider adapter boundary. `speak(text, voiceId)` resolves to
 * a typed result — never throws for expected failure modes (missing
 * quota, network error) so callers can render an honest UI state
 * instead of crashing or faking audio.
 *
 * @typedef {{ status: 'ok', audioUrl: string } | { status: 'unavailable', reason: string } | { status: 'quota-exhausted' }} TTSResult
 */

const ABENA_ENDPOINT = 'https://abena.mobobi.com/playground/api/v1/tts/synthesize/';

// The PRD assumed 'nigerian_pidgin_p' / 'nigerian_pidgin_s' voice IDs.
// Neither exists as Abena's primary Nigerian Pidgin voice today —
// 'nigerian_pidgin_s' is only a legacy alias. The real voice is
// 'james_pcm' ('pcm' = ISO code for Nigerian Pidgin).
export const PIDGIN_VOICE_ID = 'james_pcm';

/**
 * Real Abena AI adapter. No API key required for the first 50
 * requests per the documented free tier — sends one if
 * ABENA_API_KEY is set, otherwise calls unauthenticated.
 *
 * @param {string} text
 * @param {string} voiceId
 * @returns {Promise<TTSResult>}
 */
export async function abenaSpeak(text, voiceId = PIDGIN_VOICE_ID) {
  const headers = { 'Content-Type': 'application/json' };
  const apiKey = process.env.NEXT_PUBLIC_ABENA_API_KEY;
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  let response;
  try {
    response = await fetch(ABENA_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text, voice: voiceId, speed: 1.0 }),
    });
  } catch (err) {
    return { status: 'unavailable', reason: 'network-error' };
  }

  if (response.status === 401 || response.status === 429) {
    return { status: 'quota-exhausted' };
  }
  if (!response.ok) {
    return { status: 'unavailable', reason: `http-${response.status}` };
  }

  const data = await response.json();
  if (data.status !== 'success' || !data.audio_base64) {
    return { status: 'unavailable', reason: 'malformed-response' };
  }

  const mime = data.mime_type || 'audio/wav';
  return { status: 'ok', audioUrl: `data:${mime};base64,${data.audio_base64}` };
}

/**
 * Fallback adapter used when no provider can be reached — always
 * reports unavailable, never fakes audio.
 * @returns {Promise<TTSResult>}
 */
export async function nullSpeak() {
  return { status: 'unavailable', reason: 'no-provider' };
}

/**
 * Selects the active TTS provider. Abena's free tier works
 * keyless, so the real adapter is always used; this indirection
 * exists so a future provider swap or the null fallback is a
 * one-line change here, not a call-site change.
 * @returns {{ speak: (text: string, voiceId?: string) => Promise<TTSResult> }}
 */
export function getTTSProvider() {
  return { speak: abenaSpeak };
}
