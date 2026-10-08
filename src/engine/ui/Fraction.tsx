import { useId } from 'react';
import type { CSSProperties } from 'react';
import type { FoodKind } from '@/engine/core/types';

/**
 * Gambar pecahan untuk Bagi Kue (`fraction-kitchen`) — SVG engine, nol aset.
 *
 * Makanannya digambar UTUH sekali, lalu tiap potong = gambar utuh yang
 * dipotong `clipPath` irisannya. Jadi potongan yang diseret ke piring tetap
 * persis bagian dari kue yang sama, dan potongan yang ditumpuk terlihat
 * benar-benar sama/berbeda besar.
 *
 * Bentuk ikut makanannya: kue & pizza LINGKARAN (irisan dari tengah, mulai
 * jam dua belas searah jarum jam), martabak & cokelat PERSEGI PANJANG
 * (lajur tegak dari kiri). Seni impor sengaja tidak dipakai: garis potongnya
 * harus jatuh tepat di potongan sama besar (pelajaran penggaris Ukur Yuk).
 *
 * Koordinat: viewBox 0 0 100 100.
 */

export type FoodShape = 'circle' | 'rect';

export const shapeOf = (food: FoodKind): FoodShape => (food === 'kue' || food === 'pizza' ? 'circle' : 'rect');

const CX = 50;
const CY = 50;
const R = 44;
export const RECT = { x0: 4, x1: 96, y0: 22, y1: 78 } as const;

/** Bobot irisan: rata, atau irisan pertama jauh lebih besar (pengecoh). */
export function sliceWeights(d: number, uneven = false): number[] {
  if (!uneven || d < 2) return Array.from({ length: d }, () => 1 / d);
  const big = 1.9;
  const total = big + (d - 1);
  return [big / total, ...Array.from({ length: d - 1 }, () => 1 / total)];
}

/** Batas pecahan (0..1) awal & akhir irisan i. */
function bounds(weights: number[], i: number): [number, number] {
  let a = 0;
  for (let k = 0; k < i; k++) a += weights[k]!;
  return [a, a + weights[i]!];
}

const polar = (t: number): [number, number] => {
  const ang = -Math.PI / 2 + t * 2 * Math.PI;
  return [CX + R * Math.cos(ang), CY + R * Math.sin(ang)];
};

/** Path irisan i (atau gabungan irisan from..to-1 kalau `to` diisi). */
export function slicePath(shape: FoodShape, weights: number[], from: number, to = from + 1): string {
  const [t0] = bounds(weights, from);
  const [, t1] = bounds(weights, to - 1);
  if (shape === 'rect') {
    const w = RECT.x1 - RECT.x0;
    const xa = RECT.x0 + t0 * w;
    const xb = RECT.x0 + t1 * w;
    return `M${xa} ${RECT.y0}H${xb}V${RECT.y1}H${xa}Z`;
  }
  if (t1 - t0 >= 0.9999) return `M${CX - R} ${CY}a${R} ${R} 0 1 0 ${2 * R} 0a${R} ${R} 0 1 0 ${-2 * R} 0Z`;
  const [x0, y0] = polar(t0);
  const [x1, y1] = polar(t1);
  const large = t1 - t0 > 0.5 ? 1 : 0;
  return `M${CX} ${CY}L${x0.toFixed(2)} ${y0.toFixed(2)}A${R} ${R} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}Z`;
}

/** Titik tengah irisan — tempat angka petunjuk. */
export function sliceCenter(shape: FoodShape, weights: number[], i: number): [number, number] {
  const [t0, t1] = bounds(weights, i);
  if (shape === 'rect') {
    const w = RECT.x1 - RECT.x0;
    return [RECT.x0 + ((t0 + t1) / 2) * w, (RECT.y0 + RECT.y1) / 2];
  }
  const ang = -Math.PI / 2 + ((t0 + t1) / 2) * 2 * Math.PI;
  const r = weights.length === 1 ? 0 : R * 0.6;
  return [CX + r * Math.cos(ang), CY + r * Math.sin(ang)];
}

/** Gambar makanan UTUH (dipotong clipPath oleh pemanggilnya). */
function FoodArt({ food }: { food: FoodKind }) {
  switch (food) {
    case 'kue':
      return (
        <g>
          <circle cx={CX} cy={CY} r={R} fill="#f2b766" />
          <circle cx={CX} cy={CY} r={R - 6} fill="#ffc7d9" />
          {[
            [36, 30, '#ff6b9a'],
            [62, 26, '#7ec8ff'],
            [70, 52, '#ffd166'],
            [58, 72, '#8ee08e'],
            [34, 66, '#c39bff'],
            [26, 46, '#ffd166'],
            [50, 40, '#7ec8ff'],
            [46, 58, '#ff6b9a'],
            [72, 36, '#c39bff'],
            [40, 50, '#8ee08e'],
          ].map(([x, y, c], i) => (
            <rect
              key={i}
              x={(x as number) - 2.6}
              y={(y as number) - 0.9}
              width={5.2}
              height={1.8}
              rx={0.9}
              fill={c as string}
              transform={`rotate(${(i * 47) % 180} ${x} ${y})`}
            />
          ))}
        </g>
      );
    case 'pizza':
      return (
        <g>
          <circle cx={CX} cy={CY} r={R} fill="#e3a256" />
          <circle cx={CX} cy={CY} r={R - 6} fill="#ffd65c" />
          {[
            [38, 28],
            [64, 30],
            [72, 54],
            [56, 70],
            [32, 62],
            [26, 42],
            [50, 48],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={5} fill="#d9534f" stroke="#b23c38" strokeWidth={0.8} />
          ))}
          {[
            [46, 34],
            [60, 60],
            [40, 72],
            [70, 42],
          ].map(([x, y], i) => (
            <circle key={`o${i}`} cx={x} cy={y} r={2} fill="#4c8f3c" />
          ))}
        </g>
      );
    case 'martabak':
      return (
        <g>
          <rect x={RECT.x0} y={RECT.y0} width={RECT.x1 - RECT.x0} height={RECT.y1 - RECT.y0} rx={4} fill="#d08a3e" />
          <rect
            x={RECT.x0 + 3}
            y={RECT.y0 + 3}
            width={RECT.x1 - RECT.x0 - 6}
            height={RECT.y1 - RECT.y0 - 6}
            rx={3}
            fill="#7a4220"
          />
          {Array.from({ length: 12 }, (_, i) => (
            <rect
              key={i}
              x={RECT.x0 + 6 + i * 7.4}
              y={RECT.y0 + 7 + (i % 3) * 13}
              width={4}
              height={4}
              rx={1}
              fill="#f7dc7a"
            />
          ))}
          {Array.from({ length: 12 }, (_, i) => (
            <rect
              key={`b${i}`}
              x={RECT.x0 + 9 + i * 7.4}
              y={RECT.y0 + 30 + ((i + 1) % 3) * 6}
              width={3.4}
              height={3.4}
              rx={1}
              fill="#f7dc7a"
            />
          ))}
        </g>
      );
    case 'cokelat':
      return (
        <g>
          <rect x={RECT.x0} y={RECT.y0} width={RECT.x1 - RECT.x0} height={RECT.y1 - RECT.y0} rx={3} fill="#6b3a1e" />
          <rect
            x={RECT.x0 + 2.5}
            y={RECT.y0 + 2.5}
            width={RECT.x1 - RECT.x0 - 5}
            height={RECT.y1 - RECT.y0 - 5}
            rx={2}
            fill="#87502c"
          />
          <rect x={RECT.x0 + 2.5} y={RECT.y0 + 2.5} width={RECT.x1 - RECT.x0 - 5} height={8} rx={2} fill="#9c6236" />
        </g>
      );
  }
}

export interface FractionFoodProps {
  food: FoodKind;
  /** Banyak potong (1 = utuh). */
  d: number;
  /** Indeks potong yang digambar; yang lain jadi tempat kosong putus-putus. */
  show: number[];
  uneven?: boolean;
  /** Gambar garis luar makanan utuh walau potongnya tak tampil (piring). */
  outline?: boolean;
  /** Tempat kosong tidak digambar sama sekali (bayangan seretan, piring). */
  bare?: boolean;
  /** Angka petunjuk 1..d di tiap potong (P2). */
  numbers?: boolean;
  /** Garis potong petunjuk putus-putus untuk `guide` potong (P2). */
  guide?: number;
  /** Bayangan putus-putus seluas pecahan n/d dari awal (petunjuk P2 di piring). */
  target?: { n: number; d: number };
  /** Warna garis tepi potong (membedakan dua potongan yang ditumpuk). */
  edge?: string;
  className?: string;
  style?: CSSProperties;
}

/** Makanan berpotong, beberapa potong tampil. */
export function FractionFood({
  food,
  d,
  show,
  uneven,
  outline,
  bare,
  numbers,
  guide,
  target,
  edge = '#7a4a22',
  className,
  style,
}: FractionFoodProps) {
  const uid = useId().replace(/:/g, '');
  const shape = shapeOf(food);
  const w = sliceWeights(d, uneven);
  const shown = new Set(show);
  const idx = Array.from({ length: d }, (_, i) => i);
  const gw = guide ? sliceWeights(guide) : null;
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <defs>
        {idx.map((i) => (
          <clipPath key={i} id={`${uid}s${i}`}>
            <path d={slicePath(shape, w, i)} />
          </clipPath>
        ))}
      </defs>
      {outline && (
        <path d={slicePath(shape, [1], 0)} className="frac-ghost" vectorEffect="non-scaling-stroke" />
      )}
      {idx.map((i) =>
        shown.has(i) ? (
          <g key={i} data-slice={i}>
            <g clipPath={`url(#${uid}s${i})`}>
              <FoodArt food={food} />
            </g>
            <path
              d={slicePath(shape, w, i)}
              fill="none"
              stroke={edge}
              strokeWidth={1.6}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ) : bare ? null : (
          <path key={i} d={slicePath(shape, w, i)} className="frac-empty" vectorEffect="non-scaling-stroke" />
        ),
      )}
      {gw &&
        gw.map((_, i) => (
          <path key={`g${i}`} d={slicePath(shape, gw, i)} className="frac-guide" vectorEffect="non-scaling-stroke" />
        ))}
      {target && (
        <path
          d={slicePath(shape, sliceWeights(target.d), 0, target.n)}
          className="frac-target"
          vectorEffect="non-scaling-stroke"
        />
      )}
      {numbers &&
        idx.map((i) => {
          const [x, y] = sliceCenter(shape, w, i);
          return (
            <text key={`n${i}`} x={x} y={y} className="frac-num" textAnchor="middle" dominantBaseline="central">
              {i + 1}
            </text>
          );
        })}
    </svg>
  );
}

/** Lambang pecahan BERTUMPUK: pembilang di atas garis, penyebut di bawah. */
export function FracSym({ n, d, className }: { n: number; d: number; className?: string }) {
  return (
    <span className={'frac-sym' + (className ? ` ${className}` : '')} aria-label={`${n} per ${d}`}>
      <span className="frac-sym__n">{n}</span>
      <span className="frac-sym__bar" />
      <span className="frac-sym__d">{d}</span>
    </span>
  );
}

/** Kue kering kecil (pecahan dari kumpulan). */
export function Cookie({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <circle cx={20} cy={20} r={17} fill="#d99a52" stroke="#a96a2c" strokeWidth={2} />
      {[
        [13, 14],
        [25, 12],
        [27, 25],
        [15, 26],
        [21, 19],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.6} fill="#5b3216" />
      ))}
    </svg>
  );
}
