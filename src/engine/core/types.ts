/**
 * Core game-config contract (Phase 2 builds the runtime around this).
 * Every game is declared as data matching these types — adding a game
 * means writing a config + assets, never new engine code. TypeScript
 * catches config typos (wrong template name, missing fields) at build
 * time instead of at runtime on a kid's tablet.
 */

export type GroupId = 'tk' | 'sd1';

export type TemplateId =
  | 'tap-answer' // pilih jawaban benar dari 2–4 pilihan
  | 'drag-drop' // pasangkan, urutkan, kelompokkan
  | 'tracing' // menulis huruf/angka dengan jari
  | 'memory' // mencocokkan kartu
  | 'count-tap' // hitung & ketuk (dengan pengecoh — lihat CLAUDE.md)
  | 'story-choice'; // cerita interaktif

export interface GameAssets {
  /** Paths under public/assets/, e.g. "tk/berhitung/apel.webp" */
  images?: Record<string, string>;
  /** TTS narration + SFX, lazy-loaded per game */
  audio?: Record<string, string>;
}

export interface GameLevel {
  id: string;
  /** Narration text — every instruction must be voiced (TTS asset key). */
  narrationKey: string;
  /** Template-specific payload; each template narrows this in Phase 2. */
  data: Record<string, unknown>;
}

export interface GameConfig {
  id: string;
  group: GroupId;
  title: string;
  template: TemplateId;
  /** Free demo games are fully playable without login. */
  freeDemo: boolean;
  levels: GameLevel[];
  assets: GameAssets;
}

/** Star progress per level, stored per child profile. */
export interface LevelProgress {
  levelId: string;
  stars: 0 | 1 | 2 | 3;
  completedAt: number;
}
