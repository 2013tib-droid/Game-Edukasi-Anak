import { useMemo, useState } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { BoardOp } from '@/engine/core/types';
import { sfx } from '@/engine/audio/sound';
import Shape from '@/engine/ui/Shape';
import { ITEMS, itemImageUrl } from '@/engine/ui/items';

/** Human-readable operator glyphs for equation picture boards. */
const OP_GLYPH: Record<BoardOp, string> = {
  plus: '+',
  minus: '−',
  equals: '=',
  arrow: '→',
  question: '?',
};

/**
 * One item picture on a board. Renders the image asset; if it is missing
 * (e.g. art not shipped yet) it degrades to the item's emoji so the board is
 * never blank.
 */
function BoardItemPic({ id }: { id: string }) {
  const [failed, setFailed] = useState(false);
  const def = ITEMS[id];
  if (failed || !def) {
    return (
      <span className="ta-board__emoji" aria-hidden>
        {def?.emoji ?? '❓'}
      </span>
    );
  }
  return (
    <img
      className="ta-board__img"
      src={itemImageUrl(id)}
      alt=""
      aria-hidden
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

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
          <div
            className={'ta-picture' + (level.data.silhouette ? ' ta-picture--silhouette' : '')}
            aria-hidden
          >
            {level.data.picture}
          </div>
        )}
        {level.data.sequence && (
          <div className="ta-sequence" aria-hidden>
            {level.data.sequence.map((u, i) =>
              u ? (
                <div key={i} className="ta-seq-cell">
                  <Shape kind={u.kind} color={u.color} size={52} />
                </div>
              ) : (
                <div key={i} className="ta-seq-cell ta-seq-cell--q">
                  ?
                </div>
              ),
            )}
          </div>
        )}
        {level.data.boardItems && (
          <div className="ta-board ta-board--pics" aria-hidden>
            {level.data.boardItems.map((tok, i) =>
              'op' in tok ? (
                <span key={i} className="ta-board__op">
                  {OP_GLYPH[tok.op]}
                </span>
              ) : (
                <span key={i} className="ta-board__group">
                  {Array.from({ length: tok.count }, (_, n) => (
                    <BoardItemPic key={n} id={tok.item} />
                  ))}
                </span>
              ),
            )}
          </div>
        )}
        {level.data.board && !level.data.boardItems && (
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
              {c.shape && <Shape kind={c.shape.kind} color={c.shape.color} size={64} />}
              {c.emoji && <span aria-hidden>{c.emoji}</span>}
              {c.text && <span className="choice-text">{c.text}</span>}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
