import { useId } from 'react';
import type { RulerThing } from '@/engine/core/types';

/**
 * Penggaris sentimeter + satu benda memanjang di atasnya (Ukur Yuk, `sd2`).
 *
 * Satuan gambar: 1 cm = 10 satuan viewBox. Benda digambar DARI DATA SOAL —
 * ujung kirinya tepat di garis `from`, ujung kanannya tepat di garis `to` —
 * jadi penggarisnya tak pernah "berbohong". Itulah sebabnya bendanya digambar
 * di sini (SVG), bukan memakai seni item: seni item digambar miring dan
 * ujungnya tak bisa dijamin jatuh di garis sentimeter.
 *
 * Garis putus-putus dari kedua ujung benda ke penggaris sengaja ada: anak
 * kelas 3 belajar MEMBACA penggaris, bukan menaksir lurus-tidaknya dua ujung.
 */

const U = 10; // satuan per sentimeter
const M = 7; // margin kiri/kanan
const THING_Y = 13; // garis tengah benda
const BODY_TOP = 30;
const BODY_H = 34;

export const RULER_HEIGHT = BODY_TOP + BODY_H + 1;
export const rulerWidth = (max: number) => max * U + 2 * M;

function Thing({ thing, x0, x1 }: { thing: RulerThing; x0: number; x1: number }) {
  const clip = useId();
  const cy = THING_Y;
  switch (thing) {
    case 'pensil': {
      const h = 12;
      const y0 = cy - h / 2;
      return (
        <g>
          <rect x={x0} y={y0} width={6} height={h} rx={2.5} fill="#F48FB1" />
          <rect x={x0 + 4} y={y0} width={4} height={h} fill="#B0BEC5" />
          <rect x={x0 + 8} y={y0} width={x1 - x0 - 17} height={h} fill="#FFC928" />
          <rect x={x0 + 8} y={y0 + 4} width={x1 - x0 - 17} height={4} fill="#FFE07A" />
          <polygon points={`${x1 - 9},${y0} ${x1},${cy} ${x1 - 9},${y0 + h}`} fill="#F3CC94" />
          <polygon
            points={`${x1 - 3.4},${cy - 2.3} ${x1},${cy} ${x1 - 3.4},${cy + 2.3}`}
            fill="#3A2E20"
          />
        </g>
      );
    }
    case 'krayon': {
      const h = 11;
      const y0 = cy - h / 2;
      const len = x1 - x0;
      return (
        <g>
          <rect x={x0} y={y0} width={len - 7} height={h} rx={1.5} fill="#5B8DEF" />
          <rect x={x0 + 3} y={y0} width={Math.max(0, len - 13)} height={h} fill="#8FB3F5" />
          <rect x={x0 + 3} y={y0} width={Math.max(0, len - 13)} height={1.6} fill="#2F5FC4" />
          <rect x={x0 + 3} y={y0 + h - 1.6} width={Math.max(0, len - 13)} height={1.6} fill="#2F5FC4" />
          <polygon
            points={`${x1 - 7},${y0 + 1} ${x1},${cy - 1.2} ${x1},${cy + 1.2} ${x1 - 7},${y0 + h - 1}`}
            fill="#2F5FC4"
          />
        </g>
      );
    }
    case 'pita': {
      const h = 10;
      const y0 = cy - h / 2;
      const y1 = cy + h / 2;
      return (
        <polygon
          points={`${x0},${y0} ${x1},${y0} ${x1 - 3.5},${cy} ${x1},${y1} ${x0},${y1} ${x0 + 3.5},${cy}`}
          fill="#E4572E"
          stroke="#B8401F"
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
      );
    }
    case 'sedotan': {
      const h = 7;
      const y0 = cy - h / 2;
      const stripes = [];
      for (let x = x0 - 6; x < x1; x += 6) {
        stripes.push(
          <polygon
            key={x}
            points={`${x},${y0 + h} ${x + 3},${y0 + h} ${x + 6},${y0} ${x + 3},${y0}`}
            fill="#E4572E"
          />,
        );
      }
      return (
        <g>
          <clipPath id={clip}>
            <rect x={x0} y={y0} width={x1 - x0} height={h} rx={1.6} />
          </clipPath>
          <rect x={x0} y={y0} width={x1 - x0} height={h} rx={1.6} fill="#FFFFFF" />
          <g clipPath={`url(#${clip})`}>{stripes}</g>
          <rect
            x={x0}
            y={y0}
            width={x1 - x0}
            height={h}
            rx={1.6}
            fill="none"
            stroke="#C9B9A6"
            strokeWidth={0.6}
          />
        </g>
      );
    }
    case 'penghapus': {
      const h = 12;
      const y0 = cy - h / 2;
      const len = x1 - x0;
      return (
        <g>
          <rect x={x0} y={y0} width={len} height={h} rx={2.5} fill="#FFFFFF" stroke="#C9B9A6" strokeWidth={0.6} />
          <rect x={x0 + len * 0.3} y={y0} width={len * 0.45} height={h} fill="#4FB286" />
        </g>
      );
    }
  }
}

export default function Ruler({
  thing,
  from,
  to,
  max,
}: {
  thing: RulerThing;
  from: number;
  to: number;
  max?: number;
}) {
  // Penggaris sependek yang perlu (minimal 10 cm, maksimal 15 cm, selalu ada
  // sisa sesudah ujung benda supaya ujung penggaris bukan petunjuk jawaban):
  // penggaris pendek = sentimeter lebih lebar di HP.
  const len = max ?? Math.min(15, Math.max(10, Math.ceil(to) + 2));
  const x = (cm: number) => M + cm * U;
  const w = rulerWidth(len);
  const ticks = [];
  for (let i = 0; i <= len * 2; i++) {
    const cm = i / 2;
    const whole = i % 2 === 0;
    ticks.push(
      <line
        key={i}
        x1={x(cm)}
        x2={x(cm)}
        y1={BODY_TOP}
        y2={BODY_TOP + (whole ? 11 : 6)}
        stroke="#3A2E20"
        strokeWidth={whole ? 1.1 : 0.7}
      />,
    );
    if (whole) {
      ticks.push(
        <text
          key={`n${i}`}
          x={x(cm)}
          y={BODY_TOP + 22}
          // Angka dua digit dikecilkan: di font 9 "10" lebih lebar daripada
          // satu sentimeter dan angka-angkanya saling bertumpuk.
          fontSize={cm >= 10 ? 7.4 : 9}
          fontWeight={700}
          fill="#3A2E20"
          textAnchor="middle"
          fontFamily="inherit"
        >
          {cm}
        </text>,
      );
    }
  }
  return (
    <svg
      viewBox={`0 0 ${w} ${RULER_HEIGHT}`}
      data-ruler={`${from}-${to}`}
      aria-hidden
      className="measure__svg"
    >
      <rect x={1} y={BODY_TOP} width={w - 2} height={BODY_H} rx={3} fill="#FCE3A2" stroke="#D9A441" strokeWidth={1} />
      {ticks}
      <text x={w - 5} y={BODY_TOP + BODY_H - 4} fontSize={6.5} fontWeight={700} fill="#8A6A2E" textAnchor="end" fontFamily="inherit">
        cm
      </text>
      {[from, to].map((cm) => (
        <line
          key={cm}
          x1={x(cm)}
          x2={x(cm)}
          y1={THING_Y + 7}
          y2={BODY_TOP}
          stroke="#E4572E"
          strokeWidth={0.9}
          strokeDasharray="2 1.5"
        />
      ))}
      <Thing thing={thing} x0={x(from)} x1={x(to)} />
    </svg>
  );
}
