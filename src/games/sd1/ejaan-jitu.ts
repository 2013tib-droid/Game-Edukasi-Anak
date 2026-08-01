import type { GameConfig, GameLevel } from '@/engine/core/types';

/**
 * "Ejaan Jitu" (SD Kelas 1 & 2) — menyusun kata utuh dari huruf-huruf acak.
 *
 * Bedanya dengan slot "susun kata" di Taman Huruf (TK): di sana narasi
 * MENGEJAKAN hurufnya satu per satu ("R, O, K, E, T") sehingga anak tinggal
 * mengikuti. Di sini narasi hanya menyebut BENDANYA — anak sendiri yang
 * harus tahu kata itu ditulis dengan huruf apa saja dan urutannya bagaimana.
 * Kata-katanya juga lebih panjang (4–6 huruf, termasuk kata tiga suku kata).
 *
 * Aturan pengecoh (CLAUDE.md): nampan selalu dicampur huruf yang TIDAK ada
 * di kata itu, jadi anak tidak bisa asal mengetuk semua huruf.
 */

/** Satu kata: tulisan, gambar isyarat, dan huruf pengecoh di nampan. */
function word(
  text: string,
  emoji: string,
  label: string,
  decoys: string[],
): GameLevel<'spell'> {
  return {
    id: '',
    narration: `Ini ${label}. Ayo susun hurufnya jadi satu kata!`,
    data: { word: text, emoji, decoys },
  };
}

/** Semua varian dalam satu slot berbagi id — bintangnya per slot. */
function slot(id: string, ...variants: GameLevel<'spell'>[]): GameLevel<'spell'>[] {
  return variants.map((v) => ({ ...v, id }));
}

const config: GameConfig<'spell'> = {
  id: 'ejaan-jitu',
  group: 'sd1',
  title: 'Ejaan Jitu',
  emoji: '🔤',
  template: 'spell',
  sessionLevels: 7,
  levels: [
    // --- 1. Benda sekolah ---
    slot(
      'l1',
      word('BUKU', '📕', 'buku', ['R', 'M']),
      word('PENA', '🖊️', 'pena', ['S', 'K']),
      word('KRAYON', '🖍️', 'krayon', ['S', 'T']),
      word('PENSIL', '✏️', 'pensil', ['A', 'R']),
      word('TAS', '🎒', 'tas', ['P', 'U', 'M']),
    ),
    // --- 2. Hewan ---
    slot(
      'l2',
      word('SAPI', '🐮', 'sapi', ['R', 'O']),
      word('KUDA', '🐴', 'kuda', ['M', 'I']),
      word('BEBEK', '🦆', 'bebek', ['R', 'O']),
      word('KUCING', '🐱', 'kucing', ['A', 'R']),
      word('GAJAH', '🐘', 'gajah', ['R', 'U']),
      word('KATAK', '🐸', 'katak', ['R', 'O']),
      word('AYAM', '🐔', 'ayam', ['R', 'O']),
    ),
    // --- 3. Makanan & minuman ---
    slot(
      'l3',
      word('NASI', '🍚', 'nasi', ['R', 'K']),
      word('ROTI', '🍞', 'roti', ['B', 'A']),
      word('SUSU', '🥛', 'susu', ['R', 'A']),
      word('TELUR', '🥚', 'telur', ['A', 'K']),
      word('JERUK', '🍊', 'jeruk', ['A', 'M']),
      word('PISANG', '🍌', 'pisang', ['R', 'O']),
      word('MADU', '🍯', 'madu', ['R', 'I']),
    ),
    // --- 4. Alam ---
    slot(
      'l4',
      word('BULAN', '🌙', 'bulan', ['R', 'I']),
      word('HUJAN', '🌧️', 'hujan', ['R', 'O']),
      word('DAUN', '🍃', 'daun', ['R', 'M']),
      word('AWAN', '☁️', 'awan', ['R', 'U']),
      word('LAUT', '🌊', 'laut', ['R', 'M']),
      word('BUNGA', '🌸', 'bunga', ['R', 'I']),
      word('PANTAI', '🏖️', 'pantai', ['R', 'U']),
    ),
    // --- 5. Kendaraan ---
    slot(
      'l5',
      word('MOBIL', '🚗', 'mobil', ['A', 'R']),
      word('KAPAL', '🚢', 'kapal', ['R', 'U']),
      word('SEPEDA', '🚲', 'sepeda', ['R', 'U']),
      word('KERETA', '🚂', 'kereta', ['U', 'M']),
      word('TRUK', '🚚', 'truk', ['A', 'M']),
      word('BECAK', '🛺', 'becak', ['R', 'U']),
    ),
    // --- 6. Barang di rumah ---
    slot(
      'l6',
      word('PINTU', '🚪', 'pintu', ['R', 'A']),
      word('KURSI', '🪑', 'kursi', ['A', 'M']),
      word('GELAS', '🥤', 'gelas', ['R', 'U']),
      word('SENDOK', '🥄', 'sendok', ['A', 'R']),
      word('PIRING', '🍽️', 'piring', ['A', 'U']),
      word('LAMPU', '💡', 'lampu', ['R', 'I']),
    ),
    // --- 7. Pakaian & tubuh ---
    slot(
      'l7',
      word('BAJU', '👕', 'baju', ['R', 'M']),
      word('TOPI', '🧢', 'topi', ['R', 'A']),
      word('SEPATU', '👟', 'sepatu', ['R', 'M']),
      word('TANGAN', '✋', 'tangan', ['R', 'O']),
      word('MATA', '👁️', 'mata', ['R', 'O']),
      word('CELANA', '👖', 'celana', ['R', 'U']),
    ),
    // --- 8. Tempat ---
    slot(
      'l8',
      word('PASAR', '🏪', 'pasar', ['U', 'M']),
      word('KEBUN', '🌳', 'kebun', ['A', 'R']),
      word('SAWAH', '🌾', 'sawah', ['R', 'U']),
      word('DESA', '🏡', 'desa', ['R', 'U']),
      word('KOTA', '🏙️', 'kota', ['R', 'I']),
      word('RUMAH', '🏠', 'rumah', ['I', 'T']),
    ),
  ],
};

export default config;
