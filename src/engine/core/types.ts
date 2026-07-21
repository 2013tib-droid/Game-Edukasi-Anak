/**
 * Core game-config contract. Every game is declared as data matching these
 * types — adding a game means writing a config + assets, never new engine
 * code. TypeScript catches config typos (wrong template name, missing
 * fields) at build time instead of at runtime on a kid's tablet.
 */

export type GroupId = 'tk' | 'sd1';

export type TemplateId =
  | 'tap-answer' // pilih jawaban benar dari 2–4 pilihan
  | 'drag-drop' // pasangkan item ke targetnya
  | 'tracing' // menulis huruf/angka dengan jari
  | 'memory' // mencocokkan kartu
  | 'count-tap' // hitung & ketuk (wajib ada pengecoh — lihat CLAUDE.md)
  | 'story-choice' // cerita interaktif
  | 'spell'; // eja/susun huruf jadi kata (dari game Petualangan Pintar)

/* ---------- Per-template level payloads ---------- */

export interface TapChoice {
  id: string;
  /** Big visual — emoji for now, later an image asset path. */
  emoji?: string;
  text?: string;
  correct?: boolean;
}

export interface TapAnswerData {
  /**
   * Optional big picture cue shown above the choices — e.g. "🚀" for a
   * "which first letter?" question. Emoji for now, later an image path.
   */
  picture?: string;
  /**
   * Optional visual board shown above the choices, e.g. the animals to
   * count ("🦁🦁🦁"), an addition board ("🐰🐰 ➕ 🐰🐰🐰"), or a word with a
   * blank ("_OKET"). Plain text/emoji — the config author composes it.
   */
  board?: string;
  choices: TapChoice[]; // 2–4, exactly one with correct: true
}

export interface DragItem {
  id: string;
  emoji?: string;
  text?: string;
  /** id of the target this item belongs to */
  targetId: string;
}

export interface DragTarget {
  id: string;
  emoji?: string;
  label: string;
}

export interface DragDropData {
  targets: DragTarget[];
  items: DragItem[];
}

export interface TracingData {
  /** Single character to trace, e.g. "3" or "A". */
  glyph: string;
}

export interface MemoryPair {
  id: string;
  emoji: string;
}

export interface MemoryData {
  pairs: MemoryPair[]; // 3–6 pairs
}

export interface CountTapData {
  /** How many the child must tap ("Ketuk 4 apel"). */
  ask: number;
  target: { emoji: string; label: string };
  /**
   * How many target items to show — MUST be greater than `ask` so the
   * child has to stop counting at the asked number (design rule).
   */
  targetCount: number;
  /** 2–3 decoy item kinds mixed in (design rule: never monotone). */
  decoys: { emoji: string; count: number }[];
}

export interface StoryPage {
  emoji?: string;
  text: string;
  /** Absent = plain "Lanjut" page; present = a decision point. */
  choices?: { text: string; correct?: boolean; feedback?: string }[];
}

export interface StoryChoiceData {
  pages: StoryPage[];
}

export interface SpellData {
  /** Target word in UPPERCASE, e.g. "ROKET". Child taps letters in order. */
  word: string;
  /** Picture cue for the word, e.g. "🚀". */
  emoji: string;
  /**
   * Decoy letters mixed into the tray (design rule: never monotone — the
   * child must pick the right letters, not just tap everything in sight).
   * Should NOT already appear in `word`.
   */
  decoys: string[];
}

export interface LevelDataMap {
  'tap-answer': TapAnswerData;
  'drag-drop': DragDropData;
  tracing: TracingData;
  memory: MemoryData;
  'count-tap': CountTapData;
  'story-choice': StoryChoiceData;
  spell: SpellData;
}

/* ---------- Game config ---------- */

export interface GameLevel<T extends TemplateId = TemplateId> {
  id: string;
  /** Narrated instruction (TTS/speechSynthesis) — every level must have one. */
  narration: string;
  data: LevelDataMap[T];
}

/**
 * A level "slot": either a single fixed level, or an array of interchangeable
 * variants. When it's an array the shell picks one variant at random each
 * time the game is played (and on "Main Lagi") — so replays stay fresh and
 * the questions don't feel repetitive, without any per-question logic living
 * in the engine. All variants are still plain typed data.
 */
export type LevelSlot<T extends TemplateId = TemplateId> = GameLevel<T> | GameLevel<T>[];

/** Mixed-game equivalent of LevelSlot. */
export type MixedSlot = MixedLevel | MixedLevel[];

export interface GameConfig<T extends TemplateId = TemplateId> {
  id: string;
  group: GroupId;
  title: string;
  /** Icon shown on portal cards. */
  emoji: string;
  template: T;
  /** Free demo games are fully playable without login. */
  freeDemo: boolean;
  /** Ordered slots; a slot may be one level or a pool of random variants. */
  levels: LevelSlot<T>[];
}

/**
 * A level that carries its own template — used by "mixed" games where the
 * question type changes level to level (ported worlds from Petualangan
 * Pintar mix counting, letters, spelling, etc. inside one game). The
 * discriminated union keeps `data` type-safe against the level's `template`.
 */
export type MixedLevel = {
  [T in TemplateId]: {
    id: string;
    narration: string;
    template: T;
    data: LevelDataMap[T];
  };
}[TemplateId];

/**
 * Game whose levels each declare their own template. `template: 'mixed'`
 * flags the portal/shell to resolve the template per level instead of once
 * per game. Homogeneous games keep using the simpler `GameConfig<T>`.
 */
export interface MixedGameConfig {
  id: string;
  group: GroupId;
  title: string;
  emoji: string;
  template: 'mixed';
  freeDemo: boolean;
  /** Ordered slots; a slot may be one level or a pool of random variants. */
  levels: MixedSlot[];
}

/** Either kind of game — what the shell, registry, and pages accept. */
export type AnyGameConfig = GameConfig | MixedGameConfig;

/** Star progress per level, stored per device (Firestore sync in Fase 5). */
export type Stars = 0 | 1 | 2 | 3;
