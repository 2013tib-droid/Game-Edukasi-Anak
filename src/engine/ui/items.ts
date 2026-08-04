/**
 * Item registry — the single source of truth mapping a stable item `id`
 * (used in game configs, e.g. `{ item: 'panda', count: 3 }`) to its picture
 * asset, an emoji fallback, and an Indonesian label.
 *
 * Pictures live in `public/assets/items/<id>.svg` and are drawn as flat,
 * device-independent illustrations (no more relying on each phone's emoji
 * font). To upgrade the art later — e.g. swap in AI-generated WebP — replace
 * the file for an id (and bump `ext` if the extension changes); every game
 * that references the id picks it up with no config change.
 *
 * `emoji` is the graceful fallback: if an item's image fails to load (or ships
 * later than its config), the board still renders something recognizable.
 */
export interface ItemDef {
  /** Emoji shown if the picture asset is missing — keep it the real thing. */
  emoji: string;
  /** Indonesian label, used for the accessible alt text. */
  label: string;
  /** Asset extension; defaults to 'svg'. Bump when swapping to WebP etc. */
  ext?: string;
}

export const ITEMS: Record<string, ItemDef> = {
  house: { emoji: '🏠', label: 'rumah' },
  // Premium AI-generated art (cute cartoon style). Delivered as transparent
  // WebP by the project owner — see docs/asset-generation-prompts.md.
  elephant: { emoji: '🐘', label: 'gajah', ext: 'webp' },
  lion: { emoji: '🦁', label: 'singa', ext: 'webp' },
  giraffe: { emoji: '🦒', label: 'jerapah', ext: 'webp' },
  panda: { emoji: '🐼', label: 'panda', ext: 'webp' },
  rabbit: { emoji: '🐰', label: 'kelinci', ext: 'webp' },
  duck: { emoji: '🦆', label: 'bebek', ext: 'webp' },
  cat: { emoji: '🐱', label: 'kucing', ext: 'webp' },
  bear: { emoji: '🐻', label: 'beruang', ext: 'webp' },
  turtle: { emoji: '🐢', label: 'kura-kura', ext: 'webp' },
  penguin: { emoji: '🐧', label: 'pinguin', ext: 'webp' },
  horse: { emoji: '🐴', label: 'kuda', ext: 'webp' },
  chicken: { emoji: '🐔', label: 'ayam', ext: 'webp' },
  zebra: { emoji: '🦓', label: 'zebra', ext: 'webp' },
  goat: { emoji: '🐐', label: 'kambing', ext: 'webp' },
  koala: { emoji: '🐨', label: 'koala', ext: 'webp' },
  cow: { emoji: '🐮', label: 'sapi', ext: 'webp' },
  tiger: { emoji: '🐯', label: 'harimau', ext: 'webp' },
  monkey: { emoji: '🐵', label: 'monyet', ext: 'webp' },
  frog: { emoji: '🐸', label: 'katak', ext: 'webp' },
  // Everyday objects (Taman Huruf letter cues).
  sun: { emoji: '☀️', label: 'matahari', ext: 'webp' },
  cap: { emoji: '🧢', label: 'topi', ext: 'webp' },
  // Fruit (Pasar Buah, plus letter/spelling cues in other games). The colours
  // are load-bearing: Pasar Buah sorts these into colour baskets, so art for a
  // new fruit must keep the colour its config sorts it by.
  apple: { emoji: '🍎', label: 'apel', ext: 'webp' },
  banana: { emoji: '🍌', label: 'pisang', ext: 'webp' },
  orange: { emoji: '🍊', label: 'jeruk', ext: 'webp' },
  grapes: { emoji: '🍇', label: 'anggur', ext: 'webp' },
  strawberry: { emoji: '🍓', label: 'stroberi', ext: 'webp' },
  watermelon: { emoji: '🍉', label: 'semangka', ext: 'webp' },
  mango: { emoji: '🥭', label: 'mangga', ext: 'webp' },
  pineapple: { emoji: '🍍', label: 'nanas', ext: 'webp' },
  pear: { emoji: '🍐', label: 'pir', ext: 'webp' },
  kiwi: { emoji: '🥝', label: 'kiwi', ext: 'webp' },
  melon: { emoji: '🍈', label: 'melon', ext: 'webp' },
  cherry: { emoji: '🍒', label: 'ceri', ext: 'webp' },
  lemon: { emoji: '🍋', label: 'lemon', ext: 'webp' },
  avocado: { emoji: '🥑', label: 'alpukat', ext: 'webp' },
  // Kendaraan darat (Jalan Kendaraan). Semuanya MENGHADAP KIRI, sama seperti
  // emoji kendaraan — `PathTrace` mencerminkan gambar dengan `scaleX(-1)`
  // sebelum memutarnya mengikuti arah jalan, jadi seni baru WAJIB menghadap
  // kiri juga. Tampak samping saja (kendaraan udara terlihat aneh saat diputar).
  car: { emoji: '🚗', label: 'mobil', ext: 'webp' },
  bus: { emoji: '🚌', label: 'bus', ext: 'webp' },
  truck: { emoji: '🚚', label: 'truk', ext: 'webp' },
  pickup: { emoji: '🛻', label: 'mobil bak', ext: 'webp' },
  tractor: { emoji: '🚜', label: 'traktor', ext: 'webp' },
  bicycle: { emoji: '🚲', label: 'sepeda', ext: 'webp' },
  scooter: { emoji: '🛵', label: 'skuter', ext: 'webp' },
  ambulance: { emoji: '🚑', label: 'ambulans', ext: 'webp' },
  firetruck: { emoji: '🚒', label: 'mobil pemadam', ext: 'webp' },
  police: { emoji: '🚓', label: 'mobil polisi', ext: 'webp' },
  train: { emoji: '🚂', label: 'kereta', ext: 'webp' },
  bajaj: { emoji: '🛺', label: 'bajaj', ext: 'webp' },
  jeep: { emoji: '🚙', label: 'jip', ext: 'webp' },
  taxi: { emoji: '🚕', label: 'taksi', ext: 'webp' },
  motorcycle: { emoji: '🏍️', label: 'motor', ext: 'webp' },
  racecar: { emoji: '🏎️', label: 'mobil balap', ext: 'webp' },
};

/** Public URL of an item's picture, respecting the Vite base path. */
export function itemImageUrl(id: string): string {
  const ext = ITEMS[id]?.ext ?? 'svg';
  return `${import.meta.env.BASE_URL}assets/items/${id}.${ext}`;
}
