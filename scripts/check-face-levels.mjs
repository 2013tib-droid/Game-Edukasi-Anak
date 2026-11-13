/**
 * Validate every level of the `face-feel` template (Wajah Perasaan).
 *
 *     node scripts/check-face-levels.mjs
 *
 * Membundel config ASLI (soal yang persis dimainkan anak) dan aturan di
 * `src/engine/core/feelings.ts`. Dituntut:
 *  1. Wajah tiap perasaan (`FACE_OF[f]`) dibaca `feelingOf` sebagai f sendiri,
 *     dan wajah awal mode bentuk (pegangan di tengah) dibaca "biasa".
 *  2. Sasaran tiap soal bentuk wajah BISA dicapai dalam rentang pegangan —
 *     dan untuk mode satu pegangan, cukup dengan pegangan mulut saja.
 *  3. Daerah seret pegangan ≥ 64 px di wajah terkecil (`MIN_FACE_PX`).
 *  4. Kartu: jawaban tepat sekali, tak ada pilihan kembar, tak ada pasangan
 *     terlarang (takut↔kaget, senang↔kaget) dan tak ada pengecoh yang juga
 *     masuk akal untuk kejadiannya (`notWith`).
 *  5. "Kaget" hanya muncul di slot terakhir (misi besar).
 *  6. Narasi ≤ 70 karakter dan tanpa angka; tiap slot punya 6 varian.
 *
 * Kalau gagal: ubah soalnya — jangan longgarkan pemeriksaan ini.
 */
import { build } from 'esbuild';
import path from 'node:path';

const spec = (f) => path.resolve(f).replaceAll('\\', '/');

async function load(contents) {
  const out = await build({
    stdin: { contents, resolveDir: process.cwd(), loader: 'ts' },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'neutral',
    alias: { '@': path.resolve('src') },
    define: { 'import.meta.env.BASE_URL': '"/"' },
  });
  const b64 = Buffer.from(out.outputFiles[0].text).toString('base64');
  return import(`data:text/javascript;base64,${b64}`);
}

const mod = await load(
  `import config from ${JSON.stringify(spec('src/games/tk/wajah-perasaan.ts'))};\nexport { config };\n` +
    `export * from ${JSON.stringify(spec('src/engine/core/feelings.ts'))};`,
);

let problems = 0;
const fail = (where, msg) => {
  problems += 1;
  console.error(`✗ ${where}: ${msg}`);
};

// 1. Tiap wajah perasaan terbaca sebagai dirinya.
for (const f of mod.FEELINGS) {
  const read = mod.feelingOf(mod.FACE_OF[f]);
  if (read !== f) fail('FACE_OF', `wajah ${f} terbaca ${read}`);
}
for (const c of ['mulut', 'mulut-alis']) {
  const read = mod.feelingOf(mod.controlsFace(c, 0, 0));
  if (read !== 'biasa') fail('wajah awal', `${c}: pegangan di tengah terbaca ${read}`);
}

// 3. Daerah seret.
const scale = mod.MIN_FACE_PX / 200;
for (const [name, z] of Object.entries(mod.HANDLE_ZONES)) {
  const px = Math.min(z.w, z.h) * scale;
  if (px < 64) fail('pegangan', `daerah ${name} cuma ${px.toFixed(0)} px`);
}

/** Bisakah `target` dicapai dengan pegangan `controls`? (pindai rentang). */
function reachable(controls, target) {
  for (let m = -1; m <= 1.0001; m += 0.05) {
    const browRange = controls === 'mulut' ? [0] : Array.from({ length: 41 }, (_, i) => -1 + i * 0.05);
    for (const b of browRange) if (mod.feelingOf(mod.controlsFace(controls, m, b)) === target) return true;
  }
  return false;
}

function checkFeelings(where, answer, choices, event) {
  if (new Set(choices).size !== choices.length) fail(where, `pilihan kembar ${choices}`);
  if (choices.filter((c) => c === answer).length !== 1) fail(where, `jawaban ${answer} tak ada tepat sekali`);
  for (const c of choices) {
    if (c === answer) continue;
    for (const [a, b] of mod.FORBIDDEN_PAIRS) if ((a === answer && b === c) || (b === answer && a === c)) fail(where, `${answer} diadu dengan ${c}`);
    if (event && mod.FEEL_EVENTS[event].notWith.includes(c)) fail(where, `${event} juga bisa membuat ${c}`);
  }
}

const slots = mod.config.levels;
let checked = 0;
slots.forEach((slot, si) => {
  const variants = Array.isArray(slot) ? slot : [slot];
  if (variants.length !== 6) fail(`slot ${si + 1}`, `${variants.length} varian (harus 6)`);
  const last = si === slots.length - 1;
  variants.forEach((lv, v) => {
    const where = `${lv.id} varian ${v + 1}`;
    checked += 1;
    const lines = [lv.narration, ...lv.data.steps.map((s) => s.say).filter(Boolean)];
    for (const l of lines) {
      if (/\d/.test(l)) fail(where, `narasi berangka "${l}"`);
      if (l.length > 70) fail(where, `narasi ${l.length} karakter "${l}"`);
    }
    lv.data.steps.forEach((st, k) => {
      const t = st.task;
      const w = `${where} langkah ${k + 1}`;
      const feelingsHere = [];
      if (t.kind === 'pick') {
        checkFeelings(w, t.answer, t.choices, t.cue.event);
        if (mod.FEEL_EVENTS[t.cue.event].feeling !== t.answer) fail(w, `${t.cue.event} bukan ${t.answer}`);
        feelingsHere.push(...t.choices);
      }
      if (t.kind === 'cause') {
        if (new Set(t.choices).size !== t.choices.length) fail(w, 'pilihan kembar');
        if (!t.choices.includes(t.answer)) fail(w, 'jawaban tak ada');
        for (const e of t.choices) {
          const def = mod.FEEL_EVENTS[e];
          if (e === t.answer ? def.feeling !== t.feeling : def.feeling === t.feeling || def.notWith.includes(t.feeling)) fail(w, `kejadian ${e} ambigu untuk ${t.feeling}`);
          feelingsHere.push(def.feeling);
        }
      }
      if (t.kind === 'help') {
        if (new Set(t.choices).size !== t.choices.length) fail(w, 'pilihan kembar');
        for (const a of t.choices) if (mod.FEEL_ACTIONS[a].good !== (a === t.answer)) fail(w, `tindakan ${a} salah golongan`);
        feelingsHere.push(t.feeling);
      }
      if (t.kind === 'make' || t.kind === 'mirror') {
        if (!reachable(t.controls, t.target)) fail(w, `wajah ${t.target} tak tercapai dengan pegangan ${t.controls}`);
        if (mod.feelingOf(mod.controlsFace(t.controls, 0, 0)) === t.target) fail(w, 'wajah awal sudah = sasaran');
        feelingsHere.push(t.target);
      }
      if (!last && feelingsHere.includes('kaget')) fail(w, '"kaget" hanya boleh di misi besar');
    });
  });
});

console.log(`${checked} varian Wajah Perasaan diperiksa · daerah pegangan terkecil ${(Math.min(...Object.values(mod.HANDLE_ZONES).map((z) => Math.min(z.w, z.h))) * scale).toFixed(0)} px`);
if (problems) {
  console.error(`${problems} masalah.`);
  process.exit(1);
}
