/**
 * Mascot growth — an engine-wide progression fed by TOTAL stars across every
 * game (ported from the "Petualangan Pintar" maskot evolusi). The mascot is
 * shown on the portal home and on every game's finish screen, so kids feel
 * one companion growing as they play more.
 */

export interface MascotStage {
  /** Minimum total stars to reach this stage. */
  min: number;
  /**
   * Picture asset id — `public/assets/mascot/<pic>.webp`. Premium AI art from
   * the project owner: one character growing through every stage, so the
   * mascot looks the same on every phone (emoji 🦄/🐲 differ wildly, and are
   * missing entirely on older Android).
   *
   * OMIT it while a stage's art is still being drawn: the emoji then renders
   * on its own, with no <img> request and so no 404 in the console. Shipping
   * the art later is a one-word edit here — nothing else changes.
   */
  pic?: string;
  /** Fallback shown when a stage has no art yet, or its picture fails to load. */
  emoji: string;
  name: string;
}

/**
 * Evolution ladder: 🥚 → 🐣 → 🐥 → 🦉 → 🦄 → 🐲, then the dragon itself keeps
 * growing more magnificent through six further stages.
 *
 * The ladder must stay stretched over the stars the app actually holds. Every
 * game together offers 561 ⭐ (187 level slots × 3), and stars are stored as
 * the BEST result per level — replaying never adds any — so 561 is a real
 * ceiling, not a soft one. When the ladder stopped at 100 ⭐ (2026-08-09) a
 * regular player maxed out having seen 18% of the content and then collected
 * 461 more stars with nothing to show for it. If you add games, re-measure the
 * ceiling and consider whether the top stage still sits near it.
 */
export const MASCOTS: MascotStage[] = [
  { min: 0, pic: 'mascot-1', emoji: '🥚', name: 'Telur Ajaib' },
  { min: 10, pic: 'mascot-2', emoji: '🐣', name: 'Si Menetas' },
  { min: 25, pic: 'mascot-3', emoji: '🐥', name: 'Anak Ayam Ceria' },
  { min: 45, pic: 'mascot-4', emoji: '🦉', name: 'Burung Hantu Pintar' },
  { min: 70, pic: 'mascot-5', emoji: '🦄', name: 'Unicorn Ajaib' },
  { min: 100, pic: 'mascot-6', emoji: '🐲', name: 'Naga Jenius' },
  // Art pending — the same dragon, growing more magnificent each stage.
  { min: 145, emoji: '🔥', name: 'Naga Api' },
  { min: 200, emoji: '💎', name: 'Naga Kristal' },
  { min: 265, emoji: '⚡', name: 'Naga Petir' },
  { min: 340, emoji: '🌈', name: 'Naga Pelangi' },
  { min: 440, emoji: '🌟', name: 'Naga Bintang' },
  { min: 555, emoji: '👑', name: 'Naga Legenda' },
];

/** Public URL of a stage's picture, or null while its art is still pending. */
export function mascotImageUrl(stage: MascotStage): string | null {
  return stage.pic ? `${import.meta.env.BASE_URL}assets/mascot/${stage.pic}.webp` : null;
}

export interface MascotState {
  stage: MascotStage;
  /** 1-based stage number (1 = 🥚). */
  level: number;
  /** Next stage, or null when fully grown. */
  next: MascotStage | null;
  /** 0–100 progress toward the next stage. */
  progressPct: number;
  /** Stars still needed to reach the next stage (0 when maxed). */
  toNext: number;
}

/** Resolve the mascot state for a given total-star count. */
export function mascotFor(totalStars: number): MascotState {
  let index = 0;
  MASCOTS.forEach((stage, i) => {
    if (totalStars >= stage.min) index = i;
  });
  const stage = MASCOTS[index]!;
  const next = MASCOTS[index + 1] ?? null;
  const progressPct = next
    ? Math.min(100, ((totalStars - stage.min) / (next.min - stage.min)) * 100)
    : 100;
  const toNext = next ? Math.max(0, next.min - totalStars) : 0;
  return { stage, level: index + 1, next, progressPct, toNext };
}
