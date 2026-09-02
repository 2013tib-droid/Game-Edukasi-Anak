import type { GameConfig, GameLevel, SceneId, StoryPage } from '@/engine/core/types';

/**
 * "Cerita Anak" (SD Kelas 1 & 2) — cerita pendek dengan titik pilihan; anak
 * mendengarkan jalan ceritanya lalu memilih apa yang sebaiknya dilakukan
 * tokohnya.
 *
 * Dulu game ini bernama "Cerita Si Kancil" dan hanya berisi satu cerita.
 * Judulnya diganti (keputusan pemilik 2026-08-09) supaya bisa memuat cerita
 * bertema apa saja, bukan cuma fabel Kancil. **Id game-nya sengaja TETAP
 * `cerita-kancil`** — id itu dipakai route `/game/:id`, bintang yang sudah
 * dikumpulkan anak, dan folder file suaranya (`public/assets/voice/
 * cerita-kancil/`). Mengganti id akan menghapus bintang lama dan membuat
 * semua rekaman narasi harus dirender ulang.
 *
 * ISINYA FABEL HEWAN SAJA (keputusan pemilik 2026-08-09). Percobaan pertama
 * memakai cerita keseharian anak (menjaga kebersihan di taman, berbagi payung
 * saat hujan) dan ditolak: tokoh anak laki-laki & perempuan yang berbagi
 * payung terbaca seperti cerita romansa. Cerita baru di sini harus bertokoh
 * HEWAN — Kancil dan kawan-kawannya.
 *
 * Bedanya dengan Cerita Nusantara: di sana cerita rakyat & fabel klasik yang
 * sudah dikenal (Timun Mas, Bawang Putih, Semut & Belalang); di sini fabel
 * hewan Indonesia, terutama Si Kancil.
 *
 * Aturan (CLAUDE.md): tidak ada hukuman. Pilihan yang kurang tepat dijawab
 * lembut dan anak boleh memilih lagi — ceritanya hanya maju setelah pilihan
 * yang baik, jadi pesan moralnya tetap utuh.
 */

/** Halaman cerita biasa (tanpa pilihan). */
const page = (emoji: string, text: string): StoryPage => ({ emoji, text });

/**
 * Halaman bergambar: `id` item dari registry `src/engine/ui/items.ts`.
 * Aturan proyek — kalau halamannya tentang HEWAN dan seninya sudah ada,
 * pakai gambar, jangan emoji (emoji hewan beda bentuk di tiap HP).
 */
const pic = (item: string, text: string): StoryPage => ({ item, text });

/**
 * Halaman berilustrasi adegan: `art` = nama file di `public/assets/story/`.
 * Dipakai kalau satu halaman menceritakan DUA tokoh yang berinteraksi —
 * anak yang belum lancar membaca membaca adegannya dari gambar, dan dua
 * gambar item terpisah yang ditempel berdampingan tidak pernah rapi.
 * `emoji` tetap ditulis sebagai cadangan kalau filenya belum ter-deploy.
 */
const art = (name: string, emoji: string, text: string): StoryPage => ({
  art: name,
  emoji,
  text,
});

/**
 * Menandai halaman ini berpindah tempat: `at('sungai', page(...))`.
 * Latarnya digambar engine (`src/engine/ui/Scene.tsx`), jadi cukup menyebut
 * namanya. Ditulis HANYA saat tempatnya berganti — halaman sesudahnya ikut
 * latar terakhir sampai ada `at()` berikutnya.
 */
const at = <P extends StoryPage>(scene: SceneId, p: P): P => ({ ...p, scene });

/**
 * Halaman keputusan: satu pilihan benar, sisanya diberi tanggapan lembut.
 * Urutan di sini tidak menentukan urutan di layar — `StoryChoice` mengacak
 * pilihannya tiap halaman supaya anak tidak bisa menang dengan selalu
 * menekan kartu pertama.
 *
 * Gambarnya boleh emoji (`ask('🤔', …)`) atau ilustrasi adegan
 * (`ask({ art: 'jalak-kerbau-jawab', emoji: '🤔' }, …)`). Emoji berpikir itu
 * cuma isyarat "ayo pilih"; kalau adegannya punya ilustrasi, ilustrasi itu
 * yang harus tampil — anak yang belum lancar membaca menimbang pilihannya
 * sambil melihat kejadiannya.
 */
function ask(
  cue: string | { art: string; emoji: string },
  text: string,
  right: string,
  ...wrong: [string, string][]
): StoryPage {
  const { art: artName, emoji } = typeof cue === 'string' ? { art: undefined, emoji: cue } : cue;
  return {
    art: artName,
    emoji,
    text,
    choices: [
      { text: right, correct: true },
      ...wrong.map(([label, feedback]) => ({ text: label, feedback })),
    ],
  };
}

/**
 * Satu cerita = satu level = satu kartu di layar pemilih.
 * - `label` = judul pendek di kartu ("Kancil dan Gajah"),
 * - `pic` = id item registry kalau seninya ada (aturan proyek: hewan pakai
 *   gambar, bukan emoji), kalau tidak `emoji` yang dipakai,
 * - `narration` = kalimat lengkap yang diucapkan saat cerita dimulai dan saat
 *   anak menekan 🔊 di kartunya — JANGAN diubah tanpa alasan, kunci file
 *   suaranya berasal dari isi kalimat ini.
 */
function story(
  id: string,
  card: { label: string; emoji?: string; item?: string },
  narration: string,
  ...pages: StoryPage[]
): GameLevel<'story-choice'> {
  return { id, narration, card, data: { pages } };
}

/* ---------- Cerita ---------- */

/*
 * Cerita pertama game ini sejak awal. Kalimatnya sengaja TIDAK diubah:
 * kunci file suara = hash isi kalimatnya, jadi mengubah satu kata pun
 * membuat rekamannya harus dirender ulang.
 */
const KANCIL = story(
  'l1',
  { label: 'Kancil dan Pak Tani', emoji: '🦌' },
  'Si Kancil berjalan di hutan. Perutnya lapar sekali. Ayo bantu Kancil mencari makan!',
  at('hutan', page('🦌', 'Si Kancil berjalan di hutan. Perutnya lapar sekali.')),
  at(
    'kebun',
    ask(
      '🥒',
      'Kancil melihat kebun mentimun Pak Tani. Apa yang sebaiknya Kancil lakukan?',
      'Minta izin Pak Tani dulu',
      ['Ambil diam-diam', 'Hmm, mengambil tanpa izin itu tidak baik. Coba pilih yang lain!'],
    ),
  ),
  page('👨‍🌾', 'Pak Tani senang Kancil jujur. "Ambillah mentimun secukupnya," kata Pak Tani.'),
  at(
    'sungai',
    ask(
      '🐊',
      'Di sungai, ada buaya menghalangi jalan pulang. Bagaimana Kancil menyeberang?',
      'Ajak buaya berhitung sambil berbaris',
      [
        'Berteriak marah pada buaya',
        'Marah-marah tidak menyelesaikan masalah. Coba cara yang cerdik!',
      ],
    ),
  ),
  page(
    '🎉',
    'Buaya berbaris, Kancil melompat satu-satu sampai seberang. Kancil pulang dengan kenyang dan gembira!',
  ),
);

const JALAK = story(
  'l2',
  { label: 'Jalak dan Kerbau', item: 'jalak' },
  'Burung Jalak dan Kerbau. Ayo ikuti ceritanya!',
  at('sawah', page('🐃', 'Kerbau berkubang di sawah. Punggungnya gatal karena banyak kutu.')),
  art(
    'jalak-kerbau',
    '🐦',
    'Seekor burung jalak hinggap di pagar. "Bolehkah aku hinggap di punggungmu?"',
  ),
  ask(
    { art: 'jalak-kerbau-jawab', emoji: '🤔' },
    'Apa yang sebaiknya kerbau jawab?',
    'Boleh, hinggaplah di punggungku',
    ['Pergi! Aku tidak mau ditumpangi', 'Jalak justru ingin menolong. Coba pilih yang lain!'],
  ),
  art(
    'jalak-kerbau-kutu',
    '🐦',
    'Jalak mematuki kutu di punggung kerbau. Gatalnya hilang, jalak pun kenyang.',
  ),
  ask(
    '🐍',
    'Dari atas, jalak melihat ular besar mendekat. Sebaiknya jalak bagaimana?',
    'Berteriak memberi tahu kerbau',
    ['Terbang pergi diam-diam', 'Kerbau sudah menolongnya. Teman tidak ditinggal saat bahaya. Coba lagi!'],
  ),
  page('🏃', 'Kerbau cepat-cepat menjauh dari rawa. Ular itu pun pergi.'),
  page('⭐', 'Sejak itu jalak dan kerbau selalu bersama. Saling menolong membuat keduanya senang!'),
);

const GAJAH = story(
  'l3',
  { label: 'Kancil dan Gajah', item: 'elephant' },
  'Kancil dan Gajah. Ayo bantu Kancil menolong temannya!',
  // Dua halaman pembuka ini SENGAJA tanpa `at()`: ilustrasinya (kiriman
  // pemilik, 2026-08-10) sudah membawa rawanya sendiri — hutan, air, dan
  // tepian — jadi latar gambar engine di belakangnya cuma jadi hutan di atas
  // hutan. Latar `sungai` menyusul di halaman keputusan dan berlaku sampai
  // cerita selesai.
  pic('kancil-rawa', 'Pagi itu Kancil berjalan di tepi rawa.'),
  pic('gajah-lumpur', 'Ada gajah terperosok di lumpur. Badannya terlalu berat untuk naik sendiri.'),
  // Rawa belum punya latar sendiri; `sungai` sudah membawa air + tepian hijau
  // dan itu yang dikenali anak dari sisa cerita ini.
  at(
    'sungai',
    ask(
      '🤔',
      'Gajah terlalu berat. Apa yang sebaiknya Kancil lakukan?',
      'Memanggil hewan lain untuk menolong',
      ['Menarik gajah sendirian', 'Gajah terlalu berat untuk ditarik sendiri. Ada cara yang lebih baik!'],
      ['Pergi karena badannya kecil', 'Kancil memang kecil, tapi akalnya besar. Coba pilih yang lain!'],
    ),
  ),
  page('🐃', 'Kancil memanggil kerbau, rusa, dan teman-teman lain. Semua datang membantu.'),
  ask(
    '🌿',
    'Lumpurnya licin sekali. Sebaiknya mereka pakai apa?',
    'Ranting dan daun supaya tidak licin',
    ['Menarik lebih keras lagi saja', 'Kalau licin, tenaganya jadi sia-sia. Coba cara yang lebih cerdik!'],
  ),
  page('💪', 'Semua menarik bersama-sama. Gajah akhirnya keluar dari lumpur!'),
  page('⭐', 'Badan kecil pun bisa menolong, asal punya akal dan teman.'),
);

const config: GameConfig<'story-choice'> = {
  id: 'cerita-kancil',
  group: 'sd1',
  title: 'Cerita Anak',
  emoji: '📗',
  template: 'story-choice',
  // Anak memilih sendiri ceritanya — ketiga judul tampil sebagai kartu begitu
  // game dibuka (pola yang sama dengan Cerita Nusantara, keputusan pemilik
  // 2026-08-09). Satu cerita sudah cukup panjang untuk sekali duduk, jadi
  // tidak ada `sessionLevels`: satu pilihan = satu cerita.
  chooseLevel: { title: 'Pilih ceritamu!', again: '📗 Pilih Cerita Lain' },
  levels: [KANCIL, JALAK, GAJAH],
};

export default config;
