import type { CSSProperties } from 'react';
/**
 * Bangun untuk soal keliling (Ukur Yuk, `sd2`).
 *
 * - `GridShape`: bangun di kertas berpetak — tiap string satu baris, `#` =
 *   petak terisi. Hanya sisi LUAR bangun yang ditebalkan; garis petak di
 *   dalamnya tetap tipis, jadi anak menghitung sisi pinggir, bukan petak.
 * - `RectPlot`: kebun persegi panjang berlabel panjang & lebar.
 */

const C = 10; // satuan per petak


export function GridShape({ rows }: { rows: string[] }) {
  const cols = Math.max(...rows.map((r) => r.length));
  const w = (cols + 2) * C;
  const h = (rows.length + 2) * C;
  const at = (r: number, c: number) => rows[r]?.[c] === '#';
  const paper = [];
  for (let i = 0; i <= cols + 2; i++) paper.push(<line key={`v${i}`} x1={i * C} x2={i * C} y1={0} y2={h} />);
  for (let i = 0; i <= rows.length + 2; i++) paper.push(<line key={`h${i}`} x1={0} x2={w} y1={i * C} y2={i * C} />);
  const cells: JSX.Element[] = [];
  const edges: string[] = [];
  rows.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      if (ch !== '#') return;
      const x = (c + 1) * C;
      const y = (r + 1) * C;
      cells.push(<rect key={`${r}-${c}`} x={x} y={y} width={C} height={C} />);
      if (!at(r - 1, c)) edges.push(`M${x} ${y}h${C}`);
      if (!at(r + 1, c)) edges.push(`M${x} ${y + C}h${C}`);
      if (!at(r, c - 1)) edges.push(`M${x} ${y}v${C}`);
      if (!at(r, c + 1)) edges.push(`M${x + C} ${y}v${C}`);
    }),
  );
  return (
    <div className="measure__frame" style={{ '--ar': w / h } as CSSProperties}>
      <svg viewBox={`0 0 ${w} ${h}`} className="measure__svg" data-grid={rows.join('/')} aria-hidden>
        <rect width={w} height={h} fill="#FFFDF5" />
        <g stroke="#CFE0EC" strokeWidth={0.5}>{paper}</g>
        <g fill="#BDE7C9" stroke="#8CC7A0" strokeWidth={0.5}>{cells}</g>
        <path d={edges.join('')} fill="none" stroke="#2E7D4F" strokeWidth={1.6} strokeLinecap="square" />
      </svg>
    </div>
  );
}

const RW = 124;
const RH = 80;

export function RectPlot({ w, h, unit }: { w: number; h: number; unit: 'cm' | 'm' }) {
  // Gambar mengikuti bentuk kasarnya saja (rasio dipangkas 1–2): yang dinilai
  // angka di labelnya, dan persegi panjang yang terlalu gepeng tak muat label.
  const ratio = Math.min(2, Math.max(1, w / h));
  const boxW = 88;
  const boxH = 58;
  const pw = ratio >= boxW / boxH ? boxW : boxH * ratio;
  const ph = pw / ratio;
  const x = 8 + (boxW - pw) / 2;
  const y = 14 + (boxH - ph) / 2;
  const flowers = [
    [0.2, 0.3],
    [0.7, 0.25],
    [0.45, 0.7],
    [0.82, 0.72],
  ];
  return (
    <div className="measure__frame" style={{ '--ar': RW / RH } as CSSProperties}>
      <svg viewBox={`0 0 ${RW} ${RH}`} className="measure__svg" data-rect={`${w}x${h}${unit}`} aria-hidden>
        <rect x={x} y={y} width={pw} height={ph} fill="#BDE7C9" stroke="#9A6B3F" strokeWidth={2} strokeDasharray="4 2" />
        {flowers.map(([fx, fy], i) => (
          <circle key={i} cx={x + fx * pw} cy={y + fy * ph} r={2.2} fill={i % 2 ? '#F48FB1' : '#FFC928'} />
        ))}
        <text x={x + pw / 2} y={y - 4} fontSize={9} fontWeight={800} fill="#3A2E20" textAnchor="middle" fontFamily="inherit">
          {w} {unit}
        </text>
        <text
          x={x + pw + 3}
          y={y + ph / 2}
          fontSize={9}
          fontWeight={800}
          fill="#3A2E20"
          dominantBaseline="central"
          fontFamily="inherit"
        >
          {h} {unit}
        </text>
      </svg>
    </div>
  );
}
