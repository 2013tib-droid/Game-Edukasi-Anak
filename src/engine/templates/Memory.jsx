import { useMemo, useRef, useState } from 'react';
import PromptBar from '../ui/PromptBar.jsx';
import { shuffle } from '../core/utils.js';

// Template "memory": flip cards, find matching pairs.
// level: { prompt?, pairs: ['🐰', '🐸', ...] }  (each entry becomes 2 cards)
export default function Memory({ level, onCorrect, onWrong, onComplete }) {
  const cards = useMemo(
    () => shuffle(level.pairs.flatMap((emoji) => [emoji, emoji])).map((emoji, i) => ({ id: i, emoji })),
    [level]
  );
  const [open, setOpen] = useState([]); // ids of currently flipped (max 2)
  const [matched, setMatched] = useState(() => new Set());
  const lockRef = useRef(false);

  function flip(card) {
    if (lockRef.current || matched.has(card.id) || open.includes(card.id)) return;
    const nextOpen = [...open, card.id];
    setOpen(nextOpen);
    if (nextOpen.length < 2) return;

    lockRef.current = true;
    const [a, b] = nextOpen.map((id) => cards.find((c) => c.id === id));
    if (a.emoji === b.emoji) {
      const nextMatched = new Set(matched);
      nextMatched.add(a.id).add(b.id);
      onCorrect();
      setTimeout(() => {
        setMatched(nextMatched);
        setOpen([]);
        lockRef.current = false;
        if (nextMatched.size === cards.length) onComplete();
      }, 600);
    } else {
      onWrong();
      setTimeout(() => {
        setOpen([]);
        lockRef.current = false;
      }, 900);
    }
  }

  return (
    <div className="template">
      <PromptBar text={level.prompt ?? 'Temukan pasangan kartu yang sama!'} speak={level.speak} audioSrc={level.audioSrc} />
      <div className="memory-grid">
        {cards.map((card) => {
          const faceUp = open.includes(card.id) || matched.has(card.id);
          return (
            <button
              key={card.id}
              type="button"
              className={`memory-card ${faceUp ? 'memory-card-up' : ''} ${matched.has(card.id) ? 'memory-card-matched' : ''}`}
              onClick={() => flip(card)}
              aria-label={faceUp ? card.emoji : 'Kartu tertutup'}
            >
              {faceUp ? card.emoji : '❓'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
