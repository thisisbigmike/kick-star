'use client';

/**
 * Zero-text-input club/identity picker. Tapping a badge is the
 * entire onboarding interaction — no typed fields anywhere, per the
 * PRD's "no forms, ever" constraint.
 *
 * Placeholder visuals: real club-badge/player-photo art isn't
 * sourced yet (flagged in the PRD-realignment plan, Phase 6), so
 * this uses national flag emoji as a zero-text, universally
 * recognizable stand-in tied to the World Cup theme. Swappable for
 * real badge images later without changing the tap/selection logic.
 */
export const CLUBS = [
  { id: 'br', label: 'Brazil', emoji: '🇧🇷' },
  { id: 'ar', label: 'Argentina', emoji: '🇦🇷' },
  { id: 'fr', label: 'France', emoji: '🇫🇷' },
  { id: 'ng', label: 'Nigeria', emoji: '🇳🇬' },
  { id: 'de', label: 'Germany', emoji: '🇩🇪' },
  { id: 'pt', label: 'Portugal', emoji: '🇵🇹' },
  { id: 'es', label: 'Spain', emoji: '🇪🇸' },
  { id: 'gh', label: 'Ghana', emoji: '🇬🇭' },
];

export default function ClubPicker({ selectedClubId, onSelect }) {
  return (
    <div
      role="listbox"
      aria-label="Choose your club"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
      }}
    >
      {CLUBS.map((club) => {
        const selected = club.id === selectedClubId;
        return (
          <button
            key={club.id}
            type="button"
            role="option"
            aria-selected={selected}
            aria-label={club.label}
            onClick={() => onSelect(club)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '14px 8px',
              borderRadius: 'var(--radius-md)',
              border: selected ? '2px solid var(--border-selected)' : '1px solid var(--border-line)',
              background: selected ? 'rgba(20, 241, 149, 0.08)' : 'var(--bg-surface-raised)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: '28px', lineHeight: 1 }}>{club.emoji}</span>
          </button>
        );
      })}
    </div>
  );
}
