import { useState } from 'react';
import type { Stars } from '@/engine/core/types';

/**
 * Owner's art for the two feedback overlays. Each sentence is drawn INTO the
 * picture, so the overlay shows no text line next to it — that would only say
 * the same thing twice. The spoken lines in `GameShell` are unchanged.
 */
const PICS = {
  correct: { pic: 'hebat-benar', emoji: '🌟', text: 'Hebat! Kamu benar!' },
  wrong: { pic: 'coba-lagi', emoji: '💪', text: 'Coba lagi, kamu pasti bisa!' },
} as const;

/**
 * One feedback picture, degrading to the old emoji + text if the asset is
 * missing — same graceful-degradation contract as `ItemPic` and `MascotPic`,
 * so an answer is never met with a blank screen.
 */
function FeedbackPic({ kind }: { kind: 'correct' | 'wrong' }) {
  const [failed, setFailed] = useState(false);
  const { pic, emoji, text } = PICS[kind];
  if (failed) {
    return (
      <>
        <div className="feedback-emoji">{emoji}</div>
        <div className="feedback-text">{text}</div>
      </>
    );
  }
  return (
    <img
      className="feedback-pic"
      src={`${import.meta.env.BASE_URL}assets/feedback/${pic}.webp`}
      alt={text}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

export function FeedbackOverlay({ kind }: { kind: 'correct' | 'wrong' }) {
  return (
    <div className="feedback-overlay">
      <FeedbackPic kind={kind} />
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
