import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { BatikId, OrnamentPiece, PaintStep, PaintTask } from '@/engine/core/types';
import {
  BATIK,
  batikLine,
  batikTitle,
  mixLine,
  mixPaint,
  PAINT_HEX,
  paintName,
  paintTemp,
  type PaintColor,
} from '@/engine/core/paint';
import { sfx, speak } from '@/engine/audio/sound';
import { sparkleAt } from '@/engine/ui/juice';
import ItemPic from '@/engine/ui/ItemPic';
import {
  BatikTileArt,
  Bowl,
  ColorWheel,
  Ornament,
  PaintBlob,
  PaintLabel,
  PaintTube,
  PaletteBoard,
} from '@/engine/ui/Paint';
import '@/engine/ui/paint-studio.css';

/**
 * Sanggar Warna (`sd2`, Seni Rupa) — kontrak datanya di `PaintStudioData` /
 * `PaintTask` (types.ts).
 *
 * Kucing pelukis menerima pesanan karya dari pelanggan hewan, satu per satu.
 * Anak MEMEGANG warnanya, bukan memilih kartu:
 * - `palette`  tabung cat diseret/diketuk ke lubang palet;
 * - `mix`      dua tetes cat jatuh ke mangkuk, warnanya berubah PERLAHAN
 *              sambil diaduk (rAF langsung ke DOM), lalu namanya dibacakan —
 *              campuran yang salah tetap diperlihatkan ("merah + biru = ungu");
 * - `recipe`   pilih resep dua warna dari sebuah warna jadi;
 * - `border`   keping hiasan disusun di pinggiran kain;
 * - `sort`     cat dipilah ke toples warna panas / warna dingin;
 * - `batik`    lengkapi kain batik dari keping, atau kenali nama motifnya;
 * - `mirror`   warnai separuh kanan motif supaya simetris (pilih cat, ketuk kotak).
 *
 * Salah taruh/campur/warnai = SENYAP (`onWrong(true)`): itu bagian dari mencoba.
 * Salah menjawab pertanyaan (resep, nama motif) = overlay "coba lagi".
 *
 * Petunjuk bertingkat (P2): tingkat 1 menyalakan yang perlu dilihat (roda
 * warna, pola ulangnya, kotak pasangannya); tingkat 2 memperlihatkan satu
 * langkah (tabung/keping yang benar menyala, satu pilihan salah dipudarkan).
 */

const DRAG_PX = 8;
/** Lama mangkuk diaduk sampai warnanya jadi. */
const MIX_MS = 1100;

type Hint = 0 | 1 | 2;

interface TaskProps<K extends PaintTask['kind']> {
  task: Extract<PaintTask, { kind: K }>;
  hint: Hint;
  done: () => void;
  wrong: (silent?: boolean) => void;
}

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

const inside = (el: Element | null | undefined, x: number, y: number, pad = 12) => {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
};

/**
 * Seret ATAU ketuk. Bayangan seretan = salinan elemennya sendiri yang ditaruh
 * di `document.body` dan digeser rAF lewat `transform` (nol render React).
 */
function grab(e: ReactPointerEvent<HTMLElement>, end: (x: number, y: number, moved: boolean) => void) {
  if (e.button !== 0 && e.pointerType === 'mouse') return;
  const src = e.currentTarget;
  const id = e.pointerId;
  const x0 = e.clientX;
  const y0 = e.clientY;
  let x = x0;
  let y = y0;
  let ghost: HTMLElement | null = null;
  let raf = 0;
  const paint = () => {
    raf = 0;
    if (ghost) ghost.style.transform = `translate(${x - x0}px, ${y - y0}px) scale(1.08)`;
  };
  const mv = (ev: PointerEvent) => {
    if (ev.pointerId !== id) return;
    x = ev.clientX;
    y = ev.clientY;
    if (!ghost && Math.hypot(x - x0, y - y0) > DRAG_PX) {
      const r = src.getBoundingClientRect();
      ghost = src.cloneNode(true) as HTMLElement;
      ghost.classList.add('ps-ghost');
      Object.assign(ghost.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
      document.body.appendChild(ghost);
      src.classList.add('ps-lifted');
    }
    if (ghost && !raf) raf = requestAnimationFrame(paint);
  };
  const up = (ev: PointerEvent) => {
    if (ev.pointerId !== id) return;
    window.removeEventListener('pointermove', mv);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    if (raf) cancelAnimationFrame(raf);
    const moved = !!ghost;
    ghost?.remove();
    src.classList.remove('ps-lifted');
    end(x, y, moved && ev.type === 'pointerup');
  };
  window.addEventListener('pointermove', mv);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
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

function sparkleOn(el: Element | null | undefined, n = 8) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  sparkleAt(r.left + r.width / 2, r.top + r.height / 2, n);
}

/** Tahan sampai kalimatnya selesai terdengar (paling lama `max` ms). */
function speakThen(text: string, then: () => void, max = 5000) {
  let fired = false;
  const go = () => {
    if (fired) return;
    fired = true;
    then();
  };
  speak(text, go);
  window.setTimeout(go, max);
}

/* ================================================================== */
/*  Template                                                          */
/* ================================================================== */

export default function PaintStudio({ level, onCorrect, onWrong, narrate, setRepeat, hint }: TemplateProps<'paint-studio'>) {
  const steps = level.data.steps;
  const [stepIx, setStepIx] = useState(0);
  const [prompt, setPrompt] = useState(level.narration);
  const [happy, setHappy] = useState(false);
  const promptRef = useRef(prompt);
  const custRef = useRef<HTMLDivElement>(null);
  const finished = useRef(false);

  useEffect(() => {
    setRepeat(() => narrate(promptRef.current));
    return () => setRepeat(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const step = steps[stepIx]!;

  function done() {
    if (finished.current) return;
    sparkleOn(custRef.current);
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
      if (next.say) {
        promptRef.current = next.say;
        setPrompt(next.say);
        narrate(next.say);
      }
    }, 1000);
  }

  return (
    <div className="ps-wrap">
      <div className="game-prompt ps-prompt">{prompt}</div>
      <div className="game-area ps-area">
        <Counter step={step} stepIx={stepIx} total={steps.length} happy={happy} custRef={custRef} />
        <TaskView key={stepIx} task={step.task} hint={hint} done={done} wrong={onWrong} />
      </div>
    </div>
  );
}

function TaskView({ task, ...rest }: { task: PaintTask } & Omit<TaskProps<'mix'>, 'task'>) {
  switch (task.kind) {
    case 'palette':
      return <PaletteTask task={task} {...rest} />;
    case 'mix':
      return <MixTask task={task} {...rest} />;
    case 'recipe':
      return <RecipeTask task={task} {...rest} />;
    case 'border':
      return <BorderTask task={task} {...rest} />;
    case 'sort':
      return <SortTask task={task} {...rest} />;
    case 'batik':
      return task.mode === 'fill' ? <BatikFillTask task={task} {...rest} /> : <BatikNameTask task={task} {...rest} />;
    case 'mirror':
      return <MirrorTask task={task} {...rest} />;
  }
}

/* ---------- sanggar: Kucing pelukis, pelanggan, gelembung pesanan ---------- */

function bubbleOf(task: PaintTask): ReactNode {
  switch (task.kind) {
    case 'mix':
      return (
        <span className="ps-bubble__swatch">
          <PaintBlob color={task.target} className="ps-bubble__blob" />
          <PaintLabel color={task.target} />
        </span>
      );
    case 'recipe':
      return <span className="ps-bubble__q">? + ?</span>;
    case 'palette':
      return <span className="ps-bubble__q">🎨</span>;
    case 'border':
      return <Ornament {...pieceProps(task.pattern[0]!)} className="ps-bubble__orn" />;
    case 'sort':
      return <span className="ps-bubble__q">☀️ 🌊</span>;
    case 'batik':
      return <BatikTileArt m={task.motif} className="ps-bubble__batik" />;
    case 'mirror':
      return <span className="ps-bubble__q">◧ ◨</span>;
  }
}

function Counter({
  step,
  stepIx,
  total,
  happy,
  custRef,
}: {
  step: PaintStep;
  stepIx: number;
  total: number;
  happy: boolean;
  custRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="ps-counter">
      <div className="ps-host" title="Kucing pelukis">
        <ItemPic id="cat" className="ps-host__img" fallbackClassName="ps-host__emoji" />
        <span className="ps-host__beret" aria-hidden />
      </div>
      <div key={stepIx} ref={custRef} className={'ps-customer' + (happy ? ' ps-customer--happy' : '')}>
        <ItemPic id={step.customer} className="ps-customer__img" fallbackClassName="ps-customer__emoji" />
      </div>
      <div className="ps-bubble" key={`b${stepIx}`}>
        {bubbleOf(step.task)}
      </div>
      {total > 1 && (
        <div className="ps-pips" aria-label={`Pesanan ${stepIx + 1} dari ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={'ps-pip' + (i < stepIx ? ' ps-pip--done' : i === stepIx ? ' ps-pip--now' : '')} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- tabung cat ---------- */

function Tubes({
  tubes,
  glow,
  out,
  selected,
  shakeOf,
  onUse,
}: {
  tubes: PaintColor[];
  glow?: PaintColor[];
  out?: PaintColor[];
  selected?: PaintColor | null;
  shakeOf?: PaintColor | null;
  onUse: (c: PaintColor, x: number, y: number, moved: boolean) => void;
}) {
  return (
    <div className="ps-tubes" style={{ ['--n' as string]: tubes.length }}>
      {tubes.map((c) => (
        <button
          key={c}
          type="button"
          data-color={c}
          aria-label={`Cat ${paintName(c)}`}
          className={
            'ps-tube' +
            (glow?.includes(c) ? ' ps-glow' : '') +
            (out?.includes(c) ? ' ps-out' : '') +
            (selected === c ? ' ps-tube--sel' : '') +
            (shakeOf === c ? ' ps-shake' : '')
          }
          disabled={out?.includes(c)}
          onPointerDown={(e) => grab(e, (x, y, moved) => onUse(c, x, y, moved))}
          onClick={(e) => {
            if (e.detail === 0) onUse(c, 0, 0, false);
          }}
        >
          <PaintTube color={c} className="ps-tube__svg" />
          <PaintLabel color={c} />
        </button>
      ))}
    </div>
  );
}

/* ---------- palette: isi palet ---------- */

function PaletteTask({ task, hint, done, wrong }: TaskProps<'palette'>) {
  const tubes = useMemo(() => shuffle(task.tubes), [task.tubes]);
  const [slots, setSlots] = useState<(PaintColor | null)[]>(() => [
    ...(task.given ?? []),
    ...task.want.map(() => null),
  ]);
  const [shakeOf, setShakeOf] = useState<PaintColor | null>(null);
  const [boardShake, shakeBoard] = useShake();
  const boardRef = useRef<HTMLDivElement>(null);
  const solved = useRef(false);
  const missing = task.want.filter((c) => !slots.includes(c));

  function use(c: PaintColor, x: number, y: number, moved: boolean) {
    if (solved.current) return;
    if (moved && !inside(boardRef.current, x, y)) return;
    if (slots.includes(c)) return;
    if (!task.want.includes(c)) {
      sfx('tap');
      setShakeOf(c);
      window.setTimeout(() => setShakeOf(null), 450);
      shakeBoard();
      wrong(true);
      return;
    }
    sfx('tick');
    const next = [...slots];
    next[next.indexOf(null)] = c;
    setSlots(next);
    if (!next.includes(null)) {
      solved.current = true;
      sparkleOn(boardRef.current);
      window.setTimeout(done, 400);
    }
  }

  return (
    <>
      <div className="ps-stage">
        <div ref={boardRef} className={'ps-palette' + (boardShake ? ' ps-shake' : '')}>
          <PaletteBoard slots={slots} className="ps-palette__svg" />
        </div>
        {hint >= 1 && <ColorWheel className="ps-wheel" />}
      </div>
      <div className="ps-status">
        {slots.map((c, i) => (
          <span key={i} className="ps-status__slot">
            {c ? paintName(c) : '?'}
          </span>
        ))}
      </div>
      <Tubes
        tubes={tubes}
        shakeOf={shakeOf}
        glow={hint >= 2 ? missing.slice(0, 1) : undefined}
        out={hint >= 2 ? tubes.filter((c) => !task.want.includes(c)).slice(0, 2) : undefined}
        onUse={use}
      />
    </>
  );
}

/* ---------- mix: campur di mangkuk ---------- */

function lerpHex(a: string, b: string, t: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a);
  const B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i]! - v) * t).toString(16).padStart(2, '0')).join('');
}

function recipeOf(target: PaintColor, tubes: PaintColor[]): PaintColor[] {
  for (const a of tubes) for (const b of tubes) if (a !== b && mixPaint(a, b) === target) return [a, b];
  return [];
}

function MixTask({ task, hint, done, wrong }: TaskProps<'mix'>) {
  const tubes = useMemo(() => shuffle(task.tubes), [task.tubes]);
  const [drops, setDrops] = useState<PaintColor[]>([]);
  const [result, setResult] = useState<PaintColor | null>(null);
  const [busy, setBusy] = useState(false);
  const bowlRef = useRef<HTMLDivElement>(null);
  const paintRef = useRef<SVGEllipseElement>(null);
  const swirlRef = useRef<SVGPathElement>(null);
  const solved = useRef(false);
  const recipe = recipeOf(task.target, task.tubes);
  const secondary = ['oranye', 'hijau', 'ungu'].includes(task.target);

  function stir(a: PaintColor, b: PaintColor, r: PaintColor) {
    setBusy(true);
    const paint = paintRef.current;
    const swirl = swirlRef.current;
    const from = PAINT_HEX[a];
    const to = PAINT_HEX[r];
    const t0 = performance.now();
    const ms = reduced() ? 1 : MIX_MS;
    const frame = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      const ease = t * t * (3 - 2 * t);
      if (paint) paint.setAttribute('fill', lerpHex(from, to, ease));
      if (swirl) {
        swirl.setAttribute('stroke', PAINT_HEX[b]);
        swirl.setAttribute('opacity', String(1 - ease));
        swirl.setAttribute('transform', `rotate(${ease * 540} 60 27) scale(1 1)`);
      }
      if (t < 1) requestAnimationFrame(frame);
      else finish(r);
    };
    requestAnimationFrame(frame);
  }

  function finish(r: PaintColor) {
    setResult(r);
    if (r === task.target) {
      solved.current = true;
      sparkleOn(bowlRef.current, 10);
      speakThen(mixLine(r), done, 3200);
      return;
    }
    sfx('wrong');
    wrong(true);
    speak(mixLine(r));
    window.setTimeout(() => {
      setDrops([]);
      setResult(null);
      setBusy(false);
      if (paintRef.current) paintRef.current.setAttribute('fill', 'transparent');
    }, 2200);
  }

  function use(c: PaintColor, x: number, y: number, moved: boolean) {
    if (busy || solved.current) return;
    if (moved && !inside(bowlRef.current, x, y, 24)) return;
    sfx('tick');
    const next = [...drops, c];
    setDrops(next);
    if (next.length === 1) {
      if (paintRef.current) paintRef.current.setAttribute('fill', PAINT_HEX[c]);
      return;
    }
    const r = mixPaint(next[0]!, c)!;
    stir(next[0]!, c, r);
  }

  return (
    <>
      <div className="ps-stage">
        <div ref={bowlRef} className={'ps-bowl' + (drops.length ? ' ps-bowl--wet' : '')} data-result={result ?? ''}>
          <Bowl color={null} paintRef={paintRef} swirlRef={swirlRef} className="ps-bowl__svg" />
        </div>
        {hint >= 1 && secondary && <ColorWheel mark={task.target} className="ps-wheel" />}
      </div>
      <div className="ps-status ps-status--eq" aria-live="polite">
        <Drop c={drops[0]} />
        <span className="ps-op">+</span>
        <Drop c={drops[1]} glow={hint >= 1 && !secondary && drops.length === 0 ? recipe[0] : undefined} />
        <span className="ps-op">=</span>
        <Drop c={result ?? undefined} q />
      </div>
      <Tubes
        tubes={tubes}
        glow={hint >= 2 ? recipe : hint >= 1 && !secondary ? recipe.slice(0, 1) : undefined}
        onUse={use}
      />
    </>
  );
}

function Drop({ c, q, glow }: { c?: PaintColor; q?: boolean; glow?: PaintColor }) {
  if (!c)
    return (
      <span className={'ps-drop ps-drop--empty' + (glow ? ' ps-glow' : '')}>
        {glow ? <PaintBlob color={glow} className="ps-drop__blob ps-drop__blob--ghost" /> : null}
        <span className="ps-drop__q">{q ? '?' : ''}</span>
      </span>
    );
  return (
    <span className="ps-drop">
      <PaintBlob color={c} className="ps-drop__blob" />
      <PaintLabel color={c} />
    </span>
  );
}

/* ---------- recipe: dicampur dari apa? ---------- */

function RecipeTask({ task, hint, done, wrong }: TaskProps<'recipe'>) {
  const list = useMemo(() => shuffle(task.choices), [task.choices]);
  const faded = hint >= 2 ? task.choices.find((c) => !c.correct) : undefined;
  const solved = useRef(false);
  const bowlRef = useRef<HTMLDivElement>(null);
  function pick(c: (typeof task.choices)[number]) {
    if (solved.current) return;
    if (c.correct) {
      solved.current = true;
      sparkleOn(bowlRef.current, 10);
      window.setTimeout(done, 500);
    } else {
      sfx('tap');
      wrong();
    }
  }
  return (
    <>
      <div className="ps-stage">
        <div ref={bowlRef} className="ps-bowl ps-bowl--wet">
          <Bowl color={PAINT_HEX[task.target]} className="ps-bowl__svg" />
          <span className="ps-bowl__name">{paintName(task.target)}</span>
        </div>
        {hint >= 1 && <ColorWheel mark={task.target} className="ps-wheel" />}
      </div>
      <div className="ps-choices">
        {list.map((c, i) => (
          <button
            key={i}
            type="button"
            className={'choice-card ps-choice' + (c === faded ? ' choice-card--out' : '')}
            disabled={c === faded}
            onClick={() => pick(c)}
            aria-label={`${paintName(c.a)} dan ${paintName(c.b)}`}
          >
            <span className="ps-choice__half">
              <PaintBlob color={c.a} className="ps-choice__blob" />
              <PaintLabel color={c.a} />
            </span>
            <span className="ps-op ps-op--sm">+</span>
            <span className="ps-choice__half">
              <PaintBlob color={c.b} className="ps-choice__blob" />
              <PaintLabel color={c.b} />
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------- border: pinggiran kain ---------- */

const pieceProps = (p: OrnamentPiece) => ({ o: p.o, color: p.c, flip: p.flip });
const samePiece = (a: OrnamentPiece, b: OrnamentPiece) => a.o === b.o && a.c === b.c && !!a.flip === !!b.flip;

/** Panjang satuan pola yang berulang (AB = 2, ABB = 3). */
export function periodOf(pattern: OrnamentPiece[]): number {
  for (let p = 1; p < pattern.length; p += 1) {
    if (pattern.every((x, i) => samePiece(x, pattern[i % p]!))) return p;
  }
  return pattern.length;
}

function BorderTask({ task, hint, done, wrong }: TaskProps<'border'>) {
  const tray = useMemo(() => shuffle(task.tray), [task.tray]);
  const [filled, setFilled] = useState(task.shown);
  const [shakeIx, setShakeIx] = useState<number | null>(null);
  const [stripShake, shakeStrip] = useShake();
  const stripRef = useRef<HTMLDivElement>(null);
  const solved = useRef(false);
  const period = periodOf(task.pattern);
  const want = task.pattern[filled];

  function use(i: number, x: number, y: number, moved: boolean) {
    if (solved.current || !want) return;
    if (moved && !inside(stripRef.current, x, y, 20)) return;
    if (!samePiece(tray[i]!, want)) {
      sfx('tap');
      setShakeIx(i);
      window.setTimeout(() => setShakeIx(null), 450);
      shakeStrip();
      wrong(true);
      return;
    }
    sfx('tick');
    const n = filled + 1;
    setFilled(n);
    if (n >= task.pattern.length) {
      solved.current = true;
      sparkleOn(stripRef.current, 10);
      window.setTimeout(done, 450);
    }
  }

  return (
    <>
      <div className="ps-stage ps-stage--cloth">
        <div
          ref={stripRef}
          className={'ps-strip' + (stripShake ? ' ps-shake' : '')}
          style={{ ['--n' as string]: task.pattern.length }}
        >
          {task.pattern.map((p, i) => (
            <span
              key={i}
              className={
                'ps-strip__cell' +
                (i < filled ? '' : ' ps-strip__cell--empty') +
                (i === filled ? ' ps-strip__cell--next' : '') +
                (hint >= 1 && i < period ? ' ps-strip__cell--unit' : '')
              }
            >
              {i < filled && <Ornament {...pieceProps(p)} className="ps-orn" />}
            </span>
          ))}
        </div>
      </div>
      <div className="ps-tray ps-tray--orn">
        {tray.map((p, i) => (
          <button
            key={i}
            type="button"
            aria-label="Keping hiasan"
            className={
              'ps-piece' + (shakeIx === i ? ' ps-shake' : '') + (hint >= 2 && want && samePiece(p, want) ? ' ps-glow' : '')
            }
            onPointerDown={(e) => grab(e, (x, y, moved) => use(i, x, y, moved))}
            onClick={(e) => {
              if (e.detail === 0) use(i, 0, 0, false);
            }}
          >
            <Ornament {...pieceProps(p)} className="ps-orn" />
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------- sort: warna panas & dingin ---------- */

function SortTask({ task, hint, done, wrong }: TaskProps<'sort'>) {
  const colors = useMemo(() => shuffle(task.colors), [task.colors]);
  const [placed, setPlaced] = useState<Record<string, 'panas' | 'dingin'>>({});
  const [sel, setSel] = useState<PaintColor | null>(null);
  const [shakeOf, setShakeOf] = useState<PaintColor | null>(null);
  const jarRefs = { panas: useRef<HTMLButtonElement>(null), dingin: useRef<HTMLButtonElement>(null) };
  const solved = useRef(false);
  const left = colors.filter((c) => !placed[c]);
  const next = left[0];

  function put(c: PaintColor, jar: 'panas' | 'dingin') {
    if (solved.current) return;
    setSel(null);
    if (paintTemp(c) !== jar) {
      sfx('tap');
      setShakeOf(c);
      window.setTimeout(() => setShakeOf(null), 450);
      wrong(true);
      return;
    }
    sfx('tick');
    const n = { ...placed, [c]: jar };
    setPlaced(n);
    sparkleOn(jarRefs[jar].current, 5);
    if (Object.keys(n).length === colors.length) {
      solved.current = true;
      window.setTimeout(done, 450);
    }
  }

  function use(c: PaintColor, x: number, y: number, moved: boolean) {
    if (!moved) {
      setSel(sel === c ? null : c);
      return;
    }
    if (inside(jarRefs.panas.current, x, y)) put(c, 'panas');
    else if (inside(jarRefs.dingin.current, x, y)) put(c, 'dingin');
  }

  const jar = (k: 'panas' | 'dingin') => (
    <button
      ref={jarRefs[k]}
      type="button"
      className={
        `ps-jar ps-jar--${k}` + (hint >= 2 && next && paintTemp(next) === k ? ' ps-glow' : '') + (sel ? ' ps-jar--ready' : '')
      }
      onClick={() => sel && put(sel, k)}
      aria-label={k === 'panas' ? 'Toples warna panas' : 'Toples warna dingin'}
    >
      <span className="ps-jar__head">
        <span aria-hidden>{k === 'panas' ? '☀️' : '🌊'}</span> {k === 'panas' ? 'Panas' : 'Dingin'}
      </span>
      <span className="ps-jar__in">
        {colors
          .filter((c) => placed[c] === k)
          .map((c) => (
            <PaintBlob key={c} color={c} className="ps-jar__blob" />
          ))}
      </span>
    </button>
  );

  return (
    <>
      <div className="ps-stage ps-stage--jars">
        {jar('panas')}
        {hint >= 1 && <ColorWheel temp className="ps-wheel ps-wheel--mid" />}
        {jar('dingin')}
      </div>
      <div className="ps-tray">
        {left.map((c) => (
          <button
            key={c}
            type="button"
            data-color={c}
            aria-label={`Cat ${paintName(c)}`}
            className={
              'ps-swatch' +
              (sel === c ? ' ps-tube--sel' : '') +
              (shakeOf === c ? ' ps-shake' : '') +
              (hint >= 2 && c === next ? ' ps-glow' : '')
            }
            onPointerDown={(e) => grab(e, (x, y, moved) => use(c, x, y, moved))}
            onClick={(e) => {
              if (e.detail === 0) use(c, 0, 0, false);
            }}
          >
            <PaintBlob color={c} className="ps-swatch__blob" />
            <PaintLabel color={c} />
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------- batik ---------- */

const CLOTH_COLS = 3;
const CLOTH_ROWS = 2;

function Cloth({
  motif,
  holes,
  filled,
  glowIx,
  clothRef,
  shake,
}: {
  motif: BatikId;
  holes: number[];
  filled: number[];
  glowIx?: number;
  clothRef?: React.Ref<HTMLDivElement>;
  shake?: boolean;
}) {
  return (
    <div ref={clothRef} className={'ps-cloth' + (shake ? ' ps-shake' : '')} data-motif={motif}>
      {Array.from({ length: CLOTH_COLS * CLOTH_ROWS }, (_, i) => {
        const empty = holes.includes(i) && !filled.includes(i);
        return (
          <span
            key={i}
            className={'ps-cloth__tile' + (empty ? ' ps-cloth__tile--hole' : '') + (glowIx === i ? ' ps-glow' : '')}
          >
            {!empty && <BatikTileArt m={motif} className="ps-cloth__svg" />}
          </span>
        );
      })}
    </div>
  );
}

type BatikProps<M extends 'fill' | 'name'> = Omit<TaskProps<'batik'>, 'task'> & {
  task: Extract<PaintTask, { kind: 'batik'; mode: M }>;
};

function BatikFillTask({ task, hint, done, wrong }: BatikProps<'fill'>) {
  const tray = useMemo(() => shuffle([{ m: task.motif }, ...task.decoys]), [task.motif, task.decoys]);
  const [filled, setFilled] = useState<number[]>([]);
  const [shakeIx, setShakeIx] = useState<number | null>(null);
  const [clothShake, shakeCloth] = useShake();
  const clothRef = useRef<HTMLDivElement>(null);
  const solved = useRef(false);
  const nextHole = task.holes.find((h) => !filled.includes(h));
  const neighbour = nextHole === undefined ? undefined : [nextHole - 1, nextHole + 1, nextHole - 3, nextHole + 3].find(
    (i) => i >= 0 && i < 6 && !task.holes.includes(i) && Math.abs((i % 3) - (nextHole % 3)) <= 1,
  );

  function use(i: number, x: number, y: number, moved: boolean) {
    if (solved.current || nextHole === undefined) return;
    if (moved && !inside(clothRef.current, x, y, 16)) return;
    const t = tray[i]!;
    if (t.m !== task.motif || t.flip) {
      sfx('tap');
      setShakeIx(i);
      window.setTimeout(() => setShakeIx(null), 450);
      shakeCloth();
      wrong(true);
      return;
    }
    sfx('tick');
    const f = [...filled, nextHole];
    setFilled(f);
    if (f.length === task.holes.length) {
      solved.current = true;
      sparkleOn(clothRef.current, 10);
      window.setTimeout(done, 500);
    }
  }

  return (
    <>
      <div className="ps-stage ps-stage--cloth">
        <Cloth
          motif={task.motif}
          holes={task.holes}
          filled={filled}
          glowIx={hint >= 1 ? neighbour : undefined}
          clothRef={clothRef}
          shake={clothShake}
        />
      </div>
      <div className="ps-status">
        <span className="ps-batik-name">
          Batik {BATIK[task.motif]!.name} · {BATIK[task.motif]!.from}
        </span>
      </div>
      <div className="ps-tray ps-tray--batik">
        {tray.map((t, i) => (
          <button
            key={i}
            type="button"
            aria-label="Keping kain"
            className={
              'ps-piece ps-piece--batik' +
              (shakeIx === i ? ' ps-shake' : '') +
              (hint >= 2 && t.m === task.motif && !t.flip ? ' ps-glow' : '')
            }
            onPointerDown={(e) => grab(e, (x, y, moved) => use(i, x, y, moved))}
            onClick={(e) => {
              if (e.detail === 0) use(i, 0, 0, false);
            }}
          >
            <BatikTileArt m={t.m} flip={t.flip} className="ps-piece__batik" />
          </button>
        ))}
      </div>
    </>
  );
}

function BatikNameTask({ task, hint, done, wrong }: BatikProps<'name'>) {
  const list = useMemo(() => shuffle(task.choices), [task.choices]);
  const [solvedName, setSolved] = useState(false);
  const solved = useRef(false);
  const clothRef = useRef<HTMLDivElement>(null);
  const faded = hint >= 2 ? task.choices.find((c) => c !== task.motif) : undefined;
  function pick(id: BatikId) {
    if (solved.current) return;
    if (id === task.motif) {
      solved.current = true;
      setSolved(true);
      sparkleOn(clothRef.current, 10);
      speakThen(batikLine(id), done, 5000);
    } else {
      sfx('tap');
      wrong();
    }
  }
  return (
    <>
      <div className="ps-stage ps-stage--cloth">
        <Cloth motif={task.motif} holes={[]} filled={[]} clothRef={clothRef} />
      </div>
      <div className="ps-status">
        {solvedName ? (
          <span className="ps-batik-name">
            Batik {BATIK[task.motif]!.name} · {BATIK[task.motif]!.from}
          </span>
        ) : hint >= 1 ? (
          <span className="ps-batik-name ps-batik-name--hint">dari {BATIK[task.motif]!.from}</span>
        ) : null}
      </div>
      <div className="ps-choices ps-choices--names">
        {list.map((id) => (
          <button
            key={id}
            type="button"
            className={'choice-card ps-choice ps-choice--name' + (id === faded ? ' choice-card--out' : '')}
            disabled={id === faded}
            onClick={() => pick(id)}
          >
            {batikTitle(id)}
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------- mirror: warnai supaya simetris ---------- */

function MirrorTask({ task, hint, done, wrong }: TaskProps<'mirror'>) {
  const rows = task.grid.length;
  const cols = task.grid[0]!.length;
  const half = cols / 2;
  const brushes = useMemo(
    () => [...new Set(task.grid.join('').replace(/\./g, '').split(''))].map((k) => task.colors[k]!),
    [task.grid, task.colors],
  );
  const [painted, setPainted] = useState<Set<string>>(new Set());
  const [brush, setBrush] = useState<PaintColor | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [needBrush, setNeedBrush] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const solved = useRef(false);

  const want = (r: number, c: number): PaintColor | null => {
    const k = task.grid[r]![c]!;
    return k === '.' ? null : task.colors[k]!;
  };
  const todo: [number, number][] = [];
  for (let r = 0; r < rows; r += 1)
    for (let c = half; c < cols; c += 1) if (want(r, c) && !painted.has(`${r}:${c}`)) todo.push([r, c]);
  const first = todo[0];

  useEffect(() => {
    if (hint >= 2 && first) setBrush(want(first[0], first[1]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hint]);

  function tap(r: number, c: number) {
    if (solved.current || c < half) return;
    const key = `${r}:${c}`;
    if (painted.has(key)) return;
    if (!brush) {
      setNeedBrush(true);
      window.setTimeout(() => setNeedBrush(false), 700);
      return;
    }
    if (want(r, c) !== brush) {
      sfx('tap');
      setFlash(key);
      window.setTimeout(() => setFlash(null), 450);
      wrong(true);
      return;
    }
    sfx('tick');
    const n = new Set(painted);
    n.add(key);
    setPainted(n);
    if (todo.length === 1) {
      solved.current = true;
      sparkleOn(gridRef.current, 10);
      window.setTimeout(done, 500);
    }
  }

  const partner = first ? `${first[0]}:${cols - 1 - first[1]}` : null;
  return (
    <>
      <div className="ps-stage ps-stage--grid">
        <div
          ref={gridRef}
          className={'ps-grid' + (hint >= 1 ? ' ps-grid--axis' : '')}
          style={{ ['--cols' as string]: cols, ['--rows' as string]: rows }}
          role="grid"
        >
          {task.grid.map((line, r) =>
            line.split('').map((_, c) => {
              const key = `${r}:${c}`;
              const left = c < half;
              const col = left ? want(r, c) : painted.has(key) ? want(r, c) : null;
              const mark = hint >= 1 && (key === partner || (first && key === `${first[0]}:${first[1]}`));
              return (
                <button
                  key={key}
                  type="button"
                  data-cell={key}
                  aria-label={left ? 'Kotak contoh' : 'Kotak untuk diwarnai'}
                  className={
                    'ps-cell' +
                    (left ? ' ps-cell--given' : '') +
                    (c === half ? ' ps-cell--axis' : '') +
                    (flash === key ? ' ps-cell--no' : '') +
                    (mark ? ' ps-cell--mark' : '')
                  }
                  style={col ? { background: PAINT_HEX[col] } : undefined}
                  disabled={left}
                  onClick={() => tap(r, c)}
                />
              );
            }),
          )}
        </div>
      </div>
      <Tubes
        tubes={brushes}
        selected={brush}
        glow={needBrush ? brushes : hint >= 2 && first ? [want(first[0], first[1])!] : undefined}
        onUse={(c) => {
          sfx('tap');
          setBrush(c);
        }}
      />
    </>
  );
}
