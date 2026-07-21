import type { MixedGameConfig } from '@/engine/core/types';

/**
 * "Pasar Buah" — ported from the Petualangan Pintar fruit world (Kenali
 * Buah). A mixed game: it walks through the source's four question types,
 * each of which already has a template — no new engine code needed:
 *   1–2  Beli Buah      → count-tap (tap N of a fruit among decoys)
 *   3    Tebak Buah     → tap-answer (pick the named fruit)
 *   4    Tebak Bayangan → tap-answer with a silhouette picture
 *   5–6  Keranjang Warna → drag-drop (sort fruit into color baskets)
 *   7    Kartu Buah     → memory (match fruit pairs)
 * Fruit names/emoji/colors come from FRUITS in petualangan-pintar.html.
 * Design rule (CLAUDE.md): counting boards mix decoy fruits and show more
 * targets than asked; multiple-choice decoys are other real fruits.
 */
const config: MixedGameConfig = {
  id: 'pasar-buah',
  group: 'tk',
  title: 'Pasar Buah',
  emoji: '🍉',
  template: 'mixed',
  freeDemo: true,
  levels: [
    // --- Beli Buah (count-tap) ---
    {
      id: 'l1',
      template: 'count-tap',
      narration: 'Ibu mau beli 3 apel. Ketuk 3 apel!',
      data: {
        ask: 3,
        target: { emoji: '🍎', label: 'apel' },
        targetCount: 5,
        decoys: [
          { emoji: '🍌', count: 3 },
          { emoji: '🍇', count: 2 },
        ],
      },
    },
    {
      id: 'l2',
      template: 'count-tap',
      narration: 'Ibu mau beli 4 jeruk. Ketuk 4 jeruk!',
      data: {
        ask: 4,
        target: { emoji: '🍊', label: 'jeruk' },
        targetCount: 6,
        decoys: [
          { emoji: '🍓', count: 3 },
          { emoji: '🍈', count: 2 },
          { emoji: '🍇', count: 1 },
        ],
      },
    },
    // --- Tebak Buah (tap-answer) ---
    {
      id: 'l3',
      template: 'tap-answer',
      narration: 'Mana mangga? Ayo sentuh!',
      data: {
        choices: [
          { id: 'a', emoji: '🥭', correct: true },
          { id: 'b', emoji: '🍐' },
          { id: 'c', emoji: '🍌' },
          { id: 'd', emoji: '🍇' },
        ],
      },
    },
    // --- Tebak Bayangan (tap-answer + siluet) ---
    {
      id: 'l4',
      template: 'tap-answer',
      narration: 'Lihat bayangan ini. Buah apa ya? Sentuh yang sama!',
      data: {
        picture: '🍌',
        silhouette: true,
        choices: [
          { id: 'a', emoji: '🍌', correct: true },
          { id: 'b', emoji: '🍎' },
          { id: 'c', emoji: '🍇' },
        ],
      },
    },
    // --- Keranjang Warna (drag-drop) ---
    // The drag-drop template is 1:1 (each basket holds one fruit), so each
    // level uses distinct color baskets — one fruit per color.
    {
      id: 'l5',
      template: 'drag-drop',
      narration: 'Masukkan setiap buah ke keranjang warnanya!',
      data: {
        targets: [
          { id: 'merah', emoji: '🔴', label: 'Merah' },
          { id: 'kuning', emoji: '🟡', label: 'Kuning' },
          { id: 'hijau', emoji: '🟢', label: 'Hijau' },
        ],
        items: [
          { id: 'i1', emoji: '🍎', targetId: 'merah' },
          { id: 'i2', emoji: '🍌', targetId: 'kuning' },
          { id: 'i3', emoji: '🍐', targetId: 'hijau' },
        ],
      },
    },
    {
      id: 'l6',
      template: 'drag-drop',
      narration: 'Masukkan setiap buah ke keranjang warnanya!',
      data: {
        targets: [
          { id: 'merah', emoji: '🔴', label: 'Merah' },
          { id: 'oranye', emoji: '🟠', label: 'Oranye' },
          { id: 'ungu', emoji: '🟣', label: 'Ungu' },
          { id: 'hijau', emoji: '🟢', label: 'Hijau' },
        ],
        items: [
          { id: 'i1', emoji: '🍉', targetId: 'merah' },
          { id: 'i2', emoji: '🍊', targetId: 'oranye' },
          { id: 'i3', emoji: '🍇', targetId: 'ungu' },
          { id: 'i4', emoji: '🥝', targetId: 'hijau' },
        ],
      },
    },
    // --- Kartu Buah (memory) ---
    {
      id: 'l7',
      template: 'memory',
      narration: 'Balik kartunya. Cari dua buah yang sama!',
      data: {
        pairs: [
          { id: 'apel', emoji: '🍎' },
          { id: 'pisang', emoji: '🍌' },
          { id: 'jeruk', emoji: '🍊' },
          { id: 'anggur', emoji: '🍇' },
        ],
      },
    },
  ],
};

export default config;
