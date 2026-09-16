/**
 * Prove that syncing stars MERGES and never OVERWRITES.
 *
 *     node scripts/check-progress-merge.mjs
 *
 * Stars are the BEST result per level, so merging two devices must take the
 * highest value per level — a child who plays on the tablet and then on the
 * phone must not lose anything, in EITHER direction. That rule is easy to
 * break by "simplifying" the sync into a plain write, and the damage would
 * only show up on a parent's second device, weeks later. So it is pinned here
 * and runs in CI.
 *
 * Bundles the real `src/engine/core/progress.ts` (same pattern as
 * `check-item-ids.mjs`) against a fake `localStorage`, so what is tested is
 * the shipped code, not a copy of its logic.
 */
import { build } from 'esbuild';
import path from 'node:path';

/** Minimal stand-in for the browser store the module writes to. */
function installFakeStorage() {
  const map = new Map();
  globalThis.localStorage = {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
  return map;
}

async function loadProgress() {
  const out = await build({
    stdin: {
      contents: `export * from '@/engine/core/progress';`,
      resolveDir: process.cwd(),
      loader: 'ts',
    },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'neutral',
    alias: { '@': path.resolve('src') },
  });
  const b64 = Buffer.from(out.outputFiles[0].text).toString('base64');
  return import(`data:text/javascript;base64,${b64}`);
}

const failures = [];
let checks = 0;

function check(name, actual, expected) {
  checks += 1;
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) failures.push(`${name}\n    dapat    : ${a}\n    seharusnya: ${e}`);
}

const store = installFakeStorage();
const P = await loadProgress();
const KEY = 'pp_progress_v1';

function seed(obj) {
  store.set(KEY, JSON.stringify(obj));
}
function read() {
  return JSON.parse(store.get(KEY) ?? '{}');
}

// 1. Remote is HIGHER on a level → local must be raised to it.
seed({ 'hutan-hewan': { l1: 1 } });
check('remote lebih tinggi diambil', P.mergeProgress({ 'hutan-hewan': { l1: 3 } }), true);
check('nilainya naik ke 3', read(), { 'hutan-hewan': { l1: 3 } });

// 2. Remote is LOWER → local must be kept. This is the direction a naive
//    "download then write" implementation silently destroys.
seed({ 'hutan-hewan': { l1: 3 } });
check('remote lebih rendah diabaikan', P.mergeProgress({ 'hutan-hewan': { l1: 1 } }), false);
check('nilai lokal bertahan di 3', read(), { 'hutan-hewan': { l1: 3 } });

// 3. Two devices, disjoint levels → the union survives, not one side.
seed({ 'hutan-hewan': { l1: 3, l2: 2 } });
P.mergeProgress({ 'hutan-hewan': { l2: 3, l3: 1 } });
check('level dua perangkat digabung', read(), { 'hutan-hewan': { l1: 3, l2: 3, l3: 1 } });

// 4. A game that only exists on the other device must arrive whole.
seed({ 'hutan-hewan': { l1: 3 } });
P.mergeProgress({ 'pasar-buah': { l1: 2 } });
check('game baru dari cadangan masuk', read(), {
  'hutan-hewan': { l1: 3 },
  'pasar-buah': { l1: 2 },
});

// 5. Local must never be emptied by an empty backup — a fresh account has no
//    progress document at all, and that must not wipe the device.
seed({ 'hutan-hewan': { l1: 3, l2: 2 } });
check('cadangan kosong tidak mengubah apa pun', P.mergeProgress({}), false);
check('bintang lokal utuh', read(), { 'hutan-hewan': { l1: 3, l2: 2 } });

// 6. Backup comes off the network, so junk must be dropped rather than stored.
seed({ 'hutan-hewan': { l1: 2 } });
P.mergeProgress({
  'hutan-hewan': { l1: 99, l2: 0, l3: -1, l4: 2.5, l5: '3', l6: null, l7: 3 },
  'game-x': null,
});
check('nilai tidak sah dibuang, yang sah diambil', read(), {
  'hutan-hewan': { l1: 2, l7: 3 },
});

// 7. Total stars (what grows the mascot) must reflect the merge, and a level
//    must never be counted twice.
seed({ 'hutan-hewan': { l1: 3 }, 'pasar-buah': { l1: 2 } });
P.mergeProgress({ 'hutan-hewan': { l1: 3, l2: 1 } });
check('total bintang sesudah gabung', P.getTotalStars(), 3 + 1 + 2);

// 8. Merging the same backup twice must change nothing the second time —
//    the sync runs on every sign-in.
seed({ 'hutan-hewan': { l1: 1 } });
P.mergeProgress({ 'hutan-hewan': { l1: 3 } });
check('gabung kedua kali tidak mengubah', P.mergeProgress({ 'hutan-hewan': { l1: 3 } }), false);

// 9. saveLevelStars must notify listeners (that is what schedules a backup),
//    and must NOT notify when the new score is not an improvement.
seed({});
const seen = [];
const off = P.subscribeProgress((gameId) => seen.push(gameId));
P.saveLevelStars('hutan-hewan', 'l1', 2);
P.saveLevelStars('hutan-hewan', 'l1', 1); // lebih rendah — tidak disimpan
P.saveLevelStars('pasar-buah', 'l1', 3);
off();
P.saveLevelStars('taman-huruf', 'l1', 3); // sudah berhenti mendengarkan
check('pemberitahuan hanya saat bintang benar-benar naik', seen, [
  'hutan-hewan',
  'pasar-buah',
]);

// 10. getAllProgress must hand back what a backup would carry.
check('getAllProgress = isi perangkat', P.getAllProgress(), read());

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} dari ${checks} pemeriksaan GAGAL:\n`);
  failures.forEach((f) => console.error(`  - ${f}\n`));
  process.exit(1);
}
console.log(`✓ sinkron bintang: ${checks} pemeriksaan lulus (gabung-maksimum, bukan timpa)`);
