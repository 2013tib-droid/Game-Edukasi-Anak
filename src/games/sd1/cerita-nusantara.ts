import type { GameConfig, GameLevel, StoryPage } from '@/engine/core/types';

/**
 * "Cerita Nusantara" (SD Kelas 1 & 2) — cerita rakyat dan fabel dengan dua
 * titik pilihan di tiap cerita. Anak membaca (dan mendengar) jalan ceritanya,
 * lalu memilih apa yang sebaiknya dilakukan tokohnya.
 *
 * Bedanya dengan Cerita Si Kancil (satu cerita tetap): di sini tiap slot
 * berisi KOLAM cerita dan hanya `sessionLevels` cerita yang dimainkan tiap
 * sesi, jadi anak jarang mendapat cerita yang sama dua kali berturut-turut.
 *
 * Aturan (CLAUDE.md): tidak ada hukuman. Pilihan yang kurang tepat dijawab
 * lembut ("Coba pikirkan lagi…") dan anak boleh memilih lagi — ceritanya
 * hanya maju setelah pilihan yang baik, jadi pesan moralnya tetap utuh.
 */

/** Halaman cerita biasa (tanpa pilihan). */
const page = (emoji: string, text: string): StoryPage => ({ emoji, text });

/** Halaman keputusan: satu pilihan benar, sisanya diberi tanggapan lembut. */
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

/** Satu cerita = satu level. Id diisi oleh slot(). */
function story(title: string, ...pages: StoryPage[]): GameLevel<'story-choice'> {
  return { id: '', narration: title, data: { pages } };
}

/** Semua cerita dalam satu slot berbagi id — bintangnya per slot. */
function slot(
  id: string,
  ...variants: GameLevel<'story-choice'>[]
): GameLevel<'story-choice'>[] {
  return variants.map((v) => ({ ...v, id }));
}

/* ---------- Kolam cerita ---------- */

const GEMBALA = story(
  'Anak Gembala dan Serigala. Ayo bantu dia mengambil keputusan!',
  page('🧒', 'Seorang anak gembala menjaga domba-dombanya di padang rumput.'),
  page('🐑', 'Hari itu sepi sekali. Anak gembala merasa bosan.'),
  ask(
    '🤔',
    'Dia ingin ada yang menemani. Apa yang sebaiknya dia lakukan?',
    'Bermain seruling sambil menjaga domba',
    ['Berteriak "Ada serigala!" padahal tidak ada', 'Membohongi orang bisa membuat mereka tidak percaya lagi. Coba pilih yang lain!'],
  ),
  page('🎶', 'Anak gembala meniup serulingnya. Domba-domba ikut tenang mendengarnya.'),
  ask(
    '🐺',
    'Tiba-tiba serigala sungguhan datang! Apa yang harus dilakukan anak gembala?',
    'Berteriak minta tolong kepada warga desa',
    ['Diam saja karena takut', 'Kalau diam, domba-dombanya dalam bahaya. Beranilah minta tolong!'],
  ),
  page(
    '🏃',
    'Warga desa langsung datang menolong. Karena anak gembala selalu jujur, semua orang percaya padanya.',
  ),
  page('⭐', 'Domba-domba selamat. Jujur membuat kita dipercaya!'),
);

const UANG = story(
  'Dompet di Jalan. Ayo bantu Rani memilih!',
  page('👧', 'Rani berjalan pulang dari sekolah.'),
  page('👛', 'Di trotoar, Rani menemukan sebuah dompet berisi uang.'),
  ask(
    '🤔',
    'Apa yang sebaiknya Rani lakukan dengan dompet itu?',
    'Menyerahkannya kepada guru atau satpam',
    ['Menyimpannya untuk jajan', 'Uang itu milik orang lain yang pasti sedang mencarinya. Coba pilih yang lain!'],
    ['Membiarkannya di jalan', 'Kalau dibiarkan, dompetnya bisa hilang. Ada cara yang lebih baik!'],
  ),
  page('👮', 'Rani menyerahkan dompet itu kepada satpam sekolah.'),
  page('🧑', 'Tak lama, seorang bapak datang mencari dompetnya. Wajahnya lega sekali.'),
  page('⭐', '"Terima kasih, Rani. Kamu anak yang jujur," kata bapak itu.'),
);

const SEMUT = story(
  'Semut dan Belalang. Ayo ikuti ceritanya!',
  page('🐜', 'Di musim panas, semut-semut sibuk mengumpulkan makanan.'),
  page('🦗', 'Belalang malah bernyanyi seharian. "Untuk apa bekerja? Makanan masih banyak!" katanya.'),
  ask(
    '☀️',
    'Semut diajak bermain oleh belalang. Sebaiknya semut menjawab apa?',
    'Menyelesaikan pekerjaan dulu, baru bermain',
    ['Ikut bermain dan lupa bekerja', 'Kalau lupa bekerja, nanti tidak ada makanan saat musim hujan. Coba lagi!'],
  ),
  page('🏠', 'Musim hujan tiba. Makanan di ladang habis.'),
  ask(
    '🌧️',
    'Belalang datang kelaparan ke rumah semut. Apa yang sebaiknya semut lakukan?',
    'Berbagi makanan dan mengajaknya bekerja bersama',
    ['Mengusir belalang', 'Menolong teman yang kesulitan itu perbuatan baik. Coba pilih yang lain!'],
  ),
  page('🍚', 'Semut berbagi makanan. Belalang berjanji akan rajin mulai sekarang.'),
  page('⭐', 'Rajin bekerja dan suka menolong, dua-duanya penting!'),
);

const KURA = story(
  'Kura-kura dan Kelinci. Ayo ikuti lombanya!',
  page('🐢', 'Kura-kura berjalan pelan. Kelinci selalu menertawakannya.'),
  page('🐰', '"Ayo lomba lari!" tantang kelinci. Kura-kura menerima tantangan itu.'),
  ask(
    '🏁',
    'Lomba dimulai. Kura-kura tertinggal jauh. Apa yang sebaiknya dia lakukan?',
    'Terus berjalan pelan-pelan tanpa menyerah',
    ['Berhenti dan pulang saja', 'Menyerah membuat kita tidak pernah sampai. Ayo coba lagi!'],
  ),
  page('😴', 'Kelinci merasa pasti menang. Dia tidur siang di bawah pohon.'),
  ask(
    '🌳',
    'Kura-kura lewat dan melihat kelinci tertidur. Sebaiknya kura-kura bagaimana?',
    'Terus berjalan menuju garis akhir',
    ['Ikut tidur karena lelah', 'Kalau ikut tidur, usahanya jadi sia-sia. Ayo terus melangkah!'],
  ),
  page('🏆', 'Kura-kura sampai lebih dulu di garis akhir. Kelinci terbangun dan kaget.'),
  page('⭐', 'Pelan tapi tekun mengalahkan cepat tapi sombong!'),
);

const TIMUN = story(
  'Timun Mas. Ayo bantu Timun Mas pulang dengan selamat!',
  page('👵', 'Mbok Srini merawat seorang anak perempuan bernama Timun Mas.'),
  page('👹', 'Suatu hari, raksasa datang menagih janji. Timun Mas harus lari!'),
  ask(
    '🏃‍♀️',
    'Mbok Srini memberi Timun Mas empat bungkusan ajaib. Apa yang sebaiknya Timun Mas lakukan?',
    'Membawanya dan berlari ke hutan',
    ['Meninggalkan bungkusan itu', 'Bungkusan itu bisa menolongnya nanti. Coba pilih yang lain!'],
  ),
  page('🥒', 'Timun Mas menebar biji timun. Seketika tumbuh ladang timun yang lebat.'),
  ask(
    '🌊',
    'Raksasa masih mengejar. Bungkusan terakhir berisi terasi. Sebaiknya Timun Mas bagaimana?',
    'Menebarkan terasi lalu terus berlari',
    ['Berhenti dan menangis', 'Timun Mas anak yang berani. Ayo gunakan akalnya!'],
  ),
  page('🌫️', 'Terasi berubah menjadi lautan lumpur. Raksasa tidak bisa lewat.'),
  page('⭐', 'Timun Mas pulang dengan selamat. Berani dan cerdik menyelamatkannya!'),
);

const BAWANG = story(
  'Bawang Putih yang Baik Hati. Ayo ikuti ceritanya!',
  page('👧', 'Bawang Putih rajin membantu pekerjaan rumah setiap hari.'),
  page('🏞️', 'Saat mencuci di sungai, bajunya hanyut terbawa arus.'),
  ask(
    '👵',
    'Bawang Putih sampai di rumah seorang nenek. Apa yang sebaiknya dia lakukan?',
    'Menyapa dengan sopan dan meminta tolong',
    ['Masuk tanpa permisi', 'Masuk rumah orang harus permisi dulu ya. Coba lagi!'],
  ),
  page('🧹', 'Nenek meminta bantuan membersihkan rumah. Bawang Putih membantu dengan senang hati.'),
  ask(
    '🎁',
    'Nenek menyuruhnya memilih satu labu sebagai hadiah. Sebaiknya Bawang Putih memilih apa?',
    'Labu yang paling kecil',
    ['Labu yang paling besar sambil meminta lebih', 'Bawang Putih anak yang tidak serakah. Coba pilih yang lain!'],
  ),
  page('✨', 'Di dalam labu kecil itu ternyata ada perhiasan dan emas!'),
  page('⭐', 'Kebaikan hati selalu kembali kepada kita.'),
);

const config: GameConfig<'story-choice'> = {
  id: 'cerita-nusantara',
  group: 'sd1',
  title: 'Cerita Nusantara',
  emoji: '📚',
  template: 'story-choice',
  // Satu cerita cukup panjang untuk anak — dua cerita per sesi sudah pas.
  sessionLevels: 2,
  levels: [
    // --- 1. Jujur & tanggung jawab ---
    slot('l1', GEMBALA, UANG),
    // --- 2. Rajin & pantang menyerah ---
    slot('l2', SEMUT, KURA),
    // --- 3. Berani & baik hati ---
    slot('l3', TIMUN, BAWANG),
  ],
};

export default config;
