/**
 * Validate every picture-registry id referenced by a game config.
 *
 *     node scripts/check-item-ids.mjs
 *
 * A wrong id is invisible when you play: `ItemPic` quietly falls back to the
 * emoji, so the game still works and the premium art simply never appears.
 * This bundles the real config modules, walks the finished level data, and
 * fails if an id is not in `src/engine/ui/items.ts` or its asset file is
 * missing from `public/assets/items/`.
 */
import { build } from 'esbuild';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

/** Level-data fields that hold a registry id. */
const ID_FIELDS = ['item', 'pictureItem', 'vehicleItem', 'goalItem'];

const games = [];
for (const group of ['tk', 'sd1']) {
  for (const file of readdirSync(`src/games/${group}`)) {
    if (file.endsWith('.ts') && file !== 'letters.ts') games.push(`src/games/${group}/${file}`);
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
  games.map((f, i) => `import c${i} from '${path.resolve(f)}';`).join('\n') +
    `\nexport const configs = [${games.map((_, i) => `c${i}`).join(',')}];`,
);
const { ITEMS } = await load(`export * from '${path.resolve('src/engine/ui/items.ts')}'`);

/** id → set of config files that use it. */
const used = new Map();
function walk(node, game) {
  if (Array.isArray(node)) return node.forEach((n) => walk(n, game));
  if (!node || typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node)) {
    if (ID_FIELDS.includes(key) && typeof value === 'string') {
      if (!used.has(value)) used.set(value, new Set());
      used.get(value).add(game);
    }
    walk(value, game);
  }
}
mod.configs.forEach((config, i) => walk(config, games[i]));

const problems = [];
for (const [id, where] of used) {
  const def = ITEMS[id];
  const at = [...where].join(', ');
  if (!def) problems.push(`id tak terdaftar di items.ts: '${id}' (${at})`);
  else if (!existsSync(`public/assets/items/${id}.${def.ext ?? 'svg'}`))
    problems.push(`aset hilang: public/assets/items/${id}.${def.ext ?? 'svg'} (${at})`);
}

const unused = Object.keys(ITEMS).filter((id) => !used.has(id));
console.log(`${used.size} id item dipakai di ${games.length} config.`);
if (unused.length) console.log(`Terdaftar tapi belum dipakai: ${unused.join(', ')}`);
if (problems.length) {
  console.error('\nMASALAH:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('Semua id item terdaftar dan asetnya ada.');
