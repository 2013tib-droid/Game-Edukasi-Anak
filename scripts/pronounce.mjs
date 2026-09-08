/**
 * Ejaan khusus untuk MESIN SUARA — bukan untuk layar.
 *
 * Bahasa Indonesia menulis dua bunyi "e" dengan huruf yang sama: **pepet**
 * (ə, seperti "belas", "teman") dan **taling** (é, seperti "bébék", "méja").
 * Ejaannya tidak membedakan keduanya, jadi mesin suara harus MENEBAK per kata
 * — dan tebakannya meleset untuk sebagian kata. Laporan pemilik (2026-08-08):
 * "bebek" terdengar "bəbek", e di awal beda dengan e di akhir.
 *
 * Yang diperbaiki di sini HANYA teks yang dikirim ke Azure. Yang tampil di
 * layar tetap ejaan resmi ("bebek") — anak sedang belajar membaca, jadi tak
 * boleh melihat tanda aksen yang tak dipakai dalam tulisan Indonesia. Kunci
 * manifest juga tetap teks layar, jadi pencarian file di app tidak berubah.
 *
 * ATURAN MENAMBAH KATA:
 *   - Tandai HANYA suku kata yang ber-e taling: `sepeda` → `sepéda`
 *     (se- tetap pepet). Menandai semuanya justru merusak kata.
 *   - Yang seluruhnya pepet TIDAK usah didaftarkan — itu tebakan bawaan Azure
 *     dan sudah benar ("belas", "teman", "pesawat", "menara").
 *   - Sesudah menambah/mengubah kata, file suara lamanya TIDAK otomatis
 *     dirender ulang: `key`-nya berasal dari teks layar yang tidak berubah.
 *     Paksa dengan `npm run suara -- --redo-lafal` (semua baris yang tersentuh
 *     daftar ini) atau `--redo=<kata>` untuk satu kata saja.
 *
 * KENAPA EJAAN é, BUKAN TAG <phoneme> IPA (keputusan pemilik 2026-08-08):
 * keduanya dirender jadi contoh dan pemilik menilai **bunyinya sama**, jadi
 * yang dipilih yang paling murah dirawat. Ejaan é = satu baris per kata dan
 * otomatis ikut ke akhiran ("kelerengnya"); IPA menuntut transkripsi manual
 * tiap kata baru. Kalau suatu saat ada kata yang é-nya tak mempan, tag
 * <phoneme> tetap bisa dipakai khusus kata itu — Azure menuruti keduanya
 * (terukur: ketiga varian menghasilkan audio yang berbeda).
 */

/** kata (huruf kecil) → ejaan lafal. Urutan tidak penting. */
export const PRONOUNCE = {
  // Dilaporkan pemilik
  bebek: 'bébék',

  // Kata lain yang ber-e taling di narasi (satu kelas dengan "bebek").
  becak: 'bécak',
  bel: 'bél',
  ceri: 'céri',
  desa: 'désa',
  dompet: 'dompét',
  halte: 'halté',
  kelereng: 'keléréng',
  kereta: 'keréta',
  lemon: 'lémon',
  level: 'lével',
  melon: 'mélon',
  monorel: 'monorél',
  museum: 'muséum',
  nenek: 'nénék',
  otoped: 'otopéd',
  pena: 'péna',
  pendek: 'péndék',
  pensil: 'pénsil',
  roket: 'rokét',
  sendok: 'séndok',
  sepeda: 'sepéda',
  skuter: 'skutér',
  sore: 'soré',
  stroberi: 'strobéri',
  trem: 'trém',
  zebra: 'zébra',
};

/*
 * SENGAJA TIDAK DIDAFTARKAN: "apel" dan "wortel". Dua kata itu saya tidak
 * yakin taling — banyak penutur mengucapkannya pepet (apəl, wortəl), dan
 * salah menandai justru MERUSAK kata yang selama ini benar. Kata yang tidak
 * terdaftar memakai tebakan bawaan Azure, alias keadaan sekarang: tidak ada
 * yang memburuk. Kalau nanti terdengar salah di HP, tinggal tambahkan.
 */

/**
 * KEBALIKANNYA: kata yang salah dibaca TALING padahal seharusnya PEPET.
 *
 * Laporan pemilik (2026-09-08) dari game Anggota Tubuh: *"suaranya masih
 * ke-inggrisan — 'sen' di 'sentuh' masih seperti e di 'lemon', harusnya
 * seperti e di 'perang'"*. Azure membaca "sentuh" jadi "séntuh".
 *
 * Ejaan é tidak bisa menolong di sini: tulisan Indonesia **tidak punya huruf
 * untuk pepet** — é menandai taling, dan tidak ada lawannya yang dimengerti
 * mesin suara. Jadi kata jenis ini memakai jalan cadangan yang memang sudah
 * disiapkan sejak 2026-08-08: tag `<phoneme>` IPA. Bunyi pepet = `ə`.
 *
 * ATURAN MENAMBAH KATA — sama seperti daftar di atas, plus satu:
 *   - Tulis IPA SELURUH katanya, bukan cuma suku kata yang salah; tag ini
 *     mengganti pengucapan kata itu sepenuhnya. Salah menulis satu bunyi =
 *     kata itu jadi aneh di SELURUH app.
 *   - Kalau ragu, JANGAN didaftarkan (kata tak terdaftar = keadaan sekarang).
 *   - Sesudah menambah kata, baris lamanya perlu dirender ulang: baris
 *     `redo: lafal` di `.github/render-request.txt` sudah mencakup daftar ini
 *     (lihat `touched()` di bawah), atau `redo: <kata>` untuk satu kata saja.
 */
export const PHONEME = {
  // "sentuh" muncul di 127 baris (Anggota Tubuh, Labirin Warna, Jam Pintar,
  // Pasar Buah, Hitung Hebat) — satu kata yang salah, terdengar di mana-mana.
  sentuh: 'səntuh',
};

/**
 * Akhiran yang boleh menempel tanpa memutus pencocokan: "dompetnya",
 * "kelerengnya". Tanpa ini `\b` membuat kata berakhiran ikut terlewat.
 */
const SUFFIX = '(nya|ku|mu|kah|lah)?';

const RE = new RegExp(`\\b(${Object.keys(PRONOUNCE).join('|')})${SUFFIX}\\b`, 'gi');

/** "Bebek" → "Bébék": ikut huruf besar di awal kata aslinya. */
const matchCase = (replacement, original) =>
  original[0] === original[0].toUpperCase()
    ? replacement[0].toUpperCase() + replacement.slice(1)
    : replacement;

/** Teks layar → teks yang diucapkan. Kata yang tak terdaftar dibiarkan apa adanya. */
export function forSpeech(text) {
  return text.replace(RE, (_m, word, suffix = '') => matchCase(PRONOUNCE[word.toLowerCase()], word) + suffix);
}

const PHONEME_RE = new RegExp(`\\b(${Object.keys(PHONEME).join('|')})${SUFFIX}\\b`, 'gi');
const PHONEME_TEST = new RegExp(PHONEME_RE.source, 'i');

/** Aman ditaruh di dalam SSML: `<`, `&`, kutip jadi entity. */
const escape = (text) => text.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Teks layar → potongan SSML siap pakai.
 *
 * URUTANNYA MENGIKAT: escape DULU, tag `<phoneme>` disisipkan SESUDAHNYA.
 * Kalau dibalik, tanda `<` milik tag itu sendiri ikut ter-escape dan Azure
 * menerima tulisan "&#60;phoneme..." sebagai teks yang harus dibacakan.
 */
export function speechSsml(text) {
  const respelled = escape(forSpeech(text));
  return respelled.replace(
    PHONEME_RE,
    (_m, word, suffix = '') =>
      `<phoneme alphabet="ipa" ph="${PHONEME[word.toLowerCase()]}">${word}</phoneme>${suffix}`,
  );
}

/**
 * Apakah baris ini tersentuh salah satu daftar lafal? Dipakai `--redo-lafal`
 * untuk memilih baris yang perlu dirender ulang — `key`-nya berasal dari teks
 * LAYAR yang tidak berubah, jadi tanpa ini file lamanya cuma dilewati.
 */
export function touched(text) {
  // Regex TERSENDIRI tanpa flag `g` untuk pengujian: `RegExp.test` pada regex
  // ber-`g` menyimpan `lastIndex`, jadi panggilan kedua mulai dari tengah teks
  // dan menjawab `false` untuk baris yang jelas-jelas cocok.
  return forSpeech(text) !== text || PHONEME_TEST.test(text);
}
