import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import {
  CODE_LINES,
  cardCount,
  parseBoard,
  runProgram,
  sameCell,
  type Cell,
  type CodeCard,
  type CodeDir,
  type CodeProgram,
  type TraceStep,
} from '@/engine/core/codeQuest';
import { sfx } from '@/engine/audio/sound';
import { sparkleAt } from '@/engine/ui/juice';
import ItemPic from '@/engine/ui/ItemPic';
import '@/engine/ui/code-quest.css';

/**
 * Coding anak (`code-quest`): Kode Kelinci (TK) & Misi Kode (SD Kelas 1 & 2).
 * Kontrak datanya `CodeQuestData` (types.ts); mesinnya `core/codeQuest.ts`.
 *
 * - Anak MENYUSUN dulu, baru menjalankan (keputusan pemilik 2026-10-12): kartu
 *   panah diketuk ATAU diseret dari baki ke rel kode, lalu ▶️ Jalankan. Tokoh
 *   berjalan petak demi petak, kartu yang sedang dijalankan menyala.
 * - Kartu di rel disentuh = kembali ke baki. ↩️ membuang kartu terakhir rel
 *   yang aktif.
 * - Level ber-`loop` punya rel kedua "🔁 Ulangi ×N": isinya dijalankan N kali
 *   tiap kartu 🔁 di rel utama. Rel yang disentuh jadi rel aktif (tujuan
 *   ketukan kartu baki); kartu 🔁 sendiri selalu masuk rel utama.
 * - Kode yang gagal (menabrak / belum sampai / ada barang tertinggal) =
 *   SALAH SENYAP (`onWrong(true)`): kodenya TETAP di rel, kartu yang menabrak
 *   memerah, tokoh pulang ke petak mulai. Memperbaiki kode itu intinya coding.
 * - P2: tingkat 1 = jejak kaki jalan yang benar di papan; tingkat 2 = kartu
 *   pertama yang salah ditandai dan kartu yang dibutuhkan di baki menyala.
 * - "⭐ Kode hemat!" kalau kartunya tak lebih banyak dari jawaban contoh —
 *   pujian saja, bintang tetap dari banyaknya salah.
 *
 * Gerak tokoh = transisi CSS `left/top`, satu render ulang per langkah.
 */

const STEP_MS = 460;
type Rail = 'main' | 'loop';

function ArrowIcon({ dir }: { dir: CodeDir }) {
  const rot = { atas: 0, kanan: 90, bawah: 180, kiri: 270 }[dir];
  return (
    <svg viewBox="0 0 40 40" className="cq-arrow" aria-hidden>
      <path
        d="M20 5 L34 20 H25 V35 H15 V20 H6 Z"
        transform={`rotate(${rot} 20 20)`}
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
    </svg>
  );
}

function LoopIcon({ times }: { times: number }) {
  return (
    <span className="cq-loopicon" aria-hidden>
      <svg viewBox="0 0 40 40" className="cq-arrow cq-arrow--loop">
        <path d="M30 14 A12 12 0 1 0 32 24" fill="none" strokeWidth="5" strokeLinecap="round" />
        <path d="M24 6 L33 13 L24 19 Z" strokeLinejoin="round" strokeWidth="2" />
      </svg>
      <b>×{times}</b>
    </span>
  );
}

function CardFace({ card, times }: { card: CodeCard; times: number }) {
  return card === 'ulangi' ? <LoopIcon times={times} /> : <ArrowIcon dir={card} />;
}

/** Batu, digambar engine (bukan emoji — beda bentuk di tiap HP). */
function Rock() {
  return (
    <svg viewBox="0 0 40 40" className="cq-rock" aria-hidden>
      <path d="M6 31 C4 22 10 13 18 12 C22 8 30 10 32 17 C37 20 37 29 33 32 Z" className="cq-rock__body" />
      <path d="M13 20 C16 17 20 16 23 17" className="cq-rock__shine" />
    </svg>
  );
}

const ARIA: Record<CodeCard, string> = {
  atas: 'Panah atas',
  kanan: 'Panah kanan',
  bawah: 'Panah bawah',
  kiri: 'Panah kiri',
  ulangi: 'Ulangi',
};

export default function CodeQuest({ level, onCorrect, onWrong, narrate, hint }: TemplateProps<'code-quest'>) {
  const data = level.data;
  const board = useMemo(() => parseBoard(data.grid), [data.grid]);
  const times = data.loop?.times ?? 1;
  const hasLoop = Boolean(data.loop);

  const [main, setMain] = useState<CodeCard[]>(() => [...(data.given?.main ?? [])]);
  const [loop, setLoop] = useState<CodeDir[]>(() => [...(data.given?.loop ?? [])]);
  const [active, setActive] = useState<Rail>('main');
  const [hero, setHero] = useState<Cell>(board.start);
  const [hopKey, setHopKey] = useState(0);
  const [faceLeft, setFaceLeft] = useState(false);
  const [bumpDir, setBumpDir] = useState<CodeDir | null>(null);
  const [got, setGot] = useState<Set<number>>(() => new Set());
  const [running, setRunning] = useState(false);
  const [now, setNow] = useState<TraceStep | null>(null);
  const [bad, setBad] = useState<{ rail: Rail; index: number } | null>(null);
  const [thrifty, setThrifty] = useState(false);
  const [solved, setSolved] = useState(false);
  const timers = useRef<number[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const locked = running || solved;
  const solution: CodeProgram = data.solution;

  // ---- Petunjuk P2 ----
  const footprints = useMemo(() => {
    if (hint < 1) return new Set<string>();
    const run = runProgram(board, solution, times);
    return new Set(run.steps.filter((s) => !s.bump).map((s) => `${s.to.r},${s.to.c}`));
  }, [hint, board, solution, times]);

  /** Tingkat 2: kartu pertama yang menyimpang dari jawaban contoh + kartu yang dibutuhkan. */
  const nudge = useMemo(() => {
    if (hint < 2) return null;
    const cmp = <T,>(have: T[], want: T[], rail: Rail) => {
      for (let i = 0; i < want.length; i++) {
        if (have[i] !== want[i]) return { rail, index: i, wrong: i < have.length, need: want[i] as CodeCard };
      }
      return null;
    };
    return cmp(main, solution.main, 'main') ?? (hasLoop ? cmp(loop, solution.loop ?? [], 'loop') : null);
  }, [hint, main, loop, solution, hasLoop]);

  // ---- Menyusun kode ----
  function edited() {
    setBad(null);
  }

  function addCard(card: CodeCard, rail: Rail = card === 'ulangi' ? 'main' : active, at?: number) {
    if (locked) return;
    const target: Rail = card === 'ulangi' ? 'main' : rail;
    if (target === 'main') {
      if (main.length >= data.slots) return refuse(mainRef.current);
      const next = [...main];
      next.splice(at ?? next.length, 0, card);
      setMain(next);
    } else {
      if (!data.loop || loop.length >= data.loop.slots) return refuse(loopRef.current);
      const next = [...loop];
      next.splice(at ?? next.length, 0, card as CodeDir);
      setLoop(next);
    }
    sfx('tick');
    narrate(CODE_LINES.card[card]);
    edited();
  }

  function refuse(el: HTMLElement | null) {
    sfx('tap');
    if (!el) return;
    el.classList.remove('cq-rail--full');
    void el.offsetWidth;
    el.classList.add('cq-rail--full');
  }

  function removeAt(rail: Rail, index: number) {
    if (locked) return;
    sfx('tap');
    if (rail === 'main') setMain(main.filter((_, i) => i !== index));
    else setLoop(loop.filter((_, i) => i !== index));
    edited();
  }

  function undo() {
    if (locked) return;
    const rail = active === 'loop' && loop.length ? 'loop' : main.length ? 'main' : 'loop';
    const list = rail === 'main' ? main : loop;
    if (list.length === 0) return;
    removeAt(rail, list.length - 1);
  }

  // ---- Seret dari baki ----
  const drag = useRef<{ card: CodeCard; x: number; y: number; ghost: HTMLElement | null; moved: boolean } | null>(null);

  function railAt(x: number, y: number): { rail: Rail; at: number } | null {
    for (const [rail, el] of [
      ['main', mainRef.current],
      ['loop', loopRef.current],
    ] as const) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x < r.left - 12 || x > r.right + 12 || y < r.top - 16 || y > r.bottom + 16) continue;
      const cards = [...el.querySelectorAll<HTMLElement>('.cq-slot--full')];
      let at = cards.length;
      for (let i = 0; i < cards.length; i++) {
        const cr = cards[i]!.getBoundingClientRect();
        const sameRow = y >= cr.top - 6 && y <= cr.bottom + 6;
        if (sameRow && x < cr.left + cr.width / 2) {
          at = i;
          break;
        }
      }
      return { rail, at };
    }
    return null;
  }

  function trayDown(e: ReactPointerEvent<HTMLButtonElement>, card: CodeCard) {
    if (locked) return;
    e.preventDefault();
    drag.current = { card, x: e.clientX, y: e.clientY, ghost: null, moved: false };
  }

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 10) return;
      if (!d.moved) {
        d.moved = true;
        const src = document.querySelector<HTMLElement>(`.cq-tray [data-card="${d.card}"]`);
        if (src) {
          const ghost = src.cloneNode(true) as HTMLElement;
          ghost.classList.add('cq-ghost');
          const r = src.getBoundingClientRect();
          ghost.style.width = `${r.width}px`;
          ghost.style.height = `${r.height}px`;
          document.body.appendChild(ghost);
          d.ghost = ghost;
        }
      }
      if (d.ghost) {
        const w = d.ghost.offsetWidth;
        const h = d.ghost.offsetHeight;
        d.ghost.style.transform = `translate(${e.clientX - w / 2}px, ${e.clientY - h / 2}px)`;
      }
    };
    const up = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      drag.current = null;
      d.ghost?.remove();
      if (!d.moved) {
        addCard(d.card);
        return;
      }
      const hit = railAt(e.clientX, e.clientY);
      if (hit) {
        if (hit.rail === 'loop' && d.card !== 'ulangi') setActive('loop');
        addCard(d.card, hit.rail, d.card === 'ulangi' && hit.rail === 'loop' ? undefined : hit.at);
      } else sfx('tap');
    };
    const cancel = () => {
      drag.current?.ghost?.remove();
      drag.current = null;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      drag.current?.ghost?.remove();
    };
  });

  // ---- Menjalankan ----
  function cellCenter(p: Cell): [number, number] | null {
    const r = boardRef.current?.getBoundingClientRect();
    if (!r) return null;
    return [r.left + ((p.c + 0.5) / board.cols) * r.width, r.top + ((p.r + 0.5) / board.rows) * r.height];
  }

  function sparkleCell(p: Cell, n = 8) {
    const c = cellCenter(p);
    if (c) sparkleAt(c[0], c[1], n);
  }

  function run() {
    if (locked) return;
    const prog: CodeProgram = { main, loop };
    const result = runProgram(board, prog, times);
    if (result.outcome === 'kosong') {
      sfx('tap');
      narrate(CODE_LINES.empty);
      refuse(mainRef.current);
      return;
    }
    setRunning(true);
    setBad(null);
    setThrifty(false);
    const flip = (dir: CodeDir) => {
      if (dir === 'kiri' || dir === 'kanan') setFaceLeft(dir === 'kiri');
    };
    const collected = new Set<number>();
    result.steps.forEach((s, i) => {
      later(() => {
        setNow(s);
        flip(s.dir);
        if (s.bump) {
          sfx('tap');
          setBumpDir(s.dir);
          return;
        }
        sfx('tick');
        setHero(s.to);
        setHopKey((k) => k + 1);
        if (s.got !== undefined) {
          collected.add(s.got);
          setGot(new Set(collected));
          later(() => sparkleCell(s.to, 6), STEP_MS * 0.6);
        }
      }, i * STEP_MS);
    });

    const end = result.steps.length * STEP_MS + 120;
    const last = result.steps[result.steps.length - 1];
    if (result.outcome === 'sampai') {
      later(() => {
        setNow(null);
        sfx('correct');
        sparkleCell(board.goal, 12);
        const hemat = cardCount(prog) <= cardCount(solution);
        setThrifty(hemat);
        setSolved(true);
        later(() => onCorrect(), hemat ? 1100 : 650);
      }, end);
      return;
    }
    later(() => {
      setNow(null);
      if (result.outcome === 'nabrak' && last) setBad({ rail: last.rail, index: last.via ?? last.index });
      narrate(
        result.outcome === 'nabrak'
          ? CODE_LINES.bump
          : result.outcome === 'belum-ambil'
            ? CODE_LINES.missing
            : CODE_LINES.short,
      );
      onWrong(true);
    }, end + 200);
    // Pulang ke petak mulai; kodenya tetap di rel untuk diperbaiki.
    later(() => {
      setBumpDir(null);
      setHero(board.start);
      setHopKey((k) => k + 1);
      setFaceLeft(false);
      setGot(new Set());
      setRunning(false);
    }, end + 1500);
  }

  // ---- Gambar ----
  const flipHero = faceLeft !== (data.heroFaces === 'kiri');
  const heroStyle: CSSProperties = {
    left: `${(hero.c / board.cols) * 100}%`,
    top: `${(hero.r / board.rows) * 100}%`,
    width: `${100 / board.cols}%`,
    height: `${100 / board.rows}%`,
  };

  const isNow = (rail: Rail, index: number) =>
    !!now && ((now.rail === rail && now.index === index) || (rail === 'main' && now.via === index));

  const railView = (rail: Rail) => {
    const list: CodeCard[] = rail === 'main' ? main : loop;
    const cap = rail === 'main' ? data.slots : data.loop!.slots;
    const isActive = hasLoop && active === rail;
    return (
      <div
        ref={rail === 'main' ? mainRef : loopRef}
        className={
          'cq-rail' +
          (rail === 'loop' ? ' cq-rail--loop' : '') +
          (isActive ? ' cq-rail--active' : '') +
          (cap <= 3 ? ' cq-rail--short' : '')
        }
        onClick={() => hasLoop && !locked && setActive(rail)}
        aria-label={rail === 'main' ? 'Rel kode' : `Rel ulangi ${times} kali`}
      >
        {rail === 'loop' && (
          <span className="cq-rail__tag" aria-hidden>
            <LoopIcon times={times} />
          </span>
        )}
        {Array.from({ length: cap }, (_, i) => {
          const card = list[i];
          if (!card) return <span key={i} className="cq-slot" aria-hidden />;
          const hinted = nudge?.wrong && nudge.rail === rail && nudge.index === i;
          return (
            <button
              key={i}
              type="button"
              className={
                'cq-slot cq-slot--full cq-card cq-card--' +
                card +
                (isNow(rail, i) ? ' cq-card--now' : '') +
                (bad && bad.rail === rail && bad.index === i ? ' cq-card--bad' : '') +
                (hinted ? ' cq-card--hintbad' : '')
              }
              onClick={(e) => {
                e.stopPropagation();
                if (hasLoop) setActive(rail);
                removeAt(rail, i);
              }}
              disabled={locked}
              aria-label={`${ARIA[card]}, sentuh untuk membuang`}
            >
              <CardFace card={card} times={times} />
            </button>
          );
        })}
      </div>
    );
  };

  const trayCards: CodeCard[] = hasLoop ? ['atas', 'kanan', 'bawah', 'kiri', 'ulangi'] : ['atas', 'kanan', 'bawah', 'kiri'];

  return (
    <div className={'cq-wrap' + (hasLoop ? ' cq-wrap--loop' : '')}>
      <div className="game-prompt cq-prompt">{level.narration}</div>
      <div className="cq-area">
        <div className="cq-boardbox">
          <div
            className="cq-board"
            style={{ '--cq-cols': board.cols, '--cq-rows': board.rows } as CSSProperties}
          >
            <div ref={boardRef} className="cq-grid">
              {board.tiles.map((row, r) =>
                row.map((tile, c) => {
                  const p = { r, c };
                  const pi = board.pickups.findIndex((q) => sameCell(q, p));
                  return (
                    <div
                      key={`${r}-${c}`}
                      className={'cq-cell cq-cell--' + tile + ((r + c) % 2 ? ' cq-cell--alt' : '')}
                    >
                      {tile === 'batu' && <Rock />}
                      {tile === 'pohon' && <ItemPic id="tree" className="cq-pic" fallbackClassName="cq-emoji" />}
                      {footprints.has(`${r},${c}`) && <span className="cq-foot" aria-hidden />}
                      {sameCell(p, board.goal) && (
                        <ItemPic
                          id={data.goalItem}
                          className={'cq-pic cq-goal' + (solved ? ' cq-goal--won' : '')}
                          fallbackClassName="cq-emoji"
                        />
                      )}
                      {pi >= 0 && !got.has(pi) && data.pickupItem && (
                        <ItemPic id={data.pickupItem} className="cq-pic cq-pickup" fallbackClassName="cq-emoji" />
                      )}
                    </div>
                  );
                }),
              )}
              <div className="cq-hero" style={heroStyle}>
                <span
                  key={hopKey}
                  className={
                    'cq-hero__body' +
                    (hopKey > 0 ? ' cq-hero__body--hop' : '') +
                    (bumpDir ? ` cq-hero__body--bump-${bumpDir}` : '')
                  }
                >
                  <ItemPic
                    id={data.heroItem}
                    className={'cq-hero__img' + (flipHero ? ' cq-hero__img--flip' : '')}
                    fallbackClassName="cq-emoji"
                  />
                </span>
              </div>
            </div>
            {thrifty && <span className="cq-thrifty">⭐ Kode hemat!</span>}
          </div>
        </div>

        <div className="cq-code">
          {railView('main')}
          {hasLoop && railView('loop')}
        </div>

        <div className="cq-tray">
          {trayCards.map((card) => (
            <button
              key={card}
              type="button"
              data-card={card}
              className={
                'cq-card cq-card--' +
                card +
                ' cq-tray__card' +
                (nudge && nudge.need === card ? ' cq-card--hint' : '')
              }
              onPointerDown={(e) => trayDown(e, card)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  addCard(card);
                }
              }}
              disabled={locked}
              aria-label={ARIA[card]}
            >
              <CardFace card={card} times={times} />
            </button>
          ))}
        </div>

        <div className="cq-actions">
          <button
            type="button"
            className="cq-undo"
            onClick={undo}
            disabled={locked || (main.length === 0 && loop.length === 0)}
            aria-label="Buang kartu terakhir"
          >
            ↩️
          </button>
          <button type="button" className="btn btn--primary cq-run" onClick={run} disabled={locked}>
            ▶️ Jalankan
          </button>
        </div>
      </div>
    </div>
  );
}
