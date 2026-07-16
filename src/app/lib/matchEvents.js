/**
 * Canonical structured match-event schema, shared by the simulated
 * event generator (dashboard demo data) and any future real TxLINE
 * Scores-feed integration. `type` maps 1:1 to TxLINE's real Scores
 * feed taxonomy (goal, card, corner, penalty, VAR review, free-kick
 * danger levels, substitution, injury, game-phase state).
 *
 * @typedef {'goal'|'card'|'corner'|'penalty'|'var'|'substitution'|'injury'|'phase'} MatchEventType
 * @typedef {'home'|'away'} TeamSide
 *
 * @typedef {Object} MatchEvent
 * @property {string} id
 * @property {string} matchId
 * @property {MatchEventType} type
 * @property {number} minute
 * @property {TeamSide} team
 * @property {string} [player]
 * @property {{color: 'yellow'|'red'|'second-yellow'}} [card]
 * @property {{outcome: 'scored'|'missed'|'retake'}} [penalty]
 * @property {{reviewType: 'goal'|'penalty'|'red-card'|'mistaken-identity', outcome: 'confirmed'|'overturned'|'stand'}} [var]
 * @property {{danger: 'safe'|'attack'|'danger'|'highdanger'}} [freeKick]
 * @property {{playerOut: string, playerIn: string}} [substitution]
 * @property {{state: 'kickoff'|'halftime'|'fulltime'|'extra-time'|'penalties'}} [phase]
 * @property {'simulated'|'txodds-live'} source
 * @property {number} timestamp
 */

let seq = 0;

/**
 * Assigns a locally-unique, monotonically increasing id suffix.
 * Avoids Math.random()-based ids so simulated events stay
 * deterministic and easy to test/dedupe.
 */
function nextId(matchId) {
  seq += 1;
  return `${matchId}-${seq}`;
}

/**
 * Icon/color mapping for the PRD's "icon/emoji momentum + alert
 * indicators" requirement. Colors reference the existing
 * --signal-* CSS variables already defined in base.css, so the UI
 * layer stays on the established design-token system.
 */
export const EVENT_VISUALS = {
  goal: { emoji: '⚽', signal: '--signal-success' },
  card: { emoji: '🟨', signal: '--signal-warning' }, // overridden to red below when card.color is red
  corner: { emoji: '🚩', signal: '--signal-info' },
  penalty: { emoji: '🎯', signal: '--signal-warning' },
  var: { emoji: '📺', signal: '--signal-info' },
  substitution: { emoji: '🔄', signal: '--signal-info' },
  injury: { emoji: '🩹', signal: '--signal-warning' },
  phase: { emoji: '⏱️', signal: '--signal-info' },
};

/**
 * Resolves the visual (emoji + CSS signal var) for a given event,
 * accounting for type-specific variants (e.g. red card vs yellow).
 * @param {MatchEvent} event
 */
export function getEventVisual(event) {
  if (event.type === 'card' && event.card?.color === 'red') {
    return { emoji: '🟥', signal: '--signal-error' };
  }
  if (event.type === 'card' && event.card?.color === 'second-yellow') {
    return { emoji: '🟨🟥', signal: '--signal-error' };
  }
  if (event.type === 'penalty' && event.penalty?.outcome === 'missed') {
    return { emoji: '❌', signal: '--signal-error' };
  }
  return EVENT_VISUALS[event.type] ?? { emoji: 'ℹ️', signal: '--signal-info' };
}

/**
 * Builds a fully-formed simulated MatchEvent. `source: 'simulated'`
 * is set unconditionally here so simulated events can never be
 * mistaken for real TxLINE data downstream (e.g. when checking
 * "no odds/price data shown to user" compliance).
 *
 * @param {string} matchId
 * @param {MatchEventType} type
 * @param {Partial<MatchEvent>} fields
 * @returns {MatchEvent}
 */
export function createSimulatedEvent(matchId, type, fields = {}) {
  return {
    id: nextId(matchId),
    matchId,
    type,
    minute: fields.minute ?? 0,
    team: fields.team ?? 'home',
    source: 'simulated',
    timestamp: Date.now(),
    ...fields,
  };
}
