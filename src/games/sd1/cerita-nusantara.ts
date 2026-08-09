import type { GameConfig, GameLevel, StoryPage } from '@/engine/core/types';

/**
 * "Cerita Nusantara" (SD Kelas 1 & 2) — cerita rakyat dan fabel dengan dua
 * titik pilihan di tiap cerita. Anak membaca (dan mendengar) jalan ceritanya,
 * lalu memilih apa yang sebaiknya dilakukan tokohnya.
 *
 * ANAK MEMILIH SENDIRI CERITANYA (keputusan pemilik 2026-08-09): keenam judul
 * tampil sebagai kartu begitu game dibuka (`chooseLevel`), bukan dua cerita
 * yang diundi engine. Buku cerita memang dipilih, bukan dibagikan — dan anak
 * yang ingin mengulang cerita kesukaannya tak perlu menunggu undian.
 * Karena itu TIAP CERITA = SATU SLOT dengan `id` sendiri (bintangnya per
 * cerita) dan `card` berisi judul pendek + gambar; jangan kembalikan cerita
 * ke dalam kolam varian.
 *
 * Id `l1`–`l3` sengaja tetap di cerita yang dulu jadi varian PERTAMA tiap slot
 * supaya bintang lama tidak hilang; tiga cerita sisanya dapat id baru
 * (`l4`–`l6`).
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

/**
 * Satu cerita = satu level = satu kartu di layar pemilih.
 * - `label` = judul pendek di kartu ("Timun Mas"),
 * - `narration` = kalimat lengkap yang diucapkan saat cerita dimulai (dan saat
 *   anak menekan 🔊 di kartunya) — kalimatnya JANGAN diubah tanpa alasan,
 *   kunci file suaranya berasal dari isi kalimat ini.
 */
function story(
  id: string,
  label: string,
  emoji: string,
  narration: string,
  ...pages: StoryPage[]
): GameLevel<'story-choice'> {
  return { id, narration, card: { label, emoji }, data: { pages } };
}

/* ---------- Kolam cerita ---------- */

const GEMBALA = story(
  'l1',
  'Anak Gembala dan Serigala',
  '🐑',
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
  'l4',
  'Dompet di Jalan',
  '👛',
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
  'l2',
  'Semut dan Belalang',
  '🐜',
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
  'l5',
  'Kura-kura dan Kelinci',
  '🐢',
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
  'l3',
  'Timun Mas',
  '🥒',
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
  'l6',
  'Bawang Putih',
  // 💎 = perhiasan di dalam labu, adegan yang paling diingat anak. Emoji labu
  // 🎃 sengaja TIDAK dipakai: di HP bentuknya labu Halloween berwajah ukiran.
  '💎',
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
  // Anak yang memilih ceritanya, bukan undian. `sessionLevels` sengaja tidak
  // dipakai: satu pilihan = satu cerita, dan itu sudah cukup panjang untuk
  // sekali duduk anak SD kelas 1 & 2.
  chooseLevel: { title: 'Pilih ceritamu!', again: '📚 Pilih Cerita Lain' },
  // Urutannya berpasangan menurut pesan moralnya: jujur & tanggung jawab,
  // rajin & pantang menyerah, lalu berani & baik hati.
  levels: [GEMBALA, UANG, SEMUT, KURA, TIMUN, BAWANG],
};

export default config;
