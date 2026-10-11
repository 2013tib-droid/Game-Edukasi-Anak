import type {
  CollageArtwork,
  CollageStep,
  CollageTask,
  EcoBin,
  EcoThing,
  GameConfig,
  GameLevel,
  LevelStamp,
} from '@/engine/core/types';
import type { CollageArtId, CollageMaterial } from '@/engine/core/collage';
import { artOf, lookAlike } from '@/engine/core/collage';
import type { PaintColor } from '@/engine/core/paint';

/**
 * "Studio Kolase" (SD Kelas 3 & 4, `sd2`, Seni Rupa) — game Seni Rupa kedua:
 * kolase, mozaik, montase. Template `collage-studio`.
 *
 * Keputusan pemilik 2026-10-09 (semua rekomendasi disetujui):
 * - isi = KOLASE & MOZAIK (kolase memang disisakan Sanggar Warna untuk game
 *   kedua): anak MENYOBEK kertas dengan menyeretnya keluar dari lembarnya,
 *   menempelkannya ke pola sampai penuh, menyusun mozaik keping persegi
 *   bercelah, memilah bahan alam/buatan, membedakan kolase/mozaik/montase;
 * - pemilik studio = Pak Monyet (seni `monkey` yang sudah ada);
 * - gambar pola = SVG engine (`core/collage.ts` + `ui/Collage.tsx`), beberapa
 *   bagian berwarna — nol aset baru.
 *
 * SLOT (urutan TETAP, kls 3 → kls 4 dari slot 6, tanpa `sessionLevels`)
 *   l1 kolase kertas dari gambar ALAM — warnanya ditalar sendiri (daun hijau)
 *   l2 bahan kolase: pilah bahan alam / bahan buatan
 *   l3 urutkan langkah membuat kolase / mozaik / kolase biji
 *   l4 mozaik 5×5 dua warna, tiru contoh
 *   l5 kolase kertas TIRU RANCANGAN (contoh berwarna; warnanya tak bisa ditebak)
 *   l6 (kls 4) kenali karya: kolase, mozaik, atau montase?
 *   l7 kolase BIJI-BIJIAN tiru contoh (jagung, beras, kacang hijau/merah, daun kering)
 *   l8 mozaik 6×6 tiga warna (dua varian: lanjutkan yang sudah separuh)
 *   l9 MISI BESAR pameran: kolase pemandangan → hias dengan mozaik →
 *      sikap sesudah berkarya / menghargai karya teman
 *
 * - Pasangan yang di HP murah terbaca sama tak pernah jadi pilihan bersama
 *   (kuning–oranye, merah–merah muda, beras–kulit telur…) — `lookAlike`.
 * - Tiap kolase & mozaik punya minimal satu bahan PENGECOH, kalau tidak
 *   yang dilatih cuma menyeret, bukan memilih.
 * - Narasi TANPA digit dan tidak memuat jawabannya. Builder melempar error
 *   untuk data yang salah.
 * - Petunjuk bertingkat P2 menyala (`hints`), visual saja.
 */

type Level = GameLevel<'collage-studio'>;

const STAMP: Record<string, LevelStamp> = {
  l1: { emoji: '🍉', label: 'Sobek' },
  l2: { emoji: '🌿', label: 'Bahan' },
  l3: { emoji: '🔢', label: 'Langkah' },
  l4: { emoji: '🔲', label: 'Mozaik' },
  l5: { emoji: '🐟', label: 'Tiru' },
  l6: { emoji: '🖼️', label: 'Kenali' },
  l7: { emoji: '🌽', label: 'Biji' },
  l8: { emoji: '🧩', label: 'Mozaik' },
  l9: { emoji: '🏆', label: 'Pameran' },
};

/* ---------- pemeriksa ---------- */

function fail(msg: string): never {
  throw new Error(`studio-kolase: ${msg}`);
}

function noDigit(text: string): string {
  if (/\d/.test(text)) fail(`digit di narasi: ${text}`);
  return text;
}

function unique<T>(list: T[], what: string) {
  if (new Set(list).size !== list.length) fail(`${what} kembar`);
}

function safePalette(list: CollageMaterial[], what: string) {
  unique(list, what);
  const same = lookAlike(list);
  if (same) fail(`${what}: ${same[0]} & ${same[1]} terbaca sama di HP`);
}

function level(id: string, narration: string, ...steps: CollageStep[]): Level {
  return { id, narration: noDigit(narration), stamp: STAMP[id], data: { steps } };
}

function step(task: CollageTask, say?: string): CollageStep {
  return say ? { say: noDigit(say), task } : { task };
}

/* ---------- kolase ---------- */

type Parts = Record<string, CollageMaterial>;

function collage(art: CollageArtId, parts: Parts, decoys: CollageMaterial[], example = false): CollageTask {
  const ids = artOf(art).regions.map((r) => r.id);
  for (const id of ids) if (!parts[id]) fail(`${art}: bagian ${id} belum diberi bahan`);
  for (const k of Object.keys(parts)) if (!ids.includes(k)) fail(`${art}: bagian ${k} tak ada di gambar`);
  const need = [...new Set(Object.values(parts))];
  if (!decoys.length) fail(`${art}: kolase tanpa bahan pengecoh`);
  for (const d of decoys) if (need.includes(d)) fail(`${art}: pengecoh ${d} justru dipakai`);
  const sheets = [...need, ...decoys];
  if (sheets.length > 5) fail(`${art}: lebih dari lima lembar (tak muat di HP 320)`);
  safePalette(sheets, `lembar ${art}`);
  return { kind: 'collage', art, parts, sheets, ...(example ? { example } : {}) };
}

/* ---------- mozaik ---------- */

type Colors = Record<string, PaintColor>;

function mosaic(rows: string[], colors: Colors, decoys: PaintColor[], given = 0): CollageTask {
  const w = rows[0]!.length;
  if (rows.some((r) => r.length !== w)) fail(`mozaik tak persegi panjang: ${rows.join('/')}`);
  const used = new Set<PaintColor>();
  for (const ch of rows.join('')) {
    if (ch === '.') continue;
    const c = colors[ch] ?? fail(`huruf ${ch} tanpa warna`);
    used.add(c);
  }
  if (!decoys.length) fail('mozaik tanpa keping pengecoh');
  for (const d of decoys) if (used.has(d)) fail(`pengecoh ${d} justru dipakai`);
  const palette = [...used, ...decoys];
  if (palette.length > 4) fail('lebih dari empat keping (tak muat di HP 320)');
  safePalette(palette, 'keping mozaik');
  if (given >= rows.length) fail('mozaik sudah selesai semua');
  if (given && !rows.slice(given).join('').replace(/\./g, '')) fail('sisa mozaik kosong');
  return { kind: 'mosaic', rows, colors, palette, ...(given ? { given } : {}) };
}

/* Pola mozaik — huruf = warna, titik = petak kosong. */
const M5 = {
  pohon: { name: 'pohon', rows: ['.HHH.', 'HHHHH', '.HHH.', '..C..', '..C..'], colors: { H: 'hijau', C: 'cokelat' } },
  hati: { name: 'hati', rows: ['.M.M.', 'MPMMM', 'MMMMM', '.MMM.', '..M..'], colors: { M: 'merah', P: 'putih' } },
  jamur: { name: 'jamur', rows: ['.MMM.', 'MPMPM', 'MMMMM', '..P..', '.PPP.'], colors: { M: 'merah', P: 'putih' } },
  perahu: { name: 'perahu', rows: ['.P...', '.PP..', '.PPP.', 'CCCCC', '.CCC.'], colors: { P: 'putih', C: 'cokelat' } },
  ikan: { name: 'ikan', rows: ['.....', '.BB.K', 'BBBKK', '.BB.K', '.....'], colors: { B: 'biru', K: 'kuning' } },
  kupu: { name: 'kupu-kupu', rows: ['UU.UU', 'UUHUU', '..H..', 'UUHUU', 'UU.UU'], colors: { U: 'ungu', H: 'hitam' } },
  bintang: { name: 'bintang', rows: ['..K..', '.KKK.', 'KKKKK', '.KKK.', '.K.K.'], colors: { K: 'kuning' } },
} satisfies Record<string, { name: string; rows: string[]; colors: Colors }>;

const M6 = {
  rumah: {
    name: 'rumah',
    rows: ['..MM..', '.MMMM.', 'MMMMMM', '.KKKK.', '.KCCK.', '.KCCK.'],
    colors: { M: 'merah', K: 'kuning', C: 'cokelat' },
  },
  pohon: {
    name: 'pohon apel',
    rows: ['..HH..', '.HMHH.', 'HHHHMH', '.HHHH.', '..CC..', '..CC..'],
    colors: { H: 'hijau', M: 'merah', C: 'cokelat' },
  },
  kapal: {
    name: 'kapal',
    rows: ['..P...', '..PP..', '..PPP.', 'CCCCCC', '.CCCC.', 'BBBBBB'],
    colors: { P: 'putih', C: 'cokelat', B: 'biru' },
  },
  eskrim: {
    name: 'es krim',
    rows: ['..CC..', '.CCCC.', '.PPPP.', '.OOOO.', '..OO..', '..OO..'],
    colors: { C: 'cokelat', P: 'merah-muda', O: 'oranye' },
  },
  bunga: {
    name: 'bunga',
    rows: ['.UUUU.', 'UUKKUU', 'UUKKUU', '.UUUU.', '..HH..', '.HHHH.'],
    colors: { U: 'ungu', K: 'kuning', H: 'hijau' },
  },
  kupu: {
    name: 'kupu-kupu',
    rows: ['BB..BB', 'BBBBBB', 'BBHHBB', '..HH..', 'KKHHKK', 'KK..KK'],
    colors: { B: 'biru', H: 'hitam', K: 'kuning' },
  },
} satisfies Record<string, { name: string; rows: string[]; colors: Colors }>;

type Pattern = { name: string; rows: string[]; colors: Colors };

function copyMosaic(id: string, p: Pattern, decoys: PaintColor[]): Level {
  return level(id, `Tiru contoh mozaik ${p.name}! Pilih kepingnya, lalu tempel di petak.`, step(mosaic(p.rows, p.colors, decoys)));
}

function finishMosaic(id: string, p: Pattern, decoys: PaintColor[]): Level {
  return level(id, `Mozaik ${p.name} belum selesai. Lanjutkan sampai sama dengan contohnya!`, step(mosaic(p.rows, p.colors, decoys, 2)));
}

/* ---------- l1: gambar alam ---------- */

function nature(art: CollageArtId, parts: Parts, decoys: CollageMaterial[]): Level {
  return level(
    'l1',
    `Buat kolase ${artOf(art).name}! Sobek kertas yang warnanya cocok, tempel di gambar.`,
    step(collage(art, parts, decoys)),
  );
}

/* ---------- l5 & l7: tiru rancangan ---------- */

function design(id: 'l5' | 'l7', art: CollageArtId, parts: Parts, decoys: CollageMaterial[]): Level {
  const name = artOf(art).name;
  return level(
    id,
    id === 'l5'
      ? `Tiru contoh kolase ${name}! Tempel kertas sesuai warna contohnya.`
      : `Buat kolase ${name} dari biji-bijian! Tiru contohnya.`,
    step(collage(art, parts, decoys, true)),
  );
}

/* ---------- l2: bahan alam / buatan ---------- */

const T = (label: string, look: Omit<EcoThing, 'label'>): EcoThing => ({ label, ...look });

const DAUN = T('Daun kering', { art: 'daun-kering' });
const TELUR = T('Kulit telur', { art: 'kulit-telur' });
const JAGUNG = T('Biji jagung', { item: 'corn', emoji: '🌽' });
const KERANG = T('Kerang', { emoji: '🐚' });
const RANTING = T('Ranting', { emoji: '🪵' });
const BULU = T('Bulu ayam', { emoji: '🪶' });
const KORAN = T('Koran', { art: 'koran' });
const KARDUS = T('Kardus', { art: 'kardus' });
const SEDOTAN = T('Sedotan', { art: 'sedotan' });
const WOL = T('Benang wol', { emoji: '🧶' });
const GELAS = T('Gelas plastik', { art: 'gelas-plastik' });

const ALAM: EcoBin = { id: 'alam', label: 'Bahan alam', look: 'kotak', color: 'hijau', emoji: '🌿', rule: 'Dari alam' };
const BUATAN: EcoBin = { id: 'buatan', label: 'Bahan buatan', look: 'kotak', color: 'abu', emoji: '🏭', rule: 'Dibuat pabrik' };

function sorting(t: 0 | 1, alam: EcoThing[], buatan: EcoThing[]): Level {
  const items = [...alam.map((x) => ({ ...x, bin: 'alam' })), ...buatan.map((x) => ({ ...x, bin: 'buatan' }))];
  if (!alam.length || !buatan.length) fail('keranjang bahan kosong');
  if (items.length > 6) fail('lebih dari enam bahan (tak muat di HP 320)');
  unique(
    items.map((i) => i.label),
    'bahan',
  );
  const text = [
    'Bahan kolase bisa dari alam atau buatan pabrik. Pilah ke keranjangnya!',
    'Mana bahan alam, mana bahan buatan? Pilah ke keranjang yang benar!',
  ][t]!;
  return level('l2', text, step({ kind: 'sort', bins: [ALAM, BUATAN], items }));
}

/* ---------- l3: urutkan langkah ---------- */

const GAMBAR = T('Gambar polanya', { emoji: '✏️' });
const LEM = T('Oles lem di pola', { emoji: '🧴' });
const STEPS = {
  kolase: [GAMBAR, T('Sobek kertas warna', { emoji: '📄' }), LEM, T('Tempel sobekannya', { emoji: '🖐️' })],
  mozaik: [GAMBAR, T('Gunting kertas kecil persegi', { emoji: '✂️' }), LEM, T('Tempel berjarak rapi', { emoji: '🔲' })],
  biji: [GAMBAR, T('Siapkan biji-bijian', { emoji: '🌽' }), LEM, T('Tempel bijinya rapat', { emoji: '🫘' })],
};
const NOT_A_STEP = {
  kolase: T('Siram dengan air', { emoji: '💧' }),
  mozaik: T('Campur cat air', { emoji: '🎨' }),
  biji: T('Masak bijinya dulu', { emoji: '🍳' }),
};
const WHAT = { kolase: 'kolase', mozaik: 'mozaik', biji: 'kolase biji-bijian' };

function ordering(kind: keyof typeof STEPS, withDecoy: boolean): Level {
  const steps = STEPS[kind];
  unique(
    [...steps, NOT_A_STEP[kind]].map((s) => s.label),
    'kartu langkah',
  );
  return level(
    'l3',
    `Urutkan langkah membuat ${WHAT[kind]}!` + (withDecoy ? ' Ada satu kartu yang bukan langkahnya.' : ''),
    step({ kind: 'order', steps, ...(withDecoy ? { decoys: [NOT_A_STEP[kind]] } : {}) }),
  );
}

/* ---------- l6: kenali karya ---------- */

const W_KOLASE: CollageArtwork = { type: 'kolase', art: 'ikan', parts: { ekor: 'kuning', sirip: 'merah', badan: 'biru' } };
const W_KOLASE2: CollageArtwork = {
  type: 'kolase',
  art: 'kupu',
  parts: { 'sayap-atas': 'oranye', 'sayap-bawah': 'ungu', badan: 'hitam' },
};
const W_MOZAIK: CollageArtwork = { type: 'mozaik', rows: M6.rumah.rows, colors: M6.rumah.colors };
const W_MOZAIK2: CollageArtwork = { type: 'mozaik', rows: M5.jamur.rows, colors: M5.jamur.colors };
const W_MONTASE: CollageArtwork = { type: 'montase', scene: 'kota' };
const W_MONTASE2: CollageArtwork = { type: 'montase', scene: 'desa' };
const W_MONTASE3: CollageArtwork = { type: 'montase', scene: 'taman' };

const NAMES = ['Kolase', 'Mozaik', 'Montase'] as const;

function nameIt(narration: string, show: CollageArtwork): Level {
  const right = { kolase: 'Kolase', mozaik: 'Mozaik', montase: 'Montase' }[show.type];
  return level('l6', narration, step({ kind: 'pick', show, choices: NAMES.map((n) => ({ label: n, ...(n === right ? { correct: true } : {}) })) }));
}

function findIt(narration: string, right: CollageArtwork, wrongs: CollageArtwork[]): Level {
  const choices = [{ artwork: right, correct: true }, ...wrongs.map((artwork) => ({ artwork }))];
  unique(
    choices.map((c) => c.artwork.type),
    'jenis karya',
  );
  return level('l6', narration, step({ kind: 'pick', choices }));
}

/* ---------- l9: misi besar pameran ---------- */

const C = (emoji: string, label: string) => ({ emoji, label });

const ATTITUDE = [
  {
    say: 'Karyanya siap dipamerkan! Sisa kertas dan lemnya bagaimana?',
    right: C('🧹', 'Dibereskan, lemnya ditutup'),
    wrongs: [C('📄', 'Dibiarkan berserakan di meja'), C('🙈', 'Dibuang ke kolong meja')],
  },
  {
    say: 'Di pameran, karya temanmu berbeda dengan karyamu. Bagaimana sikapmu?',
    right: C('👏', 'Menghargai karyanya'),
    wrongs: [C('😝', 'Mengejek karyanya'), C('✋', 'Menyentuh sampai rusak')],
  },
  {
    say: 'Teman bertanya cara membuat kolasemu. Apa yang kamu lakukan?',
    right: C('🗣️', 'Menjelaskan dengan ramah'),
    wrongs: [C('🙅', 'Diam saja'), C('😤', 'Menyuruhnya pergi')],
  },
];

const MISSION_PICTURE = {
  pemandangan: collage('pemandangan', { langit: 'biru', matahari: 'kuning', awan: 'putih', bukit: 'hijau' }, ['ungu']),
  laut: collage('laut', { langit: 'biru', matahari: 'kuning', layar: 'putih', laut: 'biru', perahu: 'cokelat' }, ['merah-muda']),
};

function mission(picture: keyof typeof MISSION_PICTURE, deco: Pattern, decoys: PaintColor[], ask: number): Level {
  const a = ATTITUDE[ask] ?? fail('pertanyaan misi tak ada');
  const choices = [{ ...a.right, correct: true }, ...a.wrongs];
  unique(
    choices.map((c) => c.label),
    'pilihan misi',
  );
  return level(
    'l9',
    `Misi besar! Pak Monyet ikut pameran sekolah. Buat kolase ${artOf(picture).name} dulu!`,
    step(MISSION_PICTURE[picture]),
    step(mosaic(deco.rows, deco.colors, decoys), `Sekarang hias kartu namanya dengan mozaik ${deco.name}!`),
    step({ kind: 'pick', choices }, a.say),
  );
}

/* ---------- config ---------- */

const config: GameConfig<'collage-studio'> = {
  id: 'studio-kolase',
  group: 'sd2',
  title: 'Studio Kolase',
  emoji: '✂️',
  template: 'collage-studio',
  project: { title: 'Pameran Kolase' },
  hints: true,
  levels: [
    [
      nature('semangka', { kulit: 'hijau', daging: 'merah' }, ['ungu', 'biru']),
      nature('wortel', { daun: 'hijau', umbi: 'oranye' }, ['ungu', 'biru']),
      nature('pohon', { batang: 'cokelat', daun: 'hijau' }, ['merah-muda', 'biru']),
      nature('terong', { buah: 'ungu', tangkai: 'hijau' }, ['oranye', 'biru']),
      nature('tomat', { buah: 'merah', daun: 'hijau' }, ['biru', 'ungu']),
      nature('langit', { langit: 'biru', matahari: 'kuning', awan: 'putih' }, ['hijau', 'ungu']),
    ],
    [
      sorting(0, [DAUN, KERANG], [KORAN, SEDOTAN]),
      sorting(1, [JAGUNG, RANTING], [KARDUS, WOL]),
      sorting(0, [TELUR, BULU, DAUN], [GELAS, KORAN]),
      sorting(1, [KERANG, JAGUNG], [SEDOTAN, WOL, KARDUS]),
      sorting(0, [RANTING, TELUR, BULU], [KORAN, GELAS, WOL]),
      sorting(1, [DAUN, JAGUNG, KERANG], [KARDUS, SEDOTAN, GELAS]),
    ],
    [
      ordering('kolase', false),
      ordering('mozaik', false),
      ordering('biji', false),
      ordering('kolase', true),
      ordering('mozaik', true),
      ordering('biji', true),
    ],
    [
      copyMosaic('l4', M5.pohon, ['biru']),
      copyMosaic('l4', M5.hati, ['biru', 'kuning']),
      copyMosaic('l4', M5.jamur, ['hijau']),
      copyMosaic('l4', M5.perahu, ['biru']),
      copyMosaic('l4', M5.ikan, ['merah']),
      copyMosaic('l4', M5.kupu, ['hijau']),
    ],
    [
      design('l5', 'ikan', { ekor: 'kuning', sirip: 'merah', badan: 'biru' }, ['hijau']),
      design('l5', 'kupu', { 'sayap-atas': 'oranye', 'sayap-bawah': 'ungu', badan: 'hitam' }, ['biru']),
      design('l5', 'rumah', { dinding: 'kuning', atap: 'merah', pintu: 'cokelat', jendela: 'biru' }, ['hijau']),
      design('l5', 'bunga', { batang: 'hijau', kelopak: 'merah-muda', tengah: 'kuning' }, ['biru']),
      design('l5', 'perahu', { layar: 'putih', laut: 'biru', lambung: 'merah' }, ['hijau']),
      design('l5', 'layang', { kiri: 'merah', kanan: 'kuning', pita: 'biru' }, ['hijau']),
    ],
    [
      nameIt('Gambar ini ditutup sobekan kertas yang ditempel. Karya apakah ini?', W_KOLASE),
      nameIt('Karya ini dari keping kecil yang disusun berjarak. Disebut apa?', W_MOZAIK),
      nameIt('Karya ini dari potongan gambar jadi yang ditempel. Disebut apa?', W_MONTASE),
      findIt('Mana karya yang disebut mozaik?', W_MOZAIK2, [W_KOLASE2, W_MONTASE3]),
      findIt('Mana karya yang disebut kolase?', W_KOLASE2, [W_MOZAIK, W_MONTASE2]),
      findIt('Mana karya yang disebut montase?', W_MONTASE2, [W_KOLASE, W_MOZAIK2]),
    ],
    [
      design('l7', 'ayam', { ekor: 'kacang-hijau', badan: 'beras', jengger: 'kacang-merah', paruh: 'jagung' }, ['daun-kering']),
      design('l7', 'ikan', { ekor: 'kacang-merah', sirip: 'kacang-hijau', badan: 'jagung' }, ['beras']),
      design('l7', 'bunga', { batang: 'kacang-hijau', kelopak: 'kacang-merah', tengah: 'jagung' }, ['daun-kering']),
      design('l7', 'kupu', { 'sayap-atas': 'jagung', 'sayap-bawah': 'kacang-merah', badan: 'daun-kering' }, ['kacang-hijau']),
      design('l7', 'pohon', { batang: 'daun-kering', daun: 'kacang-hijau' }, ['jagung', 'beras']),
      design('l7', 'layang', { kiri: 'kacang-merah', kanan: 'jagung', pita: 'kacang-hijau' }, ['beras']),
    ],
    [
      copyMosaic('l8', M6.rumah, ['biru']),
      copyMosaic('l8', M6.pohon, ['ungu']),
      copyMosaic('l8', M6.kapal, ['kuning']),
      copyMosaic('l8', M6.eskrim, ['hijau']),
      finishMosaic('l8', M6.bunga, ['merah']),
      finishMosaic('l8', M6.kupu, ['merah']),
    ],
    [
      mission('pemandangan', M5.hati, ['biru'], 0),
      mission('laut', M5.bintang, ['ungu'], 1),
      mission('pemandangan', M5.kupu, ['hijau'], 2),
      mission('laut', M5.jamur, ['biru'], 0),
      mission('pemandangan', M5.ikan, ['merah'], 1),
      mission('laut', M5.pohon, ['ungu'], 2),
    ],
  ],
};

export default config;
