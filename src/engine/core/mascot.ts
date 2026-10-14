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
 * growing more magnificent through fourteen further stages (20 in all).
 *
 * The ladder must stay stretched over the stars the app actually holds. Stars
 * are stored as the BEST result per level — replaying never adds any — so the
 * total is a real ceiling. Measured 2026-10-14: 1.533 ⭐ across all three
 * groups (511 level slots × 3). The top stage (1.480) sits just under it, so a
 * child who grows up with the app — Playgroup → SD 1-2 → SD 3-4 — can truly
 * finish it; one group alone (plus the free demos) tops out around stage 11–12. If you add games,
 * re-measure the ceiling. NEVER raise an existing threshold: that would demote
 * children who already reached the stage.
 */
export const MASCOTS: MascotStage[] = [
  { min: 0, pic: 'mascot-1', emoji: '🥚', name: 'Telur Ajaib' },
  { min: 10, pic: 'mascot-2', emoji: '🐣', name: 'Si Menetas' },
  { min: 25, pic: 'mascot-3', emoji: '🐥', name: 'Anak Ayam Ceria' },
  { min: 45, pic: 'mascot-4', emoji: '🦉', name: 'Burung Hantu Pintar' },
  { min: 70, pic: 'mascot-5', emoji: '🦄', name: 'Unicorn Ajaib' },
  { min: 100, pic: 'mascot-6', emoji: '🐲', name: 'Naga Jenius' },
  { min: 145, pic: 'mascot-7', emoji: '🔥', name: 'Naga Api' },
  { min: 200, pic: 'mascot-8', emoji: '💎', name: 'Naga Kristal' },
  { min: 265, pic: 'mascot-9', emoji: '⚡', name: 'Naga Petir' },
  // Art pending — the same dragon, growing more magnificent each stage.
  // Prompts: docs/prompt-maskot-naga.md.
  { min: 340, pic: 'mascot-10', emoji: '🌈', name: 'Naga Pelangi' },
  { min: 440, pic: 'mascot-11', emoji: '🌟', name: 'Naga Bintang' },
  { min: 555, pic: 'mascot-12', emoji: '👑', name: 'Naga Mahkota' },
  { min: 640, pic: 'mascot-13', emoji: '🌊', name: 'Naga Samudra' },
  { min: 730, pic: 'mascot-14', emoji: '🍃', name: 'Naga Rimba' },
  { min: 830, pic: 'mascot-15', emoji: '🌸', name: 'Naga Bunga' },
  { min: 940, pic: 'mascot-16', emoji: '☀️', name: 'Naga Matahari' },
  { min: 1060, emoji: '🌙', name: 'Naga Bulan' },
  { min: 1190, emoji: '☄️', name: 'Naga Komet' },
  { min: 1330, emoji: '✨', name: 'Naga Cahaya' },
  { min: 1480, emoji: '🐉', name: 'Naga Legenda' },
];

/**
 * Rank frames, Mobile Legends style (owner, 2026-10-14: higher stages must look
 * jomplang — visibly grander than lower ones). The ART grows the dragon; the
 * FRAME around the avatar escalates by tier so the jump reads even while a
 * stage still shows its emoji. `from` = first 1-based stage of the tier.
 * Purely visual — progress and stars are untouched.
 */
export interface MascotTier {
  id: 'sarang' | 'perunggu' | 'perak' | 'emas' | 'berlian' | 'legenda' | 'mitos';
  label: string;
  from: number;
}

export const MASCOT_TIERS: MascotTier[] = [
  { id: 'sarang', label: 'Sarang', from: 1 },
  { id: 'perunggu', label: 'Perunggu', from: 6 },
  { id: 'perak', label: 'Perak', from: 7 },
  { id: 'emas', label: 'Emas', from: 10 },
  { id: 'berlian', label: 'Berlian', from: 13 },
  { id: 'legenda', label: 'Legenda', from: 17 },
  { id: 'mitos', label: 'Mitos', from: 20 },
];

export function tierFor(level: number): MascotTier {
  let tier = MASCOT_TIERS[0]!;
  for (const t of MASCOT_TIERS) if (level >= t.from) tier = t;
  return tier;
}

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
