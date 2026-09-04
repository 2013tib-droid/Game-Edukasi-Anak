import type { GameConfig, GameLevel, MemoryPair } from '@/engine/core/types';
import { ITEMS } from '@/engine/ui/items';

/**
 * "Kartu Kembar" (TK) — mencocokkan pasangan gambar.
 *
 * SATU SESI = 5 PERMAINAN (5 slot, urutannya tetap supaya papannya makin
 * besar: 3 → 4 → 4 → 5 → 6 pasang). Tiap slot punya 4 VARIAN CADANGAN dengan
 * tema berbeda (buah, kendaraan, benda, makanan/alam/bangunan); shell memilih
 * satu varian secara acak tiap kali game dimainkan dan tiap "Main Lagi", jadi
 * 5 permainan itu praktis tidak pernah berulang sama persis.
 *
 * TIDAK ADA HEWAN di game ini (keputusan pemilik, 2026-09-04) — hewan sudah
 * jadi milik Hutan Hewan. Semua kartu di sini benda mati: buah, kendaraan,
 * benda sehari-hari, makanan, alam, bangunan.
 */

/**
 * Card face from the picture registry: real AI art (WebP), same on every
 * phone. The registry's emoji stays as fallback if an asset is missing.
 */
function pair(item: keyof typeof ITEMS): MemoryPair {
  return { id: item, item, emoji: ITEMS[item].emoji };
}

/** Satu varian papan: daftar item yang dijadikan pasangan. */
function board(narration: string, ...items: Array<keyof typeof ITEMS>): GameLevel<'memory'> {
  return { id: '', narration, data: { pairs: items.map(pair) } };
}

/**
 * Semua varian dalam satu slot berbagi id — bintangnya per slot, jadi bintang
 * lama (`l1`…`l3`) tidak hilang saat kolam varian ditambah.
 */
function slot(id: string, ...variants: GameLevel<'memory'>[]): GameLevel<'memory'>[] {
  return variants.map((v) => ({ ...v, id }));
}

/**
 * Kalimatnya sengaja SEDIKIT dan dipakai ulang lintas varian: kunci file suara
 * = isi kalimat, jadi narasi bertema ("…pasangan buah yang sama!") berarti 20
 * rekaman Azure baru untuk keuntungan nol — anak sudah melihat gambarnya.
 */
const AJAKAN = {
  mulai: 'Temukan pasangan gambar yang sama!',
  lagi: 'Sekarang lebih banyak! Temukan semua pasangannya!',
  cari: 'Ayo cari lagi pasangan yang sama!',
  banyak: 'Kartunya makin banyak. Ayo cocokkan semuanya!',
  akhir: 'Level terakhir! Kamu pasti bisa!',
};

const config: GameConfig<'memory'> = {
  id: 'kartu-kembar',
  group: 'tk',
  title: 'Kartu Kembar',
  emoji: '🃏',
  template: 'memory',
  levels: [
    // --- 1. Tiga pasang (6 kartu) ---
    slot(
      'l1',
      board(AJAKAN.mulai, 'apple', 'banana', 'orange'),
      board(AJAKAN.mulai, 'car', 'bus', 'bicycle'),
      board(AJAKAN.mulai, 'book', 'pencil', 'backpack'),
      board(AJAKAN.mulai, 'sun', 'moon', 'cloud'),
    ),
    // --- 2. Empat pasang (8 kartu) ---
    slot(
      'l2',
      board(AJAKAN.lagi, 'strawberry', 'grapes', 'watermelon', 'pineapple'),
      board(AJAKAN.lagi, 'train', 'truck', 'motorcycle', 'taxi'),
      board(AJAKAN.lagi, 'ball', 'balloon', 'teddy', 'cap'),
      board(AJAKAN.lagi, 'bread', 'milk', 'egg', 'rice'),
    ),
    // --- 3. Empat pasang lagi, tema lain (8 kartu) ---
    slot(
      'l3',
      board(AJAKAN.cari, 'mango', 'pear', 'kiwi', 'melon'),
      board(AJAKAN.cari, 'ambulance', 'firetruck', 'police', 'jeep'),
      board(AJAKAN.cari, 'chair', 'door', 'key', 'umbrella'),
      board(AJAKAN.cari, 'house', 'school', 'shop', 'hospital'),
    ),
    // --- 4. Lima pasang (10 kartu) ---
    slot(
      'l4',
      board(AJAKAN.banyak, 'cherry', 'lemon', 'avocado', 'apple', 'banana'),
      board(AJAKAN.banyak, 'tractor', 'scooter', 'bajaj', 'pickup', 'racecar'),
      board(AJAKAN.banyak, 'shoe', 'book', 'ball', 'key', 'cap'),
      board(AJAKAN.banyak, 'flower', 'tree', 'sun', 'cloud', 'moon'),
    ),
    // --- 5. Enam pasang (12 kartu) ---
    slot(
      'l5',
      board(AJAKAN.akhir, 'watermelon', 'mango', 'orange', 'grapes', 'strawberry', 'pineapple'),
      board(AJAKAN.akhir, 'car', 'bus', 'train', 'truck', 'ambulance', 'bicycle'),
      board(AJAKAN.akhir, 'teddy', 'umbrella', 'pencil', 'chair', 'balloon', 'shoe'),
      board(AJAKAN.akhir, 'carrot', 'corn', 'bread', 'milk', 'egg', 'rice'),
    ),
  ],
};

export default config;
