import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { EcoBin, EcoStep, EcoTask, EcoThing } from '@/engine/core/types';
import { sfx } from '@/engine/audio/sound';
import { sparkleAt } from '@/engine/ui/juice';
import ItemPic from '@/engine/ui/ItemPic';
import { BIN_HEX, EcoPic, TongArt } from '@/engine/ui/Eco';
import '@/engine/ui/eco-mission.css';

/**
 * Sahabat Bumi (`sd2`, IPAS) — kontrak datanya di `EcoMissionData` / `EcoTask`
 * (types.ts).
 *
 * Kura-kura penjaga sungai memandu misi demi misi. Anak MEMEGANG bendanya:
 * - `sort`  sampah diseret (atau diketuk lalu ketuk tongnya) ke tong yang
 *           benar; di langkah sungai, sampahnya hanyut di air dan begitu
 *           bersih seekor bebek kembali berenang;
 * - `spot`  sentuh semua kebiasaan yang boros / merusak;
 * - `cycle` susun daur air di lingkaran (searah jarum jam);
 * - `pick`  pilih satu jawaban;
 * - `plant` tanam pohon di lubang-lubang tepi sungai.
 *
 * Salah taruh/sentuh/susun = SENYAP (`onWrong(true)`): itu bagian dari
 * mencoba. Salah memilih jawaban (`pick`) = overlay "coba lagi".
 *
 * Petunjuk bertingkat (P2): tingkat 1 = ciri tiap tong muncul, satu kartu
 * yang benar-benar baik dipudarkan, tempat berikutnya di lingkaran menyala,
 * satu pilihan salah dipudarkan; tingkat 2 = tujuan yang benar ikut menyala.
 */

const DRAG_PX = 8;

type Hint = 0 | 1 | 2;

interface TaskProps<K extends EcoTask['kind']> {
  task: Extract<EcoTask, { kind: K }>;
  hint: Hint;
  river?: boolean;
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
      ghost.classList.add('eco-ghost');
      Object.assign(ghost.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
      document.body.appendChild(ghost);
      src.classList.add('eco-lifted');
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
    src.classList.remove('eco-lifted');
    end(x, y, moved && ev.type === 'pointerup');
  };
  window.addEventListener('pointermove', mv);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
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

/** Benda + namanya. */
function Thing({ thing, size = 'md' }: { thing: EcoThing; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <>
      <EcoPic thing={thing} className={`eco-pic eco-pic--${size}`} />
      <span className="eco-label">{thing.label}</span>
    </>
  );
}

/* ================================================================== */
/*  Template                                                          */
/* ================================================================== */

export default function EcoMission({ level, onCorrect, onWrong, narrate, setRepeat, hint }: TemplateProps<'eco-mission'>) {
  const steps = level.data.steps;
  const [stepIx, setStepIx] = useState(0);
  const [prompt, setPrompt] = useState(level.narration);
  const [happy, setHappy] = useState(false);
  const promptRef = useRef(prompt);
  const guideRef = useRef<HTMLDivElement>(null);
  const finished = useRef(false);

  useEffect(() => {
    setRepeat(() => narrate(promptRef.current));
    return () => setRepeat(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const step = steps[stepIx]!;

  function done() {
    if (finished.current) return;
    sparkleOn(guideRef.current);
    setHappy(true);
    if (stepIx + 1 >= steps.length) {
      finished.current = true;
      // Bebek di sungai bersih / pohon baru perlu sempat terlihat dulu.
      window.setTimeout(onCorrect, step.river || step.task.kind === 'plant' ? 900 : 0);
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
    }, 1300);
  }

  return (
    <div className="eco-wrap">
      <div className="game-prompt eco-prompt">{prompt}</div>
      <div className="game-area eco-area">
        <Guide step={step} stepIx={stepIx} total={steps.length} happy={happy} guideRef={guideRef} />
        <TaskView key={stepIx} task={step.task} river={step.river} hint={hint} done={done} wrong={onWrong} />
      </div>
    </div>
  );
}

function TaskView({ task, ...rest }: { task: EcoTask } & Omit<TaskProps<'sort'>, 'task'>) {
  switch (task.kind) {
    case 'sort':
      return <SortTask task={task} {...rest} />;
    case 'spot':
      return <SpotTask task={task} {...rest} />;
    case 'cycle':
      return <CycleTask task={task} {...rest} />;
    case 'pick':
      return <PickTask task={task} {...rest} />;
    case 'plant':
      return <PlantTask task={task} {...rest} />;
  }
}

/* ---------- Kura-kura penjaga sungai ---------- */

function bubbleOf(step: EcoStep): ReactNode {
  const t = step.task;
  switch (t.kind) {
    case 'sort':
      return (
        <span className="eco-bubble__tongs">
          {t.bins.map((b) => (
            <span key={b.id} className="eco-bubble__dot" style={{ background: BIN_HEX[b.color].body }} />
          ))}
        </span>
      );
    case 'spot':
      return '🔍';
    case 'cycle':
      return '🔄';
    case 'pick':
      return '❓';
    case 'plant':
      return '🌱';
  }
}

function Guide({
  step,
  stepIx,
  total,
  happy,
  guideRef,
}: {
  step: EcoStep;
  stepIx: number;
  total: number;
  happy: boolean;
  guideRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="eco-guide">
      <div ref={guideRef} className={'eco-turtle' + (happy ? ' eco-turtle--happy' : '')} title="Kura-kura penjaga sungai">
        <ItemPic id="turtle" className="eco-turtle__img" fallbackClassName="eco-turtle__emoji" />
      </div>
      <div className="eco-bubble" key={stepIx}>
        {bubbleOf(step)}
      </div>
      {total > 1 && (
        <div className="eco-pips" aria-label={`Misi ${stepIx + 1} dari ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={'eco-pip' + (i < stepIx ? ' eco-pip--done' : i === stepIx ? ' eco-pip--now' : '')} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- sort: pilah ke tong ---------- */

function Bin({
  bin,
  placed,
  glow,
  ready,
  showRule,
  flash,
  binRef,
  onTap,
}: {
  bin: EcoBin;
  placed: EcoThing[];
  glow: boolean;
  ready: boolean;
  showRule: boolean;
  flash: boolean;
  binRef: (el: HTMLButtonElement | null) => void;
  onTap: () => void;
}) {
  const c = BIN_HEX[bin.color];
  return (
    <button
      ref={binRef}
      type="button"
      data-bin={bin.id}
      aria-label={bin.label}
      className={
        `eco-bin eco-bin--${bin.look}` +
        (glow ? ' eco-glow' : '') +
        (ready ? ' eco-bin--ready' : '') +
        (flash ? ' eco-shake' : '')
      }
      style={{ ['--bin' as string]: c.body, ['--bin-soft' as string]: c.soft }}
      onClick={onTap}
    >
      {bin.look === 'tong' ? (
        <TongArt color={bin.color} className="eco-bin__tong" />
      ) : (
        <span className="eco-bin__emoji" aria-hidden>
          {bin.emoji}
        </span>
      )}
      <span className="eco-bin__label">{bin.label}</span>
      {showRule && bin.rule && <span className="eco-bin__rule">{bin.rule}</span>}
      <span className="eco-bin__in">
        {placed.map((t, i) => (
          <EcoPic key={i} thing={t} className="eco-pic eco-pic--xs" />
        ))}
      </span>
    </button>
  );
}

function SortTask({ task, hint, river, done, wrong }: TaskProps<'sort'>) {
  const items = useMemo(() => shuffle(task.items.map((it, i) => ({ ...it, key: i }))), [task.items]);
  const [placed, setPlaced] = useState<Record<number, string>>({});
  const [sel, setSel] = useState<number | null>(null);
  const [shakeItem, flashItem] = useFlash<number>();
  const [shakeBin, flashBin] = useFlash<string>();
  const binEls = useRef<Record<string, HTMLButtonElement | null>>({});
  const [solved, setSolved] = useState(false);
  const left = items.filter((it) => placed[it.key] === undefined);
  const next = left[0];

  function put(key: number, binId: string) {
    if (solved) return;
    setSel(null);
    const it = items.find((x) => x.key === key)!;
    if (it.bin !== binId) {
      sfx('tap');
      flashItem(key);
      flashBin(binId);
      wrong(true);
      return;
    }
    sfx('tick');
    const n = { ...placed, [key]: binId };
    setPlaced(n);
    sparkleOn(binEls.current[binId], 5);
    if (Object.keys(n).length === items.length) {
      setSolved(true);
      window.setTimeout(done, river ? 700 : 450);
    }
  }

  function use(key: number, x: number, y: number, moved: boolean) {
    if (solved) return;
    if (!moved) {
      setSel(sel === key ? null : key);
      return;
    }
    const hit = task.bins.find((b) => inside(binEls.current[b.id], x, y));
    if (hit) put(key, hit.id);
  }

  const tray = (
    <div className={'eco-tray' + (river ? ' eco-tray--river' : '') + (river && solved ? ' eco-tray--clean' : '')}>
      {left.map((it) => (
        <button
          key={it.key}
          type="button"
          aria-label={it.label}
          className={
            'eco-thing' +
            (sel === it.key ? ' eco-thing--sel' : '') +
            (shakeItem === it.key ? ' eco-shake' : '') +
            (hint >= 2 && next?.key === it.key ? ' eco-glow' : '') +
            (river ? ' eco-thing--float' : '')
          }
          onPointerDown={(e) => grab(e, (x, y, moved) => use(it.key, x, y, moved))}
          onClick={(e) => {
            if (e.detail === 0) use(it.key, 0, 0, false);
          }}
        >
          <Thing thing={it} />
        </button>
      ))}
      {river && solved && (
        <span className="eco-river__duck">
          <ItemPic id="duck" className="eco-river__duck-img" fallbackClassName="eco-turtle__emoji" />
        </span>
      )}
    </div>
  );

  return (
    <>
      {river && tray}
      <div className="eco-bins" style={{ ['--n' as string]: task.bins.length }}>
        {task.bins.map((b) => (
          <Bin
            key={b.id}
            bin={b}
            placed={items.filter((it) => placed[it.key] === b.id)}
            glow={hint >= 2 && next?.bin === b.id}
            ready={sel !== null}
            showRule={hint >= 1}
            flash={shakeBin === b.id}
            binRef={(el) => {
              binEls.current[b.id] = el;
            }}
            onTap={() => sel !== null && put(sel, b.id)}
          />
        ))}
      </div>
      {!river && tray}
    </>
  );
}

/* ---------- spot: sentuh semua yang boros / merusak ---------- */

function SpotTask({ task, hint, done, wrong }: TaskProps<'spot'>) {
  const cards = useMemo(() => shuffle(task.cards.map((c, i) => ({ ...c, key: i }))), [task.cards]);
  const need = cards.filter((c) => c.bad).length;
  const [found, setFound] = useState<number[]>([]);
  const [shake, flash] = useFlash<number>();
  const gridRef = useRef<HTMLDivElement>(null);
  const solved = useRef(false);
  const fadedGood = hint >= 1 ? cards.find((c) => !c.bad)?.key : undefined;
  const glowBad = hint >= 2 ? cards.find((c) => c.bad && !found.includes(c.key))?.key : undefined;

  function tap(key: number) {
    if (solved.current || found.includes(key)) return;
    const c = cards.find((x) => x.key === key)!;
    if (!c.bad) {
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
      sparkleOn(gridRef.current, 10);
      window.setTimeout(done, 500);
    }
  }

  return (
    <>
      <div ref={gridRef} className="eco-cards">
        {cards.map((c) => {
          const hit = found.includes(c.key);
          return (
            <button
              key={c.key}
              type="button"
              aria-label={c.label}
              aria-pressed={hit}
              className={
                'eco-card' +
                (hit ? ' eco-card--found' : '') +
                (shake === c.key ? ' eco-shake' : '') +
                (fadedGood === c.key ? ' eco-out' : '') +
                (glowBad === c.key ? ' eco-glow' : '')
              }
              disabled={fadedGood === c.key}
              onClick={() => tap(c.key)}
            >
              <Thing thing={c} />
              {hit && (
                <span className="eco-card__mark" aria-hidden>
                  ✗
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="eco-status" aria-live="polite">
        Ketemu <b>{found.length}</b> dari <b>{need}</b>
      </div>
    </>
  );
}

/* ---------- cycle: daur berputar ---------- */

/** Letak tempat di lingkaran (searah jarum jam dari atas) pada grid 3×3. */
const RING = [
  { r: 1, c: 2 },
  { r: 2, c: 3 },
  { r: 3, c: 2 },
  { r: 2, c: 1 },
];

function CycleTask({ task, hint, done, wrong }: TaskProps<'cycle'>) {
  const n = task.stages.length;
  /** Urutan isi lingkaran mulai dari `given` (posisi 0 = atas). */
  const order = useMemo(() => Array.from({ length: n }, (_, i) => (task.given + i) % n), [task.given, n]);
  const tray = useMemo(
    () =>
      shuffle([
        ...order.slice(1).map((ix) => ({ thing: task.stages[ix]!, stage: ix })),
        ...(task.decoys ?? []).map((thing) => ({ thing, stage: -1 })),
      ]).map((t, key) => ({ ...t, key })),
    [order, task.stages, task.decoys],
  );
  const [filled, setFilled] = useState(1);
  const [used, setUsed] = useState<number[]>([]);
  const [shake, flash] = useFlash<number>();
  const ringRef = useRef<HTMLDivElement>(null);
  const solved = useRef(false);
  const want = order[filled];

  function use(key: number, x: number, y: number, moved: boolean) {
    if (solved.current || want === undefined) return;
    if (moved && !inside(ringRef.current, x, y, 16)) return;
    const t = tray.find((z) => z.key === key)!;
    if (t.stage !== want) {
      sfx('tap');
      flash(key);
      wrong(true);
      return;
    }
    sfx('tick');
    const f = filled + 1;
    setFilled(f);
    setUsed([...used, key]);
    if (f >= n) {
      solved.current = true;
      sparkleOn(ringRef.current, 12);
      window.setTimeout(done, 600);
    }
  }

  return (
    <>
      <div ref={ringRef} className={'eco-ring' + (filled >= n ? ' eco-ring--done' : '')}>
        <svg viewBox="0 0 100 100" className="eco-ring__arrows" aria-hidden>
          <path d="M50 18a32 32 0 0 1 32 32" />
          <path d="M82 50a32 32 0 0 1-32 32" />
          <path d="M50 82a32 32 0 0 1-32-32" />
          <path d="M18 50a32 32 0 0 1 32-32" />
        </svg>
        {order.map((ix, pos) => {
          const shown = pos < filled;
          const nextSlot = pos === filled;
          return (
            <div
              key={pos}
              className={
                'eco-ring__slot' +
                (shown ? '' : ' eco-ring__slot--empty') +
                (nextSlot ? ' eco-ring__slot--next' : '') +
                (nextSlot && hint >= 1 ? ' eco-glow' : '')
              }
              style={{ gridRow: RING[pos]!.r, gridColumn: RING[pos]!.c }}
            >
              {shown ? <Thing thing={task.stages[ix]!} size="sm" /> : <span className="eco-ring__q">?</span>}
            </div>
          );
        })}
      </div>
      <div className="eco-tray eco-tray--cycle">
        {tray
          .filter((t) => !used.includes(t.key))
          .map((t) => (
            <button
              key={t.key}
              type="button"
              aria-label={t.thing.label}
              className={
                'eco-thing eco-thing--stage' +
                (shake === t.key ? ' eco-shake' : '') +
                (hint >= 2 && t.stage === want ? ' eco-glow' : '')
              }
              onPointerDown={(e) => grab(e, (x, y, moved) => use(t.key, x, y, moved))}
              onClick={(e) => {
                if (e.detail === 0) use(t.key, 0, 0, false);
              }}
            >
              <Thing thing={t.thing} size="sm" />
            </button>
          ))}
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

  function pick(c: (typeof list)[number]) {
    if (solved.current) return;
    if (c.correct) {
      solved.current = true;
      sparkleOn(cueRef.current ?? undefined, 10);
      window.setTimeout(done, 450);
    } else {
      sfx('tap');
      wrong();
    }
  }

  return (
    <>
      {task.cue && (
        <div ref={cueRef} className="eco-cue">
          <Thing thing={task.cue} size="lg" />
        </div>
      )}
      <div className={'eco-choices' + (task.cue ? '' : ' eco-choices--rows')}>
        {list.map((c) => (
          <button
            key={c.key}
            type="button"
            aria-label={c.label}
            className={
              'choice-card eco-choice' +
              (c.key === faded ? ' choice-card--out' : '') +
              (hint >= 2 && c.correct ? ' eco-glow' : '')
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

/* ---------- plant: tanam pohon di tepi sungai ---------- */

function PlantTask({ task, done }: TaskProps<'plant'>) {
  const [planted, setPlanted] = useState<number[]>([]);
  const bankRef = useRef<HTMLDivElement>(null);
  const solved = useRef(false);

  function tap(i: number, el: HTMLElement) {
    if (solved.current || planted.includes(i)) return;
    sfx('tick');
    sparkleOn(el, 6);
    const p = [...planted, i];
    setPlanted(p);
    if (p.length === task.spots) {
      solved.current = true;
      window.setTimeout(done, 650);
    }
  }

  return (
    <div ref={bankRef} className="eco-bank">
      <div className="eco-bank__water" aria-hidden>
        <ItemPic id="duck" className="eco-bank__duck" fallbackClassName="eco-turtle__emoji" />
      </div>
      <div className="eco-bank__land">
        {Array.from({ length: task.spots }, (_, i) => {
          const on = planted.includes(i);
          return (
            <button
              key={i}
              type="button"
              aria-label={on ? 'Pohon baru' : 'Lubang tanah'}
              className={'eco-hole' + (on ? ' eco-hole--tree' : '')}
              onClick={(e) => tap(i, e.currentTarget)}
            >
              {on ? (
                <ItemPic id="tree" className="eco-hole__tree" fallbackClassName="eco-hole__emoji" />
              ) : (
                <span className="eco-hole__seed" aria-hidden>
                  🌱
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="eco-status">
        Pohon <b>{planted.length}</b> dari <b>{task.spots}</b>
      </div>
    </div>
  );
}
