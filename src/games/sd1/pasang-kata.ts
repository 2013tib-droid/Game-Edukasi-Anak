import type { GameConfig } from '@/engine/core/types';

/**
 * "Pasang Kata" (SD Kelas 1 & 2) — membaca kata lalu menarikannya ke gambar
 * yang cocok.
 *
 * Aturan gambar (keputusan pemilik 2026-08-01):
 *   - **Kalau bendanya HEWAN, pakai seni yang sudah diimpor** lewat id item
 *     registry (`src/engine/ui/items.ts` → `public/assets/items/*.webp`),
 *     bukan emoji. Emoji hewan berbeda-beda bentuknya di tiap HP; seni WebP
 *     sama di semua perangkat. Benda yang belum punya seni (bola, buku, mobil)
 *     tetap emoji — cukup isi `item` begitu asetnya masuk.
 *   - `pictureTargets: true` supaya gambarnya besar: di game ini gambar itu
 *     SOALNYA, bukan sekadar label (sebelumnya kekecilan di HP).
 */
const config: GameConfig<'drag-drop'> = {
  id: 'pasang-kata',
  group: 'sd1',
  title: 'Pasang Kata',
  emoji: '🧩',
  template: 'drag-drop',
  levels: [
    {
      id: 'l1',
      narration: 'Tarik kata ke gambar yang cocok!',
      data: {
        pictureTargets: true,
        targets: [
          { id: 'kucing', item: 'cat', label: '?' },
          { id: 'bola', emoji: '⚽', label: '?' },
          { id: 'buku', emoji: '📖', label: '?' },
        ],
        items: [
          { id: 'i1', text: 'kucing', targetId: 'kucing' },
          { id: 'i2', text: 'bola', targetId: 'bola' },
          { id: 'i3', text: 'buku', targetId: 'buku' },
        ],
      },
    },
    {
      id: 'l2',
      narration: 'Tarik kata ke gambar yang cocok!',
      data: {
        pictureTargets: true,
        targets: [
          { id: 'rumah', item: 'house', label: '?' },
          { id: 'mobil', emoji: '🚗', label: '?' },
          { id: 'pohon', emoji: '🌳', label: '?' },
          { id: 'matahari', item: 'sun', label: '?' },
        ],
        items: [
          { id: 'i1', text: 'rumah', targetId: 'rumah' },
          { id: 'i2', text: 'mobil', targetId: 'mobil' },
          { id: 'i3', text: 'pohon', targetId: 'pohon' },
          { id: 'i4', text: 'matahari', targetId: 'matahari' },
        ],
      },
    },
    {
      // Hewan ditarik ke makanannya — di sini hewannya yang jadi kartu, jadi
      // seni WebP-nya muncul di kartu, bukan di kotak tujuan.
      // Anjing diganti kambing: tak ada seni anjing, dan proyek ini memang
      // tidak memakai anjing (lihat Hutan Hewan di CLAUDE.md).
      id: 'l3',
      narration: 'Pasangkan hewan dengan makanannya!',
      data: {
        pictureTargets: true,
        targets: [
          { id: 'wortel', emoji: '🥕', label: 'wortel' },
          { id: 'pisang', emoji: '🍌', label: 'pisang' },
          { id: 'rumput', emoji: '🌿', label: 'rumput' },
        ],
        items: [
          { id: 'i1', item: 'rabbit', text: 'kelinci', targetId: 'wortel' },
          { id: 'i2', item: 'monkey', text: 'monyet', targetId: 'pisang' },
          { id: 'i3', item: 'goat', text: 'kambing', targetId: 'rumput' },
        ],
      },
    },
  ],
};

export default config;
