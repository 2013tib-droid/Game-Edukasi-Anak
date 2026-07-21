/**
 * Mascot growth — an engine-wide progression fed by TOTAL stars across every
 * game (ported from the "Petualangan Pintar" maskot evolusi). The mascot is
 * shown on the portal home and on every game's finish screen, so kids feel
 * one companion growing as they play more.
 */

export interface MascotStage {
  /** Minimum total stars to reach this stage. */
  min: number;
  emoji: string;
  name: string;
}

/** Evolution ladder: 🥚 → 🐣 → 🐥 → 🦉 → 🦄 → 🐲 (from the source game). */
export const MASCOTS: MascotStage[] = [
  { min: 0, emoji: '🥚', name: 'Telur Ajaib' },
  { min: 10, emoji: '🐣', name: 'Si Menetas' },
  { min: 25, emoji: '🐥', name: 'Anak Ayam Ceria' },
  { min: 45, emoji: '🦉', name: 'Burung Hantu Pintar' },
  { min: 70, emoji: '🦄', name: 'Unicorn Ajaib' },
  { min: 100, emoji: '🐲', name: 'Naga Jenius' },
];

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
