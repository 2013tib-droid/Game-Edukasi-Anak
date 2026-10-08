import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { FoodKind, Frac, KitchenChoice, KitchenStep, KitchenTask } from '@/engine/core/types';
import { sfx } from '@/engine/audio/sound';
import { sparkleAt } from '@/engine/ui/juice';
import ItemPic from '@/engine/ui/ItemPic';
import { Cookie, FracSym, FractionFood } from '@/engine/ui/Fraction';
import '@/engine/ui/fraction-kitchen.css';

/**
 * Toko Kue Bu Beruang (Bagi Kue, `sd2`) — kontrak datanya di
 * `FractionKitchenData` / `KitchenTask` (types.ts).
 *
 * Pelanggan hewan datang satu per satu dengan pesanan di gelembung kata.
 * Anak MEMEGANG pecahannya, bukan memilih kartu:
 * - `cut`   gesek jari melintasi kue → garis potong mengunci ke potongan sama
 *           besar; potongan diseret (atau diketuk) ke piring pelanggan.
 * - `share` kue kering dibagi ke piring-piring sampai sama rata.
 * - `stack` potongan DITUMPUK di atas potongan lain — ½ > ¼ terlihat, bukan
 *           dihafal; dua ¼ pas menutupi ½.
 * - `line`  ceri diseret di garis bilangan 0–1, cokelat di atasnya ikut terisi.
 * - `juice` gelas jus bergaris sepuluh diisi / dibaca sebagai desimal.
 * - `pick`  tap jawaban (gambar ↔ lambang) dengan pengecoh potongan tak sama.
 *
 * Salah potong/taruh/isi = SENYAP (`onWrong(true)`, seperti Puzzle): itu bagian
 * dari mencoba. Salah memilih jawaban = overlay "coba lagi" biasa.
 *
 * Gerakan seret & gesek: pointer event + listener window + rAF yang menulis
 * `transform` langsung ke DOM (pelajaran PathTrace). State React cuma berubah
 * saat sesuatu benar-benar terjadi (potongan pindah, garis bertambah).
 *
 * Petunjuk bertingkat (P2): tingkat 1 menyalakan yang perlu dilihat (garis
 * potong samar, angka potong, angka garis); tingkat 2 memperlihatkan satu
 * langkah (bayangan di piring, piring paling sedikit, titik tujuan) atau
 * memudarkan satu pilihan salah.
 */

/** Jari harus bergeser sejauh ini sebelum ketukan berubah jadi seretan. */
const DRAG_PX = 8;
const MAX_PARTS = 12;

const FOOD_NAME: Record<FoodKind, string> = {
  kue: 'kue',
  pizza: 'pizza',
  martabak: 'martabak',
  cokelat: 'cokelat',
};

type Hint = 0 | 1 | 2;

interface TaskProps<K extends KitchenTask['kind']> {
  task: Extract<KitchenTask, { kind: K }>;
  hint: Hint;
  /** Pesanan pelanggan ini beres. */
  done: () => void;
  wrong: (silent?: boolean) => void;
  /** Ganti kalimat soal di layar (dan yang diulang tombol 🔊). */
  ask: (text: string) => void;
  prompt: string;
}

/**
 * Ikuti satu jari sampai dilepas. `move` dipanggil paling banyak sekali per
 * frame (rAF) dan baru sesudah jari bergeser `DRAG_PX`; `end` menerima posisi
 * terakhir dan apakah jari sempat bergeser (kalau tidak: ketukan).
 */
function trackPointer(
  e: ReactPointerEvent,
  h: { move?: (dx: number, dy: number, x: number, y: number) => void; end: (x: number, y: number, moved: boolean) => void },
) {
  const id = e.pointerId;
  const x0 = e.clientX;
  const y0 = e.clientY;
  let x = x0;
  let y = y0;
  let moved = false;
  let raf = 0;
  const tick = () => {
    raf = 0;
    h.move?.(x - x0, y - y0, x, y);
  };
  const mv = (ev: PointerEvent) => {
    if (ev.pointerId !== id) return;
    x = ev.clientX;
    y = ev.clientY;
    if (!moved && Math.hypot(x - x0, y - y0) > DRAG_PX) moved = true;
    if (moved && !raf) raf = requestAnimationFrame(tick);
  };
  const up = (ev: PointerEvent) => {
    if (ev.pointerId !== id) return;
    window.removeEventListener('pointermove', mv);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    if (raf) cancelAnimationFrame(raf);
    h.end(x, y, moved);
  };
  window.addEventListener('pointermove', mv);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
}

const inside = (r: DOMRect | undefined, x: number, y: number, pad = 0) =>
  !!r && x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;

function shuffle<T>(list: T[]): T[] {
  return [...list].sort(() => Math.random() - 0.5);
}

/** Jarak titik ke ruas garis. */
function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len = dx * dx + dy * dy;
  const t = len === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function useShake(): [boolean, () => void] {
  const [on, setOn] = useState(false);
  return [
    on,
    () => {
      setOn(true);
      window.setTimeout(() => setOn(false), 450);
    },
  ];
}

/** Bayangan seretan: elemen fixed yang digeser rAF lewat `transform`. */
function Ghost({ rect, ghostRef, children }: { rect: DOMRect; ghostRef: React.RefObject<HTMLDivElement>; children: ReactNode }) {
  return (
    <div
      ref={ghostRef}
      className="fk-ghost"
      style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
      aria-hidden
    >
      {children}
    </div>
  );
}

/* ================================================================== */
/*  Template                                                          */
/* ================================================================== */

export default function FractionKitchen({
  level,
  onCorrect,
  onWrong,
  narrate,
  setRepeat,
  hint,
}: TemplateProps<'fraction-kitchen'>) {
  const steps = level.data.steps;
  const [stepIx, setStepIx] = useState(0);
  const [prompt, setPromptState] = useState(level.narration);
  const [happy, setHappy] = useState(false);
  const promptRef = useRef(prompt);
  const custRef = useRef<HTMLDivElement>(null);
  const finished = useRef(false);

  function ask(text: string) {
    promptRef.current = text;
    setPromptState(text);
    narrate(text);
  }

  useEffect(() => {
    setRepeat(() => narrate(promptRef.current));
    return () => setRepeat(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const step = steps[stepIx]!;

  function done() {
    if (finished.current) return;
    const r = custRef.current?.getBoundingClientRect();
    if (r) sparkleAt(r.left + r.width / 2, r.top + r.height / 2, 8);
    setHappy(true);
    if (stepIx + 1 >= steps.length) {
      finished.current = true;
      onCorrect();
      return;
    }
    sfx('correct');
    window.setTimeout(() => {
      const next = steps[stepIx + 1]!;
      setHappy(false);
      setStepIx(stepIx + 1);
      if (next.say) ask(next.say);
    }, 1000);
  }

  return (
    <div className="fk-wrap">
      <div className="game-prompt fk-prompt">{prompt}</div>
      <div className="game-area fk-area">
        <Counter step={step} stepIx={stepIx} total={steps.length} happy={happy} custRef={custRef} />
        <TaskView key={stepIx} step={step} hint={hint} done={done} wrong={onWrong} ask={ask} prompt={prompt} />
      </div>
    </div>
  );
}

function TaskView({
  step,
  ...rest
}: { step: KitchenStep } & Omit<TaskProps<'pick'>, 'task'>) {
  const t = step.task;
  switch (t.kind) {
    case 'pick':
      return <PickTask task={t} {...rest} />;
    case 'cut':
      return <CutTask task={t} {...rest} />;
    case 'share':
      return <ShareTask task={t} {...rest} />;
    case 'stack':
      return <StackTask task={t} {...rest} />;
    case 'line':
      return <LineTask task={t} {...rest} />;
    case 'juice':
      return <JuiceTask task={t} {...rest} />;
  }
}

/* ---------- Meja toko: Bu Beruang, pelanggan, gelembung pesanan ---------- */

function bubbleOf(task: KitchenTask): ReactNode {
  switch (task.kind) {
    case 'cut':
    case 'line':
      return <FracSym n={task.order.n} d={task.order.d} />;
    case 'share':
      return (
        <span className="fk-bubble__row">
          <FracSym n={task.take} d={task.plates} />
          <span className="fk-bubble__of">dari {task.cookies}</span>
          <Cookie className="fk-bubble__cookie" />
        </span>
      );
    case 'juice':
      return task.mode === 'fill' ? (
        <span className="fk-bubble__dec">{(task.tenths / 10).toFixed(1).replace('.', ',')}</span>
      ) : (
        <span className="fk-bubble__q">?</span>
      );
    case 'pick':
      return task.show ? <FracSym n={task.show.n} d={task.show.d} /> : <span className="fk-bubble__q">?</span>;
    case 'stack':
      return <span className="fk-bubble__q">⚖️</span>;
  }
}

function Counter({
  step,
  stepIx,
  total,
  happy,
  custRef,
}: {
  step: KitchenStep;
  stepIx: number;
  total: number;
  happy: boolean;
  custRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="fk-counter">
      <div className="fk-bear" title="Bu Beruang">
        <ItemPic id="bear" className="fk-bear__img" fallbackClassName="fk-bear__emoji" />
      </div>
      <div key={stepIx} ref={custRef} className={'fk-customer' + (happy ? ' fk-customer--happy' : '')}>
        <ItemPic id={step.customer} className="fk-customer__img" fallbackClassName="fk-customer__emoji" />
      </div>
      <div className="fk-bubble" key={`b${stepIx}`}>
        {bubbleOf(step.task)}
      </div>
      {total > 1 && (
        <div className="fk-pips" aria-label={`Pesanan ${stepIx + 1} dari ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={'fk-pip' + (i < stepIx ? ' fk-pip--done' : i === stepIx ? ' fk-pip--now' : '')} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- pick: gambar ↔ lambang ---------- */

function ChoiceFace({ c, numbers }: { c: KitchenChoice; numbers: boolean }) {
  if (c.frac) return <FracSym n={c.frac.n} d={c.frac.d} className="fk-choice__sym" />;
  if (c.picture)
    return (
      <FractionFood
        food={c.picture.food}
        d={c.picture.d}
        show={Array.from({ length: c.picture.show }, (_, i) => i)}
        uneven={c.picture.uneven}
        numbers={numbers}
        className="fk-choice__pic"
      />
    );
  return <span className="fk-choice__text">{c.text}</span>;
}

/** Pilihan salah yang dipudarkan petunjuk tingkat 2: yang pertama di data. */
const fadedOf = <T extends { correct?: boolean }>(list: T[], hint: Hint) =>
  hint >= 2 ? list.find((c) => !c.correct) : undefined;

function Choices<T extends { correct?: boolean }>({
  list,
  hint,
  onPick,
  face,
  wide,
}: {
  list: T[];
  hint: Hint;
  onPick: (c: T) => void;
  face: (c: T) => ReactNode;
  wide?: boolean;
}) {
  const shuffled = useMemo(() => shuffle(list), [list]);
  const faded = fadedOf(list, hint);
  return (
    <div className={'fk-choices' + (wide ? ' fk-choices--pics' : '')}>
      {shuffled.map((c, i) => (
        <button
          key={i}
          type="button"
          className={'choice-card fk-choice' + (c === faded ? ' choice-card--out' : '')}
          disabled={c === faded}
          onClick={() => onPick(c)}
        >
          {face(c)}
        </button>
      ))}
    </div>
  );
}

function PickTask({ task, hint, done, wrong }: TaskProps<'pick'>) {
  const [solved, setSolved] = useState(false);
  const pics = task.choices.some((c) => c.picture);
  function pick(c: KitchenChoice) {
    if (solved) return;
    if (c.correct) {
      setSolved(true);
      done();
    } else {
      sfx('tap');
      wrong();
    }
  }
  return (
    <>
      <div className="fk-stage fk-stage--pick">
        {task.picture ? (
          <FractionFood
            food={task.picture.food}
            d={task.picture.d}
            show={Array.from({ length: task.picture.show }, (_, i) => i)}
            numbers={hint >= 1}
            className="fk-food fk-food--cue"
          />
        ) : task.show ? (
          <FracSym n={task.show.n} d={task.show.d} className="fk-cue-sym" />
        ) : null}
      </div>
      <Choices
        list={task.choices}
        hint={hint}
        onPick={pick}
        wide={pics}
        face={(c) => <ChoiceFace c={c} numbers={hint >= 1} />}
      />
    </>
  );
}

/* ---------- cut: gesek untuk memotong, seret ke piring ---------- */

function CutTask({ task, hint, done, wrong }: TaskProps<'cut'>) {
  const start = task.precut ?? 1;
  const canCut = !task.precut;
  const [parts, setParts] = useState(start);
  const [served, setServed] = useState<number[]>([]);
  const [dragIx, setDragIx] = useState<number | null>(null);
  const [ghost, setGhost] = useState<DOMRect | null>(null);
  const [cutKey, setCutKey] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [plateShake, shakePlate] = useShake();
  const [foodShake, shakeFood] = useShake();
  const [solved, setSolved] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const foodRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<SVGPolylineElement>(null);
  const live = useRef({ parts, served, solved });
  live.current = { parts, served, solved };

  const food = task.food;
  const name = FOOD_NAME[food];
  const onCake = Array.from({ length: parts }, (_, i) => i).filter((i) => !served.includes(i));

  function flash(text: string) {
    setNote(text);
    window.setTimeout(() => setNote(null), 1500);
  }

  function serve(i: number) {
    if (live.current.solved || live.current.served.includes(i)) return;
    sfx('tap');
    setServed([...live.current.served, i]);
  }

  function unserve(i: number) {
    if (solved) return;
    sfx('tap');
    setServed(served.filter((s) => s !== i));
  }

  function down(e: ReactPointerEvent) {
    if (solved) return;
    const pieceEl = (e.target as Element).closest('[data-slice]');
    const i = pieceEl ? Number(pieceEl.getAttribute('data-slice')) : -1;
    if (i >= 0 && parts >= 2) {
      e.preventDefault();
      dragPiece(e, i);
    } else if (canCut) {
      e.preventDefault();
      swipe(e);
    }
  }

  function dragPiece(e: ReactPointerEvent, i: number) {
    let started = false;
    trackPointer(e, {
      move: (dx, dy) => {
        if (!started) {
          started = true;
          const r = foodRef.current?.getBoundingClientRect();
          if (r) setGhost(r);
          setDragIx(i);
        }
        if (ghostRef.current) ghostRef.current.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
      },
      end: (x, y, moved) => {
        setDragIx(null);
        setGhost(null);
        if (!moved || inside(plateRef.current?.getBoundingClientRect(), x, y, 24)) serve(i);
      },
    });
  }

  function swipe(e: ReactPointerEvent) {
    const stage = stageRef.current?.getBoundingClientRect();
    const pts: [number, number][] = [[e.clientX, e.clientY]];
    const draw = () => {
      if (!stage || !trailRef.current) return;
      trailRef.current.setAttribute('points', pts.map(([x, y]) => `${x - stage.left},${y - stage.top}`).join(' '));
      trailRef.current.style.opacity = '1';
    };
    trackPointer(e, {
      move: (_dx, _dy, x, y) => {
        pts.push([x, y]);
        draw();
      },
      end: (x, y) => {
        pts.push([x, y]);
        if (trailRef.current) trailRef.current.style.opacity = '0';
        const r = foodRef.current?.getBoundingClientRect();
        if (!r) return;
        const s = Math.min(r.width, r.height);
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const [ax, ay] = pts[0]!;
        const len = Math.hypot(x - ax, y - ay);
        let near = Infinity;
        for (let k = 1; k < pts.length; k++) {
          const [px, py] = pts[k - 1]!;
          const [qx, qy] = pts[k]!;
          near = Math.min(near, segDist(cx, cy, px, py, qx, qy));
        }
        if (len < s * 0.55 || near > s * 0.32) return;
        if (live.current.parts >= MAX_PARTS) {
          shakeFood();
          return;
        }
        sfx('tick');
        setServed([]);
        setParts(live.current.parts + 1);
        setCutKey((k) => k + 1);
      },
    });
  }

  function reset() {
    if (solved) return;
    sfx('tap');
    setParts(start);
    setServed([]);
  }

  function give() {
    if (solved || served.length === 0) return;
    if (served.length * task.order.d === task.order.n * parts) {
      setSolved(true);
      done();
    } else {
      sfx('tap');
      shakePlate();
      flash('Belum sesuai pesanan');
      wrong(true);
    }
  }

  const status =
    note ??
    (parts === 1
      ? `Gesek jari melintasi ${name} untuk memotong`
      : served.length === 0
        ? `${parts} potong — seret ke piring`
        : `Di piring: ${served.length} dari ${parts} potong`);

  return (
    <>
      <div ref={stageRef} className="fk-stage fk-stage--cut" onPointerDown={down}>
        <div
          ref={foodRef}
          key={cutKey}
          className={'fk-food' + (cutKey > 0 ? ' fk-food--cut' : '') + (foodShake ? ' fk-food--shake' : '')}
        >
          <FractionFood
            food={food}
            d={parts}
            show={onCake}
            numbers={hint >= 1 && !canCut}
            guide={hint >= 1 && canCut && parts !== task.order.d ? task.order.d : undefined}
            className="fk-food__svg"
          />
          {canCut && parts === 1 && cutKey === 0 && <span className="fk-swipe" aria-hidden />}
        </div>
        <svg className="fk-trail" aria-hidden>
          <polyline ref={trailRef} />
        </svg>
      </div>
      <div className="fk-status" aria-live="polite">
        {solved && served.length !== task.order.n ? (
          // Pecahan senilai terlihat: ½ = 2/4.
          <span className="fk-eqline">
            <FracSym n={task.order.n} d={task.order.d} /> = <FracSym n={served.length} d={parts} />
          </span>
        ) : (
          status
        )}
      </div>
      <div className="fk-bottom">
        <div
          ref={plateRef}
          className={'fk-plate fk-plate--serve' + (plateShake ? ' fk-plate--shake' : '') + (dragIx !== null ? ' fk-plate--open' : '')}
          onClick={(e) => {
            const el = (e.target as Element).closest('[data-slice]');
            if (el) unserve(Number(el.getAttribute('data-slice')));
          }}
          aria-label="Piring pelanggan"
        >
          <FractionFood
            food={food}
            d={parts}
            show={served}
            bare
            outline
            target={hint >= 2 ? task.order : undefined}
            className="fk-plate__svg"
          />
        </div>
        <div className="fk-actions">
          <button type="button" className="fk-btn fk-btn--undo" onClick={reset} disabled={solved} aria-label="Ulangi">
            ↩️
          </button>
          <button type="button" className="btn btn--primary fk-btn fk-give" onClick={give} disabled={solved || served.length === 0}>
            ✓ Berikan!
          </button>
        </div>
      </div>
      {ghost && dragIx !== null && (
        <Ghost rect={ghost} ghostRef={ghostRef}>
          <FractionFood food={food} d={parts} show={[dragIx]} bare className="fk-food__svg" />
        </Ghost>
      )}
    </>
  );
}

/* ---------- share: kue kering dibagi sama rata ---------- */

function ShareTask({ task, hint, done, wrong, ask, prompt }: TaskProps<'share'>) {
  const [tray, setTray] = useState(task.cookies);
  const [plates, setPlates] = useState<number[]>(() => Array.from({ length: task.plates }, () => 0));
  const [phase, setPhase] = useState<'deal' | 'ask'>('deal');
  const [shake, doShake] = useShake();
  const [note, setNote] = useState<string | null>(null);
  const [ghost, setGhost] = useState<DOMRect | null>(null);
  const [solved, setSolved] = useState(false);
  const plateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ghostRef = useRef<HTMLDivElement>(null);
  const live = useRef({ tray, plates, phase });
  live.current = { tray, plates, phase };

  function deal(i: number) {
    const { tray: t, plates: ps, phase: ph } = live.current;
    if (ph !== 'deal' || t === 0) return;
    sfx('tap');
    const next = ps.map((n, k) => (k === i ? n + 1 : n));
    setPlates(next);
    setTray(t - 1);
    if (t - 1 === 0) {
      if (next.every((n) => n === next[0])) {
        window.setTimeout(() => {
          setPhase('ask');
          if (task.question !== prompt) ask(task.question);
        }, 450);
      } else {
        doShake();
        setNote('Belum sama rata');
        window.setTimeout(() => setNote(null), 1500);
        wrong(true);
      }
    }
  }

  function undeal(i: number) {
    if (phase !== 'deal' || plates[i]! === 0) return;
    sfx('tap');
    setPlates(plates.map((n, k) => (k === i ? n - 1 : n)));
    setTray(tray + 1);
  }

  function dragCookie(e: ReactPointerEvent) {
    if (phase !== 'deal') return;
    e.preventDefault();
    const src = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let started = false;
    trackPointer(e, {
      move: (dx, dy) => {
        if (!started) {
          started = true;
          setGhost(src);
        }
        if (ghostRef.current) ghostRef.current.style.transform = `translate(${dx}px, ${dy}px) scale(1.15)`;
      },
      end: (x, y, moved) => {
        setGhost(null);
        if (!moved) {
          setNote('Ketuk piringnya untuk membagi');
          window.setTimeout(() => setNote(null), 1500);
          return;
        }
        const i = plateRefs.current.findIndex((el) => inside(el?.getBoundingClientRect(), x, y, 12));
        if (i >= 0) deal(i);
      },
    });
  }

  function answer(c: { value: number; correct?: boolean }) {
    if (solved) return;
    if (c.correct) {
      setSolved(true);
      done();
    } else {
      sfx('tap');
      wrong();
    }
  }

  const fewest = Math.min(...plates);
  const fewestIx = plates.indexOf(fewest);

  return (
    <>
      <div className={'fk-stage fk-stage--share' + (task.plates >= 4 ? ' fk-share--4' : '')}>
        {phase === 'deal' ? (
          <div className="fk-tray" aria-label={`Sisa ${tray} kue kering`}>
            {Array.from({ length: tray }, (_, i) => (
              <span key={i} className="fk-cookie-btn" onPointerDown={dragCookie}>
                <Cookie className="fk-cookie" />
              </span>
            ))}
            {tray === 0 && <span className="fk-tray__empty">Kue kering habis dibagi</span>}
          </div>
        ) : (
          <div className="fk-eq">
            <FracSym n={task.take} d={task.plates} />
            <span>dari {task.cookies} = ?</span>
          </div>
        )}
        <div className={'fk-plates' + (shake ? ' fk-plates--shake' : '')}>
          {plates.map((n, i) => (
            <div
              key={i}
              ref={(el) => (plateRefs.current[i] = el)}
              role="button"
              tabIndex={0}
              aria-label={`Piring ${i + 1}, ${n} kue`}
              className={
                'fk-plate fk-plate--share' +
                (phase === 'ask' && i < task.take ? ' fk-plate--on' : '') +
                (phase === 'ask' && i >= task.take ? ' fk-plate--off' : '') +
                (phase === 'deal' && hint >= 2 && i === fewestIx && tray > 0 ? ' fk-plate--glow' : '')
              }
              onClick={(e) => {
                if ((e.target as Element).closest('.fk-cookie')) undeal(i);
                else deal(i);
              }}
            >
              <div className="fk-plate__cookies">
                {Array.from({ length: n }, (_, k) => (
                  <Cookie key={k} className="fk-cookie" />
                ))}
              </div>
              {phase === 'deal' && hint >= 1 && <span className="fk-plate__count">{n}</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="fk-status" aria-live="polite">
        {note ?? (phase === 'deal' ? 'Ketuk piring atau seret kue ke piring' : 'Hitung kue di piring yang menyala')}
      </div>
      {phase === 'ask' && (
        <Choices list={task.choices} hint={hint} onPick={answer} face={(c) => <span className="fk-choice__text">{c.value}</span>} />
      )}
      {ghost && (
        <Ghost rect={ghost} ghostRef={ghostRef}>
          <Cookie className="fk-cookie fk-cookie--ghost" />
        </Ghost>
      )}
    </>
  );
}

/* ---------- stack: tumpuk dua potongan ---------- */

const EDGE = { a: '#e8590c', b: '#1c7ed6' } as const;

function StackTask({ task, hint, done, wrong, ask, prompt }: TaskProps<'stack'>) {
  type Side = 'a' | 'b';
  const [onto, setOnto] = useState<Side | null>(null);
  const [dragSide, setDragSide] = useState<Side | null>(null);
  const [ghost, setGhost] = useState<DOMRect | null>(null);
  const [solved, setSolved] = useState(false);
  const plateRefs = useRef<Record<Side, HTMLDivElement | null>>({ a: null, b: null });
  const foodRefs = useRef<Record<Side, HTMLDivElement | null>>({ a: null, b: null });
  const ghostRef = useRef<HTMLDivElement>(null);
  const frac = { a: task.a, b: task.b };
  const other = (s: Side): Side => (s === 'a' ? 'b' : 'a');
  const range = (f: Frac) => Array.from({ length: f.n }, (_, i) => i);

  const choices = useMemo<KitchenChoice[]>(
    () => [
      { frac: task.a, correct: task.answer === 'a' },
      { frac: task.b, correct: task.answer === 'b' },
      { text: 'Sama besar', correct: task.answer === 'same' },
    ],
    [task],
  );

  function stack(from: Side) {
    if (onto) return;
    sfx('tick');
    setOnto(other(from));
    window.setTimeout(() => {
      if (task.question !== prompt) ask(task.question);
    }, 500);
  }

  function down(e: ReactPointerEvent, side: Side) {
    if (onto || solved) return;
    e.preventDefault();
    let started = false;
    trackPointer(e, {
      move: (dx, dy) => {
        if (!started) {
          started = true;
          const r = foodRefs.current[side]?.getBoundingClientRect();
          if (r) setGhost(r);
          setDragSide(side);
        }
        if (ghostRef.current) ghostRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      },
      end: (x, y, moved) => {
        setGhost(null);
        setDragSide(null);
        if (!moved || inside(plateRefs.current[other(side)]?.getBoundingClientRect(), x, y, 16)) stack(side);
      },
    });
  }

  function pick(c: KitchenChoice) {
    if (solved) return;
    if (c.correct) {
      setSolved(true);
      done();
    } else {
      sfx('tap');
      wrong();
    }
  }

  const sides: Side[] = ['a', 'b'];
  return (
    <>
      <div className={'fk-stage fk-stage--stack' + (onto ? ' fk-stage--stacked' : '')}>
        {sides.map((s) => {
          const moved = onto === other(s);
          const holdsBoth = onto === s;
          return (
            <div key={s} className="fk-stack-col">
              <div
                ref={(el) => (plateRefs.current[s] = el)}
                className={
                  'fk-plate fk-plate--stack' +
                  (!onto && hint >= 1 && s === 'a' ? ' fk-plate--glow' : '') +
                  (holdsBoth ? ' fk-plate--both' : '')
                }
              >
                <div
                  ref={(el) => (foodRefs.current[s] = el)}
                  className={'fk-stack-food' + (!onto && dragSide !== s ? ' fk-stack-food--grab' : '')}
                  onPointerDown={(e) => down(e, s)}
                  style={dragSide === s ? { visibility: 'hidden' } : undefined}
                >
                  <FractionFood
                    food={task.food}
                    d={frac[s].d}
                    show={moved ? [] : range(frac[s])}
                    bare
                    outline
                    edge={EDGE[s]}
                    className="fk-food__svg"
                  />
                  {holdsBoth && (
                    <FractionFood
                      food={task.food}
                      d={frac[other(s)].d}
                      show={range(frac[other(s)])}
                      bare
                      edge={EDGE[other(s)]}
                      className="fk-food__svg fk-over"
                    />
                  )}
                </div>
              </div>
              <div className="fk-stack-label">
                {!moved && <FracSym n={frac[s].n} d={frac[s].d} className={`fk-sym--${s}`} />}
                {holdsBoth && <FracSym n={frac[other(s)].n} d={frac[other(s)].d} className={`fk-sym--${other(s)}`} />}
              </div>
            </div>
          );
        })}
      </div>
      {onto ? (
        <Choices
          list={choices}
          hint={hint}
          onPick={pick}
          face={(c) =>
            c.frac ? (
              <FracSym n={c.frac.n} d={c.frac.d} className={'fk-choice__sym ' + (c.frac === task.a ? 'fk-sym--a' : 'fk-sym--b')} />
            ) : (
              <span className="fk-choice__text fk-choice__text--sm">{c.text}</span>
            )
          }
        />
      ) : (
        <div className="fk-status">Seret satu potongan ke atas potongan lain</div>
      )}
      {ghost && dragSide && (
        <Ghost rect={ghost} ghostRef={ghostRef}>
          <FractionFood food={task.food} d={frac[dragSide].d} show={range(frac[dragSide])} bare edge={EDGE[dragSide]} className="fk-food__svg" />
        </Ghost>
      )}
    </>
  );
}

/* ---------- line: ceri di garis bilangan 0–1 ---------- */

const LW = 300;
const LPAD = 20;

function LineTask({ task, hint, done, wrong }: TaskProps<'line'>) {
  const d = task.order.d;
  const [ix, setIx] = useState(0);
  const ixRef = useRef(0);
  const [shake, doShake] = useShake();
  const [solved, setSolved] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const xOf = (k: number) => LPAD + (k / d) * (LW - 2 * LPAD);
  const pct = (k: number) => (xOf(k) / LW) * 100;

  useLayoutEffect(() => {
    if (!dragging.current && markRef.current) markRef.current.style.left = `${pct(ix)}%`;
  });

  function fracAt(clientX: number): number {
    const r = boxRef.current?.getBoundingClientRect();
    if (!r) return 0;
    const x = ((clientX - r.left) / r.width) * LW;
    return Math.max(0, Math.min(1, (x - LPAD) / (LW - 2 * LPAD)));
  }

  function setFrom(clientX: number, smooth: boolean) {
    const f = fracAt(clientX);
    const k = Math.round(f * d);
    if (smooth && markRef.current) markRef.current.style.left = `${((LPAD + f * (LW - 2 * LPAD)) / LW) * 100}%`;
    if (ixRef.current !== k) {
      ixRef.current = k;
      sfx('tick');
      setIx(k);
    }
  }

  function down(e: ReactPointerEvent) {
    if (solved) return;
    e.preventDefault();
    dragging.current = true;
    setFrom(e.clientX, true);
    trackPointer(e, {
      move: (_dx, _dy, x) => setFrom(x, true),
      end: (x) => {
        dragging.current = false;
        setFrom(x, false);
        if (markRef.current) markRef.current.style.left = `${pct(Math.round(fracAt(x) * d))}%`;
      },
    });
  }

  function check() {
    if (solved) return;
    if (ix === task.order.n) {
      setSolved(true);
      done();
    } else {
      sfx('tap');
      doShake();
      wrong(true);
    }
  }

  const ks = Array.from({ length: d + 1 }, (_, k) => k);
  const barW = (LW - 2 * LPAD) / d;
  return (
    <>
      <div className="fk-stage fk-stage--line">
        <div ref={boxRef} className={'fk-line' + (shake ? ' fk-line--shake' : '')} onPointerDown={down}>
          <svg viewBox={`0 0 ${LW} 112`} className="fk-line__svg" aria-hidden>
            {Array.from({ length: d }, (_, k) => (
              <rect
                key={k}
                x={LPAD + k * barW + 1}
                y={10}
                width={barW - 2}
                height={30}
                rx={3}
                className={k < ix ? 'fk-bar fk-bar--on' : 'fk-bar'}
              />
            ))}
            <line x1={LPAD} y1={74} x2={LW - LPAD} y2={74} className="fk-axis" />
            {ks.map((k) => (
              <line key={k} x1={xOf(k)} y1={66} x2={xOf(k)} y2={82} className="fk-tick" />
            ))}
            {hint >= 2 && <circle cx={xOf(task.order.n)} cy={74} r={11} className="fk-target-ring" />}
            <text x={xOf(0)} y={104} textAnchor="middle" className="fk-line__label">
              0
            </text>
            <text x={xOf(d)} y={104} textAnchor="middle" className="fk-line__label">
              1
            </text>
            {hint >= 1 &&
              ks.slice(1, -1).map((k) => (
                <text key={`h${k}`} x={xOf(k)} y={98} textAnchor="middle" className="fk-line__hint">
                  {k}
                </text>
              ))}
          </svg>
          <div ref={markRef} className="fk-cherry" aria-hidden>
            <svg viewBox="0 0 30 40">
              <path d="M15 4 C17 12 20 16 22 22" stroke="#3f7d2c" strokeWidth={2.4} fill="none" strokeLinecap="round" />
              <path d="M15 4 C19 2 24 4 25 7 C21 8 17 7 15 4Z" fill="#5cb85c" />
              <circle cx={15} cy={28} r={10} fill="#e03131" />
              <circle cx={11.5} cy={24.5} r={2.6} fill="#ff8787" />
            </svg>
          </div>
        </div>
      </div>
      <div className="fk-status">Seret ceri ke tempat pesanan</div>
      <div className="fk-actions fk-actions--center">
        <button type="button" className="btn btn--primary fk-btn fk-give" onClick={check} disabled={solved}>
          ✓ Cocok!
        </button>
      </div>
    </>
  );
}

/* ---------- juice: gelas bergaris sepuluh ---------- */

const G_TOP = 18;
const G_BOT = 186;
const G_H = G_BOT - G_TOP;
const GLASS = 'M22 12 L98 12 L88 192 Q87 196 83 196 L37 196 Q33 196 32 192 Z';

function JuiceTask({ task, hint, done, wrong, ask, prompt }: TaskProps<'juice'>) {
  const fill = task.mode === 'fill';
  const [lvl, setLvl] = useState(fill ? 0 : task.tenths);
  const lvlRef = useRef(lvl);
  const [shake, doShake] = useShake();
  const [solved, setSolved] = useState(false);
  const glassRef = useRef<HTMLDivElement>(null);
  const uid = useMemo(() => `g${Math.random().toString(36).slice(2, 8)}`, []);

  useEffect(() => {
    if (task.mode === 'read' && task.question !== prompt) ask(task.question);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function levelAt(clientY: number): number {
    const r = glassRef.current?.getBoundingClientRect();
    if (!r) return lvl;
    const y = ((clientY - r.top) / r.height) * 200;
    return Math.max(0, Math.min(10, Math.round(((G_BOT - y) / G_H) * 10)));
  }

  function setFrom(y: number) {
    const k = levelAt(y);
    if (lvlRef.current !== k) {
      lvlRef.current = k;
      sfx('tick');
      setLvl(k);
    }
  }

  function down(e: ReactPointerEvent) {
    if (!fill || solved) return;
    e.preventDefault();
    setFrom(e.clientY);
    trackPointer(e, { move: (_dx, _dy, _x, y) => setFrom(y), end: (_x, y) => setFrom(y) });
  }

  function give() {
    if (solved) return;
    if (lvl === task.tenths) {
      setSolved(true);
      done();
    } else {
      sfx('tap');
      doShake();
      wrong(true);
    }
  }

  function pick(c: { text: string; correct?: boolean }) {
    if (solved) return;
    if (c.correct) {
      setSolved(true);
      done();
    } else {
      sfx('tap');
      wrong();
    }
  }

  const marks = Array.from({ length: 9 }, (_, k) => k + 1);
  const yOf = (k: number) => G_BOT - (k / 10) * G_H;
  return (
    <>
      <div className="fk-stage fk-stage--juice">
        <div
          ref={glassRef}
          className={'fk-glass' + (fill ? ' fk-glass--fill' : '') + (shake ? ' fk-glass--shake' : '')}
          onPointerDown={down}
        >
          <svg viewBox="0 0 120 200" className="fk-glass__svg" aria-hidden>
            <defs>
              <clipPath id={uid}>
                <path d={GLASS} />
              </clipPath>
            </defs>
            <path d={GLASS} className="fk-glass__body" />
            <g clipPath={`url(#${uid})`}>
              <rect x={0} y={yOf(lvl)} width={120} height={200} className="fk-juice" />
              {lvl > 0 && <rect x={0} y={yOf(lvl)} width={120} height={3} className="fk-juice__top" />}
            </g>
            {marks.map((k) => (
              <line key={k} x1={k === 5 ? 66 : 74} y1={yOf(k)} x2={92 - (yOf(k) / 200) * 8} y2={yOf(k)} className="fk-mark" />
            ))}
            {hint >= 2 && fill && (
              <line x1={30} y1={yOf(task.tenths)} x2={92} y2={yOf(task.tenths)} className="fk-mark fk-mark--target" />
            )}
            {hint >= 1 &&
              fill &&
              marks.map((k) => (
                <text key={`t${k}`} x={104} y={yOf(k) + 3.5} className="fk-mark__num">
                  {k}
                </text>
              ))}
            <path d={GLASS} className="fk-glass__rim" />
          </svg>
        </div>
        <div className="fk-glass-side">
          <FracSym n={lvl} d={10} className="fk-glass-sym" />
        </div>
      </div>
      {fill ? (
        <>
          <div className="fk-status">Seret di gelas untuk mengisi jus</div>
          <div className="fk-actions fk-actions--center">
            <button type="button" className="btn btn--primary fk-btn fk-give" onClick={give} disabled={solved}>
              ✓ Berikan!
            </button>
          </div>
        </>
      ) : (
        <Choices list={task.choices} hint={hint} onPick={pick} face={(c) => <span className="fk-choice__text">{c.text}</span>} />
      )}
    </>
  );
}

