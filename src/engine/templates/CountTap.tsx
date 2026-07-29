import { useMemo, useState } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import { sfx } from '@/engine/audio/sound';

interface Cell {
  key: number;
  emoji: string;
  isTarget: boolean;
}

/**
 * "Ketuk N <benda>": tap exactly N target items, then press "Sudah!".
 * Design rule (CLAUDE.md): the board always mixes decoy kinds AND shows
 * more targets than asked — the child must recognize the right item AND
 * stop counting at the asked number.
 */
export default function CountTap({ level, onCorrect, onWrong }: TemplateProps<'count-tap'>) {
  const { ask, target, targetCount, decoys } = level.data;
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [solved, setSolved] = useState(false);

  const cells = useMemo<Cell[]>(() => {
    const list: Cell[] = [];
    let key = 0;
    for (let i = 0; i < targetCount; i++) {
      list.push({ key: key++, emoji: target.emoji, isTarget: true });
    }
    for (const d of decoys) {
      for (let i = 0; i < d.count; i++) {
        list.push({ key: key++, emoji: d.emoji, isTarget: false });
      }
    }
    return list.sort(() => Math.random() - 0.5);
  }, [level]); // eslint-disable-line react-hooks/exhaustive-deps -- reshuffle per level attempt

  function toggle(cellKey: number) {
    if (solved) return;
    sfx('tap');
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(cellKey)) next.delete(cellKey);
      else next.add(cellKey);
      return next;
    });
  }

  function submit() {
    if (solved) return;
    const pickedCells = cells.filter((c) => picked.has(c.key));
    const targetsPicked = pickedCells.filter((c) => c.isTarget).length;
    const decoysPicked = pickedCells.length - targetsPicked;
    if (targetsPicked === ask && decoysPicked === 0) {
      setSolved(true);
      onCorrect();
    } else {
      onWrong();
    }
  }

  return (
    <>
      <div className="game-prompt">
        Ketuk {ask} {target.label}!
      </div>
      <div className="game-area">
        {/* Fewer columns whenever the board allows it: the screen has height
            to spare, and a cell's WIDTH is what sets how big the fruit looks.
            Three columns for a short board, four only when it would otherwise
            grow too tall. */}
        <div
          className="choice-grid count-grid"
          style={{ gridTemplateColumns: `repeat(${cells.length <= 9 ? 3 : 4}, 1fr)` }}
        >
          {cells.map((c) => (
            <button
              key={c.key}
              type="button"
              className={
                'choice-card count-cell' + (picked.has(c.key) ? ' choice-card--selected' : '')
              }
              onClick={() => toggle(c.key)}
            >
              <span className="choice-emoji" aria-hidden>
                {c.emoji}
              </span>
            </button>
          ))}
        </div>
        <button
          className="btn btn--primary"
          style={{ marginTop: 20, alignSelf: 'center', fontSize: 24 }}
          onClick={submit}
        >
          ✅ Sudah!
        </button>
      </div>
    </>
  );
}
