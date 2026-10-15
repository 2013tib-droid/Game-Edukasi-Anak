import type { AnyGameConfig, ClockSpec, GroupId, TemplateId } from '@/engine/core/types';
import type { SubjectId } from '@/data/subjects';
import { isGameVisible } from '@/data/access';

/**
 * Portal-facing game catalog. Metadata lives here (small, in the main
 * bundle); full configs are lazy-loaded chunks so premium content and big
 * level data never sit in the initial JS.
 *
 * CATATAN: status gratis/terkunci TIDAK ada di sini. Sumbernya satu tempat:
 * `src/data/access.ts` (`FREE_GAME_IDS` + mode kunci). Dulu nilainya ditulis
 * dua kali (registry + config game) dan gampang tidak sinkron.
 */
interface GameMetaBase {
  id: string;
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
  /**
   * Berapa "game" yang dihitung untuk game ini di pita buku mapel/kelompok.
   * Bawaan 1. Game ber-peta tahap yang tiap tahapnya terasa satu game
   * sendiri (Kapten Kata: 8 pulau) menuliskan jumlah tahapnya di sini —
   * WAJIB sama dengan `stageMap.stages.length` di config-nya.
   */
  parts?: number;
  /**
   * Game sudah dibuat tapi BELUM TAYANG: disembunyikan di build produksi
   * (portal, landing, URL langsung), tetap tampil di development. Keputusannya
   * satu tempat: `isGameVisible()` di `src/data/access.ts`. Saat launching cukup
   * hapus baris ini.
   */
  draft?: true;
  /** Portal card badge; "mixed" games change question type per level. */
  template: TemplateId | 'mixed';
  load: () => Promise<{ default: AnyGameConfig }>;
}

/**
 * Kelompok ber-mapel (lihat `SUBJECTS_BY_GROUP` di `src/data/subjects.ts`)
 * WAJIB menyebut `subject` tiap game-nya; kelompok tanpa mapel dilarang
 * menyebutnya. Dipaksa di sini supaya lupa menulisnya gagal saat build.
 */
export type GameMeta = GameMetaBase &
  (
    | { group: 'tk' | 'sd1'; subject?: never }
    | { group: 'sd2' | 'sd3'; subject: SubjectId }
  );

const ALL_GAMES: GameMeta[] = [
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
  {
    // Ikon 🧩 sama dengan cadangan Pasang Kata (SD) — tidak bertabrakan:
    // keduanya di KELOMPOK berbeda, jadi tak pernah satu layar, dan Pasang
    // Kata sudah memakai seni `pic` sehingga emojinya cuma cadangan.
    id: 'puzzle-gambar',
    group: 'tk',
    title: 'Puzzle Gambar',
    emoji: '🧩',
    pic: 'puzzle-gambar',
    template: 'puzzle',
    load: () => import('@/games/tk/puzzle-gambar'),
  },
  {
    // Satu-satunya game yang isinya DIRI SENDIRI: anak menyentuh bagian tubuh
    // pada ilustrasi anak (`public/assets/kid/anak.webp`), bukan memilih kartu
    // berisi potongan tubuh. Ikon 🧒 sengaja anak UTUH — emoji bagian tubuh
    // (👂 ✋ 🦶 👃) berwarna kulit tertentu dan beda bentuk di tiap HP; sejak
    // seninya ada, emoji itu tinggal cadangan.
    id: 'anggota-tubuh',
    group: 'tk',
    title: 'Anggota Tubuh',
    emoji: '🧒',
    pic: 'anggota-tubuh',
    template: 'mixed',
    load: () => import('@/games/tk/anggota-tubuh'),
  },
  {
    // Coding anak (template `code-quest`): susun kartu panah, lalu Jalankan.
    // DRAFT sampai launching bersama SD Kelas 3 & 4 (keputusan pemilik
    // 2026-10-12). Ikon: kartu panah + wortel (2026-10-13), 🐰 cadangan.
    id: 'kode-kelinci',
    group: 'tk',
    title: 'Kode Kelinci',
    emoji: '🐰',
    pic: 'kode-kelinci',
    template: 'code-quest',
    load: () => import('@/games/tk/kode-kelinci'),
  },
  {
    // Coding anak bagian kedua (template `rule-sort`, 2026-10-15): PERCABANGAN —
    // pasang tanda "kalau" di tiap kotak, mesin memilah mainan di ban
    // berjalan. Seni ikon belum ada (prompt di docs/prompt-ikon-game.md),
    // jadi 🧸 tampil sampai `pic` diisi.
    id: 'pabrik-mainan',
    group: 'tk',
    title: 'Pabrik Mainan',
    emoji: '🧸',
    template: 'rule-sort',
    load: () => import('@/games/tk/pabrik-mainan'),
  },
  // --- SD Kelas 1 & 2 (group id tetap `sd1`) ---
  {
    // PALING ATAS (keputusan pemilik 2026-09-24, ditukar dengan "Pasang Kata"):
    // ini satu-satunya game SD yang GRATIS saat mode `'kunci'`
    // (`FREE_GAME_IDS` di src/data/access.ts), jadi ia harus jadi kartu pertama
    // yang dilihat calon pembeli — kalau demo satu-satunya terkubur di bawah
    // delapan kartu bergembok, orang tua menutup halamannya sebelum
    // menemukannya. Kalau demo SD nanti diganti game lain, PINDAHKAN JUGA
    // urutannya ke sini.
    id: 'tulis-huruf',
    group: 'sd1',
    title: 'Tulis Huruf',
    emoji: '🖊️',
    pic: 'tulis-huruf',
    template: 'tracing',
    load: () => import('@/games/sd1/tulis-huruf'),
  },
  {
    // Dulu "sengaja di sebelah Pasang Kata" (permintaan pemilik 2026-09-03);
    // sejak Tulis Huruf naik ke paling atas (2026-09-24) Pasang Kata pindah ke
    // bawah, jadi kedua kartu itu tidak lagi bersebelahan.
    // saudara "Jalan Kendaraan" (TK) tapi sengaja lebih sulit: jalan lebih
    // sempit & lebih banyak belokan (lihat komentar kepala config). Ikonnya
    // SENGAJA jalan berkelok + rambu, BUKAN mobil — supaya beda jelas dari
    // ikon Jalan Kendaraan (mobil merah); yang membedakan game ini memang
    // rutenya, bukan kendaraannya.
    id: 'rute-kendaraan',
    group: 'sd1',
    title: 'Rute Kendaraan',
    emoji: '🛣️',
    pic: 'rute-kendaraan',
    template: 'path-trace',
    load: () => import('@/games/sd1/rute-kendaraan'),
  },
  {
    // Saudara Kode Kelinci (TK) yang lebih sulit: + kartu ULANGI dan soal
    // memperbaiki kode. DRAFT sampai launching SD Kelas 3 & 4. Ikon: papan
    // berpetak + stroberi + kartu ulangi (2026-10-13), 🐢 cadangan.
    id: 'misi-kode',
    group: 'sd1',
    title: 'Misi Kode',
    emoji: '🐢',
    pic: 'misi-kode',
    template: 'code-quest',
    load: () => import('@/games/sd1/misi-kode'),
  },
  {
    // Saudara Pabrik Mainan (TK) yang lebih sulit: + ukuran, tanda LAINNYA
    // (else), kotak dua tanda (DAN), dan urutan pemeriksaan. Seni ikon belum
    // ada, jadi 🤖 tampil sampai `pic` diisi.
    id: 'robot-pemilah',
    group: 'sd1',
    title: 'Robot Pemilah',
    emoji: '🤖',
    template: 'rule-sort',
    load: () => import('@/games/sd1/robot-pemilah'),
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
    // Tangga membaca berjenjang di peta jalan (docs/rencana-referensi-galaksi.md
    // tahap 2).
    id: 'tangga-membaca',
    group: 'sd1',
    title: 'Tangga Membaca',
    emoji: '🪜',
    pic: 'tangga-membaca',
    template: 'tap-answer',
    load: () => import('@/games/sd1/tangga-membaca'),
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
    id: 'pasang-kata',
    group: 'sd1',
    title: 'Pasang Kata',
    emoji: '🧩',
    pic: 'pasang-kata',
    template: 'drag-drop',
    load: () => import('@/games/sd1/pasang-kata'),
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

  // --- SD Kelas 3 & 4 (group id `sd2`, masih draft — lihat groups.json) ---
  {
    id: 'istana-bilangan',
    group: 'sd2',
    subject: 'matematika',
    title: 'Istana Bilangan',
    emoji: '🏰',
    pic: 'istana-bilangan',
    template: 'mixed',
    load: () => import('@/games/sd2/istana-bilangan'),
  },
  {
    id: 'kebun-ilmu',
    group: 'sd2',
    subject: 'ipas',
    title: 'Kebun Ilmu',
    emoji: '🌱',
    pic: 'kebun-ilmu',
    template: 'mixed',
    load: () => import('@/games/sd2/kebun-ilmu'),
  },
  {
    id: 'kapten-kata',
    group: 'sd2',
    subject: 'bahasa-inggris',
    // Satu-satunya game mapelnya, jadi kartu mapel langsung membukanya
    // (`subjectPath`) dan judul + ikonnya = mapelnya (keputusan pemilik
    // 2026-10-11). Id & folder suara tetap `kapten-kata`.
    title: 'Bahasa Inggris',
    emoji: '⛵',
    pic: 'bahasa-inggris',
    // 8 pulau = 8 game di pita buku mapel (permintaan pemilik 2026-10-12).
    parts: 8,
    template: 'word-voyage',
    load: () => import('@/games/sd2/kapten-kata'),
  },
  {
    id: 'sahabat-bumi',
    group: 'sd2',
    subject: 'ipas',
    title: 'Sahabat Bumi',
    emoji: '🌍',
    pic: 'sahabat-bumi',
    template: 'eco-mission',
    load: () => import('@/games/sd2/sahabat-bumi'),
  },
  {
    id: 'lab-cahaya-bunyi',
    group: 'sd2',
    subject: 'ipas',
    title: 'Lab Cahaya & Bunyi',
    emoji: '🔦',
    pic: 'lab-cahaya-bunyi',
    template: 'light-lab',
    load: () => import('@/games/sd2/lab-cahaya-bunyi'),
  },
  {
    id: 'toko-kembalian',
    group: 'sd2',
    subject: 'matematika',
    title: 'Toko Kembalian',
    emoji: '🏪',
    pic: 'toko-kembalian',
    template: 'mixed',
    load: () => import('@/games/sd2/toko-kembalian'),
  },
  {
    id: 'ukur-yuk',
    group: 'sd2',
    subject: 'matematika',
    title: 'Ukur Yuk',
    emoji: '📏',
    pic: 'ukur-yuk',
    template: 'tap-answer',
    load: () => import('@/games/sd2/ukur-yuk'),
  },
  {
    id: 'detektif-data',
    group: 'sd2',
    subject: 'matematika',
    title: 'Detektif Data',
    emoji: '📊',
    pic: 'detektif-data',
    template: 'tap-answer',
    load: () => import('@/games/sd2/detektif-data'),
  },
  {
    id: 'waktu-tepat',
    group: 'sd2',
    subject: 'matematika',
    title: 'Waktu Tepat',
    emoji: '⏱️',
    // Seni stopwatch pemilik (2026-10-07) menggantikan iconClock 07.15:
    // iconClock menang atas pic, jadi keduanya tak boleh dipasang bersama.
    pic: 'waktu-tepat',
    template: 'clock-set',
    load: () => import('@/games/sd2/waktu-tepat'),
  },
  {
    id: 'perisai-garuda',
    group: 'sd2',
    subject: 'pancasila',
    title: 'Perisai Garuda',
    emoji: '🦅',
    pic: 'perisai-garuda',
    template: 'mixed',
    load: () => import('@/games/sd2/perisai-garuda'),
  },
  {
    id: 'susun-kalimat',
    group: 'sd2',
    subject: 'bahasa-indonesia',
    title: 'Susun Kalimat',
    emoji: '🚂',
    template: 'word-train',
    load: () => import('@/games/sd2/susun-kalimat'),
  },
  {
    id: 'kali-kilat',
    group: 'sd2',
    subject: 'matematika',
    title: 'Kali Kilat',
    emoji: '✖️',
    pic: 'kali-kilat',
    template: 'tap-answer',
    load: () => import('@/games/sd2/kali-kilat'),
  },
  {
    id: 'lompat-katak',
    group: 'sd2',
    subject: 'matematika',
    title: 'Lompat Katak',
    emoji: '🐸',
    pic: 'lompat-katak',
    template: 'mixed',
    load: () => import('@/games/sd2/lompat-katak'),
  },
  {
    id: 'bagi-kue',
    group: 'sd2',
    subject: 'matematika',
    title: 'Bagi Kue',
    emoji: '🍰',
    // Kue tart empat potong sama besar, satu potong di piring (2026-10-12).
    pic: 'bagi-kue',
    template: 'fraction-kitchen',
    load: () => import('@/games/sd2/bagi-kue'),
  },
  {
    id: 'detektif-bacaan',
    group: 'sd2',
    subject: 'bahasa-indonesia',
    title: 'Detektif Bacaan',
    emoji: '🔍',
    template: 'read-find',
    load: () => import('@/games/sd2/detektif-bacaan'),
  },
  {
    id: 'sanggar-warna',
    group: 'sd2',
    subject: 'seni-rupa',
    title: 'Sanggar Warna',
    emoji: '🎨',
    template: 'paint-studio',
    load: () => import('@/games/sd2/sanggar-warna'),
  },
  {
    id: 'studio-kolase',
    group: 'sd2',
    subject: 'seni-rupa',
    title: 'Studio Kolase',
    emoji: '✂️',
    template: 'collage-studio',
    load: () => import('@/games/sd2/studio-kolase'),
  },
];

/** Game yang tampil di build ini (game `draft` hanya di development). */
export const games: GameMeta[] = ALL_GAMES.filter(isGameVisible);

export function gamesForGroup(group: GroupId, subject?: SubjectId): GameMeta[] {
  return games.filter((g) => g.group === group && (!subject || g.subject === subject));
}

/** Jumlah "game" untuk pita buku: tiap game dihitung `parts` (bawaan 1). */
export function playCount(list: GameMeta[]): number {
  return list.reduce((n, g) => n + (g.parts ?? 1), 0);
}

/**
 * Ke mana kartu mapel menuju (keputusan pemilik 2026-10-11): mapel yang baru
 * punya SATU game langsung membuka game itu — layar daftar berisi satu kartu
 * cuma menambah satu ketukan. Begitu game kedua ditambahkan, daftarnya muncul
 * sendiri.
 */
export function subjectPath(group: GroupId, subject: SubjectId): string {
  const list = gamesForGroup(group, subject);
  return list.length === 1 ? `/game/${list[0].id}` : `/kelompok/${group}/${subject}`;
}

/**
 * Layar yang dituju tombol Kembali dari game: daftar mapelnya kalau ada —
 * kecuali mapel bergame tunggal, yang tak punya layar daftar (`subjectPath`),
 * jadi kembali ke pemilih mapel.
 */
export function gameListPath(meta: GameMeta): string {
  if (!meta.subject || gamesForGroup(meta.group, meta.subject).length === 1) {
    return `/kelompok/${meta.group}`;
  }
  return `/kelompok/${meta.group}/${meta.subject}`;
}

export function findGame(id: string): GameMeta | undefined {
  return games.find((g) => g.id === id);
}
