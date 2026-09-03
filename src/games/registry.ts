import type { AnyGameConfig, ClockSpec, GroupId, TemplateId } from '@/engine/core/types';

/**
 * Portal-facing game catalog. Metadata lives here (small, in the main
 * bundle); full configs are lazy-loaded chunks so premium content and big
 * level data never sit in the initial JS.
 *
 * CATATAN: status gratis/terkunci TIDAK ada di sini. Sumbernya satu tempat:
 * `src/data/access.ts` (`FREE_GAME_IDS` + mode kunci). Dulu nilainya ditulis
 * dua kali (registry + config game) dan gampang tidak sinkron.
 */
export interface GameMeta {
  id: string;
  group: GroupId;
  title: string;
  /**
   * The game's icon — portal card AND intro screen. This is the ONLY place it
   * is declared: `GamePage` hands it to `GameShell`, which prefers it over
   * `config.emoji`. Don't rely on the config's copy; it is only a fallback.
   */
  emoji: string;
  /**
   * Filename (without extension) of the game's icon ART in
   * `public/assets/games/`. When present it REPLACES `emoji` on the portal card
   * and the intro screen; `emoji` stays as the fallback if the file is missing
   * and as the game's spoken/alt identity. Games without art drawn yet leave
   * this out, so no request is made for a file that would 404.
   */
  pic?: string;
  /**
   * Draw the game's icon as our own SVG clock face (`src/engine/ui/Clock.tsx`)
   * instead of `emoji`. The clock-face emoji has no numerals and looks like a
   * flat grey disc on a phone — see the Jam Pintar note in CLAUDE.md. `emoji`
   * stays as the fallback and as the game's spoken/alt identity.
   */
  iconClock?: ClockSpec;
  /** Portal card badge; "mixed" games change question type per level. */
  template: TemplateId | 'mixed';
  load: () => Promise<{ default: AnyGameConfig }>;
}

export const games: GameMeta[] = [
  // --- TK: dunia Petualangan Pintar (Fase 3) ---
  {
    id: 'hutan-hewan',
    group: 'tk',
    title: 'Hutan Hewan',
    emoji: '🦁',
    pic: 'hutan-hewan',
    template: 'tap-answer',
    load: () => import('@/games/tk/hutan-hewan'),
  },
  {
    id: 'taman-huruf',
    group: 'tk',
    title: 'Taman Huruf',
    emoji: '🏕️',
    pic: 'taman-huruf',
    template: 'mixed',
    load: () => import('@/games/tk/taman-huruf'),
  },
  {
    id: 'labirin-warna',
    group: 'tk',
    title: 'Labirin Warna',
    emoji: '🎨',
    pic: 'labirin-warna',
    template: 'tap-answer',
    load: () => import('@/games/tk/labirin-warna'),
  },
  {
    id: 'pasar-buah',
    group: 'tk',
    title: 'Pasar Buah',
    emoji: '🍉',
    pic: 'pasar-buah',
    template: 'mixed',
    load: () => import('@/games/tk/pasar-buah'),
  },
  // --- TK ---
  // "Hitung Buah" dilebur ke Pasar Buah (2026-07-26): soal hitung buah-nya
  // jadi varian slot count-tap di sana, jadi satu dunia buah, referensi lebih
  // banyak.
  {
    id: 'kenal-huruf',
    group: 'tk',
    title: 'Kenal Huruf',
    emoji: '🔤',
    pic: 'kenal-huruf',
    template: 'tap-answer',
    load: () => import('@/games/tk/kenal-huruf'),
  },
  {
    id: 'tulis-angka',
    group: 'tk',
    title: 'Tulis Angka',
    emoji: '✏️',
    pic: 'tulis-angka',
    template: 'tracing',
    load: () => import('@/games/tk/tulis-angka'),
  },
  {
    id: 'jalan-kendaraan',
    group: 'tk',
    title: 'Jalan Kendaraan',
    emoji: '🚗',
    pic: 'jalan-kendaraan',
    template: 'path-trace',
    load: () => import('@/games/tk/jalan-kendaraan'),
  },
  {
    id: 'kartu-kembar',
    group: 'tk',
    title: 'Kartu Kembar',
    emoji: '🃏',
    pic: 'kartu-kembar',
    template: 'memory',
    load: () => import('@/games/tk/kartu-kembar'),
  },
  // --- SD Kelas 1 & 2 (group id tetap `sd1`) ---
  {
    id: 'pasang-kata',
    group: 'sd1',
    title: 'Pasang Kata',
    emoji: '🧩',
    pic: 'pasang-kata',
    template: 'drag-drop',
    load: () => import('@/games/sd1/pasang-kata'),
  },
  {
    id: 'tambah-tangkas',
    group: 'sd1',
    title: 'Tambah Tangkas',
    emoji: '➕',
    pic: 'tambah-tangkas',
    template: 'tap-answer',
    load: () => import('@/games/sd1/tambah-tangkas'),
  },
  {
    id: 'hitung-hebat',
    group: 'sd1',
    title: 'Hitung Hebat',
    emoji: '🔢',
    pic: 'hitung-hebat',
    template: 'mixed',
    load: () => import('@/games/sd1/hitung-hebat'),
  },
  {
    id: 'suku-kata',
    group: 'sd1',
    title: 'Suku Kata',
    emoji: '📖',
    pic: 'suku-kata',
    template: 'tap-answer',
    load: () => import('@/games/sd1/suku-kata'),
  },
  {
    id: 'ejaan-jitu',
    group: 'sd1',
    title: 'Ejaan Jitu',
    emoji: '🔤',
    pic: 'ejaan-jitu',
    template: 'spell',
    load: () => import('@/games/sd1/ejaan-jitu'),
  },
  {
    id: 'pasangan-pintar',
    group: 'sd1',
    title: 'Pasangan Pintar',
    // Bukan 🧠: otak mentah bukan gambar yang ramah untuk anak, dan tak ada
    // hubungannya dengan isi game. 🤝 = "berpasangan", sesuai isinya
    // (profesi↔alat, hewan↔rumah, lawan kata).
    emoji: '🤝',
    pic: 'pasangan-pintar',
    template: 'mixed',
    load: () => import('@/games/sd1/pasangan-pintar'),
  },
  {
    id: 'jam-pintar',
    group: 'sd1',
    title: 'Jam Pintar',
    emoji: '🕒',
    // Seni jam berangka, menggantikan muka jam SVG (`iconClock`) yang dulu
    // dipakai di sini. Syaratnya tetap sama seperti 2026-08-02: ikonnya WAJIB
    // muka jam yang benar-benar berangka — emoji 🕒 di HP tampil seperti
    // piringan abu-abu polos tanpa angka. Seninya sudah dicek: angka 1-12
    // lengkap & urut, jarum di 10.10. `iconClock` sengaja DIHAPUS karena ia
    // menang atas `pic`; kembalikan barisnya kalau seninya ditarik lagi.
    // CATATAN: jam di dalam SOAL tetap Clock.tsx, tidak tersentuh perubahan ini.
    pic: 'jam-pintar',
    template: 'tap-answer',
    load: () => import('@/games/sd1/jam-pintar'),
  },
  {
    id: 'tulis-huruf',
    group: 'sd1',
    title: 'Tulis Huruf',
    emoji: '🖊️',
    pic: 'tulis-huruf',
    template: 'tracing',
    load: () => import('@/games/sd1/tulis-huruf'),
  },
  {
    // Pola & logika: satu-satunya game SD yang melatih penalaran pola
    // (bentuk, warna, bilangan) — lihat docs/kurikulum-sd1-2.md.
    id: 'pola-pintar',
    group: 'sd1',
    title: 'Pola Pintar',
    emoji: '🔷',
    pic: 'pola-pintar',
    template: 'tap-answer',
    load: () => import('@/games/sd1/pola-pintar'),
  },
  {
    // Saudara "Jalan Kendaraan" (TK) tapi sengaja lebih sulit — jalan lebih
    // sempit & lebih banyak belokan (lihat komentar kepala config). Belum
    // punya ikon ART sendiri (`pic`); emoji 🛣️ jadi identitasnya sampai
    // asetnya dibuat.
    id: 'rute-kendaraan',
    group: 'sd1',
    title: 'Rute Kendaraan',
    emoji: '🛣️',
    template: 'path-trace',
    load: () => import('@/games/sd1/rute-kendaraan'),
  },
  {
    // Sengaja PALING BAWAH di daftar SD (permintaan pemilik 2026-09-03): ia
    // kartu terakhir yang dilihat anak, bukan yang kedua. Urutan kartu portal
    // = urutan array ini (`GroupPage` tidak menyortir apa pun).
    // Id sengaja tetap `cerita-kancil` walau judulnya sudah berganti dua kali
    // ("Cerita Anak" 2026-08-09, "Baca Cerita" 2026-09-02 setelah Cerita
    // Nusantara dilebur ke sini): id dipakai route, bintang anak, dan folder
    // file suaranya.
    id: 'cerita-kancil',
    group: 'sd1',
    title: 'Baca Cerita',
    emoji: '📗',
    pic: 'cerita-kancil',
    template: 'story-choice',
    load: () => import('@/games/sd1/cerita-kancil'),
  },
];

export function gamesForGroup(group: GroupId): GameMeta[] {
  return games.filter((g) => g.group === group);
}

export function findGame(id: string): GameMeta | undefined {
  return games.find((g) => g.id === id);
}
