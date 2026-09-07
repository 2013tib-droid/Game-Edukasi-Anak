import type { GameConfig, GameLevel } from '@/engine/core/types';
import { ITEMS } from '@/engine/ui/items';

/**
 * "Puzzle Gambar" (TK) — menyusun kepingan gambar sampai utuh.
 *
 * SATU SESI = 6 PERMAINAN (6 slot, urutannya TETAP supaya kepingnya makin
 * banyak: empat → empat → empat → enam → enam → enam). Tiap slot punya 6
 * VARIAN CADANGAN bertema; shell mengundi satu varian tiap kali dimainkan dan
 * tiap "Main Lagi".
 *
 * SENGAJA TANPA `sessionLevels` — pelajaran dari Kartu Kembar (2026-09-04):
 * `sessionLevels` ikut MENGACAK URUTAN SLOT, jadi anak TK bisa langsung dapat
 * papan enam keping di permainan pertama. Cadangan di sini datang dari kolam
 * varian per slot, bukan dari kolam slot.
 *
 * NOL ASET BARU: semua gambar sudah ada di repo. Seni item (`item`) dipakai
 * apa adanya dari registry, ilustrasi cerita (`art`) dari
 * `public/assets/story/`. Engine tak pernah memotong berkas — lihat
 * `PuzzleData` di `types.ts`.
 *
 * ATURAN MEMILIH UKURAN PAPAN (jangan dilanggar saat menambah varian):
 * bentuk papan (`cols/rows`) harus MENDEKATI bentuk gambarnya, supaya subjek
 * menyentuh semua sel. Kalau tidak, sebagian keping jadi bidang polos yang
 * mustahil ditebak anak — dan itu tidak adil, karena logikanya menuntut keping
 * yang PERSIS benar.
 *   - seni tegak/kotak (hewan, buah, benda; rasio ±0,9–1,2) → 2×2
 *   - seni tinggi (jerapah, gajah, singa; rasio ±0,6–1,0)   → 2×3
 *   - seni lebar (kendaraan; rasio ±1,4–2,3)                → 3×2
 *   - ilustrasi cerita berlatar penuh (rasio 1,34)          → 3×2
 * Ilustrasi cerita selalu aman (detailnya penuh sampai ke sudut); seni item
 * transparan di pinggirnya, itulah sebabnya panelnya bergradien.
 *
 * JANGAN memakai berkas di `public/assets/items/` yang isinya ADEGAN
 * (`kancil-rawa`, `gajah-lumpur`) sebagai `item`: itu gambar berlatar, bukan
 * benda potongan, jadi panelnya jadi mubazir. Pakai jalur `art` untuk adegan.
 */

/** Warna panel di belakang seni item. Selalu pilih yang KONTRAS dengan subjek. */
const BG = {
  biru: '#cfe8ff',
  kuning: '#ffe9a8',
  hijau: '#d8f3c8',
  pink: '#ffd9e2',
  ungu: '#e4dcff',
  peach: '#ffe0c2',
};

/**
 * Narasi = nama bendanya. Ini muatan belajar game ini: anak MENDENGAR nama
 * benda yang sedang disusunnya, jadi puzzle tidak cuma latihan mata.
 * (Beda dari Kartu Kembar, yang sengaja memakai satu kalimat untuk semua
 * varian — di sana namanya tak menambah apa pun, di sini justru itu isinya.)
 */
function susun(name: string): string {
  return `Ayo susun gambar ${name}!`;
}

/** Puzzle dari seni item registry, digelar di atas panel berwarna. */
function pic(
  item: keyof typeof ITEMS,
  name: string,
  bg: string,
  cols: 2 | 3,
  rows: 2 | 3,
): GameLevel<'puzzle'> {
  return { id: '', narration: susun(name), data: { item, bg, cols, rows } };
}

/** Puzzle dari ilustrasi cerita berlatar penuh (`public/assets/story/`). */
function scene(art: string, name: string): GameLevel<'puzzle'> {
  return { id: '', narration: susun(name), data: { art, cols: 3, rows: 2 } };
}

/** Semua varian dalam satu slot berbagi id — bintangnya per slot. */
function slot(id: string, ...variants: GameLevel<'puzzle'>[]): GameLevel<'puzzle'>[] {
  return variants.map((v) => ({ ...v, id }));
}

const config: GameConfig<'puzzle'> = {
  id: 'puzzle-gambar',
  group: 'tk',
  title: 'Puzzle Gambar',
  emoji: '🧩',
  template: 'puzzle',
  levels: [
    // --- 1. Empat keping — hewan berbentuk kotak/bulat ---
    slot(
      'l1',
      pic('panda', 'panda', BG.hijau, 2, 2),
      pic('rabbit', 'kelinci', BG.ungu, 2, 2),
      pic('turtle', 'kura-kura', BG.kuning, 2, 2),
      pic('cat', 'kucing', BG.biru, 2, 2),
      pic('tiger', 'harimau', BG.biru, 2, 2),
      pic('frog', 'katak', BG.kuning, 2, 2),
    ),
    // --- 2. Empat keping — buah ---
    slot(
      'l2',
      pic('apple', 'apel', BG.biru, 2, 2),
      pic('orange', 'jeruk', BG.hijau, 2, 2),
      pic('watermelon', 'semangka', BG.kuning, 2, 2),
      pic('melon', 'melon', BG.pink, 2, 2),
      pic('strawberry', 'stroberi', BG.hijau, 2, 2),
      pic('banana', 'pisang', BG.biru, 2, 2),
    ),
    // --- 3. Empat keping — benda sehari-hari ---
    slot(
      'l3',
      pic('ball', 'bola', BG.kuning, 2, 2),
      pic('book', 'buku', BG.hijau, 2, 2),
      pic('umbrella', 'payung', BG.kuning, 2, 2),
      pic('teddy', 'boneka', BG.biru, 2, 2),
      pic('backpack', 'tas', BG.hijau, 2, 2),
      pic('cap', 'topi', BG.peach, 2, 2),
    ),
    // --- 4. Enam keping — kendaraan (seni lebar, jadi papannya melebar) ---
    slot(
      'l4',
      pic('car', 'mobil', BG.biru, 3, 2),
      pic('bus', 'bus', BG.biru, 3, 2),
      pic('truck', 'truk', BG.kuning, 3, 2),
      pic('tractor', 'traktor', BG.biru, 3, 2),
      pic('train', 'kereta', BG.kuning, 3, 2),
      pic('ambulance', 'ambulans', BG.hijau, 3, 2),
    ),
    // --- 5. Enam keping — hewan tinggi (papan tegak, 2 kolom × 3 baris) ---
    slot(
      'l5',
      pic('giraffe', 'jerapah', BG.biru, 2, 3),
      pic('elephant', 'gajah', BG.kuning, 2, 3),
      pic('lion', 'singa', BG.biru, 2, 3),
      pic('bear', 'beruang', BG.hijau, 2, 3),
      pic('penguin', 'pinguin', BG.kuning, 2, 3),
      pic('horse', 'kuda', BG.hijau, 2, 3),
    ),
    // --- 6. Enam keping — ilustrasi cerita, gambar paling ramai ---
    slot(
      'l6',
      scene('jalak-kerbau-kubang', 'kerbau di sawah'),
      scene('jalak-kerbau-sahabat', 'burung jalak dan kerbau'),
      scene('kancil-tani-lapar', 'kancil di hutan'),
      scene('kancil-tani-menyeberang', 'kancil dan buaya'),
      scene('kancil-gajah-panggil', 'kancil dan teman-temannya'),
      scene('kancil-gajah-tarik', 'hewan yang bergotong royong'),
    ),
  ],
};

export default config;
