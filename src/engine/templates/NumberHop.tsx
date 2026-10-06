import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { TemplateProps } from '@/engine/core/GameShell';
import type { HopStep } from '@/engine/core/types';
import { sfx } from '@/engine/audio/sound';
import { sparkleAt } from '@/engine/ui/juice';
import ItemPic from '@/engine/ui/ItemPic';
import '@/engine/ui/number-hop.css';

/**
 * Lompat Katak (`sd2`) — katak melompat di garis bilangan. Kontrak datanya di
 * `NumberHopData` / `HopStep` (types.ts).
 *
 * - Tombol lompat ±100 / ±10 / ±1 SELALU ada dua arah (keputusan pemilik
 *   2026-10-06: "bebas, asal tiba") — 458 + 237 boleh +200 +30 +7 atau
 *   +300 −63. Yang dinilai teratai tempat katak berdiri saat "Cocok!".
 * - Catatan lompatan tersusun sendiri ("+100 ×2  +10 ×3  +1 ×7"): jembatan
 *   dari lompatan ke nilai tempat. Tombol ↩️ membatalkan satu lompatan.
 * - Lompatan paling sedikit dapat lencana "Lompatan hemat!" — pujian saja.
 *   Bintang tetap dihitung dari jumlah salah (keputusan pemilik).
 * - Langkah `place` (menaksir): katak DISERET ke kira-kira hasilnya di garis
 *   0–1.000, lalu melompat ke hasil sebenarnya.
 * - Petunjuk bertingkat (P2): tingkat 1 menyalakan tombol nilai tempat yang
 *   masih dibutuhkan; tingkat 2 menyalakan SATU tombol berikutnya. Untuk
 *   menaksir: tingkat 1 menulis soal yang sudah dibulatkan, tingkat 2
 *   menandai daerah jawabannya. Untuk pertanyaan penutup: satu pilihan salah
 *   dipudarkan.
 *
 * Lompatan dianimasikan CSS (`left` + busur `translateY`), bukan rAF/state per
 * frame — satu render ulang per lompatan saja.
 */

const SIZES = [100, 10, 1] as const;
const VB_W = 300;
const PAD = 18;

/** Jumlah lompatan paling sedikit untuk berpindah `d` (boleh lewat lalu mundur). */
function fewestHops(d: number): number {
  const target = Math.abs(d);
  const off = 1200;
  const seen = new Int16Array(2 * off + 1).fill(-1);
  const queue = [0];
  seen[off] = 0;
  for (let i = 0; i < queue.length; i += 1) {
    const v = queue[i]!;
    if (v === target) return seen[v + off]!;
    for (const s of [100, -100, 10, -10, 1, -1]) {
      const n = v + s;
      if (n < -off || n > off || seen[n + off]! >= 0) continue;
      seen[n + off] = seen[v + off]! + 1;
      queue.push(n);
    }
  }
  return Infinity;
}

/** "398 + 205" → "400 + 200" (petunjuk menaksir). */
function roundedShow(show: string): string {
  return show.replace(/\d+/g, (n) => String(Math.round(Number(n) / 100) * 100));
}

function shuffle<T>(list: T[]): T[] {
  return [...list].sort(() => Math.random() - 0.5);
}

/** Rentang garis: kelipatan seratus yang memuat semua titik penting. */
function rangeFor(step: HopStep, start: number, pos: number): [number, number] {
  if (step.kind === 'place') return [0, 1000];
  const vals = [start, pos, step.target];
  let lo = Math.floor(Math.min(...vals) / 100) * 100;
  let hi = Math.ceil((Math.max(...vals) + 1) / 100) * 100;
  if (hi - lo < 100) hi = lo + 100;
  if (hi > 1000) {
    hi = 1000;
    lo = Math.min(lo, 900);
  }
  return [lo, hi];
}

export default function NumberHop({ level, onCorrect, onWrong, narrate, hint }: TemplateProps<'number-hop'>) {
  const data = level.data;
  const [stepIx, setStepIx] = useState(0);
  const [start, setStart] = useState(data.from);
  const [pos, setPos] = useState(data.steps[0]?.kind === 'place' ? 0 : data.from);
  const [hops, setHops] = useState<number[]>([]);
  const [hopKey, setHopKey] = useState(0);
  const [bump, setBump] = useState(false);
  const [busy, setBusy] = useState(false);
  const [asking, setAsking] = useState(false);
  const [thrifty, setThrifty] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [solved, setSolved] = useState(false);
  const pondRef = useRef<HTMLDivElement>(null);
  const frogRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const step = data.steps[stepIx]!;
  const place = step.kind === 'place';
  const [lo, hi] = rangeFor(step, start, pos);
  const choices = useMemo(() => (data.ask ? shuffle(data.ask.choices) : []), [data.ask]);
  const outText = asking && hint >= 2 ? choices.find((c) => !c.correct)?.text : undefined;

  const xOf = (v: number) => PAD + ((v - lo) / (hi - lo)) * (VB_W - 2 * PAD);
  const pct = (v: number) => (xOf(v) / VB_W) * 100;

  function wiggle() {
    setBump(true);
    window.setTimeout(() => setBump(false), 420);
  }

  function hop(size: number) {
    if (busy || solved || asking) return;
    const n = pos + size;
    if (n < 0 || n > 999) {
      sfx('tap');
      wiggle();
      return;
    }
    sfx('tick');
    setPos(n);
    setHops([...hops, size]);
    setHopKey((k) => k + 1);
  }

  function undo() {
    if (busy || solved || asking || hops.length === 0) return;
    sfx('tap');
    setPos(pos - hops[hops.length - 1]!);
    setHops(hops.slice(0, -1));
    setHopKey((k) => k + 1);
  }

  function sparkleFrog() {
    const r = frogRef.current?.getBoundingClientRect();
    if (r) sparkleAt(r.left + r.width / 2, r.top + r.height / 2, 8);
  }

  /** Langkah ini beres: lanjut ke langkah berikutnya, pertanyaan, atau selesai. */
  function advance(at: number) {
    const next = stepIx + 1;
    if (next < data.steps.length) {
      const ns = data.steps[next]!;
      setStepIx(next);
      setStart(at);
      setHops([]);
      setThrifty(false);
      setRevealed(false);
      setBusy(false);
      if (ns.kind === 'place') setPos(0);
      if (ns.say) narrate(ns.say);
      return;
    }
    if (data.ask) {
      setBusy(false);
      setAsking(true);
      narrate(data.ask.prompt);
      return;
    }
    setSolved(true);
    onCorrect();
  }

  function check() {
    if (busy || solved || asking) return;
    if (place) {
      const tol = step.tolerance ?? 30;
      if (Math.abs(pos - step.target) <= tol) {
        sfx('correct');
        setBusy(true);
        setRevealed(true);
        setPos(step.target);
        setHopKey((k) => k + 1);
        window.setTimeout(sparkleFrog, 380);
        window.setTimeout(() => advance(step.target), 1300);
      } else {
        sfx('tap');
        wiggle();
        onWrong();
      }
      return;
    }
    if (pos === step.target) {
      sfx('correct');
      sparkleFrog();
      setBusy(true);
      const hemat = hops.length > 0 && hops.length <= fewestHops(step.target - start);
      setThrifty(hemat);
      window.setTimeout(() => advance(pos), hemat ? 1100 : 500);
    } else {
      sfx('tap');
      wiggle();
      onWrong();
    }
  }

  function answer(correct?: boolean) {
    if (solved) return;
    if (correct) {
      setSolved(true);
      onCorrect();
    } else {
      sfx('tap');
      onWrong();
    }
  }

  // Menyeret katak (langkah `place`). Listener di window: jari yang keluar
  // garis tetap boleh melepas.
  function valueAt(clientX: number): number {
    const r = pondRef.current?.getBoundingClientRect();
    if (!r) return pos;
    const x = ((clientX - r.left) / r.width) * VB_W;
    const v = lo + ((x - PAD) / (VB_W - 2 * PAD)) * (hi - lo);
    return Math.max(0, Math.min(1000, Math.round(v / 10) * 10));
  }

  function down(e: ReactPointerEvent) {
    if (!place || busy || solved) return;
    e.preventDefault();
    dragging.current = true;
    setPos(valueAt(e.clientX));
  }

  useEffect(() => {
    if (!place) return;
    const move = (e: PointerEvent) => {
      if (dragging.current) setPos(valueAt(e.clientX));
    };
    const up = () => {
      if (dragging.current) sfx('tick');
      dragging.current = false;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [place, lo, hi]);

  // Catatan lompatan, dikelompokkan per ukuran & arah.
  const log = useMemo(() => {
    const m = new Map<number, number>();
    for (const h of hops) m.set(h, (m.get(h) ?? 0) + 1);
    return [100, 10, 1, -100, -10, -1].filter((s) => m.has(s)).map((s) => [s, m.get(s)!] as const);
  }, [hops]);

  // Petunjuk P2 untuk tombol lompat.
  const rem = step.target - pos;
  const needed = new Set<number>();
  let nextBtn: number | null = null;
  if (!place && !asking && hint >= 1 && rem !== 0) {
    for (const s of SIZES) {
      if (Math.floor(Math.abs(rem) / s) % 10 !== 0) {
        needed.add(Math.sign(rem) * s);
        if (nextBtn === null) nextBtn = Math.sign(rem) * s;
      }
    }
  }

  // Garis: tanda tiap 10 / 50 / 100 tergantung panjangnya; angka paling banyak 5.
  const span = hi - lo;
  const tick = span <= 200 ? 10 : span <= 500 ? 50 : 100;
  const ticks: number[] = [];
  for (let v = lo; v <= hi; v += tick) ticks.push(v);
  let labelStep = 100;
  while (span / labelStep + 1 > 5) labelStep *= 2;
  if (span === 1000) labelStep = 250;
  const labels: number[] = [];
  for (let v = lo; v <= hi; v += labelStep) labels.push(v);
  if (labels[labels.length - 1] !== hi) labels.push(hi);
  if (span === 100) labels.splice(1, 0, lo + 50);

  const prompt = asking ? data.ask!.prompt : stepIx > 0 && step.say ? step.say : level.narration;

  return (
    <>
      <div className="game-prompt nh-prompt">{prompt}</div>
      <div className="game-area nh-area">
        <div className="nh-show" aria-label={`Soal ${step.show}`}>
          {step.show}
          {place && hint >= 1 && <span className="nh-show__hint">≈ {roundedShow(step.show)}</span>}
        </div>

        <div
          ref={pondRef}
          className={'nh-pond' + (place ? ' nh-pond--drag' : '') + (bump ? ' nh-pond--bump' : '')}
          onPointerDown={down}
        >
          <svg viewBox={`0 0 ${VB_W} 74`} className="nh-line" aria-hidden>
            <rect x={0} y={20} width={VB_W} height={30} rx={14} className="nh-water" />
            {place && hint >= 2 && (
              <rect
                x={xOf(step.target - (step.tolerance ?? 30))}
                y={18}
                width={xOf(step.target + (step.tolerance ?? 30)) - xOf(step.target - (step.tolerance ?? 30))}
                height={34}
                rx={8}
                className="nh-band"
              />
            )}
            <line x1={PAD} y1={44} x2={VB_W - PAD} y2={44} className="nh-axis" />
            {ticks.map((v) => (
              <line key={v} x1={xOf(v)} y1={44} x2={xOf(v)} y2={v % 100 === 0 ? 52 : 49} className="nh-tick" />
            ))}
            {labels.map((v) => (
              <text key={`l${v}`} x={xOf(v)} y={68} textAnchor="middle" className="nh-label">
                {v}
              </text>
            ))}
            {!place && <ellipse cx={xOf(start)} cy={41} rx={10} ry={4} className="nh-lily" />}
            {step.goal && (
              <g className="nh-goal">
                <ellipse cx={xOf(step.target)} cy={41} rx={12} ry={5} className="nh-lily nh-lily--goal" />
                {/* Bunga teratai digambar SVG — emoji di dalam <text> SVG tidak
                    tergambar di semua HP. */}
                {[0, 72, 144, 216, 288].map((a) => (
                  <circle
                    key={a}
                    cx={xOf(step.target) + 4.5 * Math.cos((a * Math.PI) / 180)}
                    cy={35 + 4.5 * Math.sin((a * Math.PI) / 180)}
                    r={3.6}
                    className="nh-petal"
                  />
                ))}
                <circle cx={xOf(step.target)} cy={35} r={2.4} className="nh-flower-heart" />
                <text x={xOf(step.target)} y={14} textAnchor="middle" className="nh-goal__num">
                  {step.target}
                </text>
              </g>
            )}
          </svg>
          <div
            ref={frogRef}
            className={'nh-frog' + (dragging.current ? ' nh-frog--drag' : '')}
            style={{ left: `${pct(Math.min(pos, hi))}%` }}
          >
            {/* Dipasang ulang tiap lompatan supaya busur loncatnya diputar lagi;
                pembungkusnya tetap, jadi `left` bergeser dengan transisi. */}
            <span key={hopKey} className={'nh-frog__body' + (hopKey > 0 ? ' nh-frog__body--hop' : '')}>
              <span className={'nh-frog__num' + (place && !revealed ? ' nh-frog__num--guess' : '')}>{pos}</span>
              <ItemPic id="frog" className="nh-frog__img" fallbackClassName="nh-frog__emoji" />
            </span>
          </div>
        </div>

        <div className="nh-log" aria-live="polite">
          {thrifty ? (
            <span className="nh-thrifty">⭐ Lompatan hemat!</span>
          ) : place ? (
            <span className="nh-log__hint">{revealed ? `${step.show} = ${step.target}` : 'Seret kataknya'}</span>
          ) : log.length === 0 ? (
            <span className="nh-log__hint">Tekan tombol lompat</span>
          ) : (
            log.map(([s, n]) => (
              <span key={s} className={'nh-chip' + (s < 0 ? ' nh-chip--minus' : '')}>
                {s > 0 ? `+${s}` : `−${-s}`}
                {n > 1 && <small> ×{n}</small>}
              </span>
            ))
          )}
        </div>

        {asking ? (
          <div className="nh-ask">
            {choices.map((c) => (
              <button
                key={c.text}
                type="button"
                className={'choice-card nh-chip-answer' + (outText === c.text ? ' choice-card--out' : '')}
                disabled={outText === c.text}
                onClick={() => answer(c.correct)}
              >
                {c.text}
              </button>
            ))}
          </div>
        ) : (
          <>
            {!place && (
              <div className="nh-pad">
                {[...SIZES, ...SIZES.map((s) => -s)].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={
                      'nh-btn' +
                      (s < 0 ? ' nh-btn--minus' : '') +
                      (needed.has(s) ? ' nh-btn--hint' : '') +
                      (hint >= 2 && nextBtn === s ? ' nh-btn--next' : '')
                    }
                    onClick={() => hop(s)}
                    disabled={busy || solved}
                    aria-label={s > 0 ? `Maju ${s}` : `Mundur ${-s}`}
                  >
                    {s > 0 ? `+${s}` : `−${-s}`}
                  </button>
                ))}
              </div>
            )}
            <div className="nh-row">
              {!place && (
                <button
                  type="button"
                  className="nh-btn nh-undo"
                  onClick={undo}
                  disabled={hops.length === 0 || busy || solved}
                  aria-label="Batalkan satu lompatan"
                >
                  ↩️
                </button>
              )}
              <button type="button" className="btn btn--primary nh-check" onClick={check} disabled={busy || solved}>
                ✓ Cocok!
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
