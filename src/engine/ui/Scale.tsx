import type { CSSProperties } from 'react';
import type { BalanceSpec } from '@/engine/core/types';
import ItemPic from '@/engine/ui/ItemPic';

/**
 * Timbangan jarum & timbangan dua lengan (Ukur Yuk, `sd2`).
 *
 * Bendanya memakai seni item (`ItemPic`, jatuh ke emoji kalau gambarnya
 * gagal dimuat) yang DITUMPUK di atas SVG lewat posisi persen — berat tidak
 * punya ukuran di gambar, jadi di sini seni item aman dipakai (beda dengan
 * penggaris, lihat Ruler.tsx).
 */

/** Seni item di atas SVG: kotak persegi `size` satuan, alasnya di (cx, bottom). */
function ItemOn({
  id,
  cx,
  bottom,
  size,
  vw,
  vh,
}: {
  id: string;
  cx: number;
  bottom: number;
  size: number;
  vw: number;
  vh: number;
}) {
  return (
    <div
      className="measure__item"
      style={{
        left: `${((cx - size / 2) / vw) * 100}%`,
        top: `${((bottom - size) / vh) * 100}%`,
        width: `${(size / vw) * 100}%`,
        height: `${(size / vh) * 100}%`,
      }}
    >
      <ItemPic id={id} className="measure__img" fallbackClassName="measure__emoji" />
    </div>
  );
}

// --- Timbangan jarum ---------------------------------------------------------

export const SCALE_W = 100;
export const SCALE_H = 112;
const CX = 50;
const CY = 76;
const R = 31;

/** Titik di muka jam timbangan: `f` 0…1 dari kiri bawah ke kanan bawah (270°). */
function dial(f: number, r: number): [number, number] {
  const a = ((-135 + 270 * f - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

export function Scale({ item, value, unit }: { item: string; value: number; unit: 'kg' | 'g' }) {
  // kg: 0–10, tiap kg berangka. g: 0–1.000, garis tiap 100, angka tiap 200.
  const max = unit === 'kg' ? 10 : 1000;
  const minor = unit === 'kg' ? 0.5 : 50;
  const major = unit === 'kg' ? 1 : 100;
  const label = unit === 'kg' ? 1 : 200;
  const marks = [];
  for (let v = 0; v <= max + 1e-9; v += minor) {
    const isMajor = Math.abs(v / major - Math.round(v / major)) < 1e-9;
    const [x1, y1] = dial(v / max, R - 1.5);
    const [x2, y2] = dial(v / max, R - (isMajor ? 7 : 4));
    marks.push(
      <line
        key={v}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#3A2E20"
        strokeWidth={isMajor ? 1.1 : 0.6}
      />,
    );
    if (Math.abs(v / label - Math.round(v / label)) < 1e-9) {
      const [tx, ty] = dial(v / max, R - 13.5);
      marks.push(
        <text
          key={`n${v}`}
          x={tx}
          y={ty}
          fontSize={unit === 'kg' ? 7.2 : 6.6}
          fontWeight={700}
          fill="#3A2E20"
          stroke="#FFFDF5"
          strokeWidth={2.2}
          paintOrder="stroke"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="inherit"
        >
          {v}
        </text>,
      );
    }
  }
  const [nx, ny] = dial(Math.min(value, max) / max, R - 6);
  return (
    <div className="measure__frame" style={{ '--ar': SCALE_W / SCALE_H } as CSSProperties}>
      <svg viewBox={`0 0 ${SCALE_W} ${SCALE_H}`} className="measure__svg" data-scale={`${value}${unit}`} aria-hidden>
        {/* piring */}
        <rect x={44} y={33} width={12} height={8} fill="#9AA5B1" />
        <ellipse cx={50} cy={33} rx={34} ry={4} fill="#C9D1D9" stroke="#8A96A3" strokeWidth={0.8} />
        {/* badan */}
        <rect x={9} y={40} width={82} height={70} rx={14} fill="#5B8DEF" />
        <circle cx={CX} cy={CY} r={R + 2} fill="#2F5FC4" />
        <circle cx={CX} cy={CY} r={R} fill="#FFFDF5" />
        {/* Jarum digambar SEBELUM angka, dan angkanya berlapis putih: jarum
            yang menunjuk tepat ke sebuah angka tidak boleh menutupinya. */}
        <line x1={CX} y1={CY} x2={nx} y2={ny} stroke="#E4572E" strokeWidth={2} strokeLinecap="round" />
        <circle cx={CX} cy={CY} r={3} fill="#E4572E" />
        {marks}
        <text
          x={CX}
          y={CY + 21}
          fontSize={7.5}
          fontWeight={800}
          fill="#8A6A2E"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="inherit"
        >
          {unit}
        </text>
      </svg>
      <ItemOn id={item} cx={50} bottom={31} size={30} vw={SCALE_W} vh={SCALE_H} />
    </div>
  );
}

// --- Timbangan dua lengan ----------------------------------------------------

export const BAL_W = 100;
export const BAL_H = 76;
const PIVOT_Y = 34;
const ARM = 34;
const TILT = 11; // derajat
const STRING = 12;
const ITEM = 30;

export function Balance({ spec }: { spec: BalanceSpec }) {
  const t = ((spec.heavier === 'left' ? -TILT : TILT) * Math.PI) / 180;
  // Sisi yang lebih berat TURUN. Sumbu y ke bawah, jadi sudut negatif = kiri turun.
  const lx = 50 - ARM * Math.cos(t);
  const ly = PIVOT_Y - ARM * Math.sin(t);
  const rx = 50 + ARM * Math.cos(t);
  const ry = PIVOT_Y + ARM * Math.sin(t);
  const pan = (x: number, y: number) => (
    <g>
      <line x1={x} y1={y} x2={x - 12} y2={y + STRING} stroke="#8A96A3" strokeWidth={0.7} />
      <line x1={x} y1={y} x2={x + 12} y2={y + STRING} stroke="#8A96A3" strokeWidth={0.7} />
      <path d={`M ${x - 15} ${y + STRING} Q ${x} ${y + STRING + 7} ${x + 15} ${y + STRING} Z`} fill="#F2A73B" />
    </g>
  );
  return (
    <div className="measure__frame" style={{ '--ar': BAL_W / BAL_H } as CSSProperties}>
      <svg
        viewBox={`0 0 ${BAL_W} ${BAL_H}`}
        className="measure__svg"
        data-balance={spec.heavier}
        aria-hidden
      >
        <polygon points={`50,${PIVOT_Y} 40,${BAL_H - 3} 60,${BAL_H - 3}`} fill="#9A6B3F" />
        <rect x={30} y={BAL_H - 5} width={40} height={4} rx={2} fill="#7A5230" />
        {pan(lx, ly)}
        {pan(rx, ry)}
        <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#7A5230" strokeWidth={2.6} strokeLinecap="round" />
        <circle cx={50} cy={PIVOT_Y} r={2.6} fill="#F2A73B" />
      </svg>
      <ItemOn id={spec.leftItem} cx={lx} bottom={ly + STRING + 1} size={ITEM} vw={BAL_W} vh={BAL_H} />
      <ItemOn id={spec.rightItem} cx={rx} bottom={ry + STRING + 1} size={ITEM} vw={BAL_W} vh={BAL_H} />
    </div>
  );
}
