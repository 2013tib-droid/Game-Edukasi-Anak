import type {
  BatikId,
  BatikTile,
  GameConfig,
  GameLevel,
  LevelStamp,
  OrnamentId,
  OrnamentPiece,
  PaintStep,
  PaintTask,
} from '@/engine/core/types';
import { BATIK, checkTubes, mixPaint, paintName, paintTemp, PRIMARY, type PaintColor } from '@/engine/core/paint';

/**
 * "Sanggar Warna" (SD Kelas 3 & 4, `sd2`, Seni Rupa) — game Seni Rupa
 * pertama: warna & motif hias nusantara. Template `paint-studio`.
 *
 * Keputusan pemilik 2026-10-08 (semua rekomendasi disetujui):
 * - versi PENUH: anak MENCAMPUR cat (tetes ke mangkuk, warnanya berubah
 *   perlahan), MEWARNAI (pilih cat, ketuk kotak), dan MENYUSUN keping motif;
 * - Kucing pelukis (seni `cat`) pemilik sanggar, pemesan = hewan berseni WebP;
 * - 9 slot berurutan TETAP (kls 3 → kls 4 dari slot 6), tanpa `sessionLevels`;
 * - slot pola = hiasan PINGGIRAN KAIN (tumpal, sulur, selang-seling arah) —
 *   bukan deret bentuk seperti Pola Pintar (sd1);
 * - kolase DITUNDA ke game Seni Rupa kedua;
 * - motif batik digambar SVG engine (`Paint.tsx`) & asal daerahnya disebut:
 *   kawung & parang Yogyakarta, mega mendung Cirebon, truntum Surakarta.
 *
 * SLOT
 *   l1 warna primer: isi palet (pengecoh: hijau/ungu dikira primer, putih/hitam)
 *   l2 campur dua primer → sekunder (hasil yang salah DIPERLIHATKAN: merah +
 *      biru = ungu, bukan hijau)
 *   l3 "dicampur dari apa?" — pilih resep (pengecoh: merah + biru dikira
 *      hijau, kuning + biru dikira oranye)
 *   l4 warna muda & tua (tambah putih / tambah hitam — pengecohnya tertukar)
 *   l5 hiasan pinggiran kain (ulang, selang-seling, tumpal naik-turun)
 *   l6 (kls 4) warna panas & dingin — pilah ke dua toples
 *   l7 motif batik: lengkapi kain / kenali namanya (pengecoh: motif lain,
 *      parang yang miring ke arah lain)
 *   l8 simetri: warnai separuh kanan (pengecoh: menyalin tanpa mencerminkan)
 *   l9 MISI BESAR selendang: campur warna → warnai motif simetris → hias pinggiran
 *
 * - Warna di layar SELALU bernama tertulis (anak buta warna). Kuning & oranye,
 *   merah & merah muda tidak pernah diadu sebagai pilihan.
 * - Narasi TANPA digit dan tidak memuat jawabannya. Builder melempar error
 *   untuk data yang salah (resep yang tak menghasilkan warnanya, motif tidak
 *   simetris, tabung yang campurannya tak bernama, keping yang hilang).
 * - Petunjuk bertingkat P2 menyala (`hints`), visual saja.
 */

type Level = GameLevel<'paint-studio'>;

const ANIMAL: Record<string, string> = {
  rabbit: 'Kelinci',
  panda: 'Panda',
  elephant: 'Gajah',
  monkey: 'Monyet',
  koala: 'Koala',
  giraffe: 'Jerapah',
  bear: 'Beruang',
  lion: 'Singa',
  duck: 'Bebek',
  penguin: 'Pinguin',
  zebra: 'Zebra',
  tiger: 'Harimau',
};

const STAMP: Record<string, LevelStamp> = {
  l1: { emoji: '🎨', label: 'Palet' },
  l2: { emoji: '🖌️', label: 'Campur' },
  l3: { emoji: '🌈', label: 'Resep' },
  l4: { emoji: '🌸', label: 'Muda-tua' },
  l5: { emoji: '🧵', label: 'Hiasan' },
  l6: { emoji: '☀️', label: 'Panas' },
  l7: { emoji: '🖼️', label: 'Batik' },
  l8: { emoji: '🦋', label: 'Simetri' },
  l9: { emoji: '🎁', label: 'Selendang' },
};

/* ---------- pemeriksa ---------- */

function fail(msg: string): never {
  throw new Error(`sanggar-warna: ${msg}`);
}

function who(id: string): string {
  return ANIMAL[id] ?? fail(`pelanggan tanpa nama: ${id}`);
}

function noDigit(text: string): string {
  if (/\d/.test(text)) fail(`digit di narasi: ${text}`);
  return text;
}

function uniq<T>(list: T[], what: string): T[] {
  if (new Set(list.map((x) => JSON.stringify(x))).size !== list.length) fail(`${what} kembar`);
  return list;
}

/** Tabung yang tampil berdampingan sebagai pilihan. */
function shelfOk(tubes: PaintColor[]): PaintColor[] {
  uniq(tubes, 'tabung');
  if (tubes.length > 5) fail('tabung lebih dari lima (tak muat di HP 320)');
  if (tubes.includes('kuning') && tubes.includes('oranye')) fail('kuning & oranye diadu');
  if (tubes.includes('merah') && tubes.includes('merah-muda')) fail('merah & merah muda diadu');
  return tubes;
}

/** Tabung untuk mangkuk: SEMUA pasangan tetesnya harus jadi warna bernama. */
function tubesOk(tubes: PaintColor[]): PaintColor[] {
  shelfOk(tubes);
  const bad = checkTubes(tubes);
  if (bad) fail(bad);
  return tubes;
}

function level(id: string, narration: string, ...steps: PaintStep[]): Level {
  return { id, narration: noDigit(narration), stamp: STAMP[id], data: { steps } };
}

function step(customer: string, task: PaintTask, say?: string): PaintStep {
  who(customer);
  return { customer, task, ...(say ? { say: noDigit(say) } : {}) };
}

/* ---------- l1 palet primer ---------- */

function palette(id: string, cust: string, decoys: PaintColor[], given: PaintColor[] = []): Level {
  const want = PRIMARY.filter((c) => !given.includes(c));
  if (decoys.some((c) => PRIMARY.includes(c))) fail('pengecoh palet berisi warna primer');
  const tubes = shelfOk([...want, ...decoys]);
  const text = given.length
    ? `Palet ${who(cust)} masih kurang satu warna primer. Lengkapi!`
    : `${who(cust)} mau melukis. Isi paletnya dengan tiga warna primer!`;
  return level(id, text, step(cust, { kind: 'palette', want, tubes, given }));
}

/* ---------- l2 & l4 campur ---------- */

function mix(id: string, cust: string, target: PaintColor, tubes: PaintColor[], text?: string): Level {
  tubesOk(tubes);
  if (!tubes.some((a) => tubes.some((b) => a !== b && mixPaint(a, b) === target))) fail(`${target} tak bisa dibuat`);
  if (tubes.includes(target)) fail(`${target} sudah ada di tabung`);
  return level(
    id,
    text ?? `${who(cust)} ingin cat warna ${paintName(target)}. Teteskan dua warna ke mangkuk!`,
    step(cust, { kind: 'mix', target, tubes }),
  );
}

/* ---------- l3 resep ---------- */

function recipe(id: string, cust: string, target: PaintColor, decoys: [PaintColor, PaintColor][]): Level {
  const right = PRIMARY.flatMap((a) => PRIMARY.map((b) => [a, b] as const)).find(
    ([a, b]) => a < b && mixPaint(a, b) === target,
  );
  if (!right) fail(`resep ${target} tak ada`);
  const choices = [
    { a: right[0], b: right[1], correct: true },
    ...decoys.map(([a, b]) => {
      if (mixPaint(a, b) === target) fail(`pengecoh resep ${a}+${b} menghasilkan ${target}`);
      return { a, b };
    }),
  ];
  uniq(
    choices.map((c) => [c.a, c.b].sort()),
    'resep',
  );
  return level(
    id,
    `${who(cust)} menemukan cat ${paintName(target)}. Dicampur dari dua warna apa?`,
    step(cust, { kind: 'recipe', target, choices }),
  );
}

/* ---------- l5 pinggiran ---------- */

const P = (o: OrnamentId, c: PaintColor, flip?: boolean): OrnamentPiece => ({ o, c, ...(flip ? { flip } : {}) });

const BORDER_TEXT = [
  'Lanjutkan hiasan pinggiran kainnya!',
  'Susun keping hiasan sampai pinggiran kainnya penuh!',
];

function border(id: string, cust: string, unit: OrnamentPiece[], decoys: OrnamentPiece[], t = 0): Level {
  const pattern = Array.from({ length: 8 }, (_, i) => unit[i % unit.length]!);
  const shown = 5;
  const same = (a: OrnamentPiece, b: OrnamentPiece) => a.o === b.o && a.c === b.c && !!a.flip === !!b.flip;
  const need = pattern.slice(shown).filter((p, i, all) => all.findIndex((q) => same(p, q)) === i);
  for (const d of decoys) if (unit.some((u) => same(u, d))) fail('pengecoh hiasan sama dengan keping pola');
  const tray = [...unit.filter((u, i) => unit.findIndex((q) => same(u, q)) === i), ...decoys];
  uniq(tray, 'keping hiasan');
  if (tray.length > 5) fail('baki hiasan lebih dari lima');
  for (const n of need) if (!tray.some((x) => same(x, n))) fail('keping yang dibutuhkan tak ada di baki');
  return level(id, `${who(cust)} menghias kain. ${BORDER_TEXT[t]}`, step(cust, { kind: 'border', pattern, shown, tray }));
}

/* ---------- l6 panas & dingin ---------- */

function sort(id: string, cust: string, colors: PaintColor[], alt = false): Level {
  uniq(colors, 'warna pilah');
  const temps = colors.map((c) => paintTemp(c) ?? fail(`${c} tak punya suhu`));
  if (temps.filter((t) => t === 'panas').length < 2 || temps.filter((t) => t === 'dingin').length < 2)
    fail('pilah butuh dua warna panas & dua warna dingin');
  if (colors.length > 6) fail('lebih dari enam warna');
  const text = alt
    ? `${who(cust)} melukis pantai. Pilah catnya: panas atau dingin?`
    : `${who(cust)} memilah cat: warna panas atau warna dingin?`;
  return level(id, text, step(cust, { kind: 'sort', colors }));
}

/* ---------- l7 batik ---------- */

function batikFill(id: string, cust: string, motif: BatikId, holes: number[], decoys: BatikTile[]): Level {
  if (!holes.length || holes.some((h) => h < 0 || h > 5)) fail('lubang kain di luar kain');
  uniq(holes, 'lubang');
  uniq([{ m: motif }, ...decoys], 'keping batik');
  if (decoys.some((d) => d.m === motif && !d.flip)) fail('pengecoh batik = jawaban');
  if (decoys.some((d) => d.flip && d.m !== 'parang')) fail('hanya parang yang berubah kalau dicerminkan');
  const b = BATIK[motif]!;
  return level(
    id,
    `${who(cust)} memesan kain batik ${b.name} dari ${b.from}. Lengkapi motifnya!`,
    step(cust, { kind: 'batik', mode: 'fill', motif, holes, decoys }),
  );
}

function batikName(id: string, cust: string, motif: BatikId, others: BatikId[]): Level {
  const choices = uniq([motif, ...others], 'nama motif');
  if (choices.length !== 3) fail('nama motif harus tiga');
  return level(
    id,
    `${who(cust)} membawa sehelai kain batik. Ini motif batik apa?`,
    step(cust, { kind: 'batik', mode: 'name', motif, choices }),
  );
}

/* ---------- l8 simetri ---------- */

const INK: Record<string, PaintColor> = {
  m: 'merah',
  k: 'kuning',
  b: 'biru',
  h: 'hijau',
  u: 'ungu',
  o: 'oranye',
};

function mirrorTask(grid: string[]): PaintTask {
  const cols = grid[0]!.length;
  if (cols % 2) fail('kolom simetri harus genap');
  for (const row of grid) {
    if (row.length !== cols) fail('baris simetri tak sama panjang');
    if ([...row].reverse().join('') !== row) fail(`motif tidak simetris: ${row}`);
    for (const ch of row) if (ch !== '.' && !INK[ch]) fail(`huruf warna tak dikenal: ${ch}`);
  }
  // Menyalin tanpa mencerminkan harus TERLIHAT salah — kalau separuh kiri
  // kebetulan simetris sendiri, soalnya tidak melatih pencerminan.
  const half = cols / 2;
  if (grid.every((row) => row.slice(0, half) === row.slice(half))) fail('salinan = cerminan; soal tak melatih simetri');
  const used = [...new Set(grid.join('').replace(/\./g, ''))];
  if (used.includes('k') && used.includes('o')) fail('kuning & oranye di satu motif');
  const colors = Object.fromEntries(used.map((k) => [k, INK[k]!]));
  return { kind: 'mirror', grid, colors };
}

function mirror(id: string, cust: string, grid: string[]): Level {
  return level(id, `${who(cust)} ingin motif yang simetris. Warnai separuh kanannya!`, step(cust, mirrorTask(grid)));
}

/* ---------- l9 misi selendang ---------- */

function mission(cust: string, target: PaintColor, grid: string[], unit: OrnamentPiece[], decoys: OrnamentPiece[]): Level {
  const m = mix('l9', cust, target, ['merah', 'kuning', 'biru', 'putih']);
  const b = border('l9', cust, unit, decoys);
  const mt = mirrorTask(grid);
  if (mt.kind !== 'mirror' || !Object.values(mt.colors).includes(target)) fail('motif misi tak memakai warna campuran');
  if (!unit.some((u) => u.c === target)) fail('hiasan misi tak memakai warna campuran');
  return level(
    'l9',
    `${who(cust)} memesan selendang ${paintName(target)}. Campur dulu catnya!`,
    m.data.steps[0]!,
    step(cust, mt, 'Bagus! Sekarang warnai motif selendangnya supaya simetris!'),
    step(cust, b.data.steps[0]!.task, 'Terakhir, hias pinggiran selendangnya!'),
  );
}

/* ---------- config ---------- */

const config: GameConfig<'paint-studio'> = {
  id: 'sanggar-warna',
  group: 'sd2',
  title: 'Sanggar Warna',
  emoji: '🎨',
  template: 'paint-studio',
  project: { title: 'Galeri Sanggar Warna' },
  hints: true,
  levels: [
    [
      palette('l1', 'rabbit', ['hijau', 'putih']),
      palette('l1', 'panda', ['hijau', 'ungu']),
      palette('l1', 'elephant', ['ungu', 'hitam']),
      palette('l1', 'monkey', ['hijau', 'ungu', 'putih'], ['merah', 'kuning']),
      palette('l1', 'koala', ['oranye', 'hijau', 'hitam'], ['kuning', 'biru']),
      palette('l1', 'giraffe', ['hijau', 'ungu', 'putih'], ['merah', 'biru']),
    ],
    [
      mix('l2', 'elephant', 'hijau', ['merah', 'kuning', 'biru', 'putih']),
      mix('l2', 'rabbit', 'ungu', ['merah', 'kuning', 'biru', 'putih']),
      mix('l2', 'lion', 'oranye', ['merah', 'kuning', 'biru', 'hitam']),
      mix('l2', 'duck', 'hijau', ['merah', 'kuning', 'biru', 'hitam']),
      mix('l2', 'panda', 'oranye', ['merah', 'kuning', 'biru', 'putih']),
      mix('l2', 'koala', 'ungu', ['merah', 'kuning', 'biru', 'hitam']),
    ],
    [
      recipe('l3', 'monkey', 'hijau', [
        ['merah', 'biru'],
        ['kuning', 'putih'],
      ]),
      recipe('l3', 'giraffe', 'oranye', [
        ['kuning', 'biru'],
        ['merah', 'putih'],
      ]),
      recipe('l3', 'bear', 'ungu', [
        ['merah', 'kuning'],
        ['biru', 'hitam'],
      ]),
      recipe('l3', 'penguin', 'hijau', [
        ['merah', 'kuning'],
        ['biru', 'putih'],
      ]),
      recipe('l3', 'zebra', 'oranye', [
        ['merah', 'biru'],
        ['kuning', 'hitam'],
      ]),
      recipe('l3', 'tiger', 'ungu', [
        ['kuning', 'biru'],
        ['merah', 'putih'],
      ]),
    ],
    [
      mix('l4', 'rabbit', 'merah-muda', ['merah', 'biru', 'putih', 'hitam']),
      mix('l4', 'penguin', 'biru-muda', ['biru', 'kuning', 'putih', 'hitam']),
      mix('l4', 'elephant', 'ungu-muda', ['ungu', 'kuning', 'putih', 'hitam']),
      mix('l4', 'tiger', 'merah-tua', ['merah', 'kuning', 'putih', 'hitam']),
      mix('l4', 'bear', 'biru-tua', ['biru', 'merah', 'putih', 'hitam']),
      mix('l4', 'monkey', 'hijau-tua', ['hijau', 'merah', 'putih', 'hitam']),
    ],
    [
      border('l5', 'giraffe', [P('tumpal', 'merah'), P('tumpal', 'merah', true)], [P('tumpal', 'biru')], 0),
      border('l5', 'duck', [P('bunga', 'kuning'), P('daun', 'hijau')], [P('bunga', 'ungu'), P('daun', 'hijau', true)], 1),
      border(
        'l5',
        'panda',
        [P('wajik', 'merah'), P('bunga', 'biru'), P('bunga', 'biru')],
        [P('wajik', 'biru'), P('bunga', 'merah')],
        0,
      ),
      border(
        'l5',
        'lion',
        [P('tumpal', 'hijau'), P('wajik', 'kuning'), P('sulur', 'ungu')],
        [P('sulur', 'ungu', true), P('tumpal', 'ungu')],
        1,
      ),
      border('l5', 'koala', [P('sulur', 'ungu'), P('sulur', 'ungu', true)], [P('daun', 'ungu')], 0),
      border(
        'l5',
        'zebra',
        [P('tumpal', 'biru'), P('tumpal', 'biru'), P('tumpal', 'merah', true), P('tumpal', 'merah', true)],
        [P('tumpal', 'merah'), P('tumpal', 'biru', true)],
        1,
      ),
    ],
    [
      sort('l6', 'monkey', ['merah', 'biru', 'kuning', 'hijau', 'oranye', 'ungu']),
      sort('l6', 'penguin', ['biru-muda', 'merah', 'hijau-tua', 'oranye', 'ungu', 'kuning'], true),
      sort('l6', 'lion', ['oranye', 'biru-tua', 'merah-tua', 'hijau', 'kuning', 'biru']),
      sort('l6', 'duck', ['hijau', 'merah', 'ungu-muda', 'oranye-muda', 'biru', 'kuning'], true),
      sort('l6', 'giraffe', ['kuning', 'ungu', 'merah', 'biru-muda', 'oranye-tua', 'hijau']),
      sort('l6', 'zebra', ['biru', 'oranye', 'hijau-tua', 'merah', 'ungu', 'kuning']),
    ],
    [
      batikFill('l7', 'panda', 'kawung', [1, 5], [{ m: 'parang' }, { m: 'truntum' }]),
      batikFill('l7', 'elephant', 'parang', [2, 3], [{ m: 'parang', flip: true }, { m: 'kawung' }]),
      batikFill('l7', 'rabbit', 'mega-mendung', [0, 4], [{ m: 'truntum' }, { m: 'kawung' }]),
      batikFill('l7', 'bear', 'truntum', [1, 3], [{ m: 'mega-mendung' }, { m: 'parang', flip: true }]),
      batikName('l7', 'koala', 'parang', ['kawung', 'truntum']),
      batikName('l7', 'tiger', 'mega-mendung', ['parang', 'truntum']),
    ],
    [
      mirror('l8', 'duck', ['b.kk.b', 'bbkkbb', '.bkkb.', 'b.kk.b']),
      mirror('l8', 'rabbit', ['.mbbm.', 'mmbbmm', '..hh..', 'h.hh.h']),
      mirror('l8', 'giraffe', ['..mm..', '.mmmm.', 'kbkkbk', 'kkbbkk']),
      mirror('l8', 'panda', ['u....u', 'uo..ou', 'uoooou', 'hhhhhh']),
      mirror('l8', 'koala', ['..bb..', '.bmmb.', 'b.mm.b', '.b..b.']),
      mirror('l8', 'lion', ['h.kk.h', 'hhkkhh', 'm.hh.m', 'mm..mm']),
    ],
    [
      mission(
        'elephant',
        'ungu',
        ['u.kk.u', 'uukkuu', '.u..u.', 'k.uu.k'],
        [P('tumpal', 'ungu'), P('bunga', 'kuning')],
        [P('tumpal', 'kuning'), P('bunga', 'ungu')],
      ),
      mission(
        'rabbit',
        'hijau',
        ['h.mm.h', 'hhmmhh', '..hh..', 'm.hh.m'],
        [P('daun', 'hijau'), P('daun', 'hijau', true)],
        [P('daun', 'merah')],
      ),
      mission(
        'giraffe',
        'oranye',
        ['o.bb.o', '.obbo.', 'oo..oo', 'b.oo.b'],
        [P('wajik', 'oranye'), P('tumpal', 'biru'), P('tumpal', 'biru')],
        [P('wajik', 'biru'), P('tumpal', 'oranye')],
      ),
      mission(
        'panda',
        'ungu',
        ['..uu..', '.ummu.', 'u.mm.u', 'mu..um'],
        [P('sulur', 'ungu'), P('sulur', 'ungu', true)],
        [P('sulur', 'merah')],
      ),
      mission(
        'bear',
        'hijau',
        ['bh..hb', 'b.hh.b', '.hbbh.', 'hh..hh'],
        [P('tumpal', 'hijau'), P('tumpal', 'biru', true)],
        [P('tumpal', 'hijau', true), P('tumpal', 'biru')],
      ),
      mission(
        'monkey',
        'oranye',
        ['.oooo.', 'o.mm.o', 'om..mo', '..oo..'],
        [P('bunga', 'oranye'), P('wajik', 'merah'), P('wajik', 'merah')],
        [P('bunga', 'merah'), P('wajik', 'oranye')],
      ),
    ],
  ],
};

export default config;
