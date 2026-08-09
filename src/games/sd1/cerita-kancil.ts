import type { GameConfig, GameLevel, StoryPage } from '@/engine/core/types';

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
 * Bedanya dengan Cerita Nusantara: di sana ceritanya cerita rakyat & fabel
 * klasik; di sini campur — fabel Kancil ditemani cerita keseharian anak
 * (menjaga kebersihan, berbagi saat hujan).
 *
 * Aturan (CLAUDE.md): tidak ada hukuman. Pilihan yang kurang tepat dijawab
 * lembut dan anak boleh memilih lagi — ceritanya hanya maju setelah pilihan
 * yang baik, jadi pesan moralnya tetap utuh.
 */

/** Halaman cerita biasa (tanpa pilihan). */
const page = (emoji: string, text: string): StoryPage => ({ emoji, text });

/**
 * Halaman keputusan: satu pilihan benar, sisanya diberi tanggapan lembut.
 * Urutan di sini tidak menentukan urutan di layar — `StoryChoice` mengacak
 * pilihannya tiap halaman supaya anak tidak bisa menang dengan selalu
 * menekan kartu pertama.
 */
function ask(
  emoji: string,
  text: string,
  right: string,
  ...wrong: [string, string][]
): StoryPage {
  return {
    emoji,
    text,
    choices: [
      { text: right, correct: true },
      ...wrong.map(([label, feedback]) => ({ text: label, feedback })),
    ],
  };
}

/** Satu cerita = satu level. */
function story(id: string, narration: string, ...pages: StoryPage[]): GameLevel<'story-choice'> {
  return { id, narration, data: { pages } };
}

/* ---------- Cerita ---------- */

/*
 * Cerita pertama game ini sejak awal. Kalimatnya sengaja TIDAK diubah:
 * kunci file suara = hash isi kalimatnya, jadi mengubah satu kata pun
 * membuat rekamannya harus dirender ulang.
 */
const KANCIL = story(
  'l1',
  'Si Kancil berjalan di hutan. Perutnya lapar sekali. Ayo bantu Kancil mencari makan!',
  page('🦌', 'Si Kancil berjalan di hutan. Perutnya lapar sekali.'),
  ask(
    '🥒',
    'Kancil melihat kebun mentimun Pak Tani. Apa yang sebaiknya Kancil lakukan?',
    'Minta izin Pak Tani dulu',
    ['Ambil diam-diam', 'Hmm, mengambil tanpa izin itu tidak baik. Coba pilih yang lain!'],
  ),
  page('👨‍🌾', 'Pak Tani senang Kancil jujur. "Ambillah mentimun secukupnya," kata Pak Tani.'),
  ask(
    '🐊',
    'Di sungai, ada buaya menghalangi jalan pulang. Bagaimana Kancil menyeberang?',
    'Ajak buaya berhitung sambil berbaris',
    ['Berteriak marah pada buaya', 'Marah-marah tidak menyelesaikan masalah. Coba cara yang cerdik!'],
  ),
  page(
    '🎉',
    'Buaya berbaris, Kancil melompat satu-satu sampai seberang. Kancil pulang dengan kenyang dan gembira!',
  ),
);

const TAMAN = story(
  'l2',
  'Taman yang Bersih. Ayo bantu Doni dan Sari menjaga tamannya!',
  page('⚽', 'Sore itu Doni dan Sari bermain bola di taman dekat rumah.'),
  page('🥤', 'Mereka kehausan lalu minum. Sekarang gelas plastiknya sudah kosong.'),
  ask(
    '🤔',
    'Doni memegang gelas kosongnya. Sebaiknya diapakan?',
    'Membawanya ke tempat sampah',
    ['Meletakkannya di bawah bangku', 'Sampah yang ditinggalkan membuat taman kotor. Coba pilih yang lain!'],
    ['Melemparkannya ke semak-semak', 'Semak-semak bukan tempat sampah ya. Ada cara yang lebih baik!'],
  ),
  page('🗑️', 'Doni membuang gelasnya ke tempat sampah. Sari ikut membuang gelasnya juga.'),
  ask(
    '🍬',
    'Di dekat ayunan masih banyak bungkus makanan berserakan. Sampah itu bukan milik mereka. Sebaiknya bagaimana?',
    'Memungutnya bersama-sama',
    ['Membiarkannya karena bukan sampah mereka', 'Taman ini dipakai bersama. Kalau semua membiarkan, tamannya akan kotor terus. Coba lagi!'],
  ),
  page('🧹', 'Doni dan Sari memungut sampah itu. Teman-teman yang lain ikut membantu.'),
  page('🌳', 'Taman jadi bersih dan sejuk. Semua senang bermain di sana.'),
  page('⭐', 'Menjaga kebersihan itu tugas kita bersama!'),
);

const HUJAN = story(
  'l3',
  'Payung untuk Berdua. Ayo bantu Ayu memilih!',
  page('🔔', 'Bel pulang sekolah berbunyi. Di luar, hujan turun deras.'),
  page('👧', 'Ayu membawa payung. Di teras, Beni berdiri sendirian.'),
  ask(
    '🧒',
    'Beni tidak membawa payung. Apa yang sebaiknya Ayu lakukan?',
    'Mengajak Beni berteduh di payungnya',
    ['Pulang cepat-cepat sendirian', 'Kalau ditinggal, Beni akan kehujanan. Coba pilih yang lain!'],
    ['Menertawakan Beni', 'Menertawakan teman membuatnya sedih. Ada cara yang lebih baik!'],
  ),
  page('☔', 'Mereka berjalan pulang berdua di bawah satu payung. Beni tersenyum lebar.'),
  ask(
    '🐈',
    'Di pinggir jalan ada anak kucing basah kuyup yang menggigil kedinginan. Sebaiknya mereka bagaimana?',
    'Memindahkannya ke teras toko yang kering',
    ['Membiarkannya di tengah hujan', 'Kucing kecil itu kedinginan sekali. Ayo tolong dulu!'],
  ),
  page(
    '🏪',
    'Mereka memindahkan anak kucing itu ke teras toko. Pemilik toko memberinya susu hangat.',
  ),
  page('🏠', 'Sampai di rumah, baju Ayu sedikit basah. Tapi hatinya senang sekali.'),
  page('⭐', 'Berbagi membuat hari hujan terasa hangat!'),
);

const config: GameConfig<'story-choice'> = {
  id: 'cerita-kancil',
  group: 'sd1',
  title: 'Cerita Anak',
  emoji: '📗',
  template: 'story-choice',
  // Satu cerita sudah cukup panjang untuk anak SD kelas 1 & 2 — dua cerita
  // per sesi sudah pas (pola yang sama dengan Cerita Nusantara). Ceritanya
  // dipilih acak, jadi sesi berikutnya belum tentu cerita yang sama.
  sessionLevels: 2,
  levels: [KANCIL, TAMAN, HUJAN],
};

export default config;
