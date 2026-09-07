import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { PuzzleData } from '@/engine/core/types';
import { sfx } from '@/engine/audio/sound';
import ItemPic from '@/engine/ui/ItemPic';

/**
 * How big a tray piece is next to the board cell it belongs in. Smaller so the
 * tray costs less height on a 360×640 phone (six pieces need two rows), but
 * never so small the child loses the picture on it — `pieceBox()` still floors
 * it at the 64px touch target from the child-UX rules.
 */
const TRAY_SCALE = 0.8;
/** Minimum touch target, per the child-UX rules in CLAUDE.md. */
const MIN_TOUCH = 64;
/** How long the finished picture stays whole before the shell moves on. */
const DONE_MS = 800;
/** Gap between tray pieces — must match `.pz-tray` in engine.css. */
const TRAY_GAP = 10;
/**
 * Sideways, the tray moves BESIDE the board (see `.pz-play` in engine.css).
 * Must match the media query there.
 */
const LANDSCAPE = '(min-aspect-ratio: 4/3)';
/**
 * Screen height that is NOT the board and tray, apart from the question text:
 * the top bar, the gaps between blocks, page padding. The question is measured
 * instead of guessed because a long sentence wraps to three lines on a narrow
 * phone — a guessed cost is exactly what made a 320×568 screen scroll by 2px.
 * Both numbers were measured at 320×568 (upright) and 740×360 (sideways).
 */
const CHROME_STACKED = 150;
const CHROME_WIDE = 120;

/** Fisher-Yates on a copy. */
function shuffled<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * Tray order. A tray that comes out in board order looks like the puzzle is
 * already solved, so a small board reshuffles rather than ship that.
 */
function trayOrder(n: number): number[] {
  for (let tries = 0; tries < 8; tries += 1) {
    const order = shuffled([...Array(n).keys()]);
    if (order.some((piece, i) => piece !== i)) return order;
  }
  return [...Array(n).keys()].reverse();
}

/**
 * The WHOLE picture, drawn to fill whatever box it is given. Both the faint
 * guide behind the board and every single piece render this same element —
 * that is what makes a puzzle cost no new assets: the browser downloads one
 * image and reuses it.
 *
 * `object-fit: cover` (in engine.css) is what keeps art of any shape
 * undistorted; the board simply crops it.
 */
function Picture({ data }: { data: PuzzleData }) {
  if (data.art) {
    return (
      <img
        className="pz-pic"
        src={`${import.meta.env.BASE_URL}assets/story/${data.art}.webp`}
        alt=""
        aria-hidden
        draggable={false}
      />
    );
  }
  return (
    <div className="pz-pic pz-pic--panel" style={{ background: data.bg }}>
      {data.item && (
        <ItemPic id={data.item} className="pz-pic__item" fallbackClassName="pz-pic__emoji" />
      )}
    </div>
  );
}

/**
 * One slice of the picture: the picture blown up to board size inside a box the
 * size of one cell, shifted so only this piece's share shows.
 *
 * The percentages do the arithmetic: the layer is `cols`×`rows` times its box,
 * and a translate of `-100% / cols * c` moves it left by exactly one cell — so
 * this works at any board size, and a tray piece is the same slice at a smaller
 * scale.
 */
function Slice({ data, index }: { data: PuzzleData; index: number }) {
  const c = index % data.cols;
  const r = Math.floor(index / data.cols);
  return (
    <div
      className="pz-slice"
      style={{
        width: `${data.cols * 100}%`,
        height: `${data.rows * 100}%`,
        transform: `translate(${(-100 * c) / data.cols}%, ${(-100 * r) / data.rows}%)`,
      }}
    >
      <Picture data={data} />
    </div>
  );
}

export default function Puzzle({ level, onCorrect, onWrong }: TemplateProps<'puzzle'>) {
  const data = level.data;
  const { cols, rows } = data;
  const count = cols * rows;

  const [order] = useState(() => trayOrder(count));
  const [placed, setPlaced] = useState<Set<number>>(new Set());
  const [drag, setDrag] = useState<{ piece: number; x: number; y: number } | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [missed, setMissed] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const trayRef = useRef<HTMLDivElement | null>(null);
  const promptRef = useRef<HTMLDivElement | null>(null);
  const cellRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const missTimer = useRef<number | undefined>(undefined);

  // Sideways the tray sits beside the board, so it must NOT reserve height:
  // that reserved block is what keeps a stacked board from sliding, and here it
  // would only push the board off a 360px-tall screen.
  const [wide, setWide] = useState(
    () => typeof matchMedia !== 'undefined' && matchMedia(LANDSCAPE).matches,
  );
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return;
    const mq = matchMedia(LANDSCAPE);
    const sync = () => setWide(mq.matches);
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Cell size in px, so a tray piece can be drawn at the same shape as the hole
  // it fits. Measured rather than derived: the board is clamped by height on
  // short phones, so its aspect isn't always cols/rows.
  const [cell, setCell] = useState<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0) setCell({ w: r.width / cols, h: r.height / rows });
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cols, rows]);

  // Height of the question text, subtracted from the space the board may use.
  // Safe to measure: it depends only on the sentence and the screen width, not
  // on the board, so there is no measuring loop.
  const [promptH, setPromptH] = useState(56);
  useLayoutEffect(() => {
    const el = promptRef.current;
    if (!el) return;
    const update = () => {
      const h = el.getBoundingClientRect().height;
      if (h > 0) setPromptH(h);
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function pieceBox(): { w: number; h: number } | null {
    if (!cell) return null;
    const scale = Math.min(1, Math.max(TRAY_SCALE, MIN_TOUCH / Math.min(cell.w, cell.h)));
    return { w: cell.w * scale, h: cell.h * scale };
  }

  function pieceSize(): CSSProperties | undefined {
    const box = pieceBox();
    return box ? { width: box.w, height: box.h } : undefined;
  }

  /**
   * Height the tray keeps whether or not pieces are still in it.
   *
   * A placed piece leaves the flow (`display: none`) so the rest close ranks —
   * a tray full of holes reads as broken to a child. But `.game-area` centres
   * its contents, so a tray that SHRANK would slide the board down mid-play and
   * move the very holes the child is aiming at. Reserving the full height keeps
   * the board still; it is computed from the piece size rather than measured,
   * so it is still right after the phone is rotated.
   */
  function trayHeight(): number | undefined {
    if (wide) return undefined;
    const box = pieceBox();
    const width = trayRef.current?.clientWidth ?? 0;
    if (!box || width <= 0) return undefined;
    const perRow = Math.max(1, Math.floor((width + TRAY_GAP) / (box.w + TRAY_GAP)));
    const lines = Math.ceil(count / perRow);
    return lines * box.h + (lines - 1) * TRAY_GAP;
  }

  function cellAt(x: number, y: number): number | null {
    for (const [i, el] of cellRefs.current) {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return i;
    }
    return null;
  }

  function handleDown(e: ReactPointerEvent, piece: number) {
    if (placed.has(piece) || done) return;
    e.preventDefault();
    sfx('tap');
    setDrag({ piece, x: e.clientX, y: e.clientY });
  }

  function handleMove(e: ReactPointerEvent) {
    if (!drag) return;
    setDrag({ ...drag, x: e.clientX, y: e.clientY });
    setOver(cellAt(e.clientX, e.clientY));
  }

  function handleUp(e: ReactPointerEvent) {
    if (!drag) return;
    const dropped = cellAt(e.clientX, e.clientY);
    const piece = drag.piece;
    setDrag(null);
    setOver(null);
    // Released away from the board, or onto a hole that is already filled: the
    // piece just goes home. Not a mistake — same as DragDrop.
    if (dropped === null || placed.has(dropped)) return;
    if (dropped !== piece) {
      // A mis-drop is part of solving a puzzle, like a memory-card miss, so it
      // counts toward the stars but must NOT throw the full-screen "coba lagi"
      // overlay over a child who is mid-drag.
      onWrong(true);
      sfx('wrong');
      setMissed(dropped);
      window.clearTimeout(missTimer.current);
      missTimer.current = window.setTimeout(() => setMissed(null), 450);
      return;
    }
    sfx('correct');
    const next = new Set(placed).add(piece);
    setPlaced(next);
    if (next.size === count) {
      // Let the child see the picture whole before the shell celebrates.
      setDone(true);
      window.setTimeout(onCorrect, DONE_MS);
    }
  }

  const boardStyle = {
    '--pz-ar': cols / rows,
    /*
     * How many board-heights the board plus its tray costs (see the formula in
     * `.pz-board`). The tray holds two rows of pieces at `TRAY_SCALE` × one
     * cell, so a board of TWO rows pays more than one of THREE — which is why
     * an upright board is allowed to be taller.
     *   2 rows → 1 + 2 × 0.8/2 = 1.8
     *   3 rows → 1 + 2 × 0.8/3 ≈ 1.55
     */
    '--pz-k': rows >= 3 ? 1.55 : 1.8,
    '--pz-fixed': `${CHROME_STACKED + promptH}px`,
    '--pz-fixed-wide': `${CHROME_WIDE + promptH}px`,
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
  } as CSSProperties;

  return (
    <div onPointerMove={handleMove} onPointerUp={handleUp} style={{ flex: 1 }}>
      <div className="game-prompt" ref={promptRef}>
        {level.narration}
      </div>
      <div className="game-area">
        <div className="pz-play">
          <div
            ref={boardRef}
            className={'pz-board' + (done ? ' pz-board--done' : '')}
            style={boardStyle}
            // Ukuran papan ditandai supaya tes headless bisa memeriksa bentuk
            // yang benar-benar tampil, bukan yang ditulis config (pola yang
            // sama dengan `data-shape` di Shape.tsx & `data-clock` di Clock.tsx).
            data-puzzle={`${cols}x${rows}`}
          >
            {/* The faint whole picture: a four-year-old needs to see WHERE each
                piece goes, otherwise a puzzle is guesswork. */}
            <div className="pz-guide" aria-hidden>
              <Picture data={data} />
            </div>
            {[...Array(count).keys()].map((i) => (
              <div
                key={i}
                data-cell={i}
                ref={(el) => {
                  if (el) cellRefs.current.set(i, el);
                  else cellRefs.current.delete(i);
                }}
                className={
                  'pz-cell' +
                  (placed.has(i) ? ' pz-cell--filled' : '') +
                  (over === i && !placed.has(i) ? ' pz-cell--over' : '') +
                  (missed === i ? ' pz-cell--missed' : '')
                }
              >
                {placed.has(i) && <Slice data={data} index={i} />}
              </div>
            ))}
          </div>

          <div className="pz-tray" ref={trayRef} style={{ minHeight: trayHeight() }}>
            {order.map((piece) => (
              <div
                key={piece}
                data-piece={piece}
                className={
                  'pz-piece' +
                  (placed.has(piece) ? ' pz-piece--placed' : '') +
                  (drag?.piece === piece ? ' pz-piece--dragging' : '')
                }
                style={
                  drag?.piece === piece ? { ...pieceSize(), left: drag.x, top: drag.y } : pieceSize()
                }
                onPointerDown={(e) => handleDown(e, piece)}
              >
                <Slice data={data} index={piece} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
