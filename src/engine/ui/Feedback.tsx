import type { Stars } from '@/engine/core/types';

export function FeedbackOverlay({ kind }: { kind: 'correct' | 'wrong' }) {
  return kind === 'correct' ? (
    <div className="feedback-overlay">
      <div className="feedback-emoji">🌟</div>
      <div className="feedback-text">Hebat! Kamu benar!</div>
    </div>
  ) : (
    <div className="feedback-overlay">
      <div className="feedback-emoji">💪</div>
      <div className="feedback-text">Coba lagi, kamu pasti bisa!</div>
    </div>
  );
}

export function StarsRow({ stars }: { stars: Stars }) {
  return (
    <div className="stars-row" aria-label={`${stars} bintang`}>
      {'⭐'.repeat(stars)}
      {'☆'.repeat(3 - stars)}
    </div>
  );
}

export function LevelDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="level-dots">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={
            'level-dot' +
            (i < current ? ' level-dot--done' : i === current ? ' level-dot--active' : '')
          }
        />
      ))}
    </div>
  );
}

/** Speaker button — replays the narrated instruction (UX rule: all voiced). */
export function SpeakButton({ onSpeak }: { onSpeak: () => void }) {
  return (
    <button
      type="button"
      className="btn"
      style={{ minHeight: 56, minWidth: 56, padding: 8, fontSize: 26 }}
      onClick={onSpeak}
      aria-label="Dengarkan instruksi"
    >
      🔊
    </button>
  );
}
