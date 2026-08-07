/**
 * Collect every line of Indonesian narration the app can ever speak, so it can
 * be rendered once as real TTS audio (Azure `id-ID-GadisNeural`) instead of
 * relying on whatever voice a parent's phone happens to have installed.
 *
 *     node scripts/extract-narration.mjs          # report + write lines.json
 *     node scripts/extract-narration.mjs --quiet  # write only
 *
 * Narration is NOT a plain string list in the configs: it is built by typed
 * builders per variant, and a "slot" may hold dozens of variants the engine
 * picks between at play time. So this bundles the real config modules (same
 * trick as `check-item-ids.mjs`) and walks the FINISHED level data — every
 * variant of every slot, not just the ones a single session would draw.
 *
 * Output: `scripts/narration-lines.json`, the input for the render script.
 * Each entry is `{ key, text, scope }` where `key` is a content hash: change a
 * line's wording and it gets a new key (new audio file), leave it alone and
 * the existing file is reused. `scope` decides which folder the audio lands in
 * so a game only downloads its own voice files:
 *   - a game id  → spoken only by that game
 *   - `_shared`  → spoken by several games
 *   - `_engine`  → spoken by the shell on every game (praise, "coba lagi")
 */
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const OUT_FILE = 'scripts/narration-lines.json';

/**
 * Fixed lines spoken by the engine itself, not by any config:
 * `GameShell` praise/retry (see handleCorrect/handleWrong).
 */
const ENGINE_LINES = ['Hebat! Kamu benar!', 'Selamat! Kamu hebat sekali!', 'Coba lagi, kamu pasti bisa!'];

/**
 * Option labels in `StoryChoice`. The engine SHUFFLES options per page, so any
 * option can end up under any letter — every letter a page could use has to be
 * rendered, or a shuffled story would fall back to the robot voice.
 */
const LETTERS = ['A', 'B', 'C', 'D'];

const gameFiles = [];
for (const group of ['tk', 'sd1']) {
  for (const file of readdirSync(`src/games/${group}`)) {
    // letters.ts is a shared helper module, not a game config.
    if (file.endsWith('.ts') && file !== 'letters.ts') gameFiles.push(`src/games/${group}/${file}`);
  }
}

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
  gameFiles.map((f, i) => `import c${i} from '${path.resolve(f)}';`).join('\n') +
    `\nexport const configs = [${gameFiles.map((_, i) => `c${i}`).join(',')}];`,
);

/**
 * Spoken form of a config string. Configs glue equation halves together with
 * non-breaking spaces so a phone never wraps "= ?" onto its own line — that is
 * a layout trick, and TTS should just see an ordinary space.
 */
function spoken(text) {
  return text.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
}

function keyOf(text) {
  return createHash('sha1').update(text).digest('hex').slice(0, 12);
}

/**
 * Which voice renders a line (owner's decision, 2026-08-07): the storyteller
 * voice `ardi` for the interactive stories, `gadis` for everything else.
 */
const STORY_VOICE = 'ardi';
const DEFAULT_VOICE = 'gadis';

/** text → { games: Set, voices: Set } */
const lines = new Map();

function add(text, gameId, voice = DEFAULT_VOICE) {
  const clean = spoken(text ?? '');
  if (!clean) return;
  if (!lines.has(clean)) lines.set(clean, { games: new Set(), voices: new Set() });
  const row = lines.get(clean);
  row.games.add(gameId);
  row.voices.add(voice);
}

/** Every variant of every slot, flattened. */
function levelsOf(config) {
  return config.levels.flatMap((slot) => (Array.isArray(slot) ? slot : [slot]));
}

for (const config of mod.configs) {
  for (const level of levelsOf(config)) {
    // Mixed games declare the template per level; homogeneous ones once.
    const isStory = (level.template ?? config.template) === 'story-choice';
    const voice = isStory ? STORY_VOICE : DEFAULT_VOICE;
    add(level.narration, config.id, voice);

    // Story pages carry their own spoken text, on top of the level narration.
    const pages = level.data?.pages;
    if (!Array.isArray(pages)) continue;
    for (const page of pages) {
      add(page.text, config.id, voice);
      if (!page.choices) continue;
      for (let i = 0; i < page.choices.length; i++) {
        const choice = page.choices[i];
        // Any option can land on any letter once shuffled (see LETTERS above).
        for (let slot = 0; slot < page.choices.length; slot++) {
          add(`Pilihan ${LETTERS[slot] ?? slot + 1}. ${choice.text}`, config.id, voice);
        }
        // Gentle nudge after a less-good choice.
        add(choice.feedback, config.id, voice);
      }
    }
  }
}

for (const text of ENGINE_LINES) add(text, '_engine');

/* ---------- Write + report ---------- */

const entries = [...lines.entries()]
  .map(([text, { games, voices }]) => {
    const scope = games.has('_engine') ? '_engine' : games.size > 1 ? '_shared' : [...games][0];
    // One line = one audio file, so a line a story shares with a non-story
    // game can't be in two voices — the neutral one wins.
    const voice = voices.size === 1 ? [...voices][0] : DEFAULT_VOICE;
    return { key: keyOf(text), text, scope, voice, games: [...games].sort() };
  })
  .sort((a, b) => a.scope.localeCompare(b.scope) || a.text.localeCompare(b.text));

const chars = entries.reduce((sum, e) => sum + e.text.length, 0);

writeFileSync(
  OUT_FILE,
  `${JSON.stringify({ generated: new Date().toISOString().slice(0, 10), count: entries.length, chars, lines: entries }, null, 2)}\n`,
);

if (process.argv.includes('--quiet')) process.exit(0);

/** Per-scope breakdown, biggest first. */
const perScope = new Map();
for (const e of entries) {
  const row = perScope.get(e.scope) ?? { count: 0, chars: 0 };
  row.count += 1;
  row.chars += e.text.length;
  perScope.set(e.scope, row);
}

const perVoice = new Map();
for (const e of entries) perVoice.set(e.voice, (perVoice.get(e.voice) ?? 0) + e.text.length);

console.log(`Narasi unik: ${entries.length} baris, ${chars.toLocaleString('id-ID')} karakter`);
console.log(
  `Suara: ${[...perVoice]
    .map(([v, c]) => `${v} ${c.toLocaleString('id-ID')} karakter`)
    .join(', ')}\n`,
);
console.log('  baris   karakter  bagian');
for (const [scope, row] of [...perScope].sort((a, b) => b[1].chars - a[1].chars)) {
  console.log(`  ${String(row.count).padStart(5)}  ${String(row.chars).padStart(9)}  ${scope}`);
}

// Azure Speech neural TTS: 500k characters/month free (F0), then $15 per 1M.
const FREE_TIER = 500_000;
const USD_PER_MILLION = 15;
const IDR_PER_USD = 16_000;
const overflow = Math.max(0, chars - FREE_TIER);
const cost = Math.round((overflow / 1_000_000) * USD_PER_MILLION * IDR_PER_USD);
console.log(
  `\nRender sekali di Azure: ${((chars / FREE_TIER) * 100).toFixed(1)}% dari kuota gratis bulanan ` +
    `(${FREE_TIER.toLocaleString('id-ID')} karakter). Biaya: Rp${cost.toLocaleString('id-ID')}.`,
);
console.log(
  `Sisa kuota bulan itu cukup untuk ±${Math.floor(FREE_TIER / chars)}× render ulang penuh (revisi narasi).`,
);
console.log(`\nDitulis ke ${OUT_FILE}`);
