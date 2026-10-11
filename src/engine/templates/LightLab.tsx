import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { LabEnergy, LabPass, LabStep, LabTask, LabThing } from '@/engine/core/types';
import { sfx, speak } from '@/engine/audio/sound';
import { playTone, primeTones, stopTone } from '@/engine/audio/tones';
import type { ToneSpec } from '@/engine/audio/tones';
import {
  ENERGY,
  PASS_BOX,
  PULL,
  RAIL,
  SHADOW_BASE,
  SHADOW_GOALS,
  SIDE_TOLERANCE,
  angleGap,
  mirrorCells,
  pitchHz,
  pullFits,
  railFor,
  shadowAngle,
  shadowFits,
  shadowScale,
  traceBeam,
} from '@/engine/core/lab';
import { sparkleAt } from '@/engine/ui/juice';
import { BandSvg, GlassSvg, LabPic, Panda, SenterSvg } from '@/engine/ui/Lab';
import '@/engine/ui/light-lab.css';

/**
 * Lab Cahaya & Bunyi (`sd2`, IPAS) — kontrak datanya di `LightLabData` /
 * `LabTask` (types.ts), hitungannya di `core/lab.ts`.
 *
 * Profesor Panda memandu percobaan demi percobaan. Anak MELAKUKAN
 * percobaannya: mematikan lampu kamar, menguji bahan di depan senter, menggeser
 * senter sampai bayangan jatuh/berukuran tepat, memetik karet & memukul
 * gendang (nada SUNGGUHAN lewat `tones.ts`), mengetuk gelas nada, menarik
 * benang telepon kaleng, memutar cermin, mencolokkan alat listrik, dan
 * mematikan alat yang tidak dipakai.
 *
 * Salah taruh/atur/sentuh = SENYAP (`onWrong(true)`): itu bagian dari
 * mencoba. Salah memilih jawaban (`pick`) = overlay "coba lagi".
 *
 * Petunjuk bertingkat (P2): tingkat 1 = aturannya muncul (ciri kotak, zona
 * sasaran, "air banyak = nada rendah"), satu pilihan salah dipudarkan;
 * tingkat 2 = tujuan yang benar menyala / posisi yang benar dibayangkan.
 *
 * Gerakan yang mengikuti jari (senter, karet, gendang, air) ditulis langsung
 * ke DOM lewat ref — nol render React per event pointer (pelajaran PathTrace).
 */

const DRAG_PX = 8;

type Hint = 0 | 1 | 2;

interface TaskProps<K extends LabTask['kind']> {
  task: Extract<LabTask, { kind: K }>;
  hint: Hint;
  done: () => void;
  wrong: (silent?: boolean) => void;
}

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

const inside = (el: Element | null | undefined, x: number, y: number, pad = 10) => {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
};

/**
 * Seret ATAU ketuk. Bayangan seretan = salinan elemennya sendiri di
 * `document.body`, digeser rAF lewat `transform` (nol render React).
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
      ghost.classList.add('lab-ghost');
      Object.assign(ghost.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
      document.body.appendChild(ghost);
      src.classList.add('lab-lifted');
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
    src.classList.remove('lab-lifted');
    end(x, y, moved && ev.type === 'pointerup');
  };
  window.addEventListener('pointermove', mv);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
}

/** Ikuti jari terus-menerus (senter, karet, air). `end` dipanggil saat dilepas. */
function follow(
  e: ReactPointerEvent<Element>,
  move: (x: number, y: number) => void,
  end: (x: number, y: number, moved: boolean) => void,
) {
  if (e.button !== 0 && e.pointerType === 'mouse') return;
  e.preventDefault();
  const id = e.pointerId;
  const x0 = e.clientX;
  const y0 = e.clientY;
  let x = x0;
  let y = y0;
  let moved = false;
  let raf = 0;
  const paint = () => {
    raf = 0;
    move(x, y);
  };
  const mv = (ev: PointerEvent) => {
    if (ev.pointerId !== id) return;
    x = ev.clientX;
    y = ev.clientY;
    if (Math.hypot(x - x0, y - y0) > DRAG_PX) moved = true;
    if (!raf) raf = requestAnimationFrame(paint);
  };
  const up = (ev: PointerEvent) => {
    if (ev.pointerId !== id) return;
    window.removeEventListener('pointermove', mv);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    if (raf) cancelAnimationFrame(raf);
    move(x, y);
    end(x, y, moved);
  };
  window.addEventListener('pointermove', mv);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  move(x, y);
}

function sparkleOn(el: Element | null | undefined, n = 8) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  if (!r.width) return; // pemandu disembunyikan saat HP dimiringkan
  sparkleAt(r.left + r.width / 2, r.top + r.height / 2, n);
}

function useFlash<T>(): [T | null, (v: T) => void] {
  const [on, setOn] = useState<T | null>(null);
  return [
    on,
    (v: T) => {
      setOn(v);
      window.setTimeout(() => setOn(null), 450);
    },
  ];
}

const reduced = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Benda + namanya. */
function Thing({ thing, size = 'md' }: { thing: LabThing; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <>
      <LabPic thing={thing} className={`lab-pic lab-pic--${size}`} />
      <span className="lab-label">{thing.label}</span>
    </>
  );
}

/* ================================================================== */
/*  Template                                                          */
/* ================================================================== */

export default function LightLab({ level, onCorrect, onWrong, narrate, setRepeat, hint }: TemplateProps<'light-lab'>) {
  const steps = level.data.steps;
  const [stepIx, setStepIx] = useState(0);
  const [prompt, setPrompt] = useState(level.narration);
  const [happy, setHappy] = useState(false);
  const promptRef = useRef(prompt);
  const guideRef = useRef<HTMLSpanElement>(null);
  const finished = useRef(false);

  useEffect(() => {
    setRepeat(() => narrate(promptRef.current));
    return () => {
      setRepeat(null);
      stopTone();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const step = steps[stepIx]!;

  function done() {
    if (finished.current) return;
    sparkleOn(guideRef.current);
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
    }, 1200);
  }

  return (
    <div className="lab-wrap">
      <div className="game-prompt lab-prompt">{prompt}</div>
      <div className="game-area lab-area">
        <Guide step={step} stepIx={stepIx} total={steps.length} happy={happy} guideRef={guideRef} />
        <TaskView key={stepIx} task={step.task} hint={hint} done={done} wrong={onWrong} />
      </div>
    </div>
  );
}

function TaskView({ task, ...rest }: { task: LabTask } & Omit<TaskProps<'glow'>, 'task'>) {
  switch (task.kind) {
    case 'glow':
      return <GlowTask task={task} {...rest} />;
    case 'pass':
      return <PassTask task={task} {...rest} />;
    case 'shadow':
      return task.mode === 'side' ? <ShadowSide task={task} {...rest} /> : <ShadowSize task={task} {...rest} />;
    case 'vibrate':
      return <VibrateTask task={task} {...rest} />;
    case 'pitch':
      return task.mode === 'order' ? <PitchOrder task={task} {...rest} /> : <PitchTune task={task} {...rest} />;
    case 'can':
      return <CanTask task={task} {...rest} />;
    case 'mirror':
      return <MirrorTask task={task} {...rest} />;
    case 'power':
      return <PowerTask task={task} {...rest} />;
    case 'saver':
      return <SaverTask task={task} {...rest} />;
    case 'pick':
      return <PickTask task={task} {...rest} />;
  }
}

/* ---------- Profesor Panda ---------- */

function bubbleOf(step: LabStep): ReactNode {
  switch (step.task.kind) {
    case 'glow':
      return '💡';
    case 'pass':
    case 'shadow':
    case 'mirror':
      return '🔦';
    case 'vibrate':
    case 'pitch':
    case 'can':
      return '🔊';
    case 'power':
      return '🔌';
    case 'saver':
      return '🔋';
    case 'pick':
      return '❓';
  }
}

function Guide({
  step,
  stepIx,
  total,
  happy,
  guideRef,
}: {
  step: LabStep;
  stepIx: number;
  total: number;
  happy: boolean;
  guideRef: React.RefObject<HTMLSpanElement>;
}) {
  return (
    <div className="lab-guide">
      <span ref={guideRef} className={'lab-guide__panda' + (happy ? ' lab-guide__panda--happy' : '')} title="Profesor Panda">
        <Panda />
      </span>
      <div className="lab-bubble" key={stepIx}>
        {bubbleOf(step)}
      </div>
      {total > 1 && (
        <div className="lab-pips" aria-label={`Percobaan ${stepIx + 1} dari ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={'lab-pip' + (i < stepIx ? ' lab-pip--done' : i === stepIx ? ' lab-pip--now' : '')} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- glow: matikan lampu, sentuh yang bercahaya sendiri ---------- */

function GlowTask({ task, hint, done, wrong }: TaskProps<'glow'>) {
  const cards = useMemo(() => shuffle(task.cards.map((c, i) => ({ ...c, key: i }))), [task.cards]);
  const need = cards.filter((c) => c.light).length;
  const [dark, setDark] = useState(false);
  const [found, setFound] = useState<number[]>([]);
  const [shake, flash] = useFlash<number | 'switch'>();
  const roomRef = useRef<HTMLDivElement>(null);
  const solved = useRef(false);
  const faded = hint >= 1 ? cards.find((c) => !c.light)?.key : undefined;
  const glowNext = hint >= 2 ? cards.find((c) => c.light && !found.includes(c.key))?.key : undefined;

  function tap(key: number) {
    if (solved.current || found.includes(key)) return;
    if (!dark) {
      sfx('tap');
      flash('switch');
      return;
    }
    const c = cards.find((x) => x.key === key)!;
    if (!c.light) {
      sfx('tap');
      flash(key);
      wrong(true);
      return;
    }
    sfx('tick');
    const f = [...found, key];
    setFound(f);
    if (f.length === need) {
      solved.current = true;
      sparkleOn(roomRef.current, 12);
      window.setTimeout(done, 600);
    }
  }

  return (
    <div ref={roomRef} className={'lab-room' + (dark ? ' lab-room--dark' : '')}>
      <button
        type="button"
        className={
          'lab-switch' + (dark ? ' lab-switch--off' : '') + (shake === 'switch' ? ' lab-shake' : '') + (!dark && hint >= 1 ? ' lab-glow' : '')
        }
        aria-pressed={dark}
        onClick={() => {
          if (dark) return;
          sfx('tick');
          setDark(true);
        }}
      >
        <span className="lab-switch__knob" aria-hidden />
        <span className="lab-switch__text">{dark ? 'Lampu mati' : 'Matikan lampu'}</span>
      </button>
      <div className="lab-cards">
        {cards.map((c) => {
          const lit = found.includes(c.key);
          return (
            <button
              key={c.key}
              type="button"
              aria-label={c.label}
              aria-pressed={lit}
              className={
                'lab-card' +
                (lit ? ' lab-card--lit' : '') +
                (shake === c.key ? ' lab-shake' : '') +
                (faded === c.key ? ' lab-out' : '') +
                (glowNext === c.key ? ' lab-glow' : '')
              }
              disabled={faded === c.key}
              onClick={() => tap(c.key)}
            >
              <Thing thing={c} />
            </button>
          );
        })}
      </div>
      <div className="lab-status" aria-live="polite">
        {dark ? (
          <>
            Bercahaya sendiri: <b>{found.length}</b> dari <b>{need}</b>
          </>
        ) : (
          'Kamarnya masih terang.'
        )}
      </div>
    </div>
  );
}

/* ---------- pass: uji bahan di depan senter, lalu pilah ---------- */

const PASS_ORDER: LabPass[] = ['tembus', 'sebagian', 'tidak'];

function PassTask({ task, hint, done, wrong }: TaskProps<'pass'>) {
  const items = useMemo(() => shuffle(task.items.map((it, i) => ({ ...it, key: i }))), [task.items]);
  const [placed, setPlaced] = useState<Record<number, LabPass>>({});
  const [testing, setTesting] = useState<number | null>(null);
  const [shakeItem, flashItem] = useFlash<number>();
  const [shakeBox, flashBox] = useFlash<LabPass>();
  const boxEls = useRef<Partial<Record<LabPass, HTMLButtonElement | null>>>({});
  const benchRef = useRef<HTMLDivElement>(null);
  const solved = useRef(false);
  const left = items.filter((it) => placed[it.key] === undefined);
  const inTest = testing === null ? null : items.find((x) => x.key === testing) ?? null;
  const focus = inTest ?? left[0];

  function test(key: number) {
    if (solved.current) return;
    sfx('tick');
    setTesting(key);
  }

  function put(key: number, box: LabPass) {
    if (solved.current) return;
    const it = items.find((x) => x.key === key)!;
    if (it.pass !== box) {
      sfx('tap');
      flashItem(key);
      flashBox(box);
      wrong(true);
      return;
    }
    sfx('tick');
    const n = { ...placed, [key]: box };
    setPlaced(n);
    if (testing === key) setTesting(null);
    sparkleOn(boxEls.current[box], 5);
    if (Object.keys(n).length === items.length) {
      solved.current = true;
      window.setTimeout(done, 450);
    }
  }

  function drop(key: number, x: number, y: number, moved: boolean) {
    if (!moved) {
      test(key);
      return;
    }
    if (inside(benchRef.current, x, y, 0)) {
      test(key);
      return;
    }
    const box = PASS_ORDER.find((b) => inside(boxEls.current[b], x, y));
    if (box) put(key, box);
  }

  const result = inTest?.pass ?? 'kosong';

  return (
    <>
      <div ref={benchRef} className={'lab-bench lab-bench--' + result}>
        <svg viewBox="0 0 40 24" className="lab-bench__senter" aria-hidden>
          <SenterSvg />
        </svg>
        <div className="lab-bench__beam" aria-hidden />
        <div className={'lab-bench__slot' + (inTest ? ' lab-bench__slot--full' : '') + (hint >= 1 && !inTest ? ' lab-glow' : '')}>
          {inTest ? (
            <button
              type="button"
              className="lab-thing lab-thing--test"
              aria-label={inTest.label}
              onPointerDown={(e) => grab(e, (x, y, moved) => moved && drop(inTest.key, x, y, true))}
            >
              <LabPic thing={inTest} className="lab-pic lab-pic--md" />
            </button>
          ) : (
            <span className="lab-bench__q">Uji di sini</span>
          )}
        </div>
        <div className="lab-bench__beam lab-bench__beam--after" aria-hidden />
        <div className="lab-bench__screen" aria-label="Layar">
          <span className="lab-bench__spot" />
        </div>
      </div>
      <div className="lab-boxes">
        {PASS_ORDER.map((b) => (
          <button
            key={b}
            ref={(el) => {
              boxEls.current[b] = el;
            }}
            type="button"
            data-box={b}
            className={
              'lab-box lab-box--' +
              b +
              (shakeBox === b ? ' lab-shake' : '') +
              (hint >= 2 && focus?.pass === b ? ' lab-glow' : '')
            }
            onClick={() => inTest && put(inTest.key, b)}
          >
            <span className="lab-box__label">{PASS_BOX[b].label}</span>
            {hint >= 1 && <span className="lab-box__rule">{PASS_BOX[b].rule}</span>}
            <span className="lab-box__in">
              {items
                .filter((it) => placed[it.key] === b)
                .map((it) => (
                  <LabPic key={it.key} thing={it} className="lab-pic lab-pic--xs" />
                ))}
            </span>
          </button>
        ))}
      </div>
      <div className="lab-tray">
        {left
          .filter((it) => it.key !== testing)
          .map((it) => (
            <button
              key={it.key}
              type="button"
              aria-label={it.label}
              className={'lab-thing' + (shakeItem === it.key ? ' lab-shake' : '')}
              onPointerDown={(e) => grab(e, (x, y, moved) => drop(it.key, x, y, moved))}
              onClick={(e) => {
                if (e.detail === 0) test(it.key);
              }}
            >
              <Thing thing={it} size="sm" />
            </button>
          ))}
      </div>
    </>
  );
}

/* ---------- shadow / side: bayangan selalu di seberang senter ---------- */

const RING_R = 37; // senter, % dari pusat
const TARGET_R = 27;

const rad = (deg: number) => (deg * Math.PI) / 180;

function ShadowSide({ task, hint, done, wrong }: { task: Extract<LabTask, { kind: 'shadow'; mode: 'side' }> } & Omit<TaskProps<'shadow'>, 'task'>) {
  const stageRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<SVGGElement>(null);
  const beamRef = useRef<SVGPathElement>(null);
  const shadowRef = useRef<SVGGElement>(null);
  // Senter mulai seperempat putaran dari sasaran: bayangannya jelas belum ke sana,
  // dan senter tidak menutupi gambar sasaran.
  const angle = useRef((task.angle + 90) % 360);
  const [ok, setOk] = useState(false);
  const [shake, setShake] = useState(false);
  const solved = useRef(false);

  function paint() {
    const a = angle.current;
    const px = 50 + RING_R * Math.cos(rad(a));
    const py = 50 + RING_R * Math.sin(rad(a));
    lightRef.current?.setAttribute('transform', `translate(${px} ${py}) rotate(${a + 180}) translate(-14 -8.4) scale(0.7)`);
    const mx = 50 + (RING_R - 10) * Math.cos(rad(a));
    const my = 50 + (RING_R - 10) * Math.sin(rad(a));
    const s = 15;
    const ax = 50 + s * Math.cos(rad(a + 90));
    const ay = 50 + s * Math.sin(rad(a + 90));
    const bx = 50 + s * Math.cos(rad(a - 90));
    const by = 50 + s * Math.sin(rad(a - 90));
    beamRef.current?.setAttribute('d', `M${mx} ${my}L${ax} ${ay}L${bx} ${by}Z`);
    shadowRef.current?.setAttribute('transform', `rotate(${shadowAngle(a)} 50 50)`);
  }

  useEffect(paint, []);

  function onDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (solved.current) return;
    const at = (x: number, y: number) => {
      const r = stageRef.current!.getBoundingClientRect();
      const dx = x - (r.left + r.width / 2);
      const dy = y - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < r.width * 0.12) return;
      angle.current = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
      paint();
    };
    follow(e, at, () => {
      if (solved.current) return;
      if (angleGap(shadowAngle(angle.current), task.angle) <= SIDE_TOLERANCE) {
        solved.current = true;
        sfx('tick');
        setOk(true);
        sparkleOn(stageRef.current, 10);
        window.setTimeout(done, 750);
      } else {
        sfx('tap');
        setShake(true);
        window.setTimeout(() => setShake(false), 450);
        wrong(true);
      }
    });
  }

  const tx = 50 + TARGET_R * Math.cos(rad(task.angle));
  const ty = 50 + TARGET_R * Math.sin(rad(task.angle));
  const want = (task.angle + 180) % 360; // tempat senter yang benar
  const gx = 50 + RING_R * Math.cos(rad(want));
  const gy = 50 + RING_R * Math.sin(rad(want));

  return (
    <div
      ref={stageRef}
      className={'lab-floor' + (ok ? ' lab-floor--ok' : '') + (shake ? ' lab-shake' : '')}
      onPointerDown={onDown}
      role="slider"
      aria-label="Geser senter mengelilingi benda"
      aria-valuenow={Math.round(angle.current)}
    >
      <svg viewBox="0 0 100 100" className="lab-floor__svg" aria-hidden>
        <circle cx="50" cy="50" r="49" className="lab-floor__ground" />
        <circle cx="50" cy="50" r={RING_R} className="lab-floor__ring" />
        {hint >= 1 && <line x1={tx} y1={ty} x2={gx} y2={gy} className="lab-floor__hintline" />}
        {hint >= 2 && (
          <g transform={`translate(${gx} ${gy}) rotate(${want + 180}) translate(-14 -8.4) scale(0.7)`} className="lab-floor__ghost">
            <SenterSvg />
          </g>
        )}
        <path ref={beamRef} className="lab-floor__beam" />
        <g ref={shadowRef}>
          <ellipse cx="66" cy="50" rx="17" ry="6.5" className="lab-floor__shadow" />
        </g>
        <g ref={lightRef}>
          <SenterSvg />
        </g>
      </svg>
      <span className="lab-floor__thing" style={{ left: '50%', top: '50%' }}>
        <LabPic thing={task.thing} className="lab-pic lab-pic--floor" />
      </span>
      <span className={'lab-floor__target' + (ok ? ' lab-floor__target--ok' : '')} style={{ left: `${tx}%`, top: `${ty}%` }}>
        <LabPic thing={task.target} className="lab-pic lab-pic--sm" />
      </span>
    </div>
  );
}

/* ---------- shadow / size: dekat senter = bayangan besar ---------- */

const VB_X0 = -30;
const VB_W = 230;

function ShadowSize({ task, hint, done, wrong }: { task: Extract<LabTask, { kind: 'shadow'; mode: 'size' }> } & Omit<TaskProps<'shadow'>, 'task'>) {
  const railRef = useRef<HTMLDivElement>(null);
  const senterRef = useRef<SVGGElement>(null);
  const beamRef = useRef<SVGPathElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);
  const kelirRef = useRef<HTMLDivElement>(null);
  const lx = useRef<number>(task.goal === 'kecil' ? RAIL.max - 6 : RAIL.min + 4);
  const [ok, setOk] = useState(false);
  const [shake, setShake] = useState(false);
  const solved = useRef(false);
  const goal = SHADOW_GOALS[task.goal];

  function paint() {
    const x = lx.current;
    senterRef.current?.setAttribute('transform', `translate(${x - 28} 13) scale(0.7)`);
    beamRef.current?.setAttribute('d', `M${x} 21L${RAIL.screen} 3L${RAIL.screen} 39Z`);
    if (shadowRef.current) shadowRef.current.style.transform = `translate(-50%, -50%) scale(${shadowScale(x)})`;
  }

  useEffect(paint, []);

  function onDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (solved.current) return;
    const at = (x: number) => {
      const r = railRef.current!.getBoundingClientRect();
      const v = VB_X0 + ((x - r.left) / r.width) * VB_W;
      lx.current = Math.max(RAIL.min, Math.min(RAIL.max, v));
      paint();
    };
    follow(e, (x) => at(x), () => {
      if (solved.current) return;
      if (shadowFits(task.goal, lx.current)) {
        solved.current = true;
        sfx('tick');
        setOk(true);
        sparkleOn(kelirRef.current, 10);
        window.setTimeout(done, 750);
      } else {
        sfx('tap');
        setShake(true);
        window.setTimeout(() => setShake(false), 450);
        wrong(true);
      }
    });
  }

  const frameH = Math.min(goal.frame, 112);
  // Zona rel yang benar (petunjuk tingkat 1).
  const zone = useMemo(() => {
    let a = Infinity;
    let b = -Infinity;
    for (let x = RAIL.min; x <= RAIL.max; x += 0.5) {
      if (shadowFits(task.goal, x)) {
        a = Math.min(a, x);
        b = Math.max(b, x);
      }
    }
    return { a, b };
  }, [task.goal]);

  return (
    <div className={'lab-size' + (shake ? ' lab-shake' : '')}>
      <div ref={kelirRef} className={'lab-kelir' + (ok ? ' lab-kelir--ok' : '')} aria-label="Layar bayangan">
        <span
          className="lab-kelir__frame"
          style={{ top: `${((60 - frameH / 2) / 120) * 100}%`, height: `${(frameH / 120) * 100}%` }}
          aria-hidden
        />
        <span ref={shadowRef} className="lab-kelir__shadow" style={{ height: `${(SHADOW_BASE / 120) * 100}%` }}>
          <LabPic thing={task.thing} className="lab-pic lab-pic--shadow" />
        </span>
      </div>
      <div
        ref={railRef}
        className="lab-rail"
        onPointerDown={onDown}
        role="slider"
        aria-label="Geser senter maju mundur"
      >
        <svg viewBox={`${VB_X0} 0 ${VB_W} 44`} className="lab-rail__svg" aria-hidden>
          <path d={`M${RAIL.min - 20} 36H${RAIL.screen}`} className="lab-rail__track" />
          {hint >= 1 && Number.isFinite(zone.a) && (
            <rect x={zone.a} y="31" width={zone.b - zone.a} height="10" rx="3" className="lab-rail__zone" />
          )}
          {hint >= 2 && (
            <g transform={`translate(${railFor(task.goal) - 28} 13) scale(0.7)`} className="lab-floor__ghost">
              <SenterSvg />
            </g>
          )}
          <path ref={beamRef} className="lab-rail__beam" />
          <rect x={RAIL.screen - 2} y="2" width="6" height="38" rx="1.5" className="lab-rail__screen" />
          <path d={`M${RAIL.thing} 36V28`} className="lab-rail__stand" />
          <g ref={senterRef}>
            <SenterSvg />
          </g>
        </svg>
        <span className="lab-rail__thing" style={{ left: `${((RAIL.thing - VB_X0) / VB_W) * 100}%` }}>
          <LabPic thing={task.thing} className="lab-pic lab-pic--rail" />
        </span>
      </div>
    </div>
  );
}

/* ---------- vibrate: petik karet / pukul gendang ---------- */

const MAX_PULL_PX = 70;

function VibrateTask({ task, hint, done, wrong }: TaskProps<'vibrate'>) {
  const isBand = task.thing === 'karet';
  const tone = (gain: number): ToneSpec =>
    isBand ? { kind: 'karet', hz: 330, gain } : { kind: 'gendang', hz: 110, gain };
  const bandRef = useRef<SVGPathElement | null>(null);
  const memRef = useRef<SVGGElement>(null);
  const stickRef = useRef<SVGGElement>(null);
  const meterRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const anim = useRef(0);
  const vibrating = useRef(false);
  const solved = useRef(false);
  const [state, setState] = useState<'idle' | 'ring' | 'still'>('idle');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    primeTones([0.25, 0.5, 0.85].map(tone));
    bandRef.current = stageRef.current?.querySelector<SVGPathElement>('.lab-band-line') ?? null;
    return () => cancelAnimationFrame(anim.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const HALF = 30 + 3 * 5; // BandSvg pada tingkat 3

  function draw(bend: number, lift: number) {
    if (isBand) bandRef.current?.setAttribute('d', `M${60 - HALF} 20Q60 ${20 + bend} ${60 + HALF} 20`);
    else {
      memRef.current?.setAttribute('transform', `translate(0 ${bend * 0.25})`);
      stickRef.current?.setAttribute('transform', `rotate(${-lift * 55} 98 30)`);
    }
  }

  function meter(p: number) {
    if (meterRef.current) meterRef.current.style.width = `${Math.round(p * 100)}%`;
  }

  function ring(p: number) {
    vibrating.current = true;
    setState('ring');
    playTone(tone(p));
    const t0 = performance.now();
    const life = (0.6 + p) * 1500;
    const still = reduced();
    cancelAnimationFrame(anim.current);
    const frame = (t: number) => {
      const s = (t - t0) / 1000;
      const fade = Math.exp(-s * (3.2 / (0.6 + p)));
      const amp = still ? 0 : p * 14 * fade;
      draw(amp * Math.sin(s * 70), 0);
      if (t - t0 < life && vibrating.current) anim.current = requestAnimationFrame(frame);
      else {
        draw(0, 0);
        if (vibrating.current) {
          vibrating.current = false;
          setState('idle');
        }
      }
    };
    anim.current = requestAnimationFrame(frame);
  }

  function hush() {
    vibrating.current = false;
    cancelAnimationFrame(anim.current);
    stopTone();
    draw(0, 0);
    setState('still');
  }

  function onDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (solved.current) return;
    if (vibrating.current) {
      // Menahan benda yang bergetar = getarannya berhenti, bunyinya berhenti.
      hush();
      if (task.goal === 'stop') {
        solved.current = true;
        sfx('tick');
        sparkleOn(stageRef.current, 10);
        window.setTimeout(done, 700);
        return;
      }
      // Soal keras/pelan: sentuhan yang sama langsung jadi tarikan baru.
    }
    const y0 = e.clientY;
    let p = 0;
    follow(
      e,
      (_x, y) => {
        const dy = isBand ? y - y0 : y0 - y;
        p = Math.max(0, Math.min(1, (isBand ? Math.abs(dy) : dy) / MAX_PULL_PX));
        draw(isBand ? Math.sign(y - y0 || 1) * p * 16 : 0, isBand ? 0 : p);
        meter(p);
      },
      () => {
        draw(0, 0);
        if (p < PULL.pluck) return;
        ring(p);
        if (task.goal === 'stop') return;
        if (pullFits(task.goal, p)) {
          solved.current = true;
          sparkleOn(stageRef.current, 10);
          window.setTimeout(done, 1100);
        } else {
          setShake(true);
          window.setTimeout(() => setShake(false), 450);
          wrong(true);
        }
      },
    );
  }

  const zone = task.goal === 'pelan' ? { a: PULL.pluck, b: PULL.soft } : task.goal === 'keras' ? { a: PULL.loud, b: 1 } : null;

  return (
    <>
      <div
        ref={stageRef}
        className={'lab-vib lab-vib--' + task.thing + (state === 'ring' ? ' lab-vib--ring' : '') + (shake ? ' lab-shake' : '')}
        onPointerDown={onDown}
        role="button"
        aria-label={isBand ? 'Karet gelang' : 'Gendang'}
      >
        {isBand ? (
          <BandSvg tight={0.6} />
        ) : (
          <svg viewBox="0 0 120 80" className="lab-drum-svg" aria-hidden>
            <path d="M24 44v22q36 14 72 0V44" fill="#e8590c" stroke="#3a2e20" strokeWidth="2" />
            <path d="M24 50l12 14M48 52l0 16M72 52l0 16M96 50l-12 14" stroke="#ffd8a8" strokeWidth="2" />
            <g ref={memRef}>
              <ellipse cx="60" cy="44" rx="36" ry="9" fill="#fff4e6" stroke="#3a2e20" strokeWidth="2" />
              {[44, 54, 62, 70, 78].map((x, i) => (
                <ellipse key={i} cx={x} cy={42 + (i % 2) * 3} rx="2" ry="1.2" className="lab-rice" style={{ animationDelay: `${i * 60}ms` }} />
              ))}
            </g>
            <g ref={stickRef}>
              <path d="M98 30L66 38" stroke="#8a5a24" strokeWidth="4" strokeLinecap="round" />
              <circle cx="64" cy="38.5" r="4" fill="#ffd43b" stroke="#3a2e20" strokeWidth="1.5" />
            </g>
          </svg>
        )}
        <span className="lab-vib__hint">{task.goal === 'stop' && state === 'ring' ? '✋ Sentuh!' : isBand ? '↕ Tarik lalu lepas' : '↑ Angkat lalu lepas'}</span>
      </div>
      {task.goal !== 'stop' && (
        <div className="lab-meter" aria-hidden>
          <span className="lab-meter__end">Pelan</span>
          <span className="lab-meter__bar">
            {zone && hint >= 1 && (
              <span className="lab-meter__zone" style={{ left: `${zone.a * 100}%`, width: `${(zone.b - zone.a) * 100}%` }} />
            )}
            <span ref={meterRef} className="lab-meter__fill" />
            {zone && hint >= 2 && <span className="lab-meter__aim" style={{ left: `${((zone.a + zone.b) / 2) * 100}%` }} />}
          </span>
          <span className="lab-meter__end">Keras</span>
        </div>
      )}
      {task.goal === 'stop' && (
        <div className="lab-status" aria-live="polite">
          {state === 'ring' ? 'Bergetar… berbunyi!' : state === 'still' ? 'Diam. Tidak berbunyi.' : 'Belum berbunyi.'}
        </div>
      )}
    </>
  );
}

/* ---------- pitch / order: susun nada rendah → tinggi ---------- */

function SoundThing({ source, v, ring }: { source: 'gelas' | 'karet'; v: number; ring?: boolean }) {
  return source === 'gelas' ? <GlassSvg fill={v} ring={ring} /> : <BandSvg tight={v} bend={ring ? 6 : 0} />;
}

const RULE = { gelas: 'Air banyak = nada rendah', karet: 'Karet kencang = nada tinggi' } as const;

function PitchOrder({ task, hint, done, wrong }: { task: Extract<LabTask, { kind: 'pitch'; mode: 'order' }> } & Omit<TaskProps<'pitch'>, 'task'>) {
  const kind = task.source === 'gelas' ? 'gelas' : 'karet';
  const items = useMemo(() => shuffle(task.levels.map((v, key) => ({ v, key, hz: pitchHz(task.source, v) }))), [task.levels, task.source]);
  const order = useMemo(
    () => [...items].sort((a, b) => (task.dir === 'naik' ? a.hz - b.hz : b.hz - a.hz)).map((x) => x.key),
    [items, task.dir],
  );
  const [filled, setFilled] = useState<number[]>([]);
  const [ringing, setRinging] = useState<number | null>(null);
  const [shake, flash] = useFlash<number>();
  const rowRef = useRef<HTMLDivElement>(null);
  const solved = useRef(false);

  useEffect(() => {
    primeTones(items.map((x) => ({ kind, hz: x.hz })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sound(key: number) {
    const it = items.find((x) => x.key === key)!;
    playTone({ kind, hz: it.hz });
    setRinging(key);
    window.setTimeout(() => setRinging((r) => (r === key ? null : r)), 420);
  }

  function place(key: number) {
    if (solved.current) return;
    if (order[filled.length] !== key) {
      sfx('tap');
      flash(key);
      wrong(true);
      return;
    }
    sound(key);
    const f = [...filled, key];
    setFilled(f);
    if (f.length === items.length) {
      solved.current = true;
      // Mainkan deretannya sebagai lagu pendek: rendah → tinggi (atau sebaliknya).
      const tunes = task.melody ? [...f, ...[...f].reverse().slice(1)] : f;
      tunes.forEach((k, i) => window.setTimeout(() => sound(k), 500 + i * 330));
      window.setTimeout(() => {
        sparkleOn(rowRef.current, 12);
        done();
      }, 600 + tunes.length * 330);
    }
  }

  function use(key: number, x: number, y: number, moved: boolean) {
    if (!moved) {
      sound(key);
      return;
    }
    if (inside(rowRef.current, x, y, 16)) place(key);
  }

  const next = order[filled.length];

  return (
    <>
      <div ref={rowRef} className={'lab-slots lab-slots--' + kind}>
        <span className="lab-slots__arrow" aria-hidden>
          {task.dir === 'naik' ? 'Rendah ➜ Tinggi' : 'Tinggi ➜ Rendah'}
        </span>
        <div className="lab-slots__row" style={{ ['--n' as string]: items.length }}>
          {order.map((_, pos) => {
            const key = filled[pos];
            const it = key === undefined ? null : items.find((x) => x.key === key)!;
            return (
              <div key={pos} className={'lab-slot' + (it ? ' lab-slot--full' : pos === filled.length ? ' lab-slot--next' : '')}>
                {it ? (
                  <button type="button" className="lab-sound" aria-label="Ketuk untuk mendengar" onClick={() => sound(it.key)}>
                    <SoundThing source={task.source} v={it.v} ring={ringing === it.key} />
                  </button>
                ) : (
                  <span className="lab-slot__n">{pos + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {hint >= 1 && <div className="lab-rule">{RULE[kind]}</div>}
      <div className="lab-tray lab-tray--sound" style={{ ['--n' as string]: items.length }}>
        {items
          .filter((it) => !filled.includes(it.key))
          .map((it) => (
            <button
              key={it.key}
              type="button"
              aria-label="Ketuk untuk mendengar, seret ke tempatnya"
              data-hz={Math.round(it.hz)}
              className={
                'lab-sound lab-sound--tray' + (shake === it.key ? ' lab-shake' : '') + (hint >= 2 && next === it.key ? ' lab-glow' : '')
              }
              onPointerDown={(e) => grab(e, (x, y, moved) => use(it.key, x, y, moved))}
              onClick={(e) => {
                if (e.detail === 0) place(it.key);
              }}
            >
              <SoundThing source={task.source} v={it.v} ring={ringing === it.key} />
            </button>
          ))}
      </div>
    </>
  );
}

/* ---------- pitch / tune: atur air / kencangkan karet ---------- */

function PitchTune({ task, hint, done, wrong }: { task: Extract<LabTask, { kind: 'pitch'; mode: 'tune' }> } & Omit<TaskProps<'pitch'>, 'task'>) {
  const kind = task.source === 'gelas' ? 'gelas' : 'karet';
  const [v, setV] = useState(task.start);
  const vRef = useRef(task.start);
  const [ringing, setRinging] = useState<'ref' | 'mine' | null>(null);
  const [shake, setShake] = useState(false);
  const mineRef = useRef<HTMLButtonElement>(null);
  const solved = useRef(false);

  useEffect(() => {
    primeTones([0, 0.2, 0.4, 0.6, 0.8, 1].map((x) => ({ kind, hz: pitchHz(task.source, x) })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sound(which: 'ref' | 'mine', val: number) {
    playTone({ kind, hz: pitchHz(task.source, val) });
    setRinging(which);
    window.setTimeout(() => setRinging((r) => (r === which ? null : r)), 420);
  }

  function onDown(e: ReactPointerEvent<HTMLButtonElement>) {
    if (solved.current) return;
    const el = mineRef.current!;
    let last = Math.round(vRef.current * 5);
    follow(
      e,
      (x, y) => {
        const r = el.getBoundingClientRect();
        const f =
          kind === 'gelas'
            ? 1 - (y - r.top - r.height * 0.1) / (r.height * 0.8)
            : (x - r.left - r.width * 0.1) / (r.width * 0.8);
        const val = Math.max(0, Math.min(1, f));
        const step = Math.round(val * 5);
        if (step !== last) {
          last = step;
          sfx('tick');
        }
        vRef.current = step / 5;
        setV(step / 5);
      },
      (_x, _y, moved) => {
        if (!moved) sound('mine', vRef.current);
      },
    );
  }

  function check() {
    if (solved.current) return;
    const mine = pitchHz(task.source, vRef.current);
    const ref = pitchHz(task.source, task.ref);
    const ok = task.goal === 'tinggi' ? mine > ref : mine < ref;
    if (ok) {
      solved.current = true;
      sound('mine', vRef.current);
      sparkleOn(mineRef.current, 10);
      window.setTimeout(done, 650);
    } else {
      sfx('tap');
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
      wrong(true);
    }
  }

  // Satu tingkat yang benar, untuk petunjuk tingkat 2.
  const aim = (() => {
    const refHz = pitchHz(task.source, task.ref);
    for (const x of task.goal === 'tinggi' ? [0, 0.2, 0.4, 0.6, 0.8, 1] : [1, 0.8, 0.6, 0.4, 0.2, 0]) {
      const hz = pitchHz(task.source, x);
      if (task.goal === 'tinggi' ? hz > refHz : hz < refHz) return x;
    }
    return task.ref;
  })();

  return (
    <>
      <div className={'lab-tune lab-tune--' + kind}>
        <div className="lab-tune__col">
          <button type="button" className="lab-sound lab-tune__item" aria-label="Contoh: ketuk untuk mendengar" onClick={() => sound('ref', task.ref)}>
            <SoundThing source={task.source} v={task.ref} ring={ringing === 'ref'} />
          </button>
          <span className="lab-tune__name">Contoh</span>
        </div>
        <div className="lab-tune__col">
          <button
            ref={mineRef}
            type="button"
            className={'lab-sound lab-tune__item lab-tune__item--mine' + (shake ? ' lab-shake' : '')}
            aria-label={kind === 'gelas' ? 'Gelasmu: seret naik turun untuk mengatur air' : 'Karetmu: seret ke kanan untuk mengencangkan'}
            data-level={v}
            onPointerDown={onDown}
          >
            <SoundThing source={task.source} v={v} ring={ringing === 'mine'} />
            {hint >= 2 && (
              <span
                className={'lab-tune__aim lab-tune__aim--' + kind}
                style={kind === 'gelas' ? { bottom: `${10 + aim * 70}%` } : { left: `${10 + aim * 80}%` }}
                aria-hidden
              />
            )}
          </button>
          <span className="lab-tune__name">{kind === 'gelas' ? '↕ Gelasmu' : '↔ Karetmu'}</span>
        </div>
      </div>
      {hint >= 1 && <div className="lab-rule">{RULE[kind]}</div>}
      <button type="button" className="btn btn--primary lab-check" onClick={check}>
        ✓ Cocok!
      </button>
    </>
  );
}

/* ---------- can: telepon kaleng ---------- */

const STRING_LEN = 112;
const CAN_A = 44;

function CanTask({ task, done }: TaskProps<'can'>) {
  const stageRef = useRef<HTMLDivElement>(null);
  const friendRef = useRef<HTMLSpanElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const fx = useRef(118);
  const [taut, setTaut] = useState(false);
  const solved = useRef(false);

  function paint() {
    const x = fx.current;
    const canB = x - 16;
    const gap = canB - CAN_A;
    const sag = Math.max(0, STRING_LEN - gap) * 0.55;
    pathRef.current?.setAttribute('d', `M${CAN_A} 46Q${(CAN_A + canB) / 2} ${46 + sag} ${canB} 46`);
    if (friendRef.current) friendRef.current.style.left = `${(x / 200) * 100}%`;
  }

  useEffect(paint, []);

  function onDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (solved.current) return;
    const max = CAN_A + 16 + STRING_LEN;
    follow(
      e,
      (x) => {
        const r = stageRef.current!.getBoundingClientRect();
        const v = ((x - r.left) / r.width) * 200;
        fx.current = Math.max(100, Math.min(max, v));
        paint();
      },
      () => {
        if (solved.current) return;
        if (fx.current >= max - 3) {
          solved.current = true;
          fx.current = max;
          paint();
          setTaut(true);
          sparkleOn(friendRef.current, 8);
          let left = false;
          const go = () => {
            if (left) return;
            left = true;
            done();
          };
          speak(task.line, go);
          window.setTimeout(go, 6500);
        }
      },
    );
  }

  return (
    <div
      ref={stageRef}
      className={'lab-can' + (taut ? ' lab-can--taut' : '')}
      onPointerDown={onDown}
      role="slider"
      aria-label="Tarik temanmu sampai benangnya kencang"
    >
      <svg viewBox="0 0 200 80" className="lab-can__svg" aria-hidden>
        <path ref={pathRef} className="lab-can__string" />
        {taut &&
          [0, 1, 2].map((i) => (
            <circle key={i} r="2.6" className="lab-can__wave" style={{ animationDelay: `${i * 0.25}s` }}>
              <animateMotion dur="1s" repeatCount="indefinite" begin={`${i * 0.25}s`} path={`M${CAN_A} 46H${CAN_A + STRING_LEN}`} />
            </circle>
          ))}
        <rect x={CAN_A - 8} y="38" width="10" height="16" rx="2" className="lab-can__tin" />
      </svg>
      <span className="lab-can__who lab-can__who--panda">
        <Panda />
      </span>
      <span ref={friendRef} className="lab-can__who lab-can__who--friend">
        <span className="lab-can__tin2" aria-hidden />
        <LabPic thing={task.friend} className="lab-pic lab-pic--friend" />
      </span>
      <span className="lab-can__hint">{taut ? '🔊 Suaranya sampai!' : '➜ Tarik temanmu'}</span>
    </div>
  );
}

/* ---------- mirror: putar cermin ---------- */

function MirrorTask({ task, done }: TaskProps<'mirror'>) {
  const grid = task.grid;
  const rows = grid.length;
  const cols = grid[0]!.length;
  const mirrors = useMemo(() => mirrorCells(grid), [grid]);
  const [turn, setTurn] = useState<string[]>(() => mirrors.map((m) => grid[m.r]![m.c]!));
  const [ok, setOk] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const solved = useRef(false);
  const beam = traceBeam(grid, turn);

  useEffect(() => {
    if (beam.end === 'target' && !solved.current) {
      solved.current = true;
      setOk(true);
      sfx('tick');
      window.setTimeout(() => sparkleOn(boardRef.current, 12), 200);
      window.setTimeout(done, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beam.end]);

  // Ujung sinar: sampai tepi sel terakhir ke arah geraknya.
  const pts = beam.path.map((p) => [p.c * 10 + 5, p.r * 10 + 5]);
  if (beam.end !== 'target') {
    const last = pts[pts.length - 1]!;
    const d = [
      [5, 0],
      [0, 5],
      [-5, 0],
      [0, -5],
    ][beam.dir]!;
    pts.push([last[0]! + d[0]!, last[1]! + d[1]!]);
  }

  return (
    <div
      ref={boardRef}
      className={'lab-mirror' + (ok ? ' lab-mirror--ok' : '')}
      style={{ ['--cols' as string]: cols, ['--rows' as string]: rows }}
    >
      {grid.flatMap((row, r) =>
        [...row].map((ch, c) => {
          const mi = mirrors.findIndex((m) => m.r === r && m.c === c);
          if (mi >= 0) {
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                aria-label="Cermin: ketuk untuk memutar"
                data-turn={turn[mi]}
                className="lab-mcell lab-mcell--mirror"
                onClick={() => {
                  if (solved.current) return;
                  sfx('tick');
                  setTurn(turn.map((t, i) => (i === mi ? (t === '/' ? '\\' : '/') : t)));
                }}
              >
                <span className={'lab-mirror__glass lab-mirror__glass--' + (turn[mi] === '/' ? 'a' : 'b')} />
              </button>
            );
          }
          return (
            <span key={`${r}-${c}`} className={'lab-mcell' + (ch === '#' ? ' lab-mcell--wall' : '')}>
              {ch === 'T' && <span className={'lab-mirror__plant' + (ok ? ' lab-mirror__plant--ok' : '')}>{ok ? '🌻' : '🌱'}</span>}
              {'><^v'.includes(ch) && (
                <svg viewBox="0 0 40 24" className={'lab-mirror__senter lab-mirror__senter--' + '><^v'.indexOf(ch)} aria-hidden>
                  <SenterSvg />
                </svg>
              )}
            </span>
          );
        }),
      )}
      <svg viewBox={`0 0 ${cols * 10} ${rows * 10}`} className="lab-mirror__beam" aria-hidden preserveAspectRatio="none">
        <polyline points={pts.map((p) => p.join(',')).join(' ')} />
      </svg>
    </div>
  );
}

/* ---------- power: colokkan alat, tempel energinya ---------- */

function PowerTask({ task, hint, done, wrong }: TaskProps<'power'>) {
  const devices = useMemo(() => task.devices.map((d, key) => ({ ...d, key })), [task.devices]);
  const labels = useMemo(
    () => shuffle([...new Set([...devices.map((d) => d.energy), ...task.extra])]),
    [devices, task.extra],
  );
  const [on, setOn] = useState<number[]>([]);
  const [tag, setTag] = useState<Record<number, LabEnergy>>({});
  const [sel, setSel] = useState<LabEnergy | null>(null);
  const [shakeDev, flashDev] = useFlash<number>();
  const [shakeLab, flashLab] = useFlash<LabEnergy>();
  const devEls = useRef<Record<number, HTMLButtonElement | null>>({});
  const solved = useRef(false);
  const used = new Set(Object.values(tag));
  const nextDev = devices.find((d) => tag[d.key] === undefined);
  const fadedExtra = hint >= 1 ? task.extra.find((x) => !devices.some((d) => d.energy === x)) : undefined;

  useEffect(() => {
    primeTones([{ kind: 'gelas', hz: 1318 }]);
  }, []);

  function power(key: number) {
    if (on.includes(key)) return;
    sfx('tick');
    setOn([...on, key]);
    const d = devices.find((x) => x.key === key)!;
    if (d.art === 'bel' || d.art === 'radio') playTone({ kind: 'gelas', hz: 1318, gain: 0.6 });
  }

  function attach(key: number, energy: LabEnergy) {
    if (solved.current || tag[key] !== undefined) return;
    setSel(null);
    if (!on.includes(key)) {
      // Belum dicolokkan: belum kelihatan jadi apa — bukan salah.
      sfx('tap');
      flashDev(key);
      return;
    }
    const d = devices.find((x) => x.key === key)!;
    if (d.energy !== energy) {
      sfx('tap');
      flashDev(key);
      flashLab(energy);
      wrong(true);
      return;
    }
    sfx('tick');
    const t = { ...tag, [key]: energy };
    setTag(t);
    sparkleOn(devEls.current[key], 6);
    if (Object.keys(t).length === devices.length) {
      solved.current = true;
      window.setTimeout(done, 600);
    }
  }

  return (
    <>
      <div className="lab-devices" style={{ ['--n' as string]: devices.length }}>
        {devices.map((d) => {
          const isOn = on.includes(d.key);
          const t = tag[d.key];
          return (
            <button
              key={d.key}
              ref={(el) => {
                devEls.current[d.key] = el;
              }}
              type="button"
              aria-label={d.label + (isOn ? ' menyala' : ' belum dicolokkan')}
              aria-pressed={isOn}
              className={
                'lab-device' +
                (isOn ? ' lab-on' : '') +
                (shakeDev === d.key ? ' lab-shake' : '') +
                (!isOn && hint >= 1 ? ' lab-glow' : '')
              }
              onClick={() => (isOn ? sel && attach(d.key, sel) : power(d.key))}
            >
              <LabPic thing={d} className="lab-pic lab-pic--device" />
              <span className="lab-label">{d.label}</span>
              <span className={'lab-device__plug' + (isOn ? ' lab-device__plug--in' : '')} aria-hidden>
                🔌
              </span>
              <span className={'lab-device__tag' + (t ? ' lab-device__tag--set' : '')}>
                {t ? `${ENERGY[t].emoji} ${ENERGY[t].label}` : isOn ? 'jadi … ?' : 'Ketuk colokkan'}
              </span>
            </button>
          );
        })}
      </div>
      <div className="lab-energies">
        {labels.map((e) => {
          const isUsed = used.has(e) && !devices.some((d) => d.energy === e && tag[d.key] === undefined);
          return (
            <button
              key={e}
              type="button"
              data-energy={e}
              className={
                'lab-energy' +
                (sel === e ? ' lab-energy--sel' : '') +
                (shakeLab === e ? ' lab-shake' : '') +
                (fadedExtra === e ? ' lab-out' : '') +
                (hint >= 2 && nextDev && on.includes(nextDev.key) && nextDev.energy === e ? ' lab-glow' : '')
              }
              disabled={isUsed || fadedExtra === e}
              onPointerDown={(ev) =>
                grab(ev, (x, y, moved) => {
                  if (!moved) {
                    setSel(sel === e ? null : e);
                    return;
                  }
                  const hit = devices.find((d) => inside(devEls.current[d.key], x, y));
                  if (hit) attach(hit.key, e);
                })
              }
              onClick={(ev) => {
                if (ev.detail === 0) setSel(sel === e ? null : e);
              }}
            >
              <span aria-hidden>{ENERGY[e].emoji}</span> {ENERGY[e].label}
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ---------- saver: matikan alat yang tidak dipakai ---------- */

function SaverTask({ task, hint, done, wrong }: TaskProps<'saver'>) {
  const cards = useMemo(() => shuffle(task.cards.map((c, i) => ({ ...c, key: i }))), [task.cards]);
  const need = cards.filter((c) => c.off).length;
  const [off, setOff] = useState<number[]>([]);
  const [shake, flash] = useFlash<number>();
  const gridRef = useRef<HTMLDivElement>(null);
  const solved = useRef(false);
  const faded = hint >= 1 ? cards.find((c) => !c.off)?.key : undefined;
  const glowNext = hint >= 2 ? cards.find((c) => c.off && !off.includes(c.key))?.key : undefined;
  const usage = 1 - (off.length / Math.max(1, need)) * 0.7;

  function tap(key: number) {
    if (solved.current || off.includes(key)) return;
    const c = cards.find((x) => x.key === key)!;
    if (!c.off) {
      sfx('tap');
      flash(key);
      wrong(true);
      return;
    }
    sfx('tick');
    const f = [...off, key];
    setOff(f);
    if (f.length === need) {
      solved.current = true;
      sparkleOn(gridRef.current, 10);
      window.setTimeout(done, 600);
    }
  }

  return (
    <>
      <div className="lab-usage" aria-label="Listrik yang terpakai">
        <span className="lab-usage__icon" aria-hidden>
          ⚡
        </span>
        <span className="lab-usage__bar">
          <span className="lab-usage__fill" style={{ width: `${usage * 100}%` }} />
        </span>
      </div>
      <div ref={gridRef} className="lab-cards lab-cards--saver">
        {cards.map((c) => {
          const isOff = off.includes(c.key);
          return (
            <button
              key={c.key}
              type="button"
              aria-label={c.label}
              aria-pressed={isOff}
              className={
                'lab-card lab-card--power' +
                (isOff ? '' : ' lab-on') +
                (shake === c.key ? ' lab-shake' : '') +
                (faded === c.key ? ' lab-out' : '') +
                (glowNext === c.key ? ' lab-glow' : '')
              }
              disabled={faded === c.key}
              onClick={() => tap(c.key)}
            >
              <Thing thing={c} />
              <span className={'lab-card__switch' + (isOff ? ' lab-card__switch--off' : '')} aria-hidden />
            </button>
          );
        })}
      </div>
      <div className="lab-status" aria-live="polite">
        Dimatikan: <b>{off.length}</b> dari <b>{need}</b>
      </div>
    </>
  );
}

/* ---------- pick: pilih jawaban ---------- */

function PickTask({ task, hint, done, wrong }: TaskProps<'pick'>) {
  const list = useMemo(() => shuffle(task.choices.map((c, i) => ({ ...c, key: i }))), [task.choices]);
  const faded = hint >= 1 ? list.find((c) => !c.correct)?.key : undefined;
  const solved = useRef(false);
  const cueRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  function pick(c: (typeof list)[number]) {
    if (solved.current) return;
    if (c.correct) {
      solved.current = true;
      sparkleOn(cueRef.current ?? listRef.current, 10);
      window.setTimeout(done, 450);
    } else {
      sfx('tap');
      wrong();
    }
  }

  return (
    <>
      {task.cue && (
        <div ref={cueRef} className="lab-cue">
          <Thing thing={task.cue} size="lg" />
        </div>
      )}
      <div ref={listRef} className="lab-choices">
        {list.map((c) => (
          <button
            key={c.key}
            type="button"
            aria-label={c.label}
            className={
              'choice-card lab-choice' + (c.key === faded ? ' choice-card--out' : '') + (hint >= 2 && c.correct ? ' lab-glow' : '')
            }
            disabled={c.key === faded}
            onClick={() => pick(c)}
          >
            <Thing thing={c} size="sm" />
          </button>
        ))}
      </div>
    </>
  );
}
