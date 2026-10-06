import type { ReactElement } from 'react';
import type { Place } from '@/engine/core/types';

/**
 * Balok nilai tempat (balok Dienes) — Istana Bilangan, `sd2`. Digambar SVG
 * engine, nol aset: pelat ratusan (10 × 10 petak), batang puluhan (10 petak),
 * kubus satuan. Pola yang sama dengan `Shape.tsx`.
 *
 * Satu `BlockTower` = isi SATU nilai tempat, di kotak tetap 100 × 100 dengan
 * tempat kosong yang tergambar samar — jadi anak melihat kapasitasnya
 * ("sepuluh kubus jadi satu batang") dan bisa menghitung tanpa menebak:
 * - ratusan: kisi 3 × 3 (paling banyak 9 — 10 pelat = 1.000, di luar batas `sd2`);
 * - puluhan: 10 batang berdiri berjajar;
 * - satuan: bingkai sepuluh 5 × 2 (pola yang sudah dikenal anak sejak kelas 1).
 *
 * `merging` menandai sepuluh balok yang sedang menempel jadi satu balok di
 * tempat berikutnya (animasinya di `place-value.css`).
 */

const COLOR: Record<Place, { fill: string; edge: string; line: string }> = {
  100: { fill: '#ff8a5b', edge: '#d9572a', line: '#fff3' },
  10: { fill: '#5aa9ff', edge: '#2f72c8', line: '#fff6' },
  1: { fill: '#5fcf7a', edge: '#2e9a4d', line: '#fff6' },
};

/** Posisi tiap tempat (x, y, lebar, tinggi) di kotak 100 × 100. */
function slots(place: Place): [number, number, number, number][] {
  if (place === 100) {
    const out: [number, number, number, number][] = [];
    for (let r = 0; r < 3; r += 1) for (let c = 0; c < 3; c += 1) out.push([4 + c * 32, 4 + r * 32, 28, 28]);
    return out;
  }
  if (place === 10) {
    return Array.from({ length: 10 }, (_, i): [number, number, number, number] => [3 + i * 9.6, 6, 7.6, 88]);
  }
  const out: [number, number, number, number][] = [];
  for (let r = 0; r < 2; r += 1) for (let c = 0; c < 5; c += 1) out.push([3 + c * 19.4, 32 + r * 19.4, 16.8, 16.8]);
  return out;
}

export const CAPACITY: Record<Place, number> = { 100: 9, 10: 10, 1: 10 };

function Piece({ place, x, y, w, h }: { place: Place; x: number; y: number; w: number; h: number }) {
  const c = COLOR[place];
  const lines: ReactElement[] = [];
  if (place === 100) {
    for (let i = 1; i < 10; i += 1) {
      lines.push(<line key={`v${i}`} x1={x + (w * i) / 10} y1={y} x2={x + (w * i) / 10} y2={y + h} />);
      lines.push(<line key={`h${i}`} x1={x} y1={y + (h * i) / 10} x2={x + w} y2={y + (h * i) / 10} />);
    }
  } else if (place === 10) {
    for (let i = 1; i < 10; i += 1) lines.push(<line key={i} x1={x} y1={y + (h * i) / 10} x2={x + w} y2={y + (h * i) / 10} />);
  }
  return (
    <g className="blk-piece">
      <rect x={x} y={y} width={w} height={h} rx={place === 1 ? 2.5 : 1.6} fill={c.fill} stroke={c.edge} strokeWidth={1.2} />
      {lines.length > 0 && (
        <g stroke={c.line} strokeWidth={0.5}>
          {lines}
        </g>
      )}
      {/* Kilau di sisi atas — supaya terbaca balok, bukan kotak datar. */}
      <rect x={x + 1.2} y={y + 1.2} width={w - 2.4} height={Math.min(3, h / 6)} rx={1} fill="#ffffff55" />
    </g>
  );
}

export function BlockTower({
  place,
  count,
  merging = false,
  className = '',
}: {
  place: Place;
  count: number;
  merging?: boolean;
  className?: string;
}) {
  const all = slots(place);
  const shown = Math.min(count, all.length);
  return (
    <svg
      viewBox="0 0 100 100"
      className={`blk-tower blk-tower--p${place}${merging ? ' blk-tower--merge' : ''} ${className}`}
      aria-hidden
      data-count={count}
      data-place={place}
    >
      {all.map(([x, y, w, h], i) => (
        <rect key={`e${i}`} x={x} y={y} width={w} height={h} rx={2} className="blk-slot" />
      ))}
      {all.slice(0, shown).map(([x, y, w, h], i) => (
        <Piece key={i} place={place} x={x} y={y} w={w} h={h} />
      ))}
    </svg>
  );
}

/** Satu balok sendirian (kartu gudang, balok yang sedang diseret). */
export function BlockIcon({ place, className = '' }: { place: Place; className?: string }) {
  const box: Record<Place, [number, number, number, number]> = {
    100: [10, 10, 80, 80],
    10: [42, 5, 16, 90],
    1: [32, 32, 36, 36],
  };
  const [x, y, w, h] = box[place];
  return (
    <svg viewBox="0 0 100 100" className={`blk-icon ${className}`} aria-hidden>
      <Piece place={place} x={x} y={y} w={w} h={h} />
    </svg>
  );
}
