import { useMemo, useState } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import { sfx } from '@/engine/audio/sound';
import ItemPic from '@/engine/ui/ItemPic';

interface Tile {
  key: number;
  letter: string;
}

/**
 * "Susun Kata": tap the letters in order to spell the word (ported from
 * Petualangan Pintar). A picture cues the word; the tray mixes the word's
 * letters with decoy letters (design rule: never monotone — the child must
 * pick the right letters, not tap everything). Tapping the correct next
 * letter fills the slot; a wrong letter shakes and counts as a miss.
 */
export default function Spell({ level, onCorrect, onWrong }: TemplateProps<'spell'>) {
  const { word, emoji, decoys, item } = level.data;
  const letters = word.split('');

  // Build the tray once per attempt: word letters + decoys, shuffled.
  const tiles = useMemo<Tile[]>(() => {
    const all = [...letters, ...decoys];
    return all
      .map((letter, i) => ({ key: i, letter }))
      .sort(() => Math.random() - 0.5);
  }, [level]); // eslint-disable-line react-hooks/exhaustive-deps -- reshuffle per attempt

  const [filled, setFilled] = useState(0);
  const [used, setUsed] = useState<Set<number>>(new Set());
  const [shakeKey, setShakeKey] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  function tap(tile: Tile) {
    if (solved || used.has(tile.key)) return;
    if (tile.letter === letters[filled]) {
      sfx('tap');
      const nextFilled = filled + 1;
      setUsed((prev) => new Set(prev).add(tile.key));
      setFilled(nextFilled);
      if (nextFilled === letters.length) {
        setSolved(true);
        window.setTimeout(onCorrect, 400);
      }
    } else {
      sfx('tap');
      setShakeKey(tile.key);
      window.setTimeout(() => setShakeKey(null), 450);
      onWrong();
    }
  }

  return (
    <>
      <div className="game-prompt">{level.narration}</div>
      <div className="game-area">
        {item ? (
          <div className="spell-picture spell-picture--img" aria-hidden>
            <ItemPic
              id={item}
              className="spell-picture__img"
              fallbackClassName="spell-picture__emoji"
            />
          </div>
        ) : (
          <div className="spell-picture" aria-hidden>
            {emoji}
          </div>
        )}
        <div className="spell-slots" aria-label={`Kata ${word}`}>
          {letters.map((ch, i) => (
            <span
              key={i}
              className={'spell-slot' + (i < filled ? ' spell-slot--filled' : '')}
              aria-hidden
            >
              {i < filled ? ch : ''}
            </span>
          ))}
        </div>
        <div className="spell-tray">
          {tiles.map((tile) => (
            <button
              key={tile.key}
              type="button"
              className={
                'spell-letter' +
                (used.has(tile.key) ? ' spell-letter--used' : '') +
                (shakeKey === tile.key ? ' spell-letter--shake' : '')
              }
              onClick={() => tap(tile)}
            >
              {tile.letter}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
