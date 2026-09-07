import type { ReactNode } from 'react';
import type { BodyPartId } from '@/engine/core/types';

/**
 * Gambar seorang anak, digambar sebagai SVG di ENGINE — bukan gambar yang
 * diunduh.
 *
 * Alasannya sama dengan `Shape.tsx` (bangun datar), `Clock.tsx` (muka jam) dan
 * `Scene.tsx` (latar cerita): satu berkas SVG ±3 kB yang ikut chunk template,
 * tak pernah bisa gagal karena jaringan, dan sama persis di tiap HP. Yang
 * WAJIB gambar impor tetap SUBJEK soal yang bentuknya harus tepat (hewan,
 * buah, benda) — di sini bentuknya justru milik engine, karena titik sentuh
 * tiap anggota tubuh harus cocok dengan gambarnya sampai ke pikselnya.
 *
 * KALAU NANTI DIGANTI ILUSTRASI KIRIMAN PEMILIK: gambar barunya masuk ke
 * `Figure` di bawah (atau sebagai <image> di dalamnya), lalu koordinat di
 * `BODY_PARTS` dibetulkan sekali mengikuti gambar itu. Tak satu pun config
 * game ikut berubah — config cuma menyebut nama bagiannya.
 *
 * PROPORSI SENGAJA "CHIBI" (kepala besar, badan pendek, tinggi 140 satuan):
 * bukan cuma karena lucu — kepala yang besar memberi ruang untuk mata, hidung
 * dan mulut yang berjauhan, dan jarak antar titik itulah yang menentukan
 * besar daerah sentuh anak (lihat `hitRadii` di `TapPicture.tsx`).
 */

const SKIN = '#f6c9a0';
const SKIN_DARK = '#e2a97e';
const HAIR = '#4b3524';
const SHIRT = '#57b0e8';
const SHIRT_DARK = '#3f95cd';
const PANTS = '#3d6ea9';
const SHOE = '#e8604c';
const BLUSH = '#f79aa0';
const INK = '#3a2e20';

/** Satu titik di ruang koordinat gambar (viewBox 0 0 100 140). */
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
   * Bagian WAJAH. Kalau semua bagian yang aktif di satu level bertanda ini,
   * engine memotong gambarnya jadi tampilan wajah (lihat `KID_VIEW`) — hidung
   * dan mulut mustahil disentuh dengan adil di tampilan seluruh badan.
   */
  face?: boolean;
  /**
   * Batas atas radius sentuh dalam satuan gambar. Bawaannya `HIT_MAX`;
   * `kepala` jauh lebih besar karena yang dimaksud memang seluruh kepala,
   * bukan satu titik di dahi.
   */
  cap?: number;
}

/** Batas atas radius sentuh (satuan gambar) untuk bagian biasa. */
export const HIT_MAX = 12;

/**
 * Geometri tiap bagian tubuh. Koordinatnya menempel pada gambar di `Figure`
 * di bawah — kalau salah satunya digeser, geser juga yang lain.
 */
export const BODY_PARTS: Record<BodyPartId, BodyPartGeom> = {
  rambut: { points: [{ x: 50, y: 13 }], label: 'Rambut', face: true },
  kepala: { points: [{ x: 50, y: 34 }], label: 'Kepala', cap: 19 },
  mata: {
    points: [
      { x: 38, y: 27.5 },
      { x: 62, y: 27.5 },
    ],
    label: 'Mata',
    face: true,
  },
  telinga: {
    points: [
      { x: 25, y: 37 },
      { x: 75, y: 37 },
    ],
    label: 'Telinga',
    face: true,
    // Daun telinga menempel di tepi kepala, jadi lingkaran sentuhnya tumbuh
    // KELUAR gambar. Dibatasi supaya tidak pernah terpotong bingkai wajah —
    // lingkaran yang terpotong tepi layar terbaca seperti gambar rusak.
    cap: 9,
  },
  hidung: { points: [{ x: 50, y: 38 }], label: 'Hidung', face: true },
  mulut: { points: [{ x: 50, y: 54 }], label: 'Mulut', face: true },
  pipi: {
    points: [
      { x: 28, y: 47 },
      { x: 72, y: 47 },
    ],
    label: 'Pipi',
    face: true,
  },
  leher: { points: [{ x: 50, y: 63 }], label: 'Leher' },
  pundak: {
    points: [
      { x: 32, y: 70 },
      { x: 68, y: 70 },
    ],
    label: 'Pundak',
  },
  tangan: {
    points: [
      { x: 17, y: 95 },
      { x: 83, y: 95 },
    ],
    label: 'Tangan',
  },
  perut: { points: [{ x: 50, y: 88 }], label: 'Perut', cap: 14 },
  lutut: {
    points: [
      { x: 40, y: 114 },
      { x: 60, y: 114 },
    ],
    label: 'Lutut',
  },
  kaki: {
    points: [
      { x: 40, y: 129 },
      { x: 60, y: 129 },
    ],
    label: 'Kaki',
  },
};

export type KidView = 'badan' | 'wajah';

/**
 * Bingkai gambar. `wajah` menggeser "kamera" ke kepala supaya mata, hidung dan
 * mulut punya daerah sentuh selebar jari anak — di tampilan seluruh badan
 * ketiganya berdesakan dalam ruang seukuran kuku.
 *
 * `viewBox` TIDAK memotong gambar: apa yang ada di luarnya tetap tergambar
 * sampai tepi kotaknya (yang memotong cuma viewport SVG). Jadi bingkai wajah
 * bukan "kepala digunting", melainkan kamera yang mendekat — badannya terus
 * ke bawah lalu habis di tepi layar, persis seperti foto close-up. Karena itu
 * bingkai wajahnya dijangkarkan ke ATAS (`xMidYMin`, lihat di bawah): kalau
 * ditengahkan, kepalanya turun ke tengah dan menyisakan ruang kosong lebar di
 * atas kepala sementara badannya bocor memenuhi bawah.
 *
 * TINGGI BINGKAI = SKALA. Karena isinya bocor, tinggi `wajah` cuma menentukan
 * seberapa dekat kameranya: makin pendek, makin besar gambarnya saat TINGGI
 * layar yang jadi batas. Enam puluh empat satuan adalah setinggi titik sentuh
 * terbawah (mulut + radiusnya) — memendekkannya lagi akan membuang titik
 * sentuh ke luar layar. Justru ini yang menyelamatkan soal wajah saat HP
 * dimiringkan: 46 px jadi 64 px.
 */
export const KID_VIEW: Record<KidView, string> = {
  badan: '0 0 100 140',
  wajah: '15 0 70 64',
};

/** Anak yang digambar. Murni gambar — tak tahu-menahu soal soal atau sentuhan. */
function Figure() {
  return (
    <g>
      {/* Rambut belakang, sedikit lebih besar dari kepala supaya tepinya
          terlihat mengelilingi wajah. */}
      <circle cx="50" cy="31" r="27.5" fill={HAIR} />
      {/* Telinga digambar SEBELUM kepala: bagian dalamnya tertutup wajah, jadi
          yang tersisa cuma daun telinganya. */}
      {/* Digambar MELEBAR KELUAR kepala (tepi kepala di y=37 ada di x=24):
          percobaan pertama menaruhnya di x=25,5 dan yang tersisa cuma tonjolan
          setipis garis — telinga yang tak terlihat tak bisa disentuh anak. */}
      <ellipse cx="23" cy="37" rx="6.8" ry="8.5" fill={SKIN} />
      <ellipse cx="77" cy="37" rx="6.8" ry="8.5" fill={SKIN} />
      <ellipse cx="22.6" cy="37" rx="2.8" ry="4" fill={SKIN_DARK} />
      <ellipse cx="77.4" cy="37" rx="2.8" ry="4" fill={SKIN_DARK} />

      {/* Leher (di belakang badan & kepala) */}
      <rect x="43" y="54" width="14" height="14" rx="6" fill={SKIN_DARK} />

      {/* Kepala */}
      <circle cx="50" cy="35" r="26" fill={SKIN} />
      {/* Poni: setengah lingkaran atas kepala, ditutup lengkung yang lebih
          rendah di tengah dahi. */}
      <path d="M24,35 A26,26 0 0 1 76,35 Q67,19 50,18 Q33,19 24,35 Z" fill={HAIR} />

      {/* Mata. SENGAJA TANPA ALIS: poninya turun sampai sekitar y=21 di atas
          mata, jadi alis apa pun akan tenggelam di dalam rambut — dan wajah
          kartun anak memang lebih ramah tanpanya. */}
      <circle cx="38" cy="27.5" r="4.6" fill={INK} />
      <circle cx="62" cy="27.5" r="4.6" fill={INK} />
      <circle cx="39.6" cy="25.9" r="1.7" fill="#fff" />
      <circle cx="63.6" cy="25.9" r="1.7" fill="#fff" />
      {/* Pipi */}
      <ellipse cx="28" cy="47" rx="7" ry="4.6" fill={BLUSH} opacity="0.6" />
      <ellipse cx="72" cy="47" rx="7" ry="4.6" fill={BLUSH} opacity="0.6" />
      {/* Hidung */}
      <path
        d="M46.6,36.4 Q50,41.4 53.4,36.4"
        stroke={SKIN_DARK}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Mulut tersenyum */}
      <path d="M42,50.6 Q50,59.4 58,50.6 Z" fill="#c2564a" />
      <path d="M46.4,56.2 Q50,59.2 53.6,56.2 Z" fill={BLUSH} />

      {/* Lengan: kulit dulu, lengan baju menimpanya di bahu. */}
      <path
        d="M32,72 L18,94"
        stroke={SKIN}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M68,72 L82,94"
        stroke={SKIN}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      {/* Badan / baju */}
      {/* Kerah bajunya sengaja rendah (y=67 di tengah): dagu ada di y=61, dan
          baju yang lebih tinggi menelan lehernya — padahal "leher" salah satu
          bagian yang ditanyakan. */}
      <path d="M31,72 Q50,67 69,72 L71,100 Q50,104 29,100 Z" fill={SHIRT} />
      {/* Lengan baju dimulai DI DALAM badan bajunya (x=37, badan baju 31–69):
          percobaan pertama memulainya di tepi dan hasilnya dua kapsul biru
          yang tampak melayang lepas dari bajunya. */}
      <path
        d="M37,75 L30,85"
        stroke={SHIRT_DARK}
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M63,75 L70,85"
        stroke={SHIRT_DARK}
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      {/* Tangan sengaja lebih gemuk dari lengannya (jari-jari 7,6 lawan tebal
          lengan 9): kalau sama, ujung lengan cuma jadi garis membulat dan
          tangannya tak terbaca sebagai tangan. */}
      <circle cx="16.6" cy="96" r="7.6" fill={SKIN} />
      <circle cx="83.4" cy="96" r="7.6" fill={SKIN} />

      {/* Celana pendek */}
      <path d="M31,97 L69,97 L67,111 L54,111 L50,102 L46,111 L33,111 Z" fill={PANTS} />
      {/* Kaki */}
      <path
        d="M40,109 L40,126"
        stroke={SKIN}
        strokeWidth="9.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M60,109 L60,126"
        stroke={SKIN}
        strokeWidth="9.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Sepatu, ujungnya menghadap keluar supaya kedua kaki tidak terlihat
          melangkah ke arah yang sama. */}
      <rect x="30" y="124" width="18" height="10" rx="5" fill={SHOE} />
      <rect x="52" y="124" width="18" height="10" rx="5" fill={SHOE} />
    </g>
  );
}

/**
 * Gambar anak + apa pun yang mau digambar di ATASNYA dalam koordinat yang
 * sama (`children` = titik-titik sentuh dari `TapPicture`). Harus satu SVG:
 * lingkaran sentuh dan gambarnya wajib memakai sistem koordinat yang sama,
 * jadi keduanya ikut membesar/mengecil bersamaan tanpa hitungan piksel.
 */
export default function Kid({
  view = 'badan',
  className,
  children,
}: {
  view?: KidView;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <svg
      className={className}
      viewBox={KID_VIEW[view]}
      /* Ditandai supaya tes headless bisa memeriksa bingkai yang BENAR-BENAR
         tampil, bukan yang ditulis config — pola yang sama dengan `data-shape`
         di Shape.tsx dan `data-clock` di Clock.tsx. */
      data-kid={view}
      /* Wajah dijangkarkan ke ATAS, badan ditengahkan — lihat `KID_VIEW`. */
      preserveAspectRatio={view === 'wajah' ? 'xMidYMin meet' : 'xMidYMid meet'}
      aria-hidden
    >
      <Figure />
      {children}
    </svg>
  );
}
