import type { CSSProperties } from 'react';
/**
 * Gelas takar 0–1.000 mL (Ukur Yuk, `sd2`): garis tiap 100 mL, angka tiap
 * 200 mL — isi yang ganjil (300 mL) harus dibaca dari garisnya, bukan dari
 * angka yang tertulis. Tinggi cairannya dihitung dari data soal.
 */

export const BEAKER_W = 96;
export const BEAKER_H = 118;
const GX0 = 38;
const GX1 = 80;
const Y0 = 110; // 0 mL
const Y1000 = 18; // 1.000 mL

const LIQUID: Record<'air' | 'susu' | 'jus', { fill: string; top: string }> = {
  air: { fill: '#8FCBF5', top: '#5BAEE8' },
  susu: { fill: '#FFFFFF', top: '#E3DCCF' },
  jus: { fill: '#FFB347', top: '#F2932B' },
};

export default function Beaker({ ml, liquid = 'air' }: { ml: number; liquid?: 'air' | 'susu' | 'jus' }) {
  const y = (v: number) => Y0 - ((Y0 - Y1000) * v) / 1000;
  const c = LIQUID[liquid];
  const marks = [];
  for (let v = 100; v <= 1000; v += 100) {
    const big = v % 200 === 0;
    marks.push(
      <line key={v} x1={GX0} x2={GX0 + (big ? 11 : 7)} y1={y(v)} y2={y(v)} stroke="#3A2E20" strokeWidth={big ? 1.2 : 0.8} />,
    );
    if (big) {
      marks.push(
        <text
          key={`n${v}`}
          x={GX0 - 3}
          y={y(v)}
          fontSize={8.5}
          fontWeight={700}
          fill="#3A2E20"
          textAnchor="end"
          dominantBaseline="central"
          fontFamily="inherit"
        >
          {v}
        </text>,
      );
    }
  }
  return (
    <div className="measure__frame" style={{ '--ar': BEAKER_W / BEAKER_H } as CSSProperties}>
      <svg viewBox={`0 0 ${BEAKER_W} ${BEAKER_H}`} className="measure__svg" data-beaker={ml} aria-hidden>
        {/* gagang */}
        <path d={`M ${GX1} 40 C ${GX1 + 16} 40 ${GX1 + 16} 80 ${GX1} 80`} fill="none" stroke="#BFD8EA" strokeWidth={4} />
        {/* cairan */}
        {ml > 0 && (
          <>
            <rect x={GX0 + 1} y={y(ml)} width={GX1 - GX0 - 2} height={Y0 - y(ml)} fill={c.fill} />
            <line x1={GX0 + 1} x2={GX1 - 1} y1={y(ml)} y2={y(ml)} stroke={c.top} strokeWidth={1.4} />
          </>
        )}
        {/* kaca */}
        <path
          d={`M ${GX0 - 3} 10 L ${GX0} 14 L ${GX0} ${Y0 + 2} Q ${GX0} ${Y0 + 6} ${GX0 + 4} ${Y0 + 6} L ${GX1 - 4} ${Y0 + 6} Q ${GX1} ${Y0 + 6} ${GX1} ${Y0 + 2} L ${GX1} 10`}
          fill="rgba(220,238,250,0.35)"
          stroke="#7FA7C4"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        {marks}
        <text x={GX0 - 3} y={7} fontSize={7.5} fontWeight={800} fill="#8A6A2E" textAnchor="end" fontFamily="inherit">
          mL
        </text>
      </svg>
    </div>
  );
}
