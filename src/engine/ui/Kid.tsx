import type { ReactNode } from 'react';
import type { BodyPartId } from '@/engine/core/types';

/**
 * Gambar seorang anak untuk template `tap-picture` (game "Anggota Tubuh").
 *
 * DULU SVG BUATAN ENGINE, SEKARANG ILUSTRASI KIRIMAN PEMILIK. Jalur ganti ini
 * memang sudah disiapkan sejak awal: gambarnya masuk ke `Figure`, lalu
 * koordinat di `BODY_PARTS` dibetulkan sekali mengikuti gambar itu. Yang TIDAK
 * ikut berubah: config game — ia cuma menyebut nama bagiannya.
 *
 * SATUANNYA IKUT GANTI: dulu 100×140 (anak chibi), sekarang 100×165 karena
 * anak di ilustrasi ini berproporsi wajar, bukan kepala besar berbadan pendek.
 * Semua angka di bawah — termasuk `HIT_MAX` — ikut diskalakan 140→165 supaya
 * besar daerah sentuh dalam PIKSEL tidak ikut mengecil.
 *
 * AKIBAT YANG HARUS DIINGAT KALAU GAMBARNYA DIGANTI LAGI: di wajah yang
 * digambar realistis, hidung dan mulut cuma berjarak 7,5 satuan (di anak chibi
 * dulu 16). Itu sebabnya bingkai WAJAH sekarang dihitung per soal (`kidFrame`)
 * dan bukan satu kotak tetap — kotak tetap yang harus memuat kedua telinga
 * membuat soal "hidung lawan mulut" turun ke 35 px, jauh di bawah target
 * sentuh anak. Bingkai badan tetap seluruh badan, seperti dulu.
 */

/** Ukuran gambar dalam satuan koordinat; sama dengan rasio berkas aslinya. */
export const KID_W = 100;
export const KID_H = 165;

/** Satu titik di ruang koordinat gambar (0 0 100 165). */
export interface KidPoint {
  x: number;
  y: number;
}

export interface BodyPartGeom {
  /**
   * Titik sentuh bagian ini. DUA titik untuk yang memang sepasang (mata,
   * telinga, pipi, tangan, lutut, kaki) — anak menyentuh telinga mana pun dan
   * dua-duanya benar, dan itu jauh lebih jujur daripada satu lingkaran besar
   * di tengah kepala.
   */
  points: KidPoint[];
  /** Nama Indonesianya, ditampilkan setelah dijawab benar. */
  label: string;
  /**
   * Bagian WAJAH. Kalau SEMUA bagian yang aktif di satu soal bertanda ini,
   * engine mendekatkan kameranya ke kepala (lihat `kidFrame`) — hidung dan
   * mulut mustahil disentuh dengan adil di tampilan seluruh badan.
   */
  face?: boolean;
  /**
   * Batas atas radius sentuh dalam satuan gambar. Bawaannya `HIT_MAX`;
   * `kepala` dan `perut` jauh lebih besar karena yang dimaksud memang seluruh
   * kepala / seluruh perut, bukan satu titik di dahi.
   */
  cap?: number;
}

/**
 * Batas atas radius sentuh (satuan gambar) untuk bagian biasa. 15 satuan pada
 * kanvas setinggi 165 = 12 satuan pada kanvas lama setinggi 140: besar yang
 * SAMA di layar, cuma satuannya yang berganti.
 */
export const HIT_MAX = 15;

/**
 * Geometri tiap bagian tubuh, DIUKUR dari `public/assets/kid/anak.webp`
 * (berkas 624×1030 px = 100×165 satuan). Kalau gambarnya diganti, seluruh
 * tabel ini diukur ulang — jangan menggeser satu-dua saja.
 *
 * Titik hidung sengaja di UJUNG ATAS hidung dan mulut di ujung bawah bibir,
 * bukan di tengah keduanya: jaraknya jadi 7,5 dan bukan 4,5 satuan, dan
 * radius sentuh tiap titik persis setengah jarak itu (lihat `kidSpots`).
 * Lingkaran yang dihasilkan tetap menutupi bentuk yang digambar.
 */
export const BODY_PARTS: Record<BodyPartId, BodyPartGeom> = {
  rambut: { points: [{ x: 50, y: 9 }], label: 'Rambut', face: true },
  kepala: { points: [{ x: 50, y: 26 }], label: 'Kepala', cap: 22 },
  mata: {
    points: [
      { x: 40, y: 35.5 },
      { x: 60, y: 35.5 },
    ],
    label: 'Mata',
    face: true,
  },
  telinga: {
    points: [
      { x: 26.5, y: 37 },
      { x: 73.5, y: 37 },
    ],
    label: 'Telinga',
    face: true,
    // Daun telinga menempel di tepi kepala, jadi lingkaran sentuhnya tumbuh
    // KELUAR gambar. Dibatasi supaya tidak melebar sampai terlihat lepas dari
    // kepalanya.
    cap: 8,
  },
  hidung: { points: [{ x: 50, y: 39.5 }], label: 'Hidung', face: true },
  mulut: { points: [{ x: 50, y: 47 }], label: 'Mulut', face: true },
  pipi: {
    points: [
      { x: 35.5, y: 43.5 },
      { x: 64.5, y: 43.5 },
    ],
    label: 'Pipi',
    face: true,
  },
  leher: { points: [{ x: 50, y: 53 }], label: 'Leher' },
  pundak: {
    points: [
      { x: 35, y: 62 },
      { x: 65, y: 62 },
    ],
    label: 'Pundak',
  },
  tangan: {
    points: [
      { x: 15, y: 96 },
      { x: 85, y: 96 },
    ],
    label: 'Tangan',
  },
  perut: { points: [{ x: 50, y: 93 }], label: 'Perut', cap: 16 },
  lutut: {
    points: [
      { x: 39, y: 127 },
      { x: 61, y: 127 },
    ],
    label: 'Lutut',
  },
  kaki: {
    points: [
      { x: 40, y: 156 },
      { x: 60, y: 156 },
    ],
    label: 'Kaki',
  },
};

/** Satu titik sentuh yang sudah jadi: bagian mana, di mana, seberapa besar. */
export interface KidSpot {
  part: BodyPartId;
  x: number;
  y: number;
  r: number;
}

/**
 * Titik sentuh satu soal, lengkap dengan besarnya.
 *
 * Radiusnya BUKAN angka tetap: tiap titik dipangkas jadi setengah jarak ke
 * titik milik bagian LAIN yang terdekat. Dengan begitu dua daerah sentuh tak
 * pernah bertindihan (r_a + r_b <= d), jadi tak pernah ada sentuhan yang
 * "sebenarnya benar tapi dihitung salah" — dan sekaligus jadi rem yang jujur:
 * soal yang mengaktifkan bagian-bagian berdempetan akan terlihat sendiri
 * daerah sentuhnya menciut. `scripts/check-body-parts.mjs` mengukur ini untuk
 * SEMUA varian, jadi soal yang terlalu sempit ketahuan sebelum sampai ke anak.
 *
 * Titik-titik milik bagian yang SAMA (dua mata, dua tangan) sengaja tidak
 * saling memangkas: keduanya jawaban yang sama, jadi bertindihan pun tak apa.
 */
export function kidSpots(parts: readonly BodyPartId[]): KidSpot[] {
  const base = parts.flatMap((part) =>
    BODY_PARTS[part].points.map((pt) => ({ part, x: pt.x, y: pt.y })),
  );
  return base.map((a, i) => {
    let r = BODY_PARTS[a.part].cap ?? HIT_MAX;
    base.forEach((b, j) => {
      if (i === j || a.part === b.part) return;
      r = Math.min(r, Math.hypot(a.x - b.x, a.y - b.y) / 2);
    });
    return { ...a, r };
  });
}

/** Ruang napas di sekeliling lingkaran terluar, dalam satuan gambar. */
const FRAME_PAD = 1;
/** Bingkai terkecil yang boleh dipakai — rem supaya gambar tak dizoom ekstrem. */
const FRAME_MIN = { w: 26, h: 20 };
/** Seluruh badan, dari ujung rambut sampai telapak kaki. */
const FRAME_BADAN = `0 0 ${KID_W} ${KID_H}`;

/**
 * Bingkai ("kamera") untuk satu soal.
 *
 * Soal yang menyinggung SATU SAJA bagian badan memakai seluruh badan — anak
 * perlu melihat anaknya utuh untuk tahu di mana pundak itu, dan badan yang
 * dipotong sebatas dada terbaca seperti gambar rusak.
 *
 * Soal yang SEMUA bagiannya di wajah mendapat kamera yang mendekat, dan
 * sedekat apa DIHITUNG dari soal itu sendiri: kotak terkecil yang masih memuat
 * seluruh lingkaran sentuhnya. Dulu bingkai wajahnya satu kotak tetap, dan itu
 * cukup selama wajahnya chibi. Pada ilustrasi berproporsi wajar, satu bingkai
 * yang harus memuat kedua telinga (lebar 61 satuan) membuat soal hidung-lawan-
 * mulut mengecil jadi 35 px. Dihitung per soal, soal yang cuma memakai mata,
 * hidung dan mulut mendapat bingkai selebar 33 satuan — kameranya mendekat dua
 * kali lipat, dan daerah sentuhnya lolos target.
 *
 * `viewBox` TIDAK memotong gambar: apa yang ada di luarnya tetap tergambar
 * sampai tepi kotaknya (yang memotong cuma viewport SVG). Jadi bingkai wajah
 * bukan "kepala digunting", melainkan kamera yang mendekat — badannya terus ke
 * bawah lalu habis di tepi layar, persis seperti foto close-up.
 */
export function kidFrame(spots: readonly KidSpot[]): string {
  if (!spots.every((s) => BODY_PARTS[s.part].face)) return FRAME_BADAN;
  let x0 = Math.min(...spots.map((s) => s.x - s.r)) - FRAME_PAD;
  let x1 = Math.max(...spots.map((s) => s.x + s.r)) + FRAME_PAD;
  let y0 = Math.min(...spots.map((s) => s.y - s.r)) - FRAME_PAD;
  let y1 = Math.max(...spots.map((s) => s.y + s.r)) + FRAME_PAD;
  if (x1 - x0 < FRAME_MIN.w) {
    const cx = (x0 + x1) / 2;
    x0 = cx - FRAME_MIN.w / 2;
    x1 = cx + FRAME_MIN.w / 2;
  }
  if (y1 - y0 < FRAME_MIN.h) {
    const cy = (y0 + y1) / 2;
    y0 = cy - FRAME_MIN.h / 2;
    y1 = cy + FRAME_MIN.h / 2;
  }
  const round = (n: number) => Math.round(n * 10) / 10;
  return [round(x0), round(y0), round(x1 - x0), round(y1 - y0)].join(' ');
}

/**
 * Anak yang digambar. Murni gambar — tak tahu-menahu soal soal atau sentuhan.
 *
 * `preserveAspectRatio="none"` aman DI SINI justru karena kotak 100×165
 * dipilih persis mengikuti rasio berkasnya (624×1030), jadi tak ada yang
 * gepeng; yang dihindari cuma celah setengah piksel di tepi kalau browser
 * membulatkan sendiri.
 */
function Figure() {
  return (
    <image
      href={`${import.meta.env.BASE_URL}assets/kid/anak.webp`}
      x="0"
      y="0"
      width={KID_W}
      height={KID_H}
      preserveAspectRatio="none"
    />
  );
}

/**
 * Gambar anak + apa pun yang mau digambar di ATASNYA dalam koordinat yang
 * sama (`children` = titik-titik sentuh dari `TapPicture`). Harus satu SVG:
 * lingkaran sentuh dan gambarnya wajib memakai sistem koordinat yang sama,
 * jadi keduanya ikut membesar/mengecil bersamaan tanpa hitungan piksel.
 */
export default function Kid({
  frame,
  className,
  children,
}: {
  /** viewBox dari `kidFrame`; bawaannya seluruh badan. */
  frame?: string;
  className?: string;
  children?: ReactNode;
}) {
  const viewBox = frame ?? FRAME_BADAN;
  return (
    <svg
      className={className}
      viewBox={viewBox}
      /* Ditandai supaya tes headless bisa memeriksa bingkai yang BENAR-BENAR
         tampil, bukan yang dihitungnya sendiri — pola yang sama dengan
         `data-shape` di Shape.tsx dan `data-clock` di Clock.tsx. */
      data-kid={viewBox}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <Figure />
      {children}
    </svg>
  );
}
