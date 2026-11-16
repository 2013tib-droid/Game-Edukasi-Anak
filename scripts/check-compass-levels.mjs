/**
 * Validate every level of the `compass-map` template (Kurir Kompas).
 *
 *     node scripts/check-compass-levels.mjs
 *
 * Membundel config ASLI (soal yang persis dimainkan anak) dan aturan di
 * `src/engine/core/compass.ts`. Untuk SEMUA varian dituntut:
 *  1. Peta ≤ 6×6 (petak ≥ 40 px di HP 320×568), ≤ 6 bangunan, tiap bangunan
 *     sekali saja, semuanya saling terjangkau lewat jalan.
 *  2. `follow`: instruksinya bisa dijalani (tak menabrak), tiap ruas berbelok
 *     dari ruas sebelumnya, 1–5 blok, maksimal dua belokan, dan kalimatnya =
 *     kalimat yang dibangun dari instruksi itu.
 *  3. `where`: jawabannya `dirBetween`, tepat SATU kartu benar, empat kartu
 *     berbeda; di peta terputar jawaban "tanpa membaca mawar angin" ikut
 *     jadi kartu; kalimatnya menyebut pasangan bangunan yang benar.
 *  4. `go`: petunjuknya menunjuk tepat satu bangunan, kalimatnya cocok.
 *  5. `scale`: jawaban = jalur terpendek × 100 m ≤ 1.000 m, tepat satu kartu.
 *  6. Peta diputar ⇔ langkah pertama "utara ada di mana?".
 *  7. Langkah gerak punya petak mulai; narasi ≤ 70 karakter tanpa angka;
 *     6 varian per slot.
 *
 * Kalau gagal: ubah rancangan petanya — jangan longgarkan pemeriksaan ini.
 */
import { build } from 'esbuild';
import path from 'node:path';

const spec = (f) => path.resolve(f).replaceAll('\\', '/');
const out = await build({
  stdin: {
    contents:
      `export { default as config } from ${JSON.stringify(spec('src/games/sd2/kurir-kompas.ts'))};\n` +
      `export * from ${JSON.stringify(spec('src/engine/core/compass.ts'))};\n` +
      `export { followText, whereText, goText, scaleText, findText } from ${JSON.stringify(spec('src/games/compassLevels.ts'))};`,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'neutral',
  alias: { '@': path.resolve('src') },
  define: { 'import.meta.env.BASE_URL': '"/"' },
});
const M = await import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`);

let problems = 0;
const fail = (where, msg) => {
  problems += 1;
  console.error(`✗ ${where}: ${msg}`);
};

const PHONE_W = 320;
const SCREEN_PAD = 32;
const MIN_CELL = 40;

function checkLine(where, text) {
  if (/\d/.test(text)) fail(where, `narasi berangka "${text}"`);
  if (text.length > 70) fail(where, `narasi ${text.length} karakter "${text}"`);
}

let variants = 0;
M.config.levels.forEach((slot, si) => {
  const pool = Array.isArray(slot) ? slot : [slot];
  if (pool.length !== 6) fail(`slot ${si + 1}`, `${pool.length} varian, harusnya 6`);
  pool.forEach((lvl, vi) => {
    variants += 1;
    const where = `${lvl.id} v${vi}`;
    const d = lvl.data;
    checkLine(where, lvl.narration);
    let town;
    try {
      town = M.parseTown(d.rows, d.places); // melempar untuk bangunan kembar
    } catch (e) {
      fail(where, e.message);
      return;
    }
    const scr = M.screenSize(town, d.rot);
    if (town.cols > M.MAX_SIDE || town.rows > M.MAX_SIDE) fail(where, `peta ${town.cols}×${town.rows}`);
    if ((PHONE_W - SCREEN_PAD) / scr.cols < MIN_CELL) fail(where, `petak < ${MIN_CELL} px di HP ${PHONE_W}`);
    if (town.places.length > M.MAX_PLACES) fail(where, `${town.places.length} bangunan`);
    for (const p of town.places) if (!M.shortest(town, town.places[0].cell, p.cell)) fail(where, `${p.id} tak terjangkau`);

    // Putaran: toScreen/fromScreen harus saling membalik, dan utara di layar
    // harus cocok dengan sisi yang dijawab langkah "utara ada di mana?".
    for (let r = 0; r < town.rows; r += 1) {
      for (let c = 0; c < town.cols; c += 1) {
        const [sc, sr] = M.toScreen(town, d.rot, [c, r]);
        const back = M.fromScreen(town, d.rot, sc, sr);
        if (back[0] !== c || back[1] !== r) fail(where, `putaran ${d.rot}: petak ${c},${r} tak kembali`);
      }
    }
    const a = M.toScreen(town, d.rot, [0, 1]);
    const b = M.toScreen(town, d.rot, [0, 0]);
    const v = M.screenVec('u', d.rot);
    if (b[0] - a[0] !== v[0] || b[1] - a[1] !== v[1]) fail(where, `putaran ${d.rot}: utara di layar tak konsisten`);
    const side = { '0,-1': 'atas', '1,0': 'kanan', '0,1': 'bawah', '-1,0': 'kiri' }[v.join()];
    if (side !== M.northSide(d.rot)) fail(where, `northSide(${d.rot}) = ${M.northSide(d.rot)}, layar bilang ${side}`);

    const first = d.steps[0]?.task.kind;
    if ((d.rot !== 0) !== (first === 'north')) fail(where, 'peta diputar harus dibuka langkah "utara ada di mana?" (dan sebaliknya)');
    if (first === 'north' && lvl.narration !== M.COMPASS_LINES.north) fail(where, 'narasi pembuka bukan kalimat mawar angin');

    let pos = d.start ?? null;
    d.steps.forEach((step, k) => {
      const w = `${where} langkah ${k + 1}`;
      const t = step.task;
      const say = k === 0 ? lvl.narration : step.say;
      if (!say) fail(w, 'tanpa kalimat');
      else checkLine(w, say);
      if (t.kind === 'north') return;
      if (t.kind === 'follow') {
        if (!pos) return fail(w, 'tanpa petak mulai');
        const route = M.runMoves(town, pos, t.moves);
        if (!route) return fail(w, 'instruksi menabrak / keluar peta');
        if (t.moves.length < 2 || t.moves.length > 3) fail(w, `${t.moves.length} ruas`);
        t.moves.forEach((m, i) => {
          if (m.n < 1 || m.n > 5) fail(w, `ruas ${m.n} blok`);
          const prev = t.moves[i - 1];
          if (prev && (prev.dir === m.dir || prev.dir === M.opposite(m.dir))) fail(w, 'ruas tidak berbelok');
        });
        if (new Set(route.map((c) => c.join())).size !== route.length) fail(w, 'rute menginjak petak yang sama dua kali');
        if (step.say !== M.followText(t.moves)) fail(w, `kalimat "${step.say}" ≠ instruksi`);
        pos = route.at(-1);
      } else if (t.kind === 'go') {
        if (!pos) return fail(w, 'tanpa petak mulai');
        const ref = M.cellOf(town, t.clue.of);
        const hits = town.places.filter((p) => p.id !== t.clue.of && M.dirBetween(ref, p.cell) === t.clue.dir);
        if (hits.length !== 1 || hits[0].id !== t.to) fail(w, `petunjuk menunjuk ${hits.map((p) => p.id).join(' & ') || 'tak satu pun'}`);
        if (step.say !== M.goText(t.clue.dir, t.clue.of)) fail(w, `kalimat "${step.say}" ≠ petunjuk`);
        const goal = M.cellOf(town, t.to);
        if (M.same(goal, pos)) fail(w, 'kurir sudah di tujuan');
        pos = goal;
      } else if (t.kind === 'where') {
        const ans = M.dirBetween(M.cellOf(town, t.from), M.cellOf(town, t.of));
        if (!ans) return fail(w, 'tidak tepat lurus / diagonal');
        if (new Set(t.choices).size !== 4) fail(w, `kartu ${t.choices}`);
        if (t.choices.filter((c) => c === ans).length !== 1) fail(w, 'bukan tepat satu kartu benar');
        if (d.rot !== 0 && !t.choices.includes(M.naiveDir(ans, d.rot))) fail(w, 'pengecoh "atas = utara" tak ikut');
        if (say !== M.whereText(t.of, t.from)) fail(w, `kalimat "${say}" ≠ pasangan bangunan`);
      } else if (t.kind === 'find') {
        M.cellOf(town, t.place);
        if (town.places.length < 4) fail(w, 'kurang pengecoh');
        if (say !== M.findText(t.place)) fail(w, 'kalimat ≠ bangunan');
      } else if (t.kind === 'symbol') {
        if (new Set(t.choices).size !== 3 || !t.choices.includes(t.symbol)) fail(w, 'kartu simbol cacat');
      } else if (t.kind === 'scale') {
        const route = M.shortest(town, M.cellOf(town, t.from), M.cellOf(town, t.to));
        const ans = (route.length - 1) * M.METERS_PER_CELL;
        if (ans > M.MAX_METERS) fail(w, `${ans} m`);
        if (t.choices.some((c) => c > M.MAX_METERS || c <= 0)) fail(w, `kartu ${t.choices}`);
        if (new Set(t.choices).size !== t.choices.length || t.choices.length < 3) fail(w, `kartu ${t.choices}`);
        if (t.choices.filter((c) => c === ans).length !== 1) fail(w, 'bukan tepat satu kartu benar');
        if (say !== M.scaleText(t.from, t.to)) fail(w, 'kalimat ≠ pasangan bangunan');
      }
    });
  });
});

if (problems) {
  console.error(`\n${problems} masalah di Kurir Kompas.`);
  process.exit(1);
}
console.log(`Kurir Kompas: ${variants} varian sah.`);
