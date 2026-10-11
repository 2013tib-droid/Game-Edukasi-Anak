import type { GameConfig, GameLevel, LabEnergy, LabPass, LabStep, LabTask, LabThing, LevelStamp } from '@/engine/core/types';
import { RAIL, mirrorSolutions, pitchStep, shadowFits, traceBeam } from '@/engine/core/lab';

/**
 * "Lab Cahaya & Bunyi" (SD Kelas 3 & 4, `sd2`, IPAS) — game IPAS ketiga:
 * cahaya & bayangan, bunyi, energi. Template `light-lab`.
 *
 * Keputusan pemilik 2026-10-11 (semua rekomendasi disetujui):
 * - anak MELAKUKAN percobaannya (bukan memilih kartu): mematikan lampu,
 *   menguji bahan di depan senter, menggeser senter, memetik karet & memukul
 *   gendang, mengetuk gelas nada, menarik benang telepon kaleng, memutar
 *   cermin, mencolokkan alat listrik;
 * - nada SUNGGUHAN buatan engine (`tones.ts`), lewat elemen `<audio>` supaya
 *   terdengar di iPhone yang senyap;
 * - pemandu = Profesor Panda (seni `panda` + kacamata lab SVG);
 * - misi besar = Pertunjukan Wayang Bayangan.
 *
 * SLOT (urutan TETAP, kls 3 → kls 4 dari slot 6, tanpa `sessionLevels`)
 *   l1 sumber cahaya: matikan lampu, sentuh yang bercahaya SENDIRI
 *      (pengecoh khas: bulan & cermin — memantulkan, tidak memancarkan)
 *   l2 tembus cahaya: uji bahan di depan senter, pilah tembus/sebagian/tidak
 *   l3 bayangan: dari atas (bayangan di SEBERANG senter) & dari samping
 *      (senter dekat benda = bayangan besar)
 *   l4 bunyi dari getaran: petik karet / pukul gendang; tahan = bunyi
 *      berhenti; tarik jauh = keras — lalu satu pertanyaan
 *   l5 tinggi-rendah bunyi: urutkan gelas/karet menurut nadanya, atau atur air
 *      / kencangkan karet. Gelas selalu DIKETUK (banyak air = rendah);
 *      ditiup justru kebalikannya, jadi tak pernah dipakai.
 *   l6 (kls 4) bunyi merambat: telepon kaleng (benang kencang = suara sampai),
 *      lalu pertanyaan merambat lewat udara/air/benda padat
 *   l7 cahaya dipantulkan: putar cermin sampai sinar mengenai tunas
 *   l8 energi berubah bentuk: colokkan alat, tempel energinya
 *   l9 MISI BESAR Wayang Bayangan: bayangan wayang besar di kelir → gamelan
 *      gelas → matikan alat sesudah pertunjukan (hemat energi)
 *
 * - Narasi TANPA digit dan tidak memuat jawabannya. Builder melempar error
 *   untuk soal yang salah (lihat pemeriksa di bawah).
 * - Petunjuk bertingkat P2 menyala (`hints`), visual saja.
 */

type Level = GameLevel<'light-lab'>;

const STAMP: Record<string, LevelStamp> = {
  l1: { emoji: '💡', label: 'Cahaya' },
  l2: { emoji: '🔦', label: 'Tembus' },
  l3: { emoji: '👤', label: 'Bayangan' },
  l4: { emoji: '🥁', label: 'Getar' },
  l5: { emoji: '🎵', label: 'Nada' },
  l6: { emoji: '🥫', label: 'Telepon' },
  l7: { emoji: '🪞', label: 'Cermin' },
  l8: { emoji: '🔌', label: 'Energi' },
  l9: { emoji: '🎭', label: 'Wayang' },
};

/* ---------- pemeriksa ---------- */

function fail(msg: string): never {
  throw new Error(`lab-cahaya-bunyi: ${msg}`);
}

function noDigit(text: string): string {
  if (/\d/.test(text)) fail(`digit di narasi: ${text}`);
  return text;
}

function uniqLabels(list: { label: string }[], what: string) {
  if (new Set(list.map((x) => x.label)).size !== list.length) fail(`${what} kembar`);
}

function uniqArt(list: LabThing[], what: string) {
  const pics = list.map((x) => x.art ?? x.item ?? x.emoji);
  if (new Set(pics).size !== pics.length) fail(`${what}: satu gambar dipakai dua kali`);
}

function level(id: string, narration: string, ...steps: LabStep[]): Level {
  return { id, narration: noDigit(narration), stamp: STAMP[id], data: { steps } };
}

function step(task: LabTask, say?: string): LabStep {
  return say ? { say: noDigit(say), task } : { task };
}

const T = (label: string, look: Omit<LabThing, 'label'>): LabThing => ({ label, ...look });

/* ---------- l1 sumber cahaya ---------- */

const MATAHARI = T('Matahari', { item: 'sun', emoji: '☀️' });
const LILIN = T('Lilin', { emoji: '🕯️' });
const LAMPU = T('Lampu', { art: 'lampu' });
const KUNANG = T('Kunang-kunang', { art: 'kunang' });
const API = T('Api unggun', { emoji: '🔥' });
const BULAN = T('Bulan', { item: 'moon', emoji: '🌙' });
const CERMIN = T('Cermin', { emoji: '🪞' });
const PIRING = T('Piring', { art: 'piring' });
const SENDOK = T('Sendok', { emoji: '🥄' });
const BOLA = T('Bola', { item: 'ball', emoji: '⚽' });
const BUKU = T('Buku', { item: 'book', emoji: '📖' });

const GLOW_TEXT = [
  'Matikan lampunya. Lalu sentuh semua benda yang bercahaya sendiri!',
  'Di tempat gelap, mana yang memancarkan cahaya sendiri? Matikan lampunya dulu!',
];

function glow(t: number, light: LabThing[], dark: LabThing[]): Level {
  const cards = [...light.map((c) => ({ ...c, light: true })), ...dark];
  if (cards.length !== 6) fail('kartu cahaya harus enam');
  if (light.length < 2 || light.length > 3) fail('sumber cahaya harus dua atau tiga');
  if (!dark.some((d) => d === BULAN || d === CERMIN)) fail('pengecoh bulan/cermin wajib ada');
  uniqLabels(cards, 'kartu cahaya');
  return level('l1', GLOW_TEXT[t]!, step({ kind: 'glow', cards }));
}

/* ---------- l2 tembus cahaya ---------- */

const KACA = T('Kaca bening', { art: 'kaca' });
const PLASTIK = T('Plastik bening', { art: 'plastik-bening' });
const KERTAS = T('Kertas minyak', { art: 'kertas-minyak' });
const KAIN = T('Kain tipis', { art: 'kain-tipis' });
const KACA_ES = T('Kaca buram', { art: 'kaca-es' });
const KAYU = T('Papan kayu', { art: 'kayu' });
const KARDUS = T('Kardus', { art: 'kardus' });

const PASS_TEXT = [
  'Uji tiap benda di depan senter. Lalu pilah ke kotaknya!',
  'Apakah cahaya senter bisa menembusnya? Uji dulu, lalu pilah!',
];

function pass(t: number, groups: Record<LabPass, LabThing[]>): Level {
  const items = (Object.keys(groups) as LabPass[]).flatMap((p) => {
    if (!groups[p].length) fail(`kotak ${p} tanpa benda`);
    return groups[p].map((x) => ({ ...x, pass: p }));
  });
  if (items.length < 4 || items.length > 5) fail('benda uji harus empat atau lima');
  uniqLabels(items, 'benda uji');
  return level('l2', PASS_TEXT[t]!, step({ kind: 'pass', items }));
}

/* ---------- l3 bayangan ---------- */

const KELINCI = T('Kelinci', { item: 'rabbit', emoji: '🐰' });
const POHON = T('Pohon', { item: 'tree', emoji: '🌳' });
const KUCING = T('Kucing', { item: 'cat', emoji: '🐱' });
const RUMAH = T('Rumah', { item: 'house', emoji: '🏠' });
const BUNGA = T('Bunga', { item: 'flower', emoji: '🌸' });
const JERAPAH = T('Jerapah', { item: 'giraffe', emoji: '🦒' });
const BEBEK = T('Bebek', { item: 'duck', emoji: '🦆' });
const BERUANG = T('Beruang', { item: 'bear', emoji: '🐻' });

function side(thing: LabThing, target: LabThing, angle: number): Level {
  if (angle < 0 || angle >= 360) fail('sudut sasaran di luar lingkaran');
  return level(
    'l3',
    `Geser senter supaya bayangan ${thing.label.toLowerCase()} jatuh ke arah ${target.label.toLowerCase()}!`,
    step({ kind: 'shadow', mode: 'side', thing, target, angle }),
  );
}

const SIZE_WORD = { besar: 'besar', sedang: 'sedang', kecil: 'kecil' } as const;

function checkSize(goal: 'besar' | 'sedang' | 'kecil') {
  let any = false;
  for (let x = RAIL.min; x <= RAIL.max; x += 0.5) if (shadowFits(goal, x)) any = true;
  if (!any) fail(`bayangan ${goal} tak bisa dicapai`);
}

function size(thing: LabThing, goal: 'besar' | 'sedang' | 'kecil'): Level {
  checkSize(goal);
  return level(
    'l3',
    `Geser senter maju mundur. Buat bayangan ${thing.label.toLowerCase()} di layar jadi ${SIZE_WORD[goal]}, pas dengan kotaknya!`,
    step({ kind: 'shadow', mode: 'size', thing, goal }),
  );
}

/* ---------- pilihan ---------- */

type Choice = LabThing & { correct?: boolean };

function pickStep(say: string, right: LabThing, wrongs: LabThing[], cue?: LabThing): LabStep {
  const choices: Choice[] = [{ ...right, correct: true }, ...wrongs];
  if (choices.length !== 3) fail('pilihan harus tiga');
  uniqLabels(choices, 'pilihan');
  return step(cue ? { kind: 'pick', cue, choices } : { kind: 'pick', choices }, say);
}

const C = (emoji: string, label: string): LabThing => ({ emoji, label });

/* ---------- l4 getaran ---------- */

function vibrate(narration: string, thing: 'karet' | 'gendang', goal: 'stop' | 'keras' | 'pelan', ask: LabStep): Level {
  return level('l4', narration, step({ kind: 'vibrate', thing, goal }), ask);
}

/* ---------- l5 nada ---------- */

function order(source: 'gelas' | 'karet', levels: number[], dir: 'naik' | 'turun', melody = false): LabTask {
  if (levels.length < 3 || levels.length > 4) fail('benda nada harus tiga atau empat');
  const steps = levels.map(pitchStep);
  if (new Set(steps).size !== steps.length) fail('dua benda nadanya sama');
  return { kind: 'pitch', mode: 'order', source, levels, dir, ...(melody ? { melody } : {}) };
}

function tune(source: 'gelas' | 'karet', ref: number, start: number, goal: 'tinggi' | 'rendah'): LabTask {
  const higher = (v: number) => (source === 'gelas' ? pitchStep(v) < pitchStep(ref) : pitchStep(v) > pitchStep(ref));
  const lower = (v: number) => (source === 'gelas' ? pitchStep(v) > pitchStep(ref) : pitchStep(v) < pitchStep(ref));
  const ok = goal === 'tinggi' ? higher : lower;
  if (ok(start)) fail('gelas/karet atur sudah benar sejak awal');
  if (![0, 0.2, 0.4, 0.6, 0.8, 1].some(ok)) fail('nada atur tak bisa dicapai');
  return { kind: 'pitch', mode: 'tune', source, ref, start, goal };
}

const ORDER_UP = 'Ketuk tiap gelas dan dengarkan. Susun dari bunyi paling rendah ke paling tinggi!';
const ORDER_DOWN = 'Ketuk tiap gelas dan dengarkan. Susun dari bunyi paling tinggi ke paling rendah!';

/* ---------- l6 telepon kaleng ---------- */

function can(friend: LabThing, ask: LabStep, t: number): Level {
  const line = `Halo, Panda! Aku ${friend.label}. Suaramu terdengar jelas!`;
  return level(
    'l6',
    t ? 'Telepon kaleng! Suaranya sampai kalau benangnya kencang. Tarik temanmu!' : 'Ayo main telepon kaleng! Tarik temanmu menjauh.',
    step({ kind: 'can', friend, line: noDigit(line) }),
    ask,
  );
}

const MONYET = T('Monyet', { item: 'monkey', emoji: '🐵' });
const KOALA = T('Koala', { item: 'koala', emoji: '🐨' });
const KATAK = T('Katak', { item: 'frog', emoji: '🐸' });

const BENANG = C('🧵', 'Benang');
const CAHAYA = C('💡', 'Cahaya');
const BAYANGAN = C('👤', 'Bayangan');
const AIR = C('💧', 'Air');
const UDARA = C('🌬️', 'Udara');
const KAYU_MEJA = C('🪵', 'Kayu meja');

/* ---------- l7 cermin ---------- */

const MIRROR_TEXT = [
  'Tunas butuh cahaya. Ketuk cermin untuk memutarnya, sampai cahaya senter mengenai tunas!',
  'Putar cerminnya supaya cahaya senter sampai ke tunas!',
];

function mirror(t: number, grid: string[]): Level {
  const w = grid[0]!.length;
  if (grid.some((r) => r.length !== w)) fail('baris cermin tak sama panjang');
  if (w > 5 || grid.length > 4) fail('papan cermin terlalu besar untuk HP 320');
  if (traceBeam(grid, []).end === 'target') fail('cermin sudah benar sejak awal');
  if (!mirrorSolutions(grid).length) fail('cermin tak bisa diselesaikan');
  return level('l7', MIRROR_TEXT[t]!, step({ kind: 'mirror', grid }));
}

/* ---------- l8 energi ---------- */

const D_LAMPU = { ...T('Lampu', { art: 'lampu' }), energy: 'cahaya' as LabEnergy };
const D_KIPAS = { ...T('Kipas angin', { art: 'kipas' }), energy: 'gerak' as LabEnergy };
const D_SETRIKA = { ...T('Setrika', { art: 'setrika' }), energy: 'panas' as LabEnergy };
const D_PENANAK = { ...T('Penanak nasi', { art: 'penanak' }), energy: 'panas' as LabEnergy };
const D_RADIO = { ...T('Radio', { art: 'radio' }), energy: 'bunyi' as LabEnergy };
const D_BEL = { ...T('Bel listrik', { art: 'bel' }), energy: 'bunyi' as LabEnergy };

const POWER_TEXT = [
  'Colokkan tiap alat. Listriknya berubah jadi energi apa? Tempelkan!',
  'Listrik bisa berubah bentuk. Nyalakan alatnya, lalu tempel energinya!',
];

function power(t: number, devices: (LabThing & { energy: LabEnergy })[], extra: LabEnergy[]): Level {
  if (devices.length < 2 || devices.length > 3) fail('alat harus dua atau tiga');
  if (new Set(devices.map((d) => d.energy)).size !== devices.length) fail('dua alat energinya sama');
  if (extra.some((e) => devices.some((d) => d.energy === e))) fail('label pengecoh sama dengan jawaban');
  uniqLabels(devices, 'alat');
  return level('l8', POWER_TEXT[t]!, step({ kind: 'power', devices, extra }));
}

/* ---------- l9 misi besar ---------- */

const GUNUNGAN = T('Gunungan', { art: 'wayang-gunungan' });
const TOKOH = T('Wayang', { art: 'wayang-tokoh' });
const GARUDA = T('Garuda', { art: 'wayang-garuda' });

const S_LAMPU = { ...T('Lampu panggung', { art: 'lampu' }), off: true };
const S_SENTER = { ...T('Senter', { emoji: '🔦' }), off: true };
const S_RADIO = { ...T('Radio', { art: 'radio' }), off: true };
const S_KIPAS = { ...T('Kipas di ruang kosong', { art: 'kipas' }), off: true };
const S_SETRIKA = { ...T('Setrika tak dipakai', { art: 'setrika' }), off: true };
const K_KULKAS = T('Kulkas', { art: 'kulkas' });
const K_PENANAK = T('Penanak nasi sedang memasak', { art: 'penanak' });
const K_BEL = T('Bel pintu', { art: 'bel' });

function saver(off: LabThing[], keep: LabThing[]): LabTask {
  const cards = [...off.map((c) => ({ ...c, off: true })), ...keep];
  if (cards.length !== 5) fail('kartu hemat energi harus lima');
  if (!keep.length) fail('harus ada alat yang tetap menyala');
  uniqLabels(cards, 'kartu hemat');
  uniqArt(cards, 'kartu hemat');
  return { kind: 'saver', cards };
}

function mission(wayang: LabThing, glasses: number[], off: LabThing[], keep: LabThing[]): Level {
  checkSize('besar');
  return level(
    'l9',
    `Misi besar: pertunjukan wayang! Geser senter, buat bayangan ${wayang.label.toLowerCase()} di layar jadi besar!`,
    step({ kind: 'shadow', mode: 'size', thing: wayang, goal: 'besar' }),
    step(order('gelas', glasses, 'naik', true), 'Sekarang mainkan gamelan gelas! Susun dari nada rendah ke nada tinggi.'),
    step(saver(off, keep), 'Pertunjukan selesai! Matikan alat yang tidak dipakai lagi.'),
  );
}

/* ---------- config ---------- */

const config: GameConfig<'light-lab'> = {
  id: 'lab-cahaya-bunyi',
  group: 'sd2',
  title: 'Lab Cahaya & Bunyi',
  emoji: '🔦',
  template: 'light-lab',
  project: { title: 'Pertunjukan Bayangan' },
  hints: true,
  levels: [
    [
      glow(0, [MATAHARI, LILIN], [BULAN, PIRING, BOLA, BUKU]),
      glow(1, [LAMPU, KUNANG], [CERMIN, SENDOK, BOLA, PIRING]),
      glow(0, [API, LAMPU, MATAHARI], [BULAN, CERMIN, BUKU]),
      glow(1, [KUNANG, LILIN, API], [BULAN, SENDOK, BOLA]),
      glow(0, [LAMPU, MATAHARI], [CERMIN, BULAN, SENDOK, BUKU]),
      glow(1, [LILIN, KUNANG, LAMPU], [BULAN, CERMIN, PIRING]),
    ],
    [
      pass(0, { tembus: [KACA], sebagian: [KERTAS], tidak: [KAYU, BUKU] }),
      pass(1, { tembus: [PLASTIK], sebagian: [KAIN, KACA_ES], tidak: [KARDUS] }),
      pass(0, { tembus: [KACA, PLASTIK], sebagian: [KERTAS], tidak: [PIRING] }),
      pass(1, { tembus: [KACA], sebagian: [KACA_ES, KAIN], tidak: [BUKU] }),
      pass(0, { tembus: [PLASTIK], sebagian: [KAIN, KERTAS], tidak: [BUKU, PIRING] }),
      pass(1, { tembus: [KACA, PLASTIK], sebagian: [KACA_ES], tidak: [KAYU, KARDUS] }),
    ],
    [
      side(KELINCI, RUMAH, 0),
      side(POHON, BUNGA, 135),
      side(KUCING, BOLA, 250),
      size(JERAPAH, 'besar'),
      size(BEBEK, 'kecil'),
      size(BERUANG, 'sedang'),
    ],
    [
      vibrate(
        'Tarik karetnya lalu lepas. Waktu berbunyi, sentuh karetnya!',
        'karet',
        'stop',
        pickStep('Mengapa bunyinya berhenti?', C('✋', 'Getarannya berhenti'), [C('✂️', 'Karetnya putus'), C('💡', 'Lampunya mati')]),
      ),
      vibrate(
        'Angkat pemukulnya lalu lepas. Lihat berasnya! Waktu berbunyi, sentuh gendangnya.',
        'gendang',
        'stop',
        pickStep('Mengapa beras di atas gendang melompat?', C('🥁', 'Kulit gendang bergetar'), [
          C('🌬️', 'Ditiup angin'),
          C('💧', 'Berasnya basah'),
        ]),
      ),
      vibrate(
        'Petik karetnya supaya bunyinya pelan!',
        'karet',
        'pelan',
        pickStep('Bunyi pelan terjadi kalau getarannya…', C('🤏', 'Kecil'), [C('💪', 'Besar'), C('✋', 'Berhenti')]),
      ),
      vibrate(
        'Petik karetnya supaya bunyinya keras!',
        'karet',
        'keras',
        pickStep('Bunyi keras terjadi kalau getarannya…', C('💪', 'Besar'), [C('🤏', 'Kecil'), C('✋', 'Berhenti')]),
      ),
      vibrate(
        'Pukul gendangnya supaya bunyinya keras!',
        'gendang',
        'keras',
        pickStep('Gendang berbunyi keras kalau dipukul…', C('💥', 'Kuat'), [C('🪶', 'Pelan'), C('🙅', 'Tidak dipukul')]),
      ),
      vibrate(
        'Pukul gendangnya supaya bunyinya pelan!',
        'gendang',
        'pelan',
        pickStep('Semua bunyi terjadi karena benda…', C('〰️', 'Bergetar'), [C('💡', 'Bercahaya'), C('🧊', 'Membeku')]),
      ),
    ],
    [
      level('l5', ORDER_UP, step(order('gelas', [0.2, 0.6, 1], 'naik'))),
      level('l5', ORDER_UP, step(order('gelas', [0, 0.4, 0.6, 1], 'naik'))),
      level('l5', ORDER_DOWN, step(order('gelas', [0.2, 0.4, 0.8], 'turun'))),
      level('l5', 'Petik tiap karet dan dengarkan. Susun dari bunyi paling rendah ke paling tinggi!', step(order('karet', [0.2, 0.6, 1], 'naik'))),
      level('l5', 'Atur air di gelasmu supaya bunyinya lebih rendah dari gelas contoh!', step(tune('gelas', 0.4, 0.4, 'rendah'))),
      level('l5', 'Atur karetmu supaya bunyinya lebih tinggi dari karet contoh!', step(tune('karet', 0.4, 0.2, 'tinggi'))),
    ],
    [
      can(KELINCI, pickStep('Suara di telepon kaleng merambat lewat apa?', BENANG, [CAHAYA, BAYANGAN]), 0),
      can(KUCING, pickStep('Waktu benangnya kendur, mengapa suaranya tidak sampai?', C('〰️', 'Benang tidak bergetar'), [C('🥫', 'Kalengnya kecil'), C('🌙', 'Hari sudah malam')]), 1),
      can(MONYET, pickStep('Ikan di kolam bisa mendengar bunyi. Bunyi merambat lewat apa?', AIR, [CAHAYA, BAYANGAN]), 0),
      can(BEBEK, pickStep('Kita mendengar burung berkicau. Bunyinya merambat lewat apa?', UDARA, [CAHAYA, BAYANGAN]), 1),
      can(KOALA, pickStep('Telinga ditempel ke meja, ketukan terdengar jelas. Bunyi merambat lewat apa?', KAYU_MEJA, [CAHAYA, BAYANGAN]), 0),
      can(KATAK, pickStep('Bunyi bisa merambat lewat…', C('🌬️', 'Udara, air, dan benda padat'), [C('💡', 'Cahaya saja'), C('👤', 'Bayangan saja')]), 1),
    ],
    [
      mirror(0, ['>../', '....', '...T']),
      mirror(1, ['v...', '....', '/..T']),
      mirror(0, ['>./.', '#...', '../T']),
      mirror(1, ['..T/', '#...', '>..\\']),
      mirror(0, ['v.#..', '..#T.', '/..\\.']),
      mirror(1, ['..#.', '\\./.', '....', '^T\\.']),
    ],
    [
      power(0, [D_LAMPU, D_KIPAS], ['panas']),
      power(1, [D_SETRIKA, D_RADIO], ['gerak']),
      power(0, [D_KIPAS, D_BEL, D_LAMPU], ['panas']),
      power(1, [D_PENANAK, D_BEL], ['cahaya']),
      power(0, [D_SETRIKA, D_LAMPU, D_KIPAS], ['bunyi']),
      power(1, [D_RADIO, D_PENANAK, D_LAMPU], ['gerak']),
    ],
    [
      mission(GUNUNGAN, [0, 0.4, 0.6, 1], [S_LAMPU, S_SENTER, S_RADIO], [K_KULKAS, K_PENANAK]),
      mission(TOKOH, [0.2, 0.4, 0.8], [S_LAMPU, S_KIPAS], [K_KULKAS, K_PENANAK, K_BEL]),
      mission(GARUDA, [0, 0.2, 0.6, 1], [S_SENTER, S_RADIO, S_SETRIKA], [K_KULKAS, K_BEL]),
      mission(TOKOH, [0, 0.4, 0.8, 1], [S_LAMPU, S_SETRIKA, S_KIPAS], [K_KULKAS, K_BEL]),
      mission(GARUDA, [0.2, 0.6, 1], [S_LAMPU, S_RADIO], [K_KULKAS, K_PENANAK, K_BEL]),
      mission(GUNUNGAN, [0, 0.2, 0.6, 0.8], [S_KIPAS, S_SENTER, S_RADIO], [K_KULKAS, K_PENANAK]),
    ],
  ],
};

export default config;
