/**
 * Validate every level of the `color-path` template (Petak Ajaib, Kode Warna)
 * — game PETAK WARNA: satu panah per warna petak.
 *
 *     node scripts/check-color-levels.mjs
 *
 * Builder (`src/games/colorLevels.ts`) sudah memeriksa yang murah (aturan
 * contoh sampai, aturan "perbaiki" memang salah). Yang BERAT ada di sini,
 * karena builder ikut jalan di HP anak: skrip ini mencoba SEMUA susunan
 * aturan (4^warna) untuk tiap varian dan menuntut:
 *
 *  1. TEPAT SATU susunan yang sampai, dan itu jawaban contoh — kalau ada
 *     jawaban lain yang juga benar, petunjuk P2 (yang menunjuk "aturan
 *     pertama yang beda dari contoh") akan menyalahkan anak yang benar.
 *  2. Peluang menebak asal ≤ 25% (cuma soal kenalan yang boleh setinggi itu).
 *  3. Tiap warna di papan benar-benar dilewati jalan yang benar — warna yang
 *     tak pernah diinjak berarti panahnya tak penting, dan anak menebak.
 *  4. Aturan "perbaiki" yang terpasang memang gagal.
 *  5. Soal DUA TOKOH: tiap tokoh SENDIRI masih punya lebih dari satu susunan
 *     yang membawanya sampai (kalau tidak, tokoh kedua cuma hiasan — soalnya
 *     harus menuntut aturan yang cocok bagi KEDUANYA), dan di jalan yang
 *     benar kedua tokoh tak pernah berdiri di petak yang sama pada saat yang
 *     sama (termasuk menginjak tujuan tokoh lain yang sudah duduk di sana).
 *
 * Kalau sebuah soal gagal: UBAH RANCANGAN PAPANNYA — jangan longgarkan
 * pemeriksaan ini.
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

const files = ['src/games/tk/petak-ajaib.ts', 'src/games/sd1/kode-warna.ts'];
const mod = await load(
  files.map((f, i) => `import c${i} from ${JSON.stringify(spec(f))};`).join('\n') +
    `\nexport const configs = [${files.map((_, i) => `c${i}`).join(',')}];` +
    `\nexport { parsePathBoard, runTeam, runHero, heroesOf, allRules } from ${JSON.stringify(spec('src/engine/core/colorPath.ts'))};`,
);

const same = (a, b, colors) => colors.every((c) => a[c] === b[c]);
let problems = 0;
let checked = 0;
let duo = 0;
let worst = { rate: 0, where: '' };

for (const config of mod.configs) {
  for (const slot of config.levels) {
    const variants = Array.isArray(slot) ? slot : [slot];
    variants.forEach((lv, vi) => {
      const where = `${config.id} ${lv.id} varian ${vi + 1}`;
      const d = lv.data;
      const board = mod.parsePathBoard(d.grid);
      const fail = (why) => {
        problems++;
        console.error(`✗ ${where}: ${why}`);
      };
      checked++;
      const dirs = d.buddy ? [d.startDir, d.buddy.startDir] : [d.startDir];
      if (!!board.start2 !== !!d.buddy) fail('papan `s`/`g` dan `buddy` tidak cocok');
      let total = 0;
      const wins = [];
      for (const r of mod.allRules(board.colors)) {
        total++;
        if (mod.runTeam(board, dirs, r).outcome === 'sampai') wins.push(r);
      }
      if (wins.length !== 1) fail(`${wins.length} susunan aturan yang sampai (harus tepat satu)`);
      else if (!same(wins[0], d.solution, board.colors)) fail('satu-satunya susunan yang sampai bukan jawaban contoh');
      const rate = wins.length / total;
      if (rate > worst.rate) worst = { rate, where };
      if (rate > 0.25) fail(`peluang tebak asal ${(rate * 100).toFixed(1)}% (> 25%)`);
      const team = mod.runTeam(board, dirs, d.solution);
      const used = new Set(team.runs.flatMap((run) => run.steps.map((s) => s.pad)).filter(Boolean));
      const unused = board.colors.filter((c) => !used.has(c));
      if (unused.length) fail(`warna tak pernah diinjak jalan yang benar: ${unused.join(', ')}`);
      if (d.given && mod.runTeam(board, dirs, d.given).outcome === 'sampai') fail('aturan "perbaiki" sudah benar');
      if (d.buddy) {
        duo++;
        const heroes = mod.heroesOf(board, dirs);
        heroes.forEach((h, i) => {
          let alone = 0;
          for (const r of mod.allRules(board.colors)) if (mod.runHero(board, h, r).outcome === 'sampai') alone++;
          if (alone < 2) fail(`tokoh ${i + 1} sendirian cuma punya ${alone} jawaban — tokoh lain jadi hiasan`);
        });
        // Posisi tiap tokoh per detik langkah (yang sudah sampai diam di tujuannya).
        const at = (run, h, t) => (t === 0 ? h.start : run.steps[Math.min(t, run.steps.length) - 1].to);
        const len = Math.max(...team.runs.map((r) => r.steps.length));
        for (let t = 0; t <= len; t++) {
          const [a, b] = team.runs.map((run, i) => at(run, heroes[i], t));
          if (a.r === b.r && a.c === b.c) {
            fail(`kedua tokoh bertumpuk di petak ${a.r},${a.c} pada langkah ${t}`);
            break;
          }
        }
      }
    });
  }
}

console.log(
  `${checked} varian petak warna diperiksa (${duo} dua tokoh); tebak asal terbesar ${(worst.rate * 100).toFixed(1)}% (${worst.where}).`,
);
if (problems) {
  console.error(`${problems} masalah.`);
  process.exit(1);
}
