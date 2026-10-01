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

/* ======================================================================
 * KAMUS LAFAL PENUH (2026-10-01)
 * ======================================================================
 *
 * Laporan pemilik (2026-10-01) dari Kebun Ilmu: *"notasi suaranya masih
 * terasa seperti bule, kurang pure Indonesia, terutama di kata e. Sering
 * terbolak-balik."* Contohnya "Menendang bola" dan "Hujan turun deras".
 *
 * Dua daftar di atas menambal kata SATU PER SATU sesudah ada yang mengeluh —
 * dan tiap game baru membawa kata ber-e baru yang tak pernah didengar siapa
 * pun. Kamus ini membalik caranya: SETIAP kata ber-e di narasi diberi lafal
 * IPA, dan yang perlu ditulis tangan cuma kata ber-e TALING. Selebihnya
 * pepet (ə), karena memang itu yang paling umum di bahasa Indonesia.
 * Azure jadi tak perlu menebak sama sekali.
 *
 * Sejak 2026-10-01 dipakai render produksi HANYA untuk game di
 * `KAMUS_SCOPES` (lihat di bawah). Belum untuk semua, karena dua hal harus
 * didengar dulu:
 *   1. apakah suara HD menuruti tag <phoneme> untuk SEMUA kata (lafal
 *      "sentuh" belum pernah dikonfirmasi dengan telinga), dan
 *   2. apakah kalimat yang separuh katanya bertag masih mengalir wajar.
 * Contohnya dirender `scripts/sample-lafal.mjs` (mode: lafal).
 *
 * ATURAN MENAMBAH KATA: kata baru yang ber-e TALING wajib masuk
 * `KAMUS_TALING` (tulis é di suku kata taling saja). Kata pepet tak usah.
 * `node scripts/sample-lafal.mjs --cek` mendaftar semua kata ber-e di narasi
 * yang dianggap pepet, untuk diperiksa sekilas tiap kali ada game baru.
 */

/**
 * Game yang narasinya SUDAH memakai kamus penuh di render produksi.
 * Dimulai dari Kebun Ilmu (laporan pemilik 2026-10-01: "Menendang bola",
 * "Mengangkat tas memakai gaya?", "Hujan turun deras" — e-nya salah semua).
 * Kalau pemilik menilai hasilnya benar, game lain menyusul dengan menambah
 * id-nya di sini lalu render ulang: `only: <game>` + `redo: e` di
 * `.github/render-request.txt` (redo "e" = setiap baris yang memuat huruf e).
 */
export const KAMUS_SCOPES = new Set(['kebun-ilmu']);

/** Kata ber-e TALING. Termasuk semua isi `PRONOUNCE`. */
export const KAMUS_TALING = {
  ...PRONOUNCE,
  beda: 'béda',
  berbeda: 'berbéda',
  beni: 'béni',
  bensin: 'bénsin',
  boleh: 'boléh',
  boneka: 'bonéka',
  buket: 'bukét',
  ekor: 'ékor',
  es: 'és',
  hebat: 'hébat',
  helm: 'hélm',
  hewan: 'héwan',
  kaget: 'kagét',
  kue: 'kué',
  leher: 'léher',
  lembek: 'lembék',
  lewat: 'léwat',
  meja: 'méja',
  meleleh: 'meléléh',
  menoleh: 'menoléh',
  merah: 'mérah',
  mereka: 'meréka',
  meter: 'méter',
  sentimeter: 'sentiméter',
  monyet: 'monyét',
  oleh: 'oléh',
  paket: 'pakét',
  permen: 'pérmén',
  persegi: 'perségi',
  petak: 'pétak',
  reda: 'réda',
  rem: 'rém',
  seekor: 'seékor',
  // Nama huruf "E" dibaca é (huruf, bukan kata).
  e: 'é',
};

const KAMUS_SUFFIX = /(nya|ku|mu|kah|lah)$/;

/** Kata (huruf kecil) → ejaan dengan é di suku kata taling. */
function talingSpelling(word) {
  if (KAMUS_TALING[word]) return KAMUS_TALING[word];
  const m = KAMUS_SUFFIX.exec(word);
  if (m) {
    const base = word.slice(0, -m[1].length);
    if (KAMUS_TALING[base]) return KAMUS_TALING[base] + m[1];
  }
  return word;
}

/**
 * Ejaan Indonesia → IPA. Ejaannya fonemis kecuali "e", jadi cukup aturan
 * huruf: é → e, e → ə, ng → ŋ, ny → ɲ, sy → ʃ, kh → x, c → tʃ, j → dʒ, y → j.
 */
export function toIpa(word) {
  const s = talingSpelling(word.toLowerCase());
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const two = s.slice(i, i + 2);
    if (two === 'ng') { out += 'ŋ'; i++; continue; }
    if (two === 'ny') { out += 'ɲ'; i++; continue; }
    if (two === 'sy') { out += 'ʃ'; i++; continue; }
    if (two === 'kh') { out += 'x'; i++; continue; }
    const c = s[i];
    out += { é: 'e', e: 'ə', c: 'tʃ', j: 'dʒ', y: 'j', q: 'k', x: 'ks' }[c] ?? c;
  }
  return out;
}

/** Apakah kata ini dianggap pepet seluruhnya (tak ada é sesudah kamus)? */
export const isAllPepet = (word) => !talingSpelling(word.toLowerCase()).includes('é');

/**
 * Teks layar → SSML dengan tag <phoneme> di SETIAP kata ber-e. Escape dulu,
 * tag sesudahnya — urutan yang sama dengan `speechSsml()`.
 */
export function kamusSsml(text) {
  return escape(text).replace(/[A-Za-z]*[eE][A-Za-z]*/g, (word) =>
    `<phoneme alphabet="ipa" ph="${toIpa(word)}">${word}</phoneme>`,
  );
}
