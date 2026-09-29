/**
 * Geometri "gambar yang bisa disentuh" untuk template `tap-picture`.
 *
 * Dulu template itu terkunci ke gambar anak (`Kid.tsx`) dan rumus titik
 * sentuhnya bernama `kidSpots`/`kidFrame`. Sejak Kebun Ilmu (sd2, 2026-09-29)
 * ada figur kedua — tanaman (`Plant.tsx`) — jadi rumusnya diangkat ke sini dan
 * tiap figur cukup menyerahkan TABEL titiknya (`FigureDef`). Kedua figur (dan
 * figur berikutnya) memakai aturan yang sama persis: daerah sentuh tak pernah
 * bertindihan, dan `scripts/check-body-parts.mjs` mengukur keduanya dengan
 * fungsi yang sama yang dipakai layar.
 *
 * Modul ini sengaja TANPA JSX dan tanpa import gambar: skrip pemeriksa di CI
 * mem-bundle-nya langsung.
 */

/** Satu titik di ruang koordinat gambar (0 0 w h). */
export interface FigurePoint {
  x: number;
  y: number;
}

export interface FigurePartGeom {
  /**
   * Titik sentuh bagian ini. DUA titik untuk yang memang sepasang (dua mata,
   * dua daun) — menyentuh yang mana pun benar.
   */
  points: FigurePoint[];
  /** Nama Indonesianya, ditampilkan setelah dijawab benar. */
  label: string;
  /**
   * Bagian KECIL yang butuh kamera mendekat (wajah anak). Kalau SEMUA bagian
   * aktif di satu soal bertanda ini, bingkainya dihitung ketat mengelilingi
   * lingkaran sentuhnya; kalau tidak, figurnya tampil utuh.
   */
  zoom?: boolean;
  /** Batas atas radius sentuh (satuan gambar). Bawaannya `FigureDef.hitMax`. */
  cap?: number;
}

export interface FigureDef<P extends string = string> {
  /** Ukuran gambar dalam satuan koordinat — rasionya = rasio gambarnya. */
  w: number;
  h: number;
  /** Batas atas radius sentuh untuk bagian biasa, dalam satuan gambar. */
  hitMax: number;
  parts: Record<P, FigurePartGeom>;
}

/** Satu titik sentuh yang sudah jadi: bagian mana, di mana, seberapa besar. */
export interface FigureSpot<P extends string = string> {
  part: P;
  x: number;
  y: number;
  r: number;
}

/**
 * Titik sentuh satu soal, lengkap dengan besarnya.
 *
 * Radiusnya BUKAN angka tetap: tiap titik dipangkas jadi setengah jarak ke
 * titik milik bagian LAIN yang terdekat. Dua daerah sentuh tak pernah
 * bertindihan (r_a + r_b <= d), jadi tak pernah ada sentuhan yang "sebenarnya
 * benar tapi dihitung salah" — dan soal yang mengaktifkan bagian berdempetan
 * terlihat sendiri daerah sentuhnya menciut.
 *
 * Titik-titik milik bagian yang SAMA sengaja tidak saling memangkas: keduanya
 * jawaban yang sama, jadi bertindihan pun tak apa.
 */
export function figureSpots<P extends string>(
  def: FigureDef<P>,
  parts: readonly P[],
): FigureSpot<P>[] {
  const base = parts.flatMap((part) =>
    def.parts[part].points.map((pt) => ({ part, x: pt.x, y: pt.y })),
  );
  return base.map((a, i) => {
    let r = def.parts[a.part].cap ?? def.hitMax;
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

/** Seluruh figur. */
export function fullFrame(def: FigureDef): string {
  return `0 0 ${def.w} ${def.h}`;
}

/**
 * Bingkai ("kamera") untuk satu soal: seluruh figur, KECUALI semua bagian
 * aktifnya bertanda `zoom` — maka kotak terkecil yang masih memuat seluruh
 * lingkaran sentuhnya. `viewBox` tidak memotong gambar; ia cuma mendekatkan
 * kamera (lihat catatan panjangnya di Kid.tsx).
 */
export function figureFrame<P extends string>(
  def: FigureDef<P>,
  spots: readonly FigureSpot<P>[],
): string {
  if (!spots.every((s) => def.parts[s.part].zoom)) return fullFrame(def);
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
