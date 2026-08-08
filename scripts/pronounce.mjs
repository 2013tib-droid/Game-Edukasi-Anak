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
