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
  // Buildings & places (tujuan di Jalan Kendaraan, rumah di Hutan Hewan /
  // Pasang Kata / Hitung Hebat). Premium art, gaya kartun yang sama.
  house: { emoji: '🏠', label: 'rumah', ext: 'webp' },
  // Rumah HEWAN — kandang beratap merah. Sengaja dipisah dari `house`: papan
  // pengurangan ("hewan pulang ke rumah") dulu memakai rumah manusia, jadi
  // gambarnya sama dengan soal "rumah" di Taman Huruf / Pasang Kata. Pakai
  // `barn` untuk hewan, `house` untuk manusia — jangan ditukar.
  barn: { emoji: '🛖', label: 'kandang', ext: 'webp' },
  school: { emoji: '🏫', label: 'sekolah', ext: 'webp' },
  hospital: { emoji: '🏥', label: 'rumah sakit', ext: 'webp' },
  shop: { emoji: '🏪', label: 'toko', ext: 'webp' },
  'gas-station': { emoji: '⛽', label: 'pom bensin', ext: 'webp' },
  field: { emoji: '🌾', label: 'sawah', ext: 'webp' },
  tree: { emoji: '🌳', label: 'pohon', ext: 'webp' },
  park: { emoji: '🏞️', label: 'taman', ext: 'webp' },
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
  // Burung jalak (Cerita Anak). Emoji 🐦 itu burung biru generik — jalak
  // justru dikenali dari badan hitam, paruh & kaki kuning, dan garis putih
  // di sayap; tidak ada emoji yang membawanya.
  jalak: { emoji: '🐦', label: 'burung jalak', ext: 'webp' },
  // ILUSTRASI HALAMAN CERITA, bukan benda yang bisa dihitung. Gambarnya satu
  // adegan utuh (Kancil berjalan di tepi rawa) berikut latarnya sendiri, jadi
  // hanya boleh dipakai sebagai `StoryPage.item`. JANGAN dipakai sebagai
  // jawaban tap-answer, sel papan hitung, atau kartu ingatan — di sana yang
  // dibandingkan anak adalah bentuk satu benda, dan gambar beradegan penuh
  // akan menyesatkan.
  'kancil-rawa': { emoji: '🦌', label: 'kancil di tepi rawa', ext: 'webp' },
  'gajah-lumpur': { emoji: '🐘', label: 'gajah terperosok di lumpur', ext: 'webp' },
  // Everyday objects — the things that show up again and again in letter,
  // syllable and spelling questions (Taman Huruf, Pasang Kata, Suku Kata,
  // Ejaan Jitu, Pasangan Pintar).
  sun: { emoji: '☀️', label: 'matahari', ext: 'webp' },
  cap: { emoji: '🧢', label: 'topi', ext: 'webp' },
  ball: { emoji: '⚽', label: 'bola', ext: 'webp' },
  book: { emoji: '📖', label: 'buku', ext: 'webp' },
  pencil: { emoji: '✏️', label: 'pensil', ext: 'webp' },
  backpack: { emoji: '🎒', label: 'tas', ext: 'webp' },
  key: { emoji: '🔑', label: 'kunci', ext: 'webp' },
  umbrella: { emoji: '☂️', label: 'payung', ext: 'webp' },
  shoe: { emoji: '👟', label: 'sepatu', ext: 'webp' },
  chair: { emoji: '🪑', label: 'kursi', ext: 'webp' },
  door: { emoji: '🚪', label: 'pintu', ext: 'webp' },
  balloon: { emoji: '🎈', label: 'balon', ext: 'webp' },
  // `teddy` is the toy — deliberately NOT `bear`, which is the real animal in
  // Hutan Hewan. Never let the two stand in for each other in a question.
  teddy: { emoji: '🧸', label: 'boneka', ext: 'webp' },
  flower: { emoji: '🌸', label: 'bunga', ext: 'webp' },
  moon: { emoji: '🌙', label: 'bulan', ext: 'webp' },
  cloud: { emoji: '☁️', label: 'awan', ext: 'webp' },
  // BAGIAN TUBUH — dipakai kata "MATA" di Ejaan Jitu (slot "Pakaian & tubuh").
  // Dipakai kata "MATA" di Ejaan Jitu. Emoji 👁️ bawaan HP terlihat SEREM untuk
  // game anak (bola mata lepas render realistis) — keluhan pemilik 2026-09-03.
  // BELUM ADA ASETNYA: percobaan pertama memakai foto mata sungguhan lalu
  // dibatalkan pemilik ("bikin animasi aja") — foto sekilas pun tetap
  // terbaca "mata lepas", sedangkan seluruh item lain di registry ini gaya
  // kartun kawaii. Prompt gambarnya: `docs/prompt-gambar-mata.md`. Sampai
  // filenya ada, `ItemPic` otomatis jatuh ke emoji 👁️ (fallback aman, sama
  // seperti `wrench` di bawah).
  eye: { emoji: '👁️', label: 'mata', ext: 'webp' },
  // Food & drink (everyday objects, not the Pasar Buah fruit below).
  milk: { emoji: '🥛', label: 'susu', ext: 'webp' },
  egg: { emoji: '🥚', label: 'telur', ext: 'webp' },
  bread: { emoji: '🍞', label: 'roti', ext: 'webp' },
  rice: { emoji: '🍚', label: 'nasi', ext: 'webp' },
  carrot: { emoji: '🥕', label: 'wortel', ext: 'webp' },
  corn: { emoji: '🌽', label: 'jagung', ext: 'webp' },
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
  // Alat kerja profesi (Pasangan Pintar, BATCH 7 di
  // docs/prompt-gambar-gemini.md). Belum ada asetnya — jatuh ke emoji lewat
  // ItemPic sampai gambarnya dikirim, pola yang sama dengan tahap maskot yang
  // belum punya seni.
  wrench: { emoji: '🔧', label: 'kunci pas', ext: 'webp' },
};

/** Public URL of an item's picture, respecting the Vite base path. */
export function itemImageUrl(id: string): string {
  const ext = ITEMS[id]?.ext ?? 'svg';
  return `${import.meta.env.BASE_URL}assets/items/${id}.${ext}`;
}
