import type { ReactNode } from 'react';
import type { PlantPartId } from '@/engine/core/types';
import type { FigureDef, FigurePartGeom } from '@/engine/ui/figure';

/**
 * Tanaman untuk template `tap-picture` (Kebun Ilmu, sd2): akar, batang, daun,
 * bunga, dan buah dalam SATU gambar, dengan tanah yang dipotong melintang
 * supaya akarnya terlihat.
 *
 * Gambarnya ILUSTRASI kiriman pemilik (`public/assets/plant/tanaman.webp`,
 * 2026-10-12) — menggantikan SVG engine yang dinilai "kurang profesional".
 * Prompt-nya: `docs/prompt-gambar-tanaman.md`. Tabel `PLANT_PARTS` diukur
 * ulang dari gambar itu; config game tidak ikut berubah karena cuma menyebut
 * nama bagiannya (pola yang sama dengan gambar anak di `Kid.tsx`).
 *
 * KOTAKNYA 100×128, BUKAN 100×165 seperti gambar anak: rasio 0,78 itu sama
 * dengan kotak gambar di HP terkecil (288×368 px di 320×568), jadi tanamannya
 * mengisi kotak itu penuh dan tiap daerah sentuh sebesar-besarnya.
 *
 * TATA LETAKNYA MENGIKAT TITIK SENTUH: bunga di pucuk tengah, daun kiri lebih
 * tinggi dari daun kanan, buah menggantung di kanan bawah, akar di bawah garis
 * tanah. Jaraknya dipilih supaya daerah sentuh terkecil di HP 320 px tetap
 * ≥ 60 px walau kelima bagian aktif bersamaan — dijaga `check-body-parts.mjs`.
 * Pojok kanan atas SENGAJA kosong: di situ isyarat benda (`cueItem`) duduk.
 */

export const PLANT_W = 100;
export const PLANT_H = 128;

/**
 * Ilustrasi dipasang setinggi kotak (128) dan ditengahkan mendatar: rasionya
 * 629×900 (0,70) sedikit lebih ramping dari kotak 0,78, jadi lebarnya 89,46
 * satuan mulai di x 5,27. Semua titik di bawah DIUKUR dari gambar itu lewat
 * kisi bersatuan viewBox — kalau gambarnya diganti, ukur ulang di sini.
 */
const ART_W = (PLANT_H * 629) / 900;
const ART_X = (PLANT_W - ART_W) / 2;

export const PLANT_PARTS: Record<PlantPartId, FigurePartGeom> = {
  // Titiknya sedikit di bawah pusat bunga + cap 12: bunga menempel di tepi
  // atas gambar, jadi lingkaran r15 di pusatnya terpotong tepi kotak.
  bunga: { points: [{ x: 50, y: 11 }], label: 'Bunga', cap: 12 },
  daun: {
    points: [
      { x: 27, y: 28 },
      { x: 70, y: 42 },
    ],
    label: 'Daun',
  },
  // Batang polos di antara tangkai buah dan rumput. Sengaja serendah ini:
  // lebih tinggi lagi, jaraknya ke tomat < 21 satuan dan daerah sentuh
  // keduanya jatuh di bawah 60 px di HP 320.
  batang: { points: [{ x: 49.5, y: 80 }], label: 'Batang' },
  buah: { points: [{ x: 64, y: 64 }], label: 'Buah' },
  // Akar = seluruh sebaran akar di bawah tanah, jadi batasnya lebih lebar.
  akar: { points: [{ x: 50, y: 106 }], label: 'Akar', cap: 19 },
};

export const PLANT_FIGURE: FigureDef<PlantPartId> = {
  w: PLANT_W,
  h: PLANT_H,
  hitMax: 15,
  parts: PLANT_PARTS,
};

function PlantArt() {
  return (
    <image
      href={`${import.meta.env.BASE_URL}assets/plant/tanaman.webp`}
      x={ART_X}
      y={0}
      width={ART_W}
      height={PLANT_H}
      preserveAspectRatio="xMidYMid meet"
    />
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
