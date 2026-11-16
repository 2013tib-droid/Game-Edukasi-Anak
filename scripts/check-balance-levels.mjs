/**
 * Validate every level of the `balance-scale` template (Timbangan Seimbang).
 *
 *     node scripts/check-balance-levels.mjs
 *
 * Membundel config ASLI (soal yang persis dimainkan anak) dan aturan di
 * `src/engine/core/balance.ts`, lalu mencoba SEMUA himpunan bagian baki tiap
 * varian. Dituntut:
 *  1. Semua balok 1–30, dan piring sasaran tak pernah lebih dari 30 walau
 *     semua balok baki ditaruh (batas bilangan SD 1-2, keputusan 2026-08-01).
 *  2. Ada susunan baki yang benar; timbangan tidak seimbang sejak awal.
 *  3. `fewest`: banyak balok paling sedikit = yang diminta.
 *     `missing`: tepat SATU balok yang mengisi "?".
 *     `equation`: tiap susunan benar memberi tiga kartu berbeda, dan cuma
 *     kartu "benar" yang memang benar secara nilai.
 *  4. Baki ≤ 5 balok dan selalu berpengecoh.
 *  5. Timbangan rujukan (misi gambar) seimbang.
 *  6. Ukuran di HP 320×568: balok baki 56 px & baki muat satu baris, piring
 *     ≥ 64 px.
 *  7. Narasi ≤ 70 karakter, tanpa angka; 6 varian per slot.
 *
 * Kalau gagal: ubah soalnya — jangan longgarkan pemeriksaan ini.
 */
import { build } from 'esbuild';
import path from 'node:path';

const spec = (f) => path.resolve(f).replaceAll('\\', '/');
const out = await build({
  stdin: {
    contents:
      `export { default as config } from ${JSON.stringify(spec('src/games/sd1/timbangan-seimbang.ts'))};\n` +
      `export * from ${JSON.stringify(spec('src/engine/core/balance.ts'))};`,
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

// Ukuran tetap di CSS (`balance-scale.css`) — WAJIB ikut diubah kalau CSS-nya berubah.
const PHONE_W = 320;
const SCREEN_PAD = 32 - 24; // padding .game-screen (16+16) dikurangi baki yang melebar 12 px tiap sisi (≤ 360 px)
const TRAY_BLOCK = 56;
const TRAY_GAP = 4;
const TRAY_PAD = 8;
const PAN_FRAC = 0.42;

const sumOf = (xs) => xs.reduce((a, b) => a + b, 0);
const kinds = (step, sols) => new Set(sols.map((s) => s.map((i) => `${step.tray[i].v}:${step.tray[i].item ?? ''}`).sort().join('+')));

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
    checkLine(where, lvl.narration);
    lvl.data.steps.forEach((step, k) => {
      const w = `${where} langkah ${k + 1}`;
      if (step.say) checkLine(w, step.say);
      const blocks = [...step.left, ...step.right, ...step.tray, ...(step.refs ?? []).flatMap((r) => [...r.left, ...r.right])];
      for (const b of blocks) if (b.v < 1 || b.v > M.MAX_NUMBER || !Number.isInteger(b.v)) fail(w, `balok ${b.v}`);
      const fixedT = M.sideSum(step.target === 'kiri' ? step.left : step.right);
      const load = step.mode === 'missing' ? Math.max(...step.tray.map((b) => b.v)) : M.sideSum(step.tray);
      if (fixedT + load > M.MAX_NUMBER) fail(w, `piring sasaran bisa ${fixedT + load}`);
      if (M.sideSum(step.left) === M.sideSum(step.right)) fail(w, 'seimbang sejak awal');
      for (const r of step.refs ?? []) if (M.sideSum(r.left) !== M.sideSum(r.right)) fail(w, 'rujukan tak seimbang');
      if (step.tray.length > 5) fail(w, `baki ${step.tray.length} balok`);
      const trayW = step.tray.length * TRAY_BLOCK + (step.tray.length - 1) * TRAY_GAP + TRAY_PAD;
      if (trayW > PHONE_W - SCREEN_PAD) fail(w, `baki ${trayW} px tak muat sebaris di HP ${PHONE_W}`);
      if ((PHONE_W - 32) * PAN_FRAC < 64) fail(w, 'piring < 64 px');

      const sols = M.solutions(step);
      if (!sols.length) fail(w, 'tak ada susunan yang benar');
      const picture = step.tray.some((b) => b.item);
      const used = new Set(sols.flat());
      const decoy = picture ? sols.every((s) => s.length < step.tray.length) : used.size < step.tray.length;
      if (!decoy) fail(w, 'baki tanpa pengecoh');
      if (step.mode === 'missing' && kinds(step, sols).size !== 1) fail(w, `"?" bisa diisi ${kinds(step, sols).size} cara`);
      if (step.mode === 'fewest') {
        const min = Math.min(...M.balancedSubsets(step).map((s) => s.length));
        if (min !== step.fewest) fail(w, `paling sedikit ${min}, bukan ${step.fewest}`);
      }
      if (step.mode === 'equation') {
        for (const s of sols) {
          const cards = M.equationCards(step, s);
          if (cards.length !== 3) fail(w, `kartu kembar ${JSON.stringify(cards)}`);
          for (const c of cards) {
            const [l, r] = c.text.split(' = ').map((x) => sumOf(x.split(' + ').map(Number)));
            if ((l === r) !== c.correct) fail(w, `kartu "${c.text}" ditandai ${c.correct ? 'benar' : 'salah'}`);
          }
        }
      }
    });
  });
});

if (problems) {
  console.error(`\n${problems} masalah di Timbangan Seimbang.`);
  process.exit(1);
}
console.log(`Timbangan Seimbang: ${variants} varian sah.`);
