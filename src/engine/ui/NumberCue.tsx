import { useEffect, useRef } from 'react';
import type { NumberCueSpec, Place } from '@/engine/core/types';
import { PLACES, PLACE_KEY, PLACE_NAME, countsOf } from '@/engine/core/placeValue';
import { BlockTower } from '@/engine/ui/Blocks';
import '@/engine/ui/place-value.css';

/**
 * Isyarat bilangan di atas kartu jawaban tap-answer (Istana Bilangan, `sd2`)
 * — kontraknya di `NumberCueSpec` (types.ts). Di-lazy-load dari TapAnswer,
 * jadi game tap-answer lain tak ikut mengunduhnya (pola Measure & Chart).
 *
 * - `focus` (petunjuk P2 tingkat 1): bagian yang harus dilihat menyala —
 *   angka yang ditanya, atau kedua lembah bukit.
 * - `solved`: bola di bukit menggelinding ke lembah jawabannya. Hadiahnya
 *   melihat KENAPA 347 jadi 350, bukan cuma mendengar "benar".
 */
export default function NumberCue({
  spec,
  focus,
  solved,
}: {
  spec: NumberCueSpec;
  focus: boolean;
  solved: boolean;
}) {
  if (spec.kind === 'blocks') return <BlocksCue n={spec.n} />;
  if (spec.kind === 'digits') return <DigitsCue n={spec.n} mark={spec.mark} focus={focus} />;
  return <HillCue n={spec.n} step={spec.step} focus={focus} solved={solved} />;
}

function BlocksCue({ n }: { n: number }) {
  const c = countsOf(n);
  return (
    <div className="nc-blocks" aria-label="Balok bilangan">
      {PLACES.map((p) => (
        <div key={p} className="nc-blocks__col">
          <span className="pv-col__name">{PLACE_NAME[p]}</span>
          <BlockTower place={p} count={c[PLACE_KEY[p]]} />
        </div>
      ))}
    </div>
  );
}

function DigitsCue({ n, mark, focus }: { n: number; mark: Place; focus: boolean }) {
  const text = String(n);
  // Tempat tiap angka dihitung dari kanan: angka terakhir = satuan.
  const placeOf = (i: number): Place => (10 ** (text.length - 1 - i)) as Place;
  return (
    <div className="nc-digits" aria-hidden>
      {[...text].map((d, i) => (
        <span
          key={i}
          className={
            'nc-digit' + (placeOf(i) === mark ? ' nc-digit--mark' + (focus ? ' nc-digit--focus' : '') : '')
          }
        >
          {d}
        </span>
      ))}
    </div>
  );
}

const HX0 = 26;
const HX1 = 274;
const BASE = 96;
const PEAK = 58;

/** Titik di bukit untuk bilangan `v` (lembah di kedua ujung, puncak di tengah). */
function hillPoint(v: number, lo: number, step: number): [number, number] {
  const t = (v - lo) / step;
  return [HX0 + (HX1 - HX0) * t, BASE - PEAK * Math.sin(Math.PI * t)];
}

function HillCue({ n, step, focus, solved }: { n: number; step: 10 | 100; focus: boolean; solved: boolean }) {
  const lo = Math.floor(n / step) * step;
  const hi = lo + step;
  const dest = n - lo < step / 2 ? lo : hi;
  const ballRef = useRef<SVGGElement>(null);
  const [bx, by] = hillPoint(n, lo, step);

  // Menggelinding dengan rAF langsung ke DOM — tanpa render ulang React
  // (pelajaran PathTrace 2026-07-28).
  useEffect(() => {
    if (!solved) return;
    const g = ballRef.current;
    if (!g) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const dur = reduce ? 1 : 850;
    const t0 = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = k * k; // makin cepat menuruni lereng
      const v = n + (dest - n) * e;
      const [x, y] = hillPoint(v, lo, step);
      const turn = ((v - n) / step) * 540;
      g.setAttribute('transform', `translate(${x} ${y - 11}) rotate(${turn})`);
      if (k < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [solved, n, dest, lo, step]);

  const curve: string[] = [];
  for (let i = 0; i <= 40; i += 1) {
    const [x, y] = hillPoint(lo + (step * i) / 40, lo, step);
    curve.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  const ticks = Array.from({ length: 11 }, (_, i) => lo + (step / 10) * i);

  return (
    <svg viewBox="0 0 300 132" className={'nc-hill' + (focus ? ' nc-hill--focus' : '')} aria-hidden data-n={n}>
      <path d={`${curve.join(' ')} L${HX1} ${BASE + 8} L${HX0} ${BASE + 8} Z`} className="nc-hill__ground" />
      <path d={curve.join(' ')} className="nc-hill__line" />
      {/* Garis bilangan di kaki bukit. */}
      <line x1={HX0} y1={BASE + 10} x2={HX1} y2={BASE + 10} className="nc-hill__axis" />
      {ticks.map((v, i) => {
        const x = HX0 + ((HX1 - HX0) * i) / 10;
        const big = i === 0 || i === 10;
        return <line key={v} x1={x} y1={BASE + 10} x2={x} y2={BASE + (big ? 20 : i === 5 ? 18 : 15)} className="nc-hill__tick" />;
      })}
      {[lo, hi].map((v, i) => (
        <g key={v} className="nc-hill__valley">
          <circle cx={i ? HX1 : HX0} cy={BASE - 2} r={9} className="nc-hill__pit" />
          <text x={i ? HX1 : HX0} y={BASE + 34} textAnchor="middle" className="nc-hill__label">
            {v}
          </text>
        </g>
      ))}
      {/* Bilangan soalnya ditulis di atas bola, bukan di garis: tempat bola
          yang sebenarnya cukup terlihat dari letaknya di lereng. */}
      <text x={bx} y={by - 28} textAnchor="middle" className="nc-hill__tag">
        {n}
      </text>
      <g ref={ballRef} transform={`translate(${bx} ${by - 11})`}>
        <circle r={11} className="nc-hill__ball" />
        <path d="M-7 -3 Q0 -9 7 -3" className="nc-hill__shine" />
      </g>
    </svg>
  );
}
