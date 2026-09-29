import type { ReactNode } from 'react';
import type { BodyPartId, KidView } from '@/engine/core/types';
import { fullFrame, type FigureDef, type FigurePartGeom } from '@/engine/ui/figure';

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
 * dulu 16). Itu sebabnya bingkai WAJAH sekarang dihitung per soal (`figureFrame`)
 * dan bukan satu kotak tetap — kotak tetap yang harus memuat kedua telinga
 * membuat soal "hidung lawan mulut" turun ke 35 px, jauh di bawah target
 * sentuh anak. Bingkai badan tetap seluruh badan, seperti dulu.
 */

/** Ukuran gambar dalam satuan koordinat; sama dengan rasio berkas aslinya. */
export const KID_W = 100;
export const KID_H = 165;

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
 * radius sentuh tiap titik persis setengah jarak itu (lihat `figureSpots` di figure.ts).
 * Lingkaran yang dihasilkan tetap menutupi bentuk yang digambar.
 */
export const BODY_PARTS: Record<BodyPartId, FigurePartGeom> = {
  rambut: { points: [{ x: 50, y: 9 }], label: 'Rambut', zoom: true },
  kepala: { points: [{ x: 50, y: 26 }], label: 'Kepala', cap: 22 },
  mata: {
    points: [
      { x: 40, y: 35.5 },
      { x: 60, y: 35.5 },
    ],
    label: 'Mata',
    zoom: true,
  },
  telinga: {
    points: [
      { x: 26.5, y: 37 },
      { x: 73.5, y: 37 },
    ],
    label: 'Telinga',
    zoom: true,
    // Daun telinga menempel di tepi kepala, jadi lingkaran sentuhnya tumbuh
    // KELUAR gambar. Dibatasi supaya tidak melebar sampai terlihat lepas dari
    // kepalanya.
    cap: 8,
  },
  hidung: { points: [{ x: 50, y: 39.5 }], label: 'Hidung', zoom: true },
  mulut: { points: [{ x: 50, y: 47 }], label: 'Mulut', zoom: true },
  pipi: {
    points: [
      { x: 35.5, y: 43.5 },
      { x: 64.5, y: 43.5 },
    ],
    label: 'Pipi',
    zoom: true,
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

/**
 * Tabel titik sentuh gambar anak untuk template `tap-picture`. Rumus radius &
 * bingkainya ada di `figure.ts` (`figureSpots`/`figureFrame`), dipakai bersama
 * figur tanaman — dulu bernama `kidSpots`/`kidFrame` dan hanya milik gambar ini.
 *
 * Bagian bertanda `zoom` (wajah) membuat kameranya mendekat bila SEMUA bagian
 * aktif ada di wajah; satu bagian badan saja ikut → seluruh badan.
 */
export const KID_FIGURE: FigureDef<BodyPartId> = {
  w: KID_W,
  h: KID_H,
  hitMax: HIT_MAX,
  parts: BODY_PARTS,
};

/** Seluruh badan, dari ujung rambut sampai telapak kaki. */
const FRAME_BADAN = fullFrame(KID_FIGURE);

/**
 * Bingkai untuk gambar anak yang dipakai sebagai ISYARAT SOAL di kartu
 * jawaban (`TapAnswerData.kid`), bukan sebagai papan sentuh.
 *
 * Di sini bingkainya TIDAK bisa dihitung seperti `figureFrame`: tak ada lingkaran
 * sentuh yang harus dimuat, jadi yang menentukan cuma "apa yang harus terlihat
 * anak". Ketiganya DIUKUR dari `public/assets/kid/anak.webp` yang sama, jadi
 * kalau gambarnya diganti, tabel ini diukur ulang bersama `BODY_PARTS`.
 *
 * `wajah` sengaja berhenti di kerah baju, bukan di dagu: kepala yang dipotong
 * pas di dagu terbaca seperti kepala lepas. `tangan` ikut membawa lengan
 * bawahnya dengan alasan yang sama — aturan lama "jangan pernah memajang
 * potongan tubuh yang melayang".
 *
 * Kotaknya dipakai apa adanya sebagai `viewBox`, dan CSS memberi elemennya
 * bentuk yang SAMA (tinggi dipatok, lebar ikut), jadi viewport-nya persis
 * sebesar kotak ini — tak ada bagian gambar di luar bingkai yang bocor
 * terlihat (`viewBox` sendiri tidak pernah memotong apa pun).
 */
export const KID_CUE_FRAMES: Record<KidView, string> = {
  /** Seluruh kepala: rambut, kedua telinga, wajah, sampai kerah baju. */
  wajah: '18 0 64 58',
  /** Seluruh badan — untuk yang dihitung di luar wajah (kaki, tangan, lutut). */
  badan: FRAME_BADAN,
  /**
   * Satu telapak tangan, cukup besar untuk menghitung jarinya.
   *
   * Bingkainya sengaja naik sampai UJUNG LENGAN BAJU: tanpa itu yang tampil
   * cuma lengan terpotong yang melayang — persis yang dilarang aturan "jangan
   * pernah memajang potongan tubuh yang melayang", dan sudah kelihatan begitu
   * di percobaan pertama. Dengan lengan bajunya ikut terlihat, gambarnya
   * terbaca sebagai tangan MILIK anak yang sama, cuma didekatkan.
   */
  tangan: '72 68 32 36',
};

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
  /** viewBox dari `figureFrame`; bawaannya seluruh badan. */
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
