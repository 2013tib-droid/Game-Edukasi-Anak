import type { ReactNode } from 'react';
import type { PlantPartId } from '@/engine/core/types';
import type { FigureDef, FigurePartGeom } from '@/engine/ui/figure';

/**
 * Tanaman untuk template `tap-picture` (Kebun Ilmu, sd2): akar, batang, daun,
 * bunga, dan buah dalam SATU gambar, dengan tanah yang dipotong melintang
 * supaya akarnya terlihat.
 *
 * SVG buatan engine, bukan ilustrasi impor (keputusan pemilik 2026-09-29) —
 * alasan yang sama dengan `Shape.tsx`, `Clock.tsx` dan `Scene.tsx`: titik
 * sentuh tiap bagian harus cocok dengan gambarnya sampai ke satuannya, dan
 * gambarnya tampil sama di semua HP. Kalau nanti pemilik mengirim ilustrasi,
 * gambarnya masuk ke `PlantArt` lalu tabel `PLANT_PARTS` diukur ulang SEKALI;
 * config game tidak ikut berubah karena cuma menyebut nama bagiannya.
 *
 * KOTAKNYA 100×128, BUKAN 100×165 seperti gambar anak: rasio 0,78 itu sama
 * dengan kotak gambar di HP terkecil (288×368 px di 320×568), jadi tanamannya
 * mengisi kotak itu penuh dan tiap daerah sentuh sebesar-besarnya.
 *
 * TATA LETAKNYA MENGIKAT TITIK SENTUH: bunga di pucuk tengah, daun kiri lebih
 * rendah dari daun kanan, buah menggantung di kanan bawah, akar di bawah garis
 * tanah. Jaraknya dipilih supaya daerah sentuh terkecil di HP 320 px tetap
 * ≥ 60 px walau kelima bagian aktif bersamaan — dijaga `check-body-parts.mjs`.
 * Pojok kanan atas SENGAJA kosong: di situ isyarat benda (`cueItem`) duduk.
 */

export const PLANT_W = 100;
export const PLANT_H = 128;

/** Garis permukaan tanah. */
const GROUND = 90;

export const PLANT_PARTS: Record<PlantPartId, FigurePartGeom> = {
  bunga: { points: [{ x: 50, y: 17 }], label: 'Bunga' },
  daun: {
    points: [
      { x: 23, y: 52 },
      { x: 76, y: 57 },
    ],
    label: 'Daun',
  },
  batang: { points: [{ x: 50, y: 79 }], label: 'Batang' },
  buah: { points: [{ x: 74, y: 83 }], label: 'Buah' },
  // Akar = seluruh sebaran akar di bawah tanah, jadi batasnya lebih lebar.
  akar: { points: [{ x: 46, y: 110 }], label: 'Akar', cap: 19 },
};

export const PLANT_FIGURE: FigureDef<PlantPartId> = {
  w: PLANT_W,
  h: PLANT_H,
  hitMax: 15,
  parts: PLANT_PARTS,
};

/** Satu helai daun: ujung di `tip`, pangkal di `base`, lengkung ke dua sisi. */
function leaf(base: [number, number], tip: [number, number], width: number) {
  const [bx, by] = base;
  const [tx, ty] = tip;
  const mx = (bx + tx) / 2;
  const my = (by + ty) / 2;
  // Normal of the midrib, scaled to half the leaf width.
  const len = Math.hypot(tx - bx, ty - by);
  const nx = (-(ty - by) / len) * width;
  const ny = ((tx - bx) / len) * width;
  return {
    blade: `M${bx} ${by} Q${mx + nx} ${my + ny} ${tx} ${ty} Q${mx - nx} ${my - ny} ${bx} ${by}Z`,
    vein: `M${bx} ${by} L${tx} ${ty}`,
  };
}

const LEAF_L = leaf([50, 58], [12, 46], 9);
const LEAF_R = leaf([50, 50], [90, 60], 9);
const LEAF_TOP_L = leaf([50, 34], [38, 27], 4);

function PlantArt() {
  return (
    <g>
      {/* Tanah dipotong melintang. */}
      <rect x="0" y={GROUND} width={PLANT_W} height={PLANT_H - GROUND} rx="4" fill="#b98457" />
      <rect x="0" y={GROUND} width={PLANT_W} height="4" fill="#8fc464" />
      {[
        [12, 104],
        [86, 108],
        [20, 122],
        [78, 123],
        [91, 96],
      ].map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="2.6" ry="1.8" fill="#9a6b44" />
      ))}

      {/* Akar serabut-tunggang: satu akar utama + cabang. */}
      <g fill="none" stroke="#f3dfb6" strokeLinecap="round">
        <path d="M50 92 C49 103 47 113 45 125" strokeWidth="3" />
        <path d="M49.5 97 C42 101 36 107 30 116" strokeWidth="2" />
        <path d="M49 103 C56 107 60 113 64 121" strokeWidth="2" />
        <path d="M48 111 C40 115 36 120 33 125" strokeWidth="1.5" />
        <path d="M47 117 C52 120 55 123 57 126" strokeWidth="1.5" />
        <path d="M50 95 C57 97 63 100 68 106" strokeWidth="1.5" />
        <path d="M49 100 C43 102 38 103 33 102" strokeWidth="1.2" />
      </g>

      {/* Batang. */}
      <path d="M50 92 C49 72 51 50 50 26" fill="none" stroke="#4f9a3a" strokeWidth="4.5" strokeLinecap="round" />
      {/* Tangkai buah. */}
      <path d="M50 68 C60 70 69 71 73 74" fill="none" stroke="#4f9a3a" strokeWidth="2.2" strokeLinecap="round" />

      {/* Daun. */}
      {[LEAF_L, LEAF_R, LEAF_TOP_L].map((lf, i) => (
        <g key={i}>
          <path d={lf.blade} fill="#6cc04a" stroke="#3f8a2e" strokeWidth="0.8" />
          <path d={lf.vein} stroke="#3f8a2e" strokeWidth="0.7" fill="none" />
        </g>
      ))}

      {/* Buah (tomat) menggantung. */}
      <circle cx="73" cy="82" r="8.5" fill="#e8483a" />
      <ellipse cx="70" cy="79" rx="2.4" ry="1.6" fill="#ffffff" opacity="0.55" />
      <path d="M68 74.5 L73 76.5 L78 74.5 L75 77.5 L73 75 L71 77.5Z" fill="#3f8a2e" />

      {/* Bunga. */}
      <g transform="translate(50 17)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-6.5" rx="4.4" ry="6.5" fill="#ff9fc4" stroke="#e66e9d" strokeWidth="0.6" transform={`rotate(${a})`} />
        ))}
        <circle r="4" fill="#ffd23f" stroke="#e6a817" strokeWidth="0.6" />
      </g>
    </g>
  );
}

/**
 * Tanaman + apa pun yang digambar di ATASNYA dalam koordinat yang sama
 * (titik-titik sentuh dari `TapPicture`). Kontraknya sama dengan `Kid`.
 */
export default function Plant({
  frame,
  className,
  children,
}: {
  frame?: string;
  className?: string;
  children?: ReactNode;
}) {
  const viewBox = frame ?? `0 0 ${PLANT_W} ${PLANT_H}`;
  return (
    <svg
      className={className}
      viewBox={viewBox}
      data-figure="tanaman"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <PlantArt />
      {children}
    </svg>
  );
}
