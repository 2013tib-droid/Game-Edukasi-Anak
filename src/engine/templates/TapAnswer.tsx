import { useMemo, useState } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import { sfx } from '@/engine/audio/sound';

/** Pick the one correct answer out of 2–4 big cards. */
export default function TapAnswer({ level, onCorrect, onWrong }: TemplateProps<'tap-answer'>) {
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  // Shuffle once per level attempt so the correct card moves around.
  const choices = useMemo(
    () => [...level.data.choices].sort(() => Math.random() - 0.5),
    [level],
  );

  function handleTap(id: string, correct: boolean | undefined) {
    if (solved) return;
    if (correct) {
      setSolved(true);
      onCorrect();
    } else {
      sfx('tap');
      setShakeId(id);
      window.setTimeout(() => setShakeId(null), 450);
      onWrong();
    }
  }

  return (
    <>
      <div className="game-prompt">{level.narration}</div>
      <div className="game-area">
        {level.data.picture && (
          <div className="ta-picture" aria-hidden>
            {level.data.picture}
          </div>
        )}
        {level.data.board && (
          <div className="ta-board" aria-hidden>
            {/* Split on normal spaces into atomic tokens; operators are glued
                to their group with non-breaking spaces in the config, so each
                token stays whole and a wrap breaks only between equation
                halves — never mid-group. */}
            {level.data.board.split(' ').map((token, i) => (
              <span key={i} className="ta-board__tok">
                {token}
              </span>
            ))}
          </div>
        )}
        <div className="choice-grid">
          {choices.map((c) => (
            <button
              key={c.id}
              type="button"
              className={'choice-card' + (shakeId === c.id ? ' choice-card--shake' : '')}
              onClick={() => handleTap(c.id, c.correct)}
            >
              {c.emoji && <span aria-hidden>{c.emoji}</span>}
              {c.text && <span className="choice-text">{c.text}</span>}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
