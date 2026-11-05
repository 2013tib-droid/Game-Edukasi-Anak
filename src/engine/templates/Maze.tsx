import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import {
  MAZE_LINES,
  OPEN_N,
  OPEN_W,
  canStep,
  colOf,
  nextRoute,
  openNeighbors,
  rowOf,
  shortestPath,
  type MazeGrid,
} from '@/engine/core/maze';
import { sfx } from '@/engine/audio/sound';
import { buzz, sparkleAt } from '@/engine/ui/juice';
import ItemPic from '@/engine/ui/ItemPic';
import Scene from '@/engine/ui/Scene';
import '@/engine/ui/maze.css';

/**
 * LABIRIN (`maze`, Taman Labirin). Kontrak datanya `MazeData` (types.ts),
 * mesinnya `core/maze.ts`.
 *
 * - Anak MENARIK tokoh dengan jari. Jejak kuning mengikuti jarinya petak demi
 *   petak; menyeret balik ke petak yang sudah dilewati = mundur. Mengetuk
 *   petak yang segaris lorong (atau dua langkah) juga memindahkan tokoh —
 *   jari yang cepat tak pernah "tertinggal".
 * - Dinding tidak menghukum: jari yang menabrak dinding cuma tidak bergerak.
 * - Masuk JALAN BUNTU = salah senyap (`onWrong(true)`), sekali per petak
 *   buntu, dan petak itu diberi tanda silang supaya tak dimasuki lagi.
 * - Barang (`pickups`) wajib diambil sebelum tujuan; tiba di tujuan tanpa
 *   semuanya cuma diberi tahu, TIDAK dihitung salah.
 * - Petunjuk: tombol 💡 menyalakan beberapa langkah berikutnya sebentar
 *   (gratis); P2 tingkat 1 = tiga langkah berikutnya bertanda tapak, tingkat
 *   2 = seluruh jalan ke sasaran berikutnya.
 * - ↩️ mundur ke persimpangan terakhir. "Langkah N" menghitung tiap gerak;
 *   "⭐ Jalan hemat!" kalau langkahnya tak lebih dari rute terpendek.
 */

const U = 10; // satuan per petak di SVG
const WALL = 2.6; // tebal pagar (satuan)

function wallPath(m: MazeGrid): string {
  const parts: string[] = [];
  const W = m.cols * U;
  const H = m.rows * U;
  // Garis mendatar digabung per baris supaya pagar menyambung rapi.
  for (let r = 0; r < m.rows; r += 1) {
    let run = -1;
    for (let c = 0; c <= m.cols; c += 1) {
      const wall = c < m.cols && !(m.open[r * m.cols + c]! & OPEN_N);
      if (wall && run < 0) run = c;
      if (!wall && run >= 0) {
        parts.push(`M${run * U} ${r * U}H${c * U}`);
        run = -1;
      }
    }
  }
  parts.push(`M0 ${H}H${W}`);
  for (let c = 0; c < m.cols; c += 1) {
    let run = -1;
    for (let r = 0; r <= m.rows; r += 1) {
      const wall = r < m.rows && !(m.open[r * m.cols + c]! & OPEN_W);
      if (wall && run < 0) run = r;
      if (!wall && run >= 0) {
        parts.push(`M${c * U} ${run * U}V${r * U}`);
        run = -1;
      }
    }
  }
  parts.push(`M${W} 0V${H}`);
  return parts.join('');
}

/** Bunga-bunga kecil di sudut pagar — hiasan acak-tetap per labirin. */
function flowers(m: MazeGrid): { x: number; y: number; hue: string }[] {
  const out: { x: number; y: number; hue: string }[] = [];
  const hues = ['#ff8fb1', '#ffd23f', '#ffffff', '#ff9e5e'];
  let h = m.open.reduce((a, v, i) => (a * 31 + v + i) >>> 0, 7);
  for (let r = 0; r <= m.rows; r += 1) {
    for (let c = 0; c <= m.cols; c += 1) {
      h = (Math.imul(h ^ (r * 73 + c * 151), 2654435761) >>> 0) % 1000003;
      if (h % 7 !== 0) continue;
      out.push({ x: c * U, y: r * U, hue: hues[h % hues.length]! });
    }
  }
  return out;
}

function center(m: MazeGrid, i: number) {
  return { x: (colOf(m, i) + 0.5) * U, y: (rowOf(m, i) + 0.5) * U };
}

function BulbIcon() {
  return (
    <svg viewBox="0 0 48 48" className="mz-btn__icon" aria-hidden>
      <g stroke="#ffb703" strokeWidth="3" strokeLinecap="round">
        <path d="M24 3v5M7 10l4 3.5M41 10l-4 3.5M3 25h5M40 25h5" />
      </g>
      <path d="M24 12a11 11 0 0 0-6.6 19.8c1.5 1.1 2.3 2.6 2.3 4.2h8.6c0-1.6.8-3.1 2.3-4.2A11 11 0 0 0 24 12z" fill="#ffe066" stroke="#e8a500" strokeWidth="2.4" />
      <rect x="19" y="37" width="10" height="7" rx="2.5" fill="#9aa7b8" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 48 48" className="mz-btn__icon" aria-hidden>
      <path d="M16 15H28C35 15 39 20 39 26C39 32 35 37 28 37H20" fill="none" stroke="#7b6ad8" strokeWidth="6" strokeLinecap="round" />
      <path d="M19 6L8 15L19 24Z" fill="#7b6ad8" stroke="#7b6ad8" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

export default function Maze({ level, onCorrect, onWrong, narrate, hint }: TemplateProps<'maze'>) {
  const data = level.data;
  const m: MazeGrid = useMemo(() => ({ cols: data.cols, rows: data.rows, open: data.open }), [data]);
  const pickups = useMemo(() => data.pickups ?? [], [data]);
  const walls = useMemo(() => wallPath(m), [m]);
  const deco = useMemo(() => flowers(m), [m]);

  const [trail, setTrail] = useState<number[]>([data.start]);
  const trailRef = useRef<number[]>([data.start]);
  const [got, setGot] = useState<Set<number>>(() => new Set());
  const gotRef = useRef<Set<number>>(new Set());
  const [deadSeen, setDeadSeen] = useState<Set<number>>(() => new Set());
  const deadRef = useRef<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const movesRef = useRef(0);
  const [faceLeft, setFaceLeft] = useState(false);
  const [sign, setSign] = useState<{ cell: number; key: number } | null>(null);
  const [glow, setGlow] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);
  const saidDead = useRef(false);
  const saidMissing = useRef(false);
  const dragging = useRef(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      for (const t of timers.current) window.clearTimeout(t);
    },
    [],
  );

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  /** Titik layar sebuah petak (untuk percikan). */
  function screenOf(i: number) {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: rect.left + ((colOf(m, i) + 0.5) / m.cols) * rect.width,
      y: rect.top + ((rowOf(m, i) + 0.5) / m.rows) * rect.height,
    };
  }

  function commit(next: number[]) {
    trailRef.current = next;
    setTrail(next);
  }

  function finish() {
    doneRef.current = true;
    dragging.current = false;
    setDone(true);
    setGlow([]);
    const p = screenOf(data.goal);
    sparkleAt(p.x, p.y, 14);
    buzz([20, 40, 30]);
    later(onCorrect, 520);
  }

  /** Satu langkah ke petak tetangga `next` (maju, atau mundur kalau itu petak sebelumnya). */
  function stepTo(next: number) {
    const t = trailRef.current;
    const end = t[t.length - 1]!;
    if (!canStep(m, end, next)) return false;
    const dc = colOf(m, next) - colOf(m, end);
    if (dc !== 0) setFaceLeft(dc < 0);
    movesRef.current += 1;
    setMoves(movesRef.current);
    if (t.length >= 2 && t[t.length - 2] === next) {
      commit(t.slice(0, -1));
      // Kembali ke tujuan lewat jejak sendiri (sudah lewat tujuan sebelum
      // barangnya lengkap) tetap menyelesaikan labirin.
      if (next === data.goal && gotRef.current.size >= pickups.length) finish();
      return true;
    }
    commit([...t, next]);
    sfx('tick');

    if (pickups.includes(next) && !gotRef.current.has(next)) {
      gotRef.current = new Set(gotRef.current).add(next);
      setGot(gotRef.current);
      sfx('tap');
      buzz(18);
      const p = screenOf(next);
      sparkleAt(p.x, p.y, 8);
      setGlow([]);
    }

    if (next === data.goal) {
      if (gotRef.current.size >= pickups.length) {
        finish();
      } else if (!saidMissing.current) {
        saidMissing.current = true;
        narrate(MAZE_LINES.missing);
      }
      return true;
    }

    const isDead =
      openNeighbors(m, next).length === 1 && next !== data.start && !pickups.includes(next);
    if (isDead && !deadRef.current.has(next)) {
      deadRef.current = new Set(deadRef.current).add(next);
      setDeadSeen(deadRef.current);
      setSign({ cell: next, key: Date.now() });
      later(() => setSign(null), 1500);
      sfx('wrong');
      buzz(30);
      if (!saidDead.current) {
        saidDead.current = true;
        narrate(MAZE_LINES.deadEnd);
      }
      onWrong(true);
    }
    return true;
  }

  /** Bawa jejak ke petak `cell` kalau masuk akal (segaris lorong, ≤ 2 langkah, atau mundur). */
  function reach(cell: number) {
    if (doneRef.current) return;
    const t = trailRef.current;
    const end = t[t.length - 1]!;
    if (cell === end) return;
    const back = t.lastIndexOf(cell);
    if (back >= 0) {
      // Mundur di sepanjang jejak sendiri.
      for (let i = t.length - 2; i >= back; i -= 1) stepTo(t[i]!);
      return;
    }
    let route: number[] = [];
    const er = rowOf(m, end);
    const ec = colOf(m, end);
    const cr = rowOf(m, cell);
    const cc = colOf(m, cell);
    if (er === cr || ec === cc) {
      const dr = Math.sign(cr - er);
      const dcol = Math.sign(cc - ec);
      let at = end;
      while (at !== cell) {
        const nxt = (rowOf(m, at) + dr) * m.cols + (colOf(m, at) + dcol);
        if (!canStep(m, at, nxt)) {
          route = [];
          break;
        }
        route.push(nxt);
        at = nxt;
      }
    }
    if (!route.length) {
      const sp = shortestPath(m, end, cell);
      if (sp.length >= 2 && sp.length <= 3) route = sp.slice(1);
    }
    for (const p of route) {
      if (doneRef.current) break;
      if (!stepTo(p)) break;
      // Berhenti di petak buntu / tujuan supaya tandanya terlihat.
      const last = trailRef.current[trailRef.current.length - 1];
      if (last !== p) break;
    }
  }

  function cellAt(e: ReactPointerEvent): number | null {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const c = Math.floor(((e.clientX - rect.left) / rect.width) * m.cols);
    const r = Math.floor(((e.clientY - rect.top) / rect.height) * m.rows);
    if (r < 0 || c < 0 || r >= m.rows || c >= m.cols) return null;
    return r * m.cols + c;
  }

  function down(e: ReactPointerEvent) {
    if (doneRef.current) return;
    e.preventDefault();
    const cell = cellAt(e);
    if (cell === null) return;
    dragging.current = true;
    fieldRef.current?.setPointerCapture?.(e.pointerId);
    reach(cell);
  }

  function move(e: ReactPointerEvent) {
    if (!dragging.current || doneRef.current) return;
    const cell = cellAt(e);
    if (cell !== null) reach(cell);
  }

  function up() {
    dragging.current = false;
  }

  function undo() {
    if (doneRef.current) return;
    const t = trailRef.current;
    if (t.length < 2) return;
    let i = t.length - 2;
    while (i > 0 && openNeighbors(m, t[i]!).length < 3) i -= 1;
    for (let k = t.length - 2; k >= i; k -= 1) stepTo(t[k]!);
    sfx('tap');
  }

  function bulb() {
    if (doneRef.current) return;
    const t = trailRef.current;
    const left = pickups.filter((p) => !gotRef.current.has(p));
    setGlow(nextRoute(m, t[t.length - 1]!, data.goal, left).slice(0, 5));
    sfx('tap');
    later(() => setGlow([]), 2600);
  }

  // ---- Gambar ----
  const end = trail[trail.length - 1]!;
  const left = pickups.filter((p) => !got.has(p));
  const hintCells = useMemo(() => {
    if (hint < 1 || done) return [];
    const route = nextRoute(m, end, data.goal, left);
    return hint >= 2 ? route : route.slice(0, 3);
  }, [hint, end, done, left.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const pts = trail.map((i) => {
    const p = center(m, i);
    return `${p.x},${p.y}`;
  });
  const flip = faceLeft !== (data.heroFaces === 'kiri');
  const cellStyle = (i: number): CSSProperties => ({
    left: `${(colOf(m, i) / m.cols) * 100}%`,
    top: `${(rowOf(m, i) / m.rows) * 100}%`,
    width: `${100 / m.cols}%`,
    height: `${100 / m.rows}%`,
  });
  const thrifty = done && moves <= data.par;
  const s0 = center(m, data.start);

  return (
    <div className="mz-wrap">
      <Scene id={data.scene ?? 'kebun'} />
      <div className="game-prompt mz-prompt">{level.narration}</div>
      <div className="mz-area">
        <div className="mz-bar">
          <span className="mz-chip" aria-label={`Langkah ${moves}`}>
            👣 <b>{moves}</b>
          </span>
          {pickups.length > 0 && data.pickupItem && (
            <span className="mz-chip mz-chip--bag" aria-label={`Terambil ${got.size} dari ${pickups.length}`}>
              <ItemPic id={data.pickupItem} className="mz-chip__pic" fallbackClassName="mz-chip__emoji" />
              <b>
                {got.size}/{pickups.length}
              </b>
            </span>
          )}
          <span className="mz-bar__gap" />
          <button type="button" className="mz-btn mz-btn--bulb" onClick={bulb} aria-label="Petunjuk">
            <BulbIcon />
          </button>
          <button type="button" className="mz-btn mz-btn--undo" onClick={undo} aria-label="Mundur ke simpangan">
            <UndoIcon />
          </button>
        </div>

        <div className="mz-boardbox">
          <div className="mz-board" style={{ '--mz-cols': m.cols, '--mz-rows': m.rows } as CSSProperties}>
            <div
              ref={fieldRef}
              className="mz-field"
              data-moves={moves}
              data-maze={`${m.cols}|${m.rows}|${data.open.join(',')}|${data.start}|${data.goal}|${pickups.join(',')}`}
              data-done={done ? '1' : '0'}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
            >
              <svg className="mz-svg" viewBox={`0 0 ${m.cols * U} ${m.rows * U}`} preserveAspectRatio="none" aria-hidden>
                <defs>
                  <pattern id="mz-paving" width={U} height={U} patternUnits="userSpaceOnUse">
                    <rect width={U} height={U} fill="#f3e3bf" />
                    <rect x="1.1" y="1.1" width={U - 2.2} height={U - 2.2} rx="2.2" fill="#fbf1d8" />
                    <circle cx="3" cy="6.6" r="0.45" fill="#e7d3a6" />
                    <circle cx="7.2" cy="3.4" r="0.35" fill="#e7d3a6" />
                  </pattern>
                </defs>
                <rect width={m.cols * U} height={m.rows * U} fill="url(#mz-paving)" />
                {/* bantalan mulai */}
                <circle cx={s0.x} cy={s0.y} r={3.6} className="mz-startpad" />
                {/* tanda jalan buntu yang sudah dimasuki */}
                {[...deadSeen].map((i) => {
                  const p = center(m, i);
                  return (
                    <g key={i} className="mz-cross">
                      <path d={`M${p.x - 1.8} ${p.y - 1.8}L${p.x + 1.8} ${p.y + 1.8}M${p.x + 1.8} ${p.y - 1.8}L${p.x - 1.8} ${p.y + 1.8}`} />
                    </g>
                  );
                })}
                {/* jejak */}
                {trail.length > 1 && (
                  <>
                    <polyline points={pts.join(' ')} className="mz-trail mz-trail--edge" />
                    <polyline points={pts.join(' ')} className="mz-trail mz-trail--core" />
                    <polyline points={pts.join(' ')} className="mz-trail mz-trail--dash" />
                  </>
                )}
                {/* petunjuk */}
                {[...new Set([...hintCells, ...glow])].map((i, n) => {
                  const p = center(m, i);
                  return (
                    <circle
                      key={`h${i}`}
                      cx={p.x}
                      cy={p.y}
                      r={1.5}
                      className="mz-hint"
                      style={{ animationDelay: `${n * 90}ms` }}
                    />
                  );
                })}
                {/* pagar tanaman: bayangan → badan → kilau atas */}
                <path d={walls} className="mz-wall mz-wall--shade" strokeWidth={WALL} transform="translate(0 0.75)" />
                <path d={walls} className="mz-wall mz-wall--body" strokeWidth={WALL} />
                <path d={walls} className="mz-wall mz-wall--light" strokeWidth={WALL * 0.45} transform="translate(0 -0.5)" />
                {deco.map((f, i) => (
                  <g key={i} transform={`translate(${f.x} ${f.y})`} className="mz-flower">
                    {[0, 72, 144, 216, 288].map((a) => (
                      <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 0.75} cy={Math.sin((a * Math.PI) / 180) * 0.75} r="0.6" fill={f.hue} />
                    ))}
                    <circle r="0.45" fill="#f4a300" />
                  </g>
                ))}
              </svg>

              <div className={'mz-thing mz-goal' + (done ? ' mz-goal--won' : '')} style={cellStyle(data.goal)}>
                <span className="mz-goal__ring" aria-hidden />
                <ItemPic id={data.goalItem} className="mz-pic" fallbackClassName="mz-emoji" />
              </div>
              {pickups.map((p) =>
                got.has(p) || !data.pickupItem ? null : (
                  <div key={p} className="mz-thing mz-pickup" style={cellStyle(p)}>
                    <ItemPic id={data.pickupItem} className="mz-pic" fallbackClassName="mz-emoji" />
                  </div>
                ),
              )}
              {sign && (
                <div key={sign.key} className="mz-thing mz-sign" style={cellStyle(sign.cell)} aria-hidden>
                  <span>🚧</span>
                </div>
              )}
              <div className="mz-thing mz-hero" style={cellStyle(end)}>
                <span className={'mz-hero__body' + (done ? ' mz-hero__body--won' : '')}>
                  <ItemPic
                    id={data.heroItem}
                    className={'mz-pic mz-hero__img' + (flip ? ' mz-hero__img--flip' : '')}
                    fallbackClassName="mz-emoji"
                  />
                </span>
              </div>
            </div>
            {thrifty && <span className="mz-thrifty">⭐ Jalan hemat!</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
