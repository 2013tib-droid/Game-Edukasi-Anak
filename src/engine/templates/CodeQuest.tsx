import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import {
  CODE_LINES,
  LOOP_TIMES,
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
import CodeCritter from '@/engine/ui/CodeCritters';
import { ArrowIcon, Rock } from '@/engine/ui/CodeArt';
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
 * - KOTAK SIHIR (level ber-`loop`, keputusan pemilik 2026-10-13, menggantikan
 *   rel ulangi terpisah yang membingungkan): kartu 🔁 dari baki masuk ke rel
 *   SEBAGAI KOTAK. Panah diketuk/diseret MASUK ke kotak itu, dan anak sendiri
 *   yang memilih berapa kali diulang (angka di kotak diketuk: ? → 2 → 3 → 4 →
 *   5). Kotak yang disentuh jadi tujuan ketukan kartu baki; rel yang disentuh
 *   mengembalikannya ke rel. Ikon 🔁 di kotak disentuh = kotak dibuang.
 *   Kebanyakan ulangan = tokoh kelewatan (`lewat`), jadi angkanya harus
 *   dihitung, tak bisa asal yang terbesar.
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

function LoopGlyph() {
  return (
    <svg viewBox="0 0 40 40" className="cq-arrow cq-arrow--loop" aria-hidden>
      <path d="M30 14 A12 12 0 1 0 32 24" fill="none" strokeWidth="5" strokeLinecap="round" />
      <path d="M24 6 L33 13 L24 19 Z" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function CardFace({ card }: { card: CodeCard }) {
  return card === 'ulangi' ? <LoopGlyph /> : <ArrowIcon dir={card} />;
}

/** Panah melengkung "buang yang terakhir" (bukan emoji ↩️ — beda di tiap HP). */
function UndoIcon() {
  return (
    <svg viewBox="0 0 48 48" className="cq-undo__icon" aria-hidden>
      <g stroke="#ffd23f" strokeWidth="3" strokeLinecap="round" className="cq-undo__spark">
        <path d="M5 13 L9 16 M4 21 H9" />
        <path d="M43 31 L39 33 M44 38 L39 38" />
      </g>
      <path
        d="M16 15 H28 C35 15 39 20 39 26 C39 32 35 37 28 37 H20"
        fill="none"
        stroke="#7b6ad8"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      <path d="M19 6 L9 15 L19 24 Z" fill="#7b6ad8" stroke="#7b6ad8" strokeWidth="3" strokeLinejoin="round" />
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
  const hasLoop = Boolean(data.loop);

  const [main, setMain] = useState<CodeCard[]>(() => [...(data.given?.main ?? [])]);
  const [loop, setLoop] = useState<CodeDir[]>(() => [...(data.given?.loop ?? [])]);
  const [times, setTimes] = useState<number | null>(() => data.given?.times ?? null);
  const [timesPing, setTimesPing] = useState(0);
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
  const boxIndex = main.indexOf('ulangi');
  const hasBox = boxIndex >= 0;

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const locked = running || solved;
  const solution: CodeProgram = data.solution;

  // ---- Petunjuk P2 ----
  const footprints = useMemo(() => {
    if (hint < 1) return new Set<string>();
    const run = runProgram(board, solution);
    return new Set(run.steps.filter((s) => !s.bump).map((s) => `${s.to.r},${s.to.c}`));
  }, [hint, board, solution]);

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
  /** Tingkat 2, kodenya sudah benar tapi angka ulangannya belum: angkanya menyala. */
  const nudgeTimes = hint >= 2 && hasBox && !nudge && times !== (solution.times ?? null);

  // ---- Menyusun kode ----
  function edited() {
    setBad(null);
  }

  function addCard(card: CodeCard, rail: Rail = active, at?: number) {
    if (locked) return;
    if (card === 'ulangi' && hasBox) return refuse(loopRef.current);
    const target: Rail = card === 'ulangi' || !hasBox ? 'main' : rail;
    if (target === 'main') {
      if (main.length >= data.slots) return refuse(mainRef.current);
      const next = [...main];
      next.splice(at ?? next.length, 0, card);
      setMain(next);
      // Kotak baru langsung jadi tujuan: panah berikutnya masuk ke dalamnya.
      if (card === 'ulangi') setActive('loop');
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
    if (rail === 'main') {
      // Membuang kotak ulangi = isinya ikut kembali ke baki.
      if (main[index] === 'ulangi') {
        setLoop([]);
        setTimes(null);
        setActive('main');
      }
      setMain(main.filter((_, i) => i !== index));
    } else setLoop(loop.filter((_, i) => i !== index));
    edited();
  }

  function undo() {
    if (locked) return;
    if (active === 'loop' && hasBox) {
      if (loop.length) removeAt('loop', loop.length - 1);
      else removeAt('main', boxIndex);
      return;
    }
    if (main.length) removeAt('main', main.length - 1);
  }

  function cycleTimes() {
    if (locked) return;
    const i = times === null ? -1 : LOOP_TIMES.indexOf(times as (typeof LOOP_TIMES)[number]);
    const next = LOOP_TIMES[(i + 1) % LOOP_TIMES.length]!;
    setTimes(next);
    setActive('loop');
    sfx('tick');
    narrate(CODE_LINES.times[next]!);
    edited();
  }

  // ---- Seret dari baki ----
  const drag = useRef<{ card: CodeCard; x: number; y: number; ghost: HTMLElement | null; moved: boolean } | null>(null);

  function railAt(x: number, y: number): { rail: Rail; at: number } | null {
    // Kotak dulu (ia ada DI DALAM rel), dengan batas yang ketat.
    for (const [rail, el, pad] of [
      ['loop', loopRef.current, 4],
      ['main', mainRef.current, 14],
    ] as const) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x < r.left - pad || x > r.right + pad || y < r.top - pad || y > r.bottom + pad) continue;
      const cards = [...el.querySelectorAll<HTMLElement>(':scope > .cq-item, :scope > .cq-box__body > .cq-item')];
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
        if (d.card !== 'ulangi') setActive(hit.rail);
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
    const prog: CodeProgram = { main, loop, times };
    if (hasBox && loop.length === 0) {
      sfx('tap');
      narrate(CODE_LINES.loopEmpty);
      setActive('loop');
      refuse(loopRef.current);
      return;
    }
    if (hasBox && times === null) {
      sfx('tap');
      narrate(CODE_LINES.noTimes);
      setTimesPing((k) => k + 1);
      return;
    }
    const result = runProgram(board, prog);
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
      if (result.outcome === 'nabrak' && last) setBad({ rail: last.rail, index: last.index });
      if (result.outcome === 'lewat' && hasBox) setBad({ rail: 'main', index: boxIndex });
      narrate(
        result.outcome === 'lewat'
          ? CODE_LINES.over
          : result.outcome === 'nabrak'
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

  const cardButton = (rail: Rail, card: CodeCard, i: number) => {
    const hinted = nudge?.wrong && nudge.rail === rail && nudge.index === i;
    return (
      <button
        key={i}
        type="button"
        className={
          'cq-slot cq-slot--full cq-item cq-card cq-card--' +
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
        <CardFace card={card} />
      </button>
    );
  };

  /** Kotak sihir: ikon 🔁 (sentuh = buang kotak) · tempat panah · angka ulangan. */
  const boxView = (i: number) => {
    const boxActive = active === 'loop';
    const cap = data.loop!.slots;
    return (
      <div
        key={i}
        ref={loopRef}
        className={
          'cq-item cq-box' +
          (boxActive ? ' cq-box--active' : '') +
          (isNow('main', i) ? ' cq-box--now' : '') +
          (bad && bad.rail === 'main' && bad.index === i ? ' cq-box--bad' : '') +
          (nudge?.wrong && nudge.rail === 'main' && nudge.index === i ? ' cq-box--hintbad' : '')
        }
        onClick={(e) => {
          e.stopPropagation();
          if (!locked) setActive('loop');
        }}
        aria-label="Kotak ulangi"
      >
        <button
          type="button"
          className="cq-box__icon"
          onClick={(e) => {
            e.stopPropagation();
            removeAt('main', i);
          }}
          disabled={locked}
          aria-label="Kotak ulangi, sentuh untuk membuang"
        >
          <LoopGlyph />
        </button>
        <div className="cq-box__body">
          {Array.from({ length: cap }, (_, j) => {
            const card = loop[j];
            return card ? cardButton('loop', card, j) : <span key={j} className="cq-slot" aria-hidden />;
          })}
        </div>
        <button
          key={timesPing}
          type="button"
          className={
            'cq-box__times' +
            (times === null ? ' cq-box__times--unset' : '') +
            (timesPing ? ' cq-box__times--ping' : '') +
            (nudgeTimes ? ' cq-box__times--hint' : '')
          }
          onClick={(e) => {
            e.stopPropagation();
            cycleTimes();
          }}
          disabled={locked}
          aria-label={times === null ? 'Pilih berapa kali diulang' : `Diulang ${times} kali, sentuh untuk mengganti`}
        >
          ×{times ?? '?'}
        </button>
      </div>
    );
  };

  const railView = () => {
    const cap = data.slots;
    // Kotak memakai satu tempat rel; tempat kosong sisanya digambar sesudahnya.
    const empties = Math.max(0, cap - main.length);
    return (
      <div
        ref={mainRef}
        className={'cq-rail' + (hasLoop && active === 'main' ? ' cq-rail--active' : '') + (!hasLoop && cap <= 3 ? ' cq-rail--short' : '')}
        onClick={() => hasLoop && !locked && setActive('main')}
        aria-label="Rel kode"
      >
        {main.map((card, i) => (card === 'ulangi' ? boxView(i) : cardButton('main', card, i)))}
        {Array.from({ length: empties }, (_, k) => (
          <span key={`e${k}`} className="cq-slot" aria-hidden />
        ))}
      </div>
    );
  };

  const trayCards: CodeCard[] = hasLoop ? ['atas', 'kanan', 'bawah', 'kiri', 'ulangi'] : ['atas', 'kanan', 'bawah', 'kiri'];

  return (
    <div className="cq-wrap">
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

        <div className="cq-code">{railView()}</div>

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
              {card !== 'ulangi' && <CodeCritter dir={card} />}
              <CardFace card={card} />
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
            <UndoIcon />
          </button>
          <button type="button" className="cq-run" onClick={run} disabled={locked}>
            <img
              src={`${import.meta.env.BASE_URL}assets/mascot/mascot-3.webp`}
              alt=""
              className="cq-run__chick"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <span className="cq-run__play" aria-hidden>
              <svg viewBox="0 0 24 24">
                <path d="M8 5.5 L19 12 L8 18.5 Z" fill="#fff" strokeLinejoin="round" stroke="#fff" strokeWidth="2" />
              </svg>
            </span>
            <span className="cq-run__text">Jalankan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
