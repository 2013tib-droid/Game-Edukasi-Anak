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

/**
 * Satu kata: tulisan, gambar isyarat, dan huruf pengecoh di nampan.
 *
 * `item` (opsional) = id item registry (`src/engine/ui/items.ts`): kalau diisi,
 * isyaratnya digambar dari seni WebP, bukan font emoji HP. `emoji` tetap jadi
 * cadangan kalau asetnya belum ada.
 */
function word(
  text: string,
  emoji: string,
  label: string,
  decoys: string[],
  item?: string,
): GameLevel<'spell'> {
  return {
    id: '',
    narration: `Ini ${label}. Ayo susun hurufnya jadi satu kata!`,
    data: { word: text, emoji, decoys, ...(item ? { item } : {}) },
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
      word('BUKU', '📕', 'buku', ['R', 'M'], 'book'),
      word('PENA', '🖊️', 'pena', ['S', 'K']),
      word('KRAYON', '🖍️', 'krayon', ['S', 'T']),
      word('PENSIL', '✏️', 'pensil', ['A', 'R'], 'pencil'),
      word('TAS', '🎒', 'tas', ['P', 'U', 'M'], 'backpack'),
    ),
    // --- 2. Hewan ---
    slot(
      'l2',
      word('SAPI', '🐮', 'sapi', ['R', 'O'], 'cow'),
      word('KUDA', '🐴', 'kuda', ['M', 'I'], 'horse'),
      word('BEBEK', '🦆', 'bebek', ['R', 'O'], 'duck'),
      word('KUCING', '🐱', 'kucing', ['A', 'R'], 'cat'),
      word('GAJAH', '🐘', 'gajah', ['R', 'U'], 'elephant'),
      word('KATAK', '🐸', 'katak', ['R', 'O'], 'frog'),
      word('AYAM', '🐔', 'ayam', ['R', 'O'], 'chicken'),
    ),
    // --- 3. Makanan & minuman ---
    slot(
      'l3',
      word('NASI', '🍚', 'nasi', ['R', 'K'], 'rice'),
      word('ROTI', '🍞', 'roti', ['B', 'A'], 'bread'),
      word('SUSU', '🥛', 'susu', ['R', 'A'], 'milk'),
      word('TELUR', '🥚', 'telur', ['A', 'K'], 'egg'),
      word('JERUK', '🍊', 'jeruk', ['A', 'M'], 'orange'),
      word('PISANG', '🍌', 'pisang', ['R', 'O'], 'banana'),
      word('MADU', '🍯', 'madu', ['R', 'I']),
    ),
    // --- 4. Alam ---
    slot(
      'l4',
      word('BULAN', '🌙', 'bulan', ['R', 'I'], 'moon'),
      word('HUJAN', '🌧️', 'hujan', ['R', 'O']),
      word('DAUN', '🍃', 'daun', ['R', 'M']),
      word('AWAN', '☁️', 'awan', ['R', 'U'], 'cloud'),
      word('LAUT', '🌊', 'laut', ['R', 'M']),
      word('BUNGA', '🌸', 'bunga', ['R', 'I'], 'flower'),
      word('PANTAI', '🏖️', 'pantai', ['R', 'U']),
    ),
    // --- 5. Kendaraan ---
    slot(
      'l5',
      word('MOBIL', '🚗', 'mobil', ['A', 'R'], 'car'),
      word('KAPAL', '🚢', 'kapal', ['R', 'U']),
      word('SEPEDA', '🚲', 'sepeda', ['R', 'U'], 'bicycle'),
      word('KERETA', '🚂', 'kereta', ['U', 'M'], 'train'),
      word('TRUK', '🚚', 'truk', ['A', 'M'], 'truck'),
      word('BECAK', '🛺', 'becak', ['R', 'U']),
    ),
    // --- 6. Barang di rumah ---
    slot(
      'l6',
      word('PINTU', '🚪', 'pintu', ['R', 'A'], 'door'),
      word('KURSI', '🪑', 'kursi', ['A', 'M'], 'chair'),
      word('GELAS', '🥤', 'gelas', ['R', 'U']),
      word('SENDOK', '🥄', 'sendok', ['A', 'R']),
      word('PIRING', '🍽️', 'piring', ['A', 'U']),
      word('LAMPU', '💡', 'lampu', ['R', 'I']),
    ),
    // --- 7. Pakaian & tubuh ---
    slot(
      'l7',
      word('BAJU', '👕', 'baju', ['R', 'M']),
      word('TOPI', '🧢', 'topi', ['R', 'A'], 'cap'),
      word('SEPATU', '👟', 'sepatu', ['R', 'M'], 'shoe'),
      word('TANGAN', '✋', 'tangan', ['R', 'O']),
      word('MATA', '👁️', 'mata', ['R', 'O']),
      word('CELANA', '👖', 'celana', ['R', 'U']),
    ),
    // --- 8. Tempat ---
    slot(
      'l8',
      word('PASAR', '🏪', 'pasar', ['U', 'M'], 'shop'),
      // TAMAN, bukan KEBUN: seni `tree` itu SATU POHON (label registry-nya
      // memang 'pohon', dan Pasang Kata/Taman Huruf memakainya untuk kata
      // "pohon") — anak yang melihatnya membaca "pohon", bukan "kebun".
      // `park` menggambar pohon + bangku di rumput, jadi benar-benar sebuah
      // TEMPAT, sesuai tema slot ini. POHON sengaja TIDAK dipakai: selain
      // bukan tempat, kata itu sudah disusun di Taman Huruf (TK) dengan
      // gambar yang sama persis.
      word('TAMAN', '🏞️', 'taman', ['R', 'O'], 'park'),
      word('SAWAH', '🌾', 'sawah', ['R', 'U'], 'field'),
      word('DESA', '🏡', 'desa', ['R', 'U']),
      word('KOTA', '🏙️', 'kota', ['R', 'I']),
      word('RUMAH', '🏠', 'rumah', ['I', 'T'], 'house'),
    ),
  ],
};

export default config;
