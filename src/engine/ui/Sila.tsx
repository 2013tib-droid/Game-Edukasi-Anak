/**
 * Lambang lima sila Pancasila, digambar SVG sendiri (keputusan pemilik
 * 2026-10-05) — alasan yang sama dengan `Shape.tsx` & `Clock.tsx`: sama di
 * semua HP, nol unduhan, dan emoji tak punya padanannya (🐂 bukan kepala
 * banteng, padi-kapas tak ada sama sekali).
 *
 * Tiap lambang = satu petak perisai berwarna latar resminya:
 *   1 bintang emas di hitam · 2 rantai emas di merah · 3 beringin di putih ·
 *   4 kepala banteng hitam di merah · 5 padi & kapas di putih.
 *
 * Ini LAMBANG NEGARA: bentuknya disederhanakan untuk layar HP, tapi warna &
 * isinya jangan dikarang-karang. Kalau mengubah gambarnya, lihat dulu hasilnya.
 */
import type { SilaId } from '@/engine/core/types';

export type { SilaId };

export const SILA_NAME: Record<SilaId, string> = {
  1: 'Ketuhanan Yang Maha Esa',
  2: 'Kemanusiaan yang adil dan beradab',
  3: 'Persatuan Indonesia',
  4: 'Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan/perwakilan',
  5: 'Keadilan sosial bagi seluruh rakyat Indonesia',
};

export const SILA_SYMBOL: Record<SilaId, string> = {
  1: 'bintang',
  2: 'rantai',
  3: 'pohon beringin',
  4: 'kepala banteng',
  5: 'padi dan kapas',
};

const BG: Record<SilaId, string> = {
  1: '#1b1b1b',
  2: '#c8202f',
  3: '#ffffff',
  4: '#c8202f',
  5: '#ffffff',
};

const GOLD = '#f6c21a';
const GOLD_DARK = '#c99406';

function Star() {
  // Five-point star, center (50,52), outer r 34, inner r 14.
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 34 : 14;
    const a = (-90 + i * 36) * (Math.PI / 180);
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(52 + r * Math.sin(a)).toFixed(2)}`);
  }
  return (
    <polygon
      points={pts.join(' ')}
      fill={GOLD}
      stroke={GOLD_DARK}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  );
}

function Chain() {
  // 16 links on a ring, alternating round & square (round = women, square =
  // men in the official meaning); each link is a hollow outline.
  const links = [];
  const n = 16;
  for (let i = 0; i < n; i++) {
    const a = (i * 360) / n;
    const rad = (a - 90) * (Math.PI / 180);
    const x = 50 + 30 * Math.cos(rad);
    const y = 50 + 30 * Math.sin(rad);
    links.push(
      i % 2 === 0 ? (
        <circle key={i} cx={x} cy={y} r={5.2} fill="none" stroke={GOLD} strokeWidth={2.6} />
      ) : (
        <rect
          key={i}
          x={x - 4.6}
          y={y - 4.6}
          width={9.2}
          height={9.2}
          rx={1}
          fill="none"
          stroke={GOLD}
          strokeWidth={2.6}
          transform={`rotate(${a} ${x} ${y})`}
        />
      ),
    );
  }
  return <g>{links}</g>;
}

function Beringin() {
  return (
    <g>
      {/* hanging aerial roots */}
      <g stroke="#6b4a2b" strokeWidth={1.4} strokeLinecap="round">
        <line x1={30} y1={50} x2={30} y2={74} />
        <line x1={36} y1={52} x2={36} y2={70} />
        <line x1={64} y1={52} x2={64} y2={70} />
        <line x1={70} y1={50} x2={70} y2={74} />
      </g>
      {/* trunk with flared base */}
      <path d="M44 86 L46 58 L54 58 L56 86 Q50 82 44 86 Z" fill="#7a5230" />
      {/* canopy: a cluster of rounded lobes */}
      <g fill="#2f8f3a">
        <circle cx={50} cy={30} r={17} />
        <circle cx={33} cy={38} r={14} />
        <circle cx={67} cy={38} r={14} />
        <circle cx={24} cy={49} r={10} />
        <circle cx={76} cy={49} r={10} />
        <ellipse cx={50} cy={48} rx={24} ry={11} />
      </g>
      <g fill="#46ad4f">
        <circle cx={45} cy={24} r={6} />
        <circle cx={30} cy={34} r={5} />
        <circle cx={62} cy={32} r={5} />
      </g>
      <line x1={14} y1={86} x2={86} y2={86} stroke="#3a7a2a" strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

function Banteng() {
  return (
    <g>
      {/* horns: thick curves sweeping out and up */}
      <path
        d="M36 38 C24 38 14 32 12 18 C18 26 26 28 37 30 Z"
        fill="#2a2a2a"
      />
      <path
        d="M64 38 C76 38 86 32 88 18 C82 26 74 28 63 30 Z"
        fill="#2a2a2a"
      />
      {/* ears */}
      <ellipse cx={27} cy={42} rx={9} ry={4.5} transform="rotate(-18 27 42)" fill="#111" />
      <ellipse cx={73} cy={42} rx={9} ry={4.5} transform="rotate(18 73 42)" fill="#111" />
      {/* head: broad forehead tapering to the muzzle */}
      <path
        d="M34 30 Q50 24 66 30 L65 52 Q62 70 58 80 Q50 85 42 80 Q38 70 35 52 Z"
        fill="#111"
      />
      {/* muzzle */}
      <ellipse cx={50} cy={78} rx={10} ry={6.5} fill="#2c2c2c" />
      <circle cx={46} cy={78} r={1.6} fill="#000" />
      <circle cx={54} cy={78} r={1.6} fill="#000" />
      {/* eyes */}
      <ellipse cx={41.5} cy={46} rx={3.2} ry={2.4} fill="#fff" />
      <ellipse cx={58.5} cy={46} rx={3.2} ry={2.4} fill="#fff" />
      <circle cx={42} cy={46.3} r={1.3} fill="#111" />
      <circle cx={58} cy={46.3} r={1.3} fill="#111" />
      {/* forehead highlight so the head reads as 3-D, not a flat blob */}
      <path d="M44 34 Q50 31 56 34 L54 40 Q50 38 46 40 Z" fill="#3a3a3a" />
    </g>
  );
}

function PadiKapas() {
  // Padi (rice) on the left curving right, kapas (cotton) on the right.
  const grains = [];
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const x = 22 + t * 20;
    const y = 76 - t * 52 + Math.pow(t, 2) * 6;
    grains.push(
      <ellipse
        key={`l${i}`}
        cx={x - 4}
        cy={y}
        rx={4.6}
        ry={2.6}
        transform={`rotate(-40 ${x - 4} ${y})`}
        fill={GOLD}
        stroke={GOLD_DARK}
        strokeWidth={0.9}
      />,
      <ellipse
        key={`r${i}`}
        cx={x + 4}
        cy={y + 1}
        rx={4.6}
        ry={2.6}
        transform={`rotate(40 ${x + 4} ${y + 1})`}
        fill={GOLD}
        stroke={GOLD_DARK}
        strokeWidth={0.9}
      />,
    );
  }
  const bolls: [number, number][] = [
    [70, 22],
    [62, 42],
    [77, 54],
    [66, 70],
  ];
  return (
    <g>
      <path d="M20 86 Q26 60 40 22" fill="none" stroke={GOLD_DARK} strokeWidth={2.8} />
      {grains}
      <path d="M82 86 Q64 60 70 22" fill="none" stroke="#2f7a24" strokeWidth={3} />
      {bolls.map(([x, y], i) => (
        <g key={i}>
          <path
            d={`M${x - 8} ${y + 3} Q${x} ${y + 13} ${x + 8} ${y + 3} L${x} ${y + 7} Z`}
            fill="#2f7a24"
          />
          <circle cx={x - 3.6} cy={y} r={4.8} fill="#fff" stroke="#8a8a8a" strokeWidth={1.3} />
          <circle cx={x + 3.6} cy={y} r={4.8} fill="#fff" stroke="#8a8a8a" strokeWidth={1.3} />
          <circle cx={x} cy={y - 4.2} r={4.8} fill="#fff" stroke="#8a8a8a" strokeWidth={1.3} />
        </g>
      ))}
    </g>
  );
}

export default function Sila({
  n,
  className,
  size,
}: {
  n: SilaId;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Lambang sila ${n}: ${SILA_SYMBOL[n]}`}
      data-sila={n}
    >
      <rect
        x={3}
        y={3}
        width={94}
        height={94}
        rx={14}
        fill={BG[n]}
        stroke="#c99406"
        strokeWidth={4}
      />
      {n === 1 && <Star />}
      {n === 2 && <Chain />}
      {n === 3 && <Beringin />}
      {n === 4 && <Banteng />}
      {n === 5 && <PadiKapas />}
    </svg>
  );
}
