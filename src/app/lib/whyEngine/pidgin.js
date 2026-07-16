/**
 * Deterministic Pidgin text templates keyed by MatchEvent type/outcome.
 * Template lookup is instant, so all latency budget goes to the TTS
 * call itself — this is what makes the PRD's <3s tap-to-audio target
 * achievable.
 *
 * @param {import('../matchEvents').MatchEvent} event
 * @param {{ teamName: (side: 'home'|'away') => string }} matchContext
 * @returns {string}
 */
export function generatePidginText(event, matchContext) {
  const team = matchContext.teamName(event.team);
  const player = event.player || team;

  switch (event.type) {
    case 'goal':
      return `Goal! ${player} don score for ${team} for minute ${event.minute}. Naija boy dey shake body!`;

    case 'card':
      if (event.card?.color === 'red' || event.card?.color === 'second-yellow') {
        return `Wahala! ${player} of ${team} just see red card for minute ${event.minute}. Dem go play with one man less.`;
      }
      return `${player} of ${team} enter book for minute ${event.minute}. Referee no gree body.`;

    case 'corner':
      return `${team} get corner kick for minute ${event.minute}. Dem dey push for goal now.`;

    case 'penalty':
      if (event.penalty?.outcome === 'scored') {
        return `Penalty and na goal! ${player} no miss am for minute ${event.minute}.`;
      }
      if (event.penalty?.outcome === 'missed') {
        return `Penalty miss o! ${player} no fit convert am for minute ${event.minute}.`;
      }
      return `Penalty go dey retake for minute ${event.minute}. Tension full ground.`;

    case 'var':
      if (event.var?.outcome === 'overturned') {
        return `VAR don check am well well, dem cancel di ${event.var.reviewType} for minute ${event.minute}.`;
      }
      return `VAR dey check ${event.var?.reviewType || 'di play'} for minute ${event.minute}. Make we wait small.`;

    case 'substitution':
      return `${team} dey change player — ${event.substitution?.playerOut} comot, ${event.substitution?.playerIn} enter for minute ${event.minute}.`;

    case 'injury':
      return `${player} dey feel body for minute ${event.minute}. Medical team dey rush enter pitch.`;

    case 'phase':
      if (event.phase?.state === 'halftime') return `Na halftime be dis. Both team go rest small.`;
      if (event.phase?.state === 'fulltime') return `Match don finish o!`;
      return `Match dey continue.`;

    default:
      return `Something dey happen for minute ${event.minute}.`;
  }
}
