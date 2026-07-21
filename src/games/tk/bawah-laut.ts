import type { GameConfig } from '@/engine/core/types';

/**
 * "Bawah Laut" — ported from the Petualangan Pintar ocean world (Warna &
 * Bentuk). Every level is a "pick one card" question (tap-answer), but the
 * cards are colored geometric shapes drawn as SVG (see engine/ui/Shape).
 * The source's four level types are laid out as a progression:
 *   1–2  Cari Bentuk  (same color, pick the named shape)
 *   3–4  Cari Warna   (same shape, pick the named color)
 *   5–6  Bentuk & Warna (pick the card matching BOTH)
 *   7    Pola Ajaib   (continue the ABAB shape pattern)
 * Design rule (CLAUDE.md): decoys are deliberate look-alikes — similar
 * shapes (kotak/ketupat, lingkaran/oval) and neighboring colors
 * (merah/oranye/pink, biru/ungu) — so the child must really discriminate.
 */

// Color palette (hex) ported from COLORS in petualangan-pintar.html.
const MERAH = '#EF5350';
const BIRU = '#42A5F5';
const KUNING = '#FFC93C';
const HIJAU = '#66BB6A';
const UNGU = '#AB47BC';
const ORANYE = '#FFA726';
const PINK = '#F48FB1';

const config: GameConfig<'tap-answer'> = {
  id: 'bawah-laut',
  group: 'tk',
  title: 'Bawah Laut',
  emoji: '🐠',
  freeDemo: true,
  template: 'tap-answer',
  levels: [
    // --- Cari Bentuk: warna sama, bentuk beda ---
    {
      id: 'l1',
      narration: 'Semua warnanya sama. Sentuh bentuk segitiga!',
      data: {
        choices: [
          { id: 'a', shape: { kind: 'segitiga', color: BIRU }, correct: true },
          { id: 'b', shape: { kind: 'kotak', color: BIRU } },
          { id: 'c', shape: { kind: 'ketupat', color: BIRU } },
          { id: 'd', shape: { kind: 'lingkaran', color: BIRU } },
        ],
      },
    },
    {
      id: 'l2',
      narration: 'Semua warnanya sama. Sentuh bentuk bintang!',
      data: {
        choices: [
          { id: 'a', shape: { kind: 'bintang', color: MERAH }, correct: true },
          { id: 'b', shape: { kind: 'hati', color: MERAH } },
          { id: 'c', shape: { kind: 'segitiga', color: MERAH } },
          { id: 'd', shape: { kind: 'lingkaran', color: MERAH } },
        ],
      },
    },
    // --- Cari Warna: bentuk sama, warna beda ---
    {
      id: 'l3',
      narration: 'Semua bentuknya sama. Sentuh warna biru!',
      data: {
        choices: [
          { id: 'a', shape: { kind: 'lingkaran', color: BIRU }, correct: true },
          { id: 'b', shape: { kind: 'lingkaran', color: UNGU } },
          { id: 'c', shape: { kind: 'lingkaran', color: HIJAU } },
          { id: 'd', shape: { kind: 'lingkaran', color: ORANYE } },
        ],
      },
    },
    {
      id: 'l4',
      narration: 'Semua bentuknya sama. Sentuh warna kuning!',
      data: {
        choices: [
          { id: 'a', shape: { kind: 'bintang', color: KUNING }, correct: true },
          { id: 'b', shape: { kind: 'bintang', color: ORANYE } },
          { id: 'c', shape: { kind: 'bintang', color: PINK } },
          { id: 'd', shape: { kind: 'bintang', color: HIJAU } },
        ],
      },
    },
    // --- Bentuk & Warna: setiap pengecoh cocok satu ciri saja ---
    {
      id: 'l5',
      narration: 'Sentuh hati yang berwarna merah!',
      data: {
        choices: [
          { id: 'a', shape: { kind: 'hati', color: MERAH }, correct: true },
          { id: 'b', shape: { kind: 'hati', color: PINK } },
          { id: 'c', shape: { kind: 'lingkaran', color: MERAH } },
          { id: 'd', shape: { kind: 'kotak', color: BIRU } },
        ],
      },
    },
    {
      id: 'l6',
      narration: 'Sentuh kotak yang berwarna kuning!',
      data: {
        choices: [
          { id: 'a', shape: { kind: 'kotak', color: KUNING }, correct: true },
          { id: 'b', shape: { kind: 'kotak', color: ORANYE } },
          { id: 'c', shape: { kind: 'ketupat', color: KUNING } },
          { id: 'd', shape: { kind: 'segitiga', color: HIJAU } },
        ],
      },
    },
    // --- Pola Ajaib: lanjutkan deret ABAB ---
    {
      id: 'l7',
      narration: 'Lihat polanya baik-baik. Bentuk apa selanjutnya?',
      data: {
        sequence: [
          { kind: 'lingkaran', color: MERAH },
          { kind: 'bintang', color: KUNING },
          { kind: 'lingkaran', color: MERAH },
          { kind: 'bintang', color: KUNING },
          { kind: 'lingkaran', color: MERAH },
          null,
        ],
        choices: [
          { id: 'a', shape: { kind: 'bintang', color: KUNING }, correct: true },
          { id: 'b', shape: { kind: 'lingkaran', color: MERAH } },
          { id: 'c', shape: { kind: 'bintang', color: MERAH } },
          { id: 'd', shape: { kind: 'kotak', color: KUNING } },
        ],
      },
    },
  ],
};

export default config;
