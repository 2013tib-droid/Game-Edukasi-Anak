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

const JALAK = story(
  'l2',
  'Burung Jalak dan Kerbau. Ayo ikuti ceritanya!',
  page('🐃', 'Kerbau berkubang di sawah. Punggungnya gatal karena banyak kutu.'),
  page('🐦', 'Seekor burung jalak hinggap di pagar. "Bolehkah aku hinggap di punggungmu?"'),
  ask(
    '🤔',
    'Apa yang sebaiknya kerbau jawab?',
    'Boleh, hinggaplah di punggungku',
    ['Pergi! Aku tidak mau ditumpangi', 'Jalak justru ingin menolong. Coba pilih yang lain!'],
  ),
  page('🪶', 'Jalak mematuki kutu di punggung kerbau. Gatalnya hilang, jalak pun kenyang.'),
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
  'Kancil dan Gajah. Ayo bantu Kancil menolong temannya!',
  page('🦌', 'Pagi itu Kancil berjalan di tepi rawa.'),
  page('🐘', 'Ada gajah terperosok di lumpur. Badannya terlalu berat untuk naik sendiri.'),
  ask(
    '🤔',
    'Gajah terlalu berat. Apa yang sebaiknya Kancil lakukan?',
    'Memanggil hewan lain untuk menolong',
    ['Menarik gajah sendirian', 'Gajah terlalu berat untuk ditarik sendiri. Ada cara yang lebih baik!'],
    ['Pergi karena badannya kecil', 'Kancil memang kecil, tapi akalnya besar. Coba pilih yang lain!'],
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
  // Satu cerita sudah cukup panjang untuk anak SD kelas 1 & 2 — dua cerita
  // per sesi sudah pas (pola yang sama dengan Cerita Nusantara). Ceritanya
  // dipilih acak, jadi sesi berikutnya belum tentu cerita yang sama.
  sessionLevels: 2,
  levels: [KANCIL, JALAK, GAJAH],
};

export default config;
