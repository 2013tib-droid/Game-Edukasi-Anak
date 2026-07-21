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
  | 'story-choice'; // cerita interaktif

/* ---------- Per-template level payloads ---------- */

export interface TapChoice {
  id: string;
  /** Big visual — emoji for now, later an image asset path. */
  emoji?: string;
  text?: string;
  correct?: boolean;
}

export interface TapAnswerData {
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

export interface LevelDataMap {
  'tap-answer': TapAnswerData;
  'drag-drop': DragDropData;
  tracing: TracingData;
  memory: MemoryData;
  'count-tap': CountTapData;
  'story-choice': StoryChoiceData;
}

/* ---------- Game config ---------- */

export interface GameLevel<T extends TemplateId = TemplateId> {
  id: string;
  /** Narrated instruction (TTS/speechSynthesis) — every level must have one. */
  narration: string;
  data: LevelDataMap[T];
}

export interface GameConfig<T extends TemplateId = TemplateId> {
  id: string;
  group: GroupId;
  title: string;
  /** Icon shown on portal cards. */
  emoji: string;
  template: T;
  /** Free demo games are fully playable without login. */
  freeDemo: boolean;
  levels: GameLevel<T>[];
}

/** Star progress per level, stored per device (Firestore sync in Fase 5). */
export type Stars = 0 | 1 | 2 | 3;
