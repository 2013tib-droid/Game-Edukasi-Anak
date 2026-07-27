import { useMemo, useRef, useState } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import { sfx } from '@/engine/audio/sound';
import ItemPic from '@/engine/ui/ItemPic';

interface Card {
  key: number;
  pairId: string;
  emoji: string;
  /** Registry item id — when present the face is real art, not emoji. */
  item?: string;
}

/** Classic pair-matching. Misses count silently (part of normal play). */
export default function Memory({ level, onCorrect, onWrong }: TemplateProps<'memory'>) {
  const cards = useMemo<Card[]>(() => {
    const doubled = level.data.pairs.flatMap((p, i) => [
      { key: i * 2, pairId: p.id, emoji: p.emoji, item: p.item },
      { key: i * 2 + 1, pairId: p.id, emoji: p.emoji, item: p.item },
    ]);
    return doubled.sort(() => Math.random() - 0.5);
  }, [level]); // eslint-disable-line react-hooks/exhaustive-deps

  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const busy = useRef(false);

  function flip(card: Card) {
    if (busy.current || open.includes(card.key) || matched.has(card.pairId)) return;
    sfx('tap');
    const nowOpen = [...open, card.key];
    setOpen(nowOpen);
    if (nowOpen.length === 2) {
      const [a, b] = nowOpen.map((k) => cards.find((c) => c.key === k)!);
      if (a.pairId === b.pairId) {
        const nextMatched = new Set(matched).add(a.pairId);
        setMatched(nextMatched);
        setOpen([]);
        sfx('correct');
        if (nextMatched.size === level.data.pairs.length) {
          window.setTimeout(onCorrect, 350);
        }
      } else {
        busy.current = true;
        onWrong(true); // silent: misses shouldn't trigger the retry overlay
        window.setTimeout(() => {
          setOpen([]);
          busy.current = false;
        }, 850);
      }
    }
  }

  const cols = cards.length <= 6 ? 3 : 4;

  return (
    <>
      <div className="game-prompt">{level.narration}</div>
      <div className="game-area">
        <div className="choice-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {cards.map((card) => {
            const isUp = open.includes(card.key) || matched.has(card.pairId);
            return (
              <button
                key={card.key}
                type="button"
                className="choice-card memory-card"
                onClick={() => flip(card)}
                aria-label={isUp ? card.emoji : 'Kartu tertutup'}
              >
                {isUp ? (
                  <span
                    className={
                      'memory-face' + (matched.has(card.pairId) ? ' memory-face--matched' : '')
                    }
                    aria-hidden
                  >
                    {card.item ? (
                      <ItemPic
                        id={card.item}
                        className="memory-face__img"
                        fallbackClassName="memory-face__emoji"
                      />
                    ) : (
                      card.emoji
                    )}
                  </span>
                ) : (
                  <span className="memory-face memory-face--down" aria-hidden>
                    ❓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
