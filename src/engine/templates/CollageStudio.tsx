import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { CollageStep, CollageTask, EcoThing } from '@/engine/core/types';
import type { CollageMaterial } from '@/engine/core/collage';
import { artOf, grains, isSeed, materialHex, materialLabel, SEEDS, tornPath } from '@/engine/core/collage';
import { PAINT_HEX, paintName } from '@/engine/core/paint';
import { sfx } from '@/engine/audio/sound';
import { sparkleAt } from '@/engine/ui/juice';
import ItemPic from '@/engine/ui/ItemPic';
import { EcoPic } from '@/engine/ui/Eco';
import type { Piece } from '@/engine/ui/Collage';
import { Artwork, CollageCanvas, CollageDone, MosaicArt, SheetArt, Tile } from '@/engine/ui/Collage';
import '@/engine/ui/collage-studio.css';

/**
 * Studio Kolase (`sd2`, Seni Rupa) — kontrak datanya di `CollageStudioData`
 * / `CollageTask` (types.ts), bahan & gambar pola di `core/collage.ts`.
 *
 * Pak Monyet (seni `monkey`) memandu pesanan demi pesanan. Anak MEMEGANG
 * bahannya:
 * - `collage` seret keluar dari lembar bahan = menyobek; sobekannya ikut jari
 *             dan menempel DI TITIK jari dilepas, terpotong rapi mengikuti
 *             garis pola. Bagian yang sudah ±tertutup dirapikan engine (diisi
 *             rata di bawah sobekannya). Bisa juga ketuk lembar lalu ketuk
 *             gambarnya.
 * - `mosaic`  pilih keping lalu ketuk / SAPUKAN jari di petak-petaknya.
 * - `order`   urutkan langkah membuat karya.
 * - `sort`    pilah bahan alam / bahan buatan.
 * - `pick`    "karya ini disebut apa?" / "mana yang mozaik?".
 *
 * Salah tempel/petak/urut/pilah = SENYAP (`onWrong(true)`) — bagian dari
 * mencoba, dan satu sapuan mozaik hanya dihitung salah SEKALI walau
 * melewati banyak petak. Salah memilih jawaban (`pick`) = overlay.
 *
 * Petunjuk bertingkat (P2): tingkat 1 = bagian pola diberi warna samar /
 * petak mozaik bertitik warna / tempat berikutnya menyala / satu pilihan
 * dipudarkan; tingkat 2 = bahan, petak, atau kartu yang benar ikut menyala.
 */

const DRAG_PX = 8;
/** Jarak titik uji tutupan bagian, dalam satuan gambar (kotak 0..100). */
const GRID = 2.5;
/** Bagian dianggap tertutup (lalu dirapikan engine) pada tutupan ini. */
const FULL_AT = 0.72;

type Hint = 0 | 1 | 2;

interface TaskProps<K extends CollageTask['kind']> {
  task: Extract<CollageTask, { kind: K }>;
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

function sparkleOn(el: Element | null | undefined, n = 8) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  if (!r.width) return; // pemandu disembunyikan saat HP dimiringkan
  sparkleAt(r.left + r.width / 2, r.top + r.height / 2, n);
}

function useFlash<T>(): [T | null, (v: T) => void] {
  const [on, setOn] = useState<T | null>(null);
  const timer = useRef(0);
  return [
    on,
    (v: T) => {
      setOn(v);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setOn(null), 450);
    },
  ];
}

/**
 * Seret ATAU ketuk. `ghost` membuat bayangan seretan (elemen DOM biasa di
 * `document.body`, digeser rAF lewat `transform` — nol render React).
 * Bawaannya salinan elemen sumbernya sendiri.
 */
function grab(
  e: ReactPointerEvent<HTMLElement>,
  end: (x: number, y: number, moved: boolean) => void,
  ghostOf?: () => HTMLElement,
) {
  if (e.button !== 0 && e.pointerType === 'mouse') return;
  const src = e.currentTarget;
  const id = e.pointerId;
  const x0 = e.clientX;
  const y0 = e.clientY;
  let x = x0;
  let y = y0;
  let ghost: HTMLElement | null = null;
  let gx = 0;
  let gy = 0;
  let raf = 0;
  const paint = () => {
    raf = 0;
    if (ghost) ghost.style.transform = `translate(${x - gx}px, ${y - gy}px)`;
  };
  const mv = (ev: PointerEvent) => {
    if (ev.pointerId !== id) return;
    x = ev.clientX;
    y = ev.clientY;
    if (!ghost && Math.hypot(x - x0, y - y0) > DRAG_PX) {
      if (ghostOf) {
        ghost = ghostOf();
        document.body.appendChild(ghost);
        const r = ghost.getBoundingClientRect();
        // Sobekan duduk TEPAT di bawah jari: di situ juga ia menempel.
        gx = r.width / 2;
        gy = r.height / 2;
        ghost.style.left = '0px';
        ghost.style.top = '0px';
        sfx('tap');
      } else {
        const r = src.getBoundingClientRect();
        ghost = src.cloneNode(true) as HTMLElement;
        ghost.classList.add('ks-ghost');
        Object.assign(ghost.style, { left: '0px', top: '0px', width: `${r.width}px`, height: `${r.height}px` });
        document.body.appendChild(ghost);
        gx = x0 - r.left;
        gy = y0 - r.top;
        src.classList.add('ks-lifted');
      }
      paint();
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
    src.classList.remove('ks-lifted');
    end(x, y, moved && ev.type === 'pointerup');
  };
  window.addEventListener('pointermove', mv);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
}

/** Sobekan yang ikut jari, sebagai string SVG (bayangan di luar React). */
function ghostPiece(material: CollageMaterial, seed: number, px: number): HTMLElement {
  let body: string;
  if (isSeed(material)) {
    const s = SEEDS[material];
    body = grains(10, seed, 12)
      .map(
        ([x, y, r]) =>
          `<ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="2.3" ry="1.6" transform="rotate(${r} ${x.toFixed(2)} ${y.toFixed(2)})" fill="${s.fill}" stroke="${s.edge}" stroke-width="0.5"/>`,
      )
      .join('');
  } else {
    const d = tornPath(10, seed);
    body = `<path d="${d}" fill="#fff" transform="scale(1.08)"/><path d="${d}" fill="${materialHex(material)}"/>`;
  }
  const el = document.createElement('div');
  el.className = 'ks-ghost ks-ghost--piece';
  el.style.width = `${px}px`;
  el.style.height = `${px}px`;
  el.innerHTML = `<svg viewBox="-12 -12 24 24" width="100%" height="100%" aria-hidden="true">${body}</svg>`;
  return el;
}

/** Kartu langkah / bahan: gambar + namanya. */
function Thing({ thing, size = 'md' }: { thing: EcoThing; size?: 'sm' | 'md' }) {
  return (
    <>
      <EcoPic thing={thing} className={`ks-pic ks-pic--${size}`} />
      <span className="ks-label">{thing.label}</span>
    </>
  );
}

/* ================================================================== */
/*  Template                                                          */
/* ================================================================== */

export default function CollageStudio({ level, onCorrect, onWrong, narrate, setRepeat, hint }: TemplateProps<'collage-studio'>) {
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
    }, 1300);
  }

  return (
    <div className={`ks-wrap ks-wrap--${step.task.kind}`}>
      <div className="game-prompt ks-prompt">{prompt}</div>
      <div className="game-area ks-area">
        <Guide step={step} stepIx={stepIx} total={steps.length} happy={happy} guideRef={guideRef} />
        <TaskView key={stepIx} task={step.task} hint={hint} done={done} wrong={onWrong} />
      </div>
    </div>
  );
}

function TaskView({ task, ...rest }: { task: CollageTask } & Omit<TaskProps<'sort'>, 'task'>) {
  switch (task.kind) {
    case 'collage':
      return <CollageTaskView task={task} {...rest} />;
    case 'mosaic':
      return <MosaicTask task={task} {...rest} />;
    case 'order':
      return <OrderTask task={task} {...rest} />;
    case 'sort':
      return <SortTask task={task} {...rest} />;
    case 'pick':
      return <PickTask task={task} {...rest} />;
  }
}

/* ---------- Pak Monyet + contoh ---------- */

function example(step: CollageStep): ReactNode {
  const t = step.task;
  if (t.kind === 'collage' && t.example) return <CollageDone art={t.art} parts={t.parts} flat className="ks-example__art" />;
  if (t.kind === 'mosaic') return <MosaicArt rows={t.rows} colors={t.colors} className="ks-example__art" label="Contoh mozaik" />;
  return null;
}

const BUBBLE: Record<CollageTask['kind'], string> = {
  collage: '✂️',
  mosaic: '🔲',
  order: '🔢',
  sort: '🧺',
  pick: '🖼️',
};

function Guide({
  step,
  stepIx,
  total,
  happy,
  guideRef,
}: {
  step: CollageStep;
  stepIx: number;
  total: number;
  happy: boolean;
  guideRef: React.RefObject<HTMLDivElement>;
}) {
  const ex = example(step);
  return (
    <div className="ks-guide">
      <div ref={guideRef} className={'ks-host' + (happy ? ' ks-host--happy' : '')} title="Pak Monyet">
        <ItemPic id="monkey" className="ks-host__img" fallbackClassName="ks-host__emoji" />
      </div>
      {ex ? (
        <div className="ks-example" key={stepIx}>
          {ex}
          <span className="ks-example__tag">Contoh</span>
        </div>
      ) : (
        <div className="ks-bubble" key={stepIx}>
          {BUBBLE[step.task.kind]}
        </div>
      )}
      {total > 1 && (
        <div className="ks-pips" aria-label={`Pesanan ${stepIx + 1} dari ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={'ks-pip' + (i < stepIx ? ' ks-pip--done' : i === stepIx ? ' ks-pip--now' : '')} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- collage: sobek & tempel ---------- */

interface RegionPts {
  xs: number[];
  ys: number[];
  covered: Uint8Array;
  n: number;
  hit: number;
  r: number;
}

function CollageTaskView({ task, hint, done, wrong }: TaskProps<'collage'>) {
  const regions = artOf(task.art).regions;
  const sheets = useMemo(() => shuffle(task.sheets), [task.sheets]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [full, setFull] = useState<Set<string>>(() => new Set());
  const [sel, setSel] = useState<CollageMaterial | null>(null);
  const [nudge, setNudge] = useFlash<true>();
  const [bad, flashBad] = useFlash<string>();
  const [badSheet, flashSheet] = useFlash<CollageMaterial>();
  const [framed, setFramed] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const els = useRef<Record<string, SVGPathElement | null>>({});
  const pts = useRef<Record<string, RegionPts>>({});
  const fullRef = useRef(full);
  const idRef = useRef(0);
  const solved = useRef(false);

  // Titik uji tiap bagian: hanya yang TERLIHAT (tak tertutup bagian di atasnya).
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const p = svg.createSVGPoint();
    const inFill = (el: SVGPathElement | null | undefined, x: number, y: number) => {
      if (!el) return false;
      p.x = x;
      p.y = y;
      if (typeof el.isPointInFill === 'function') return el.isPointInFill(p);
      const b = el.getBBox();
      return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
    };
    const out: Record<string, RegionPts> = {};
    regions.forEach((r, i) => {
      const xs: number[] = [];
      const ys: number[] = [];
      for (let y = GRID / 2; y < 100; y += GRID) {
        for (let x = GRID / 2; x < 100; x += GRID) {
          if (!inFill(els.current[r.id], x, y)) continue;
          if (regions.slice(i + 1).some((up) => inFill(els.current[up.id], x, y))) continue;
          xs.push(x);
          ys.push(y);
        }
      }
      const area = xs.length * GRID * GRID;
      out[r.id] = {
        xs,
        ys,
        covered: new Uint8Array(xs.length),
        n: xs.length,
        hit: 0,
        r: Math.max(8, Math.min(20, Math.sqrt(area) * 0.36)),
      };
    });
    pts.current = out;
    const empty = regions.filter((r) => !out[r.id]!.n).map((r) => r.id);
    if (empty.length) setFull(new Set(empty));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fullRef.current = full;
  }, [full]);

  const open = regions.filter((r) => !full.has(r.id));
  const glowRegion = hint >= 2 ? open[0]?.id ?? null : null;
  const glowSheet = glowRegion ? task.parts[glowRegion] : null;

  function toSvg(cx: number, cy: number): { x: number; y: number } | null {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const p = svg.createSVGPoint();
    p.x = cx;
    p.y = cy;
    const q = p.matrixTransform(m.inverse());
    return { x: q.x, y: q.y };
  }

  /** Bagian paling atas di titik itu; kalau meleset sedikit, titik uji terdekat. */
  function regionAt(x: number, y: number): string | null {
    const svg = svgRef.current;
    if (!svg || x < -4 || y < -4 || x > 104 || y > 104) return null;
    const p = svg.createSVGPoint();
    p.x = x;
    p.y = y;
    for (let i = regions.length - 1; i >= 0; i -= 1) {
      const el = els.current[regions[i]!.id];
      if (el && typeof el.isPointInFill === 'function' && el.isPointInFill(p)) return regions[i]!.id;
    }
    let best: string | null = null;
    let bestD = 5 * 5;
    for (const r of regions) {
      const P = pts.current[r.id];
      if (!P) continue;
      for (let k = 0; k < P.n; k += 1) {
        const d = (P.xs[k]! - x) ** 2 + (P.ys[k]! - y) ** 2;
        if (d < bestD) {
          bestD = d;
          best = r.id;
        }
      }
    }
    return best;
  }

  function stick(region: string, material: CollageMaterial, x: number, y: number) {
    const P = pts.current[region];
    if (!P) return;
    const r2 = P.r * P.r;
    const gainAt = (cx: number, cy: number) => {
      let g = 0;
      for (let k = 0; k < P.n; k += 1) if (!P.covered[k] && (P.xs[k]! - cx) ** 2 + (P.ys[k]! - cy) ** 2 <= r2) g += 1;
      return g;
    };
    // Tempelan yang nyaris tak menutup apa pun digeser ke bagian kosong terdekat —
    // anak selalu melihat gambarnya bertambah penuh.
    const disc = (Math.PI * r2) / (GRID * GRID);
    if (gainAt(x, y) < 0.3 * Math.min(disc, P.n - P.hit)) {
      let bestD = Infinity;
      for (let k = 0; k < P.n; k += 1) {
        if (P.covered[k]) continue;
        const d = (P.xs[k]! - x) ** 2 + (P.ys[k]! - y) ** 2;
        if (d < bestD) {
          bestD = d;
          x = P.xs[k]!;
          y = P.ys[k]!;
        }
      }
    }
    for (let k = 0; k < P.n; k += 1) {
      if (!P.covered[k] && (P.xs[k]! - x) ** 2 + (P.ys[k]! - y) ** 2 <= r2) {
        P.covered[k] = 1;
        P.hit += 1;
      }
    }
    const id = (idRef.current += 1);
    setPieces((list) => [
      ...list,
      {
        id,
        region,
        material,
        x,
        y,
        r: P.r,
        rot: Math.floor(Math.random() * 360),
        seed: Math.floor(Math.random() * 1e6),
      },
    ]);
    sfx('tick');
    if (P.hit / P.n >= FULL_AT) {
      const f = new Set(fullRef.current);
      f.add(region);
      fullRef.current = f;
      setFull(f);
      const c = toScreen(P);
      if (c) sparkleAt(c.x, c.y, 7);
      if (f.size === regions.length && !solved.current) {
        solved.current = true;
        setSel(null);
        window.setTimeout(() => {
          setFramed(true);
          sparkleOn(svgRef.current, 14);
        }, 250);
        window.setTimeout(done, 1250);
      }
    }
  }

  /** Pusat bagian di layar (untuk percikan saat bagian itu penuh). */
  function toScreen(P: RegionPts) {
    const m = svgRef.current?.getScreenCTM();
    if (!m || !P.n) return null;
    let sx = 0;
    let sy = 0;
    for (let k = 0; k < P.n; k += 1) {
      sx += P.xs[k]!;
      sy += P.ys[k]!;
    }
    const p = svgRef.current!.createSVGPoint();
    p.x = sx / P.n;
    p.y = sy / P.n;
    const q = p.matrixTransform(m);
    return { x: q.x, y: q.y };
  }

  function drop(material: CollageMaterial, cx: number, cy: number) {
    if (solved.current) return;
    const at = toSvg(cx, cy);
    if (!at) return;
    const region = regionAt(at.x, at.y);
    if (!region || fullRef.current.has(region)) return;
    if (task.parts[region] !== material) {
      sfx('tap');
      flashBad(region);
      flashSheet(material);
      wrong(true);
      return;
    }
    stick(region, material, at.x, at.y);
  }

  function ghostPx(): number {
    const w = svgRef.current?.getBoundingClientRect().width ?? 240;
    return Math.max(44, (w / 100) * 26);
  }

  return (
    <>
      <div className={'ks-stage' + (framed ? ' ks-stage--framed' : '')}>
        <CollageCanvas
          art={task.art}
          parts={task.parts}
          pieces={pieces}
          full={full}
          tint={hint >= 1}
          glow={glowRegion}
          flash={bad}
          className={'ks-canvas' + (sel ? ' ks-canvas--ready' : '')}
          svgRef={svgRef}
          regionRef={(id, el) => {
            els.current[id] = el;
          }}
          onClick={(e) => {
            if (solved.current) return;
            if (!sel) {
              setNudge(true);
              return;
            }
            drop(sel, e.clientX, e.clientY);
          }}
        />
      </div>
      <div className={'ks-sheets' + (nudge ? ' ks-sheets--nudge' : '')} style={{ ['--n' as string]: sheets.length }}>
        {sheets.map((m) => (
          <button
            key={m}
            type="button"
            aria-label={materialLabel(m)}
            aria-pressed={sel === m}
            className={
              'ks-sheet' +
              (sel === m ? ' ks-sheet--sel' : '') +
              (badSheet === m ? ' ks-shake' : '') +
              (glowSheet === m ? ' ks-glow' : '')
            }
            onPointerDown={(e) =>
              grab(
                e,
                (x, y, moved) => {
                  if (!moved) {
                    setSel(sel === m ? null : m);
                    return;
                  }
                  drop(m, x, y);
                },
                () => ghostPiece(m, Math.floor(Math.random() * 1e6), ghostPx()),
              )
            }
            onClick={(e) => {
              if (e.detail === 0) setSel(sel === m ? null : m);
            }}
          >
            <SheetArt material={m} />
            <span className="ks-sheet__label">{materialLabel(m)}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------- mosaic: tempel keping persegi berjarak ---------- */

function MosaicTask({ task, hint, done, wrong }: TaskProps<'mosaic'>) {
  const rows = task.rows;
  const h = rows.length;
  const w = rows[0]!.length;
  const cells = useMemo(
    () => rows.flatMap((row, y) => [...row].map((ch, x) => ({ key: y * w + x, x, y, color: ch === '.' ? null : task.colors[ch]! }))),
    [rows, w, task.colors],
  );
  const need = cells.filter((c) => c.color);
  const palette = useMemo(() => shuffle(task.palette), [task.palette]);
  const [placed, setPlaced] = useState<Set<number>>(
    () => new Set(cells.filter((c) => c.color && c.y < (task.given ?? 0)).map((c) => c.key)),
  );
  const [sel, setSel] = useState<keyof typeof PAINT_HEX | null>(null);
  const [badCell, flashCell] = useFlash<number>();
  const [nudge, setNudge] = useFlash<true>();
  const [shine, setShine] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const placedRef = useRef(placed);
  const stroke = useRef<{ id: number; seen: Set<number>; wrong: boolean } | null>(null);
  const solved = useRef(false);

  const nextCell = need.find((c) => !placed.has(c.key));
  const glowColor = hint >= 2 ? nextCell?.color ?? null : null;

  function paint(cx: number, cy: number) {
    const s = stroke.current;
    const g = gridRef.current;
    if (!s || !g || !sel) return;
    const r = g.getBoundingClientRect();
    const x = Math.floor(((cx - r.left) / r.width) * w);
    const y = Math.floor(((cy - r.top) / r.height) * h);
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const key = y * w + x;
    if (s.seen.has(key)) return;
    s.seen.add(key);
    if (placedRef.current.has(key)) return;
    const c = cells[key]!;
    if (c.color !== sel) {
      flashCell(key);
      if (!s.wrong) {
        s.wrong = true;
        sfx('tap');
        wrong(true);
      }
      return;
    }
    sfx('tick');
    const n = new Set(placedRef.current);
    n.add(key);
    placedRef.current = n;
    setPlaced(n);
    if (need.every((q) => n.has(q.key)) && !solved.current) {
      solved.current = true;
      stroke.current = null;
      setSel(null);
      setShine(true);
      sparkleOn(g, 14);
      window.setTimeout(done, 1000);
    }
  }

  function down(e: ReactPointerEvent<HTMLDivElement>) {
    if (solved.current) return;
    if (!sel) {
      setNudge(true);
      return;
    }
    e.currentTarget.setPointerCapture?.(e.pointerId);
    stroke.current = { id: e.pointerId, seen: new Set(), wrong: false };
    paint(e.clientX, e.clientY);
  }

  return (
    <>
      <div className="ks-stage">
        <div
          ref={gridRef}
          className={'ks-mosaic' + (shine ? ' ks-mosaic--shine' : '') + (sel ? ' ks-mosaic--ready' : '')}
          style={{ ['--cols' as string]: w, ['--rows' as string]: h }}
          role="grid"
          aria-label="Papan mozaik"
          onPointerDown={down}
          onPointerMove={(e) => stroke.current?.id === e.pointerId && paint(e.clientX, e.clientY)}
          onPointerUp={() => {
            stroke.current = null;
          }}
          onPointerCancel={() => {
            stroke.current = null;
          }}
        >
          {cells.map((c) => {
            const on = placed.has(c.key);
            return (
              <div
                key={c.key}
                role="gridcell"
                aria-label={on && c.color ? paintName(c.color) : 'kosong'}
                className={
                  'ks-cell' +
                  (badCell === c.key ? ' ks-cell--no' : '') +
                  (hint >= 2 && nextCell?.key === c.key ? ' ks-cell--glow' : '')
                }
              >
                {on && c.color ? (
                  <svg viewBox="0 0 1 1" className="ks-tile" aria-hidden>
                    <Tile x={0} y={0} color={PAINT_HEX[c.color]} seed={c.key * 13 + 5} />
                  </svg>
                ) : (
                  hint >= 1 && c.color && <span className="ks-cell__dot" style={{ background: PAINT_HEX[c.color] }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className={'ks-sheets ks-sheets--tiles' + (nudge ? ' ks-sheets--nudge' : '')} style={{ ['--n' as string]: palette.length }}>
        {palette.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Keping ${paintName(c)}`}
            aria-pressed={sel === c}
            className={'ks-sheet ks-swatch' + (sel === c ? ' ks-sheet--sel' : '') + (glowColor === c ? ' ks-glow' : '')}
            onClick={() => setSel(c)}
          >
            <svg viewBox="-0.1 -0.1 2.2 2.2" className="ks-swatch__art" aria-hidden>
              <Tile x={0} y={0} color={PAINT_HEX[c]} seed={3} />
              <Tile x={1} y={0} color={PAINT_HEX[c]} seed={4} />
              <Tile x={0} y={1} color={PAINT_HEX[c]} seed={5} />
              <Tile x={1} y={1} color={PAINT_HEX[c]} seed={6} />
            </svg>
            <span className="ks-sheet__label">{materialLabel(c)}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------- order: urutkan langkah ---------- */

function OrderTask({ task, hint, done, wrong }: TaskProps<'order'>) {
  const tray = useMemo(
    () =>
      shuffle([
        ...task.steps.map((thing, stage) => ({ thing, stage })),
        ...(task.decoys ?? []).map((thing) => ({ thing, stage: -1 })),
      ]).map((t, key) => ({ ...t, key })),
    [task.steps, task.decoys],
  );
  const [filled, setFilled] = useState(0);
  const [used, setUsed] = useState<number[]>([]);
  const [shake, flash] = useFlash<number>();
  const listRef = useRef<HTMLOListElement>(null);
  const solved = useRef(false);
  const n = task.steps.length;

  function use(key: number, x: number, y: number, moved: boolean) {
    if (solved.current) return;
    if (moved && !inside(listRef.current, x, y, 16)) return;
    const t = tray.find((z) => z.key === key)!;
    if (t.stage !== filled) {
      sfx('tap');
      flash(key);
      wrong(true);
      return;
    }
    sfx('tick');
    setFilled(filled + 1);
    setUsed([...used, key]);
    if (filled + 1 >= n) {
      solved.current = true;
      sparkleOn(listRef.current, 12);
      window.setTimeout(done, 600);
    }
  }

  return (
    <>
      <ol ref={listRef} className="ks-steps">
        {task.steps.map((s, i) => (
          <li
            key={i}
            className={
              'ks-step' +
              (i < filled ? ' ks-step--done' : '') +
              (i === filled ? ' ks-step--next' : '') +
              (i === filled && hint >= 1 ? ' ks-glow' : '')
            }
          >
            <span className="ks-step__no">{i + 1}</span>
            {i < filled ? (
              <span className="ks-step__card">
                <EcoPic thing={s} className="ks-pic ks-pic--sm" />
                <span className="ks-step__text">{s.label}</span>
              </span>
            ) : (
              <span className="ks-step__empty">?</span>
            )}
          </li>
        ))}
      </ol>
      <div className="ks-tray">
        {tray
          .filter((t) => !used.includes(t.key))
          .map((t) => (
            <button
              key={t.key}
              type="button"
              aria-label={t.thing.label}
              className={
                'ks-thing ks-thing--wide' +
                (shake === t.key ? ' ks-shake' : '') +
                (hint >= 2 && t.stage === filled ? ' ks-glow' : '')
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

/* ---------- sort: bahan alam / buatan ---------- */

function SortTask({ task, hint, done, wrong }: TaskProps<'sort'>) {
  const items = useMemo(() => shuffle(task.items.map((it, i) => ({ ...it, key: i }))), [task.items]);
  const [placed, setPlaced] = useState<Record<number, string>>({});
  const [sel, setSel] = useState<number | null>(null);
  const [shakeItem, flashItem] = useFlash<number>();
  const [shakeBin, flashBin] = useFlash<string>();
  const binEls = useRef<Record<string, HTMLButtonElement | null>>({});
  const solved = useRef(false);
  const left = items.filter((it) => placed[it.key] === undefined);
  const next = left[0];

  function put(key: number, binId: string) {
    if (solved.current) return;
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
      solved.current = true;
      window.setTimeout(done, 450);
    }
  }

  function use(key: number, x: number, y: number, moved: boolean) {
    if (!moved) {
      setSel(sel === key ? null : key);
      return;
    }
    const hit = task.bins.find((b) => inside(binEls.current[b.id], x, y));
    if (hit) put(key, hit.id);
  }

  return (
    <>
      <div className="ks-bins">
        {task.bins.map((b) => (
          <button
            key={b.id}
            ref={(el) => {
              binEls.current[b.id] = el;
            }}
            type="button"
            aria-label={b.label}
            className={
              'ks-bin' +
              (sel !== null ? ' ks-bin--ready' : '') +
              (shakeBin === b.id ? ' ks-shake' : '') +
              (hint >= 2 && next?.bin === b.id ? ' ks-glow' : '')
            }
            onClick={() => sel !== null && put(sel, b.id)}
          >
            <span className="ks-bin__emoji" aria-hidden>
              {b.emoji}
            </span>
            <span className="ks-bin__label">{b.label}</span>
            {hint >= 1 && b.rule && <span className="ks-bin__rule">{b.rule}</span>}
            <span className="ks-bin__in">
              {items
                .filter((it) => placed[it.key] === b.id)
                .map((it) => (
                  <EcoPic key={it.key} thing={it} className="ks-pic ks-pic--xs" />
                ))}
            </span>
          </button>
        ))}
      </div>
      <div className="ks-tray">
        {left.map((it) => (
          <button
            key={it.key}
            type="button"
            aria-label={it.label}
            className={
              'ks-thing' +
              (sel === it.key ? ' ks-thing--sel' : '') +
              (shakeItem === it.key ? ' ks-shake' : '') +
              (hint >= 2 && next?.key === it.key ? ' ks-glow' : '')
            }
            onPointerDown={(e) => grab(e, (x, y, moved) => use(it.key, x, y, moved))}
            onClick={(e) => {
              if (e.detail === 0) use(it.key, 0, 0, false);
            }}
          >
            <Thing thing={it} />
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------- pick: karya ini disebut apa? ---------- */

function PickTask({ task, hint, done, wrong }: TaskProps<'pick'>) {
  const list = useMemo(() => shuffle(task.choices.map((c, i) => ({ ...c, key: i }))), [task.choices]);
  const faded = hint >= 1 ? list.find((c) => !c.correct)?.key : undefined;
  const solved = useRef(false);
  const showRef = useRef<HTMLDivElement>(null);
  const works = list.every((c) => c.artwork);
  const rows = !task.show && !works;

  function pick(c: (typeof list)[number], el: HTMLElement) {
    if (solved.current) return;
    if (c.correct) {
      solved.current = true;
      sparkleOn(showRef.current ?? el, 10);
      window.setTimeout(done, 450);
    } else {
      sfx('tap');
      wrong();
    }
  }

  return (
    <>
      {task.show && (
        <div ref={showRef} className="ks-stage ks-show">
          <div className="ks-frame">
            <Artwork work={task.show} className="ks-show__art" />
          </div>
        </div>
      )}
      <div className={'ks-choices' + (works ? ' ks-choices--works' : '') + (rows ? ' ks-choices--rows' : '')}>
        {list.map((c) => (
          <button
            key={c.key}
            type="button"
            aria-label={c.label ?? 'Karya'}
            className={
              'choice-card ks-choice' +
              (c.key === faded ? ' choice-card--out' : '') +
              (hint >= 2 && c.correct ? ' ks-glow' : '')
            }
            disabled={c.key === faded}
            onClick={(e) => pick(c, e.currentTarget)}
          >
            {c.artwork ? (
              <span className="ks-frame ks-frame--sm">
                <Artwork work={c.artwork} className="ks-choice__art" />
              </span>
            ) : (
              <>
                {c.emoji && (
                  <span className="ks-choice__emoji" aria-hidden>
                    {c.emoji}
                  </span>
                )}
                <span className="ks-choice__text">{c.label}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </>
  );
}
