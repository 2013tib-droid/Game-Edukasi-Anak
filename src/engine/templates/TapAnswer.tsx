import { useMemo, useState } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { BoardOp } from '@/engine/core/types';
import { sfx } from '@/engine/audio/sound';
import Shape from '@/engine/ui/Shape';
import ItemPic from '@/engine/ui/ItemPic';

/** Human-readable operator glyphs for equation picture boards. */
const OP_GLYPH: Record<BoardOp, string> = {
  plus: '+',
  minus: '−',
  equals: '=',
  arrow: '→',
  question: '?',
};

/** Pick the one correct answer out of 2–4 big cards. */
export default function TapAnswer({ level, onCorrect, onWrong }: TemplateProps<'tap-answer'>) {
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  // Shuffle once per level attempt so the correct card moves around.
  const choices = useMemo(
    () => [...level.data.choices].sort(() => Math.random() - 0.5),
    [level],
  );

  // Total picture count on the board (animals + props like houses, ignoring
  // operators). Busy boards (subtraction: "7 ducks → 3 houses" = 10 items)
  // shrink the pictures a notch so everything fits without scrolling.
  const boardItemCount = useMemo(
    () =>
      (level.data.boardItems ?? []).reduce(
        (n, tok) => ('op' in tok ? n : n + tok.count),
        0,
      ),
    [level],
  );
  const denseBoard = boardItemCount > 6;

  // Answers that are pure pictures (fruit, objects — no letter, caption or
  // shape) get the wide two-across grid: the picture IS the answer, so card
  // width is what matters. Letter/number/shape answers keep the tight grid.
  const pictureChoices = choices.every((c) => c.emoji && !c.text && !c.shape);

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
        {level.data.pictureItem ? (
          <div
            className={
              'ta-picture ta-picture--img' +
              (level.data.silhouette ? ' ta-picture--silhouette' : '')
            }
            aria-hidden
          >
            <ItemPic
              id={level.data.pictureItem}
              className="ta-picture__img"
              fallbackClassName="ta-picture__emoji"
            />
          </div>
        ) : (
          level.data.picture && (
            <div
              className={'ta-picture' + (level.data.silhouette ? ' ta-picture--silhouette' : '')}
              aria-hidden
            >
              {level.data.picture}
            </div>
          )
        )}
        {level.data.sequence && (
          <div className="ta-sequence" aria-hidden>
            {level.data.sequence.map((u, i) =>
              u ? (
                <div key={i} className="ta-seq-cell">
                  <Shape kind={u.kind} color={u.color} size={52} className="ta-seq-shape" />
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
          <div
            className={'ta-board ta-board--pics' + (denseBoard ? ' ta-board--dense' : '')}
            aria-hidden
          >
            {level.data.boardItems.map((tok, i) =>
              'op' in tok ? (
                <span key={i} className="ta-board__op">
                  {OP_GLYPH[tok.op]}
                </span>
              ) : (
                <span key={i} className="ta-board__group">
                  {Array.from({ length: tok.count }, (_, n) => (
                    <ItemPic
                      key={n}
                      id={tok.item}
                      className="ta-board__img"
                      fallbackClassName="ta-board__emoji"
                    />
                  ))}
                </span>
              ),
            )}
          </div>
        )}
        {/* The same sum written in numbers, under the pictures the child just
            counted — the bridge from "this many" to "3 + 3 = ?". */}
        {level.data.equation && (
          <div className={'ta-equation' + (denseBoard ? ' ta-equation--dense' : '')} aria-hidden>
            {level.data.equation}
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
        <div className={'choice-grid' + (pictureChoices ? ' choice-grid--pics' : '')}>
          {choices.map((c) => (
            <button
              key={c.id}
              type="button"
              className={'choice-card' + (shakeId === c.id ? ' choice-card--shake' : '')}
              onClick={() => handleTap(c.id, c.correct)}
            >
              {c.shape && (
                <Shape
                  kind={c.shape.kind}
                  color={c.shape.color}
                  size={64}
                  className="choice-shape"
                />
              )}
              {c.emoji && (
                <span className="choice-emoji" aria-hidden>
                  {c.emoji}
                </span>
              )}
              {c.text && (
                // A text answer with no emoji (a letter/number) is the main
                // visual — render it big. With an emoji it's just a caption.
                <span className={c.emoji ? 'choice-text' : 'choice-text choice-text--main'}>
                  {c.text}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
