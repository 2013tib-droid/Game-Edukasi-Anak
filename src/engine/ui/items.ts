/**
 * Item registry — the single source of truth mapping a stable item `id`
 * (used in game configs, e.g. `{ item: 'panda', count: 3 }`) to its picture
 * asset, an emoji fallback, and an Indonesian label.
 *
 * Pictures live in `public/assets/items/<id>.svg` and are drawn as flat,
 * device-independent illustrations (no more relying on each phone's emoji
 * font). To upgrade the art later — e.g. swap in AI-generated WebP — replace
 * the file for an id (and bump `ext` if the extension changes); every game
 * that references the id picks it up with no config change.
 *
 * `emoji` is the graceful fallback: if an item's image fails to load (or ships
 * later than its config), the board still renders something recognizable.
 */
export interface ItemDef {
  /** Emoji shown if the picture asset is missing — keep it the real thing. */
  emoji: string;
  /** Indonesian label, used for the accessible alt text. */
  label: string;
  /** Asset extension; defaults to 'svg'. Bump when swapping to WebP etc. */
  ext?: string;
}

export const ITEMS: Record<string, ItemDef> = {
  house: { emoji: '🏠', label: 'rumah' },
  // Premium AI-generated art (cute cartoon style). Delivered as transparent
  // WebP by the project owner — see docs/asset-generation-prompts.md.
  elephant: { emoji: '🐘', label: 'gajah', ext: 'webp' },
  lion: { emoji: '🦁', label: 'singa', ext: 'webp' },
  giraffe: { emoji: '🦒', label: 'jerapah', ext: 'webp' },
  panda: { emoji: '🐼', label: 'panda', ext: 'webp' },
  rabbit: { emoji: '🐰', label: 'kelinci', ext: 'webp' },
  duck: { emoji: '🦆', label: 'bebek', ext: 'webp' },
  cat: { emoji: '🐱', label: 'kucing', ext: 'webp' },
  bear: { emoji: '🐻', label: 'beruang', ext: 'webp' },
  turtle: { emoji: '🐢', label: 'kura-kura', ext: 'webp' },
  penguin: { emoji: '🐧', label: 'pinguin', ext: 'webp' },
  horse: { emoji: '🐴', label: 'kuda', ext: 'webp' },
  chicken: { emoji: '🐔', label: 'ayam', ext: 'webp' },
  zebra: { emoji: '🦓', label: 'zebra', ext: 'webp' },
  goat: { emoji: '🐐', label: 'kambing', ext: 'webp' },
};

/** Public URL of an item's picture, respecting the Vite base path. */
export function itemImageUrl(id: string): string {
  const ext = ITEMS[id]?.ext ?? 'svg';
  return `${import.meta.env.BASE_URL}assets/items/${id}.${ext}`;
}
