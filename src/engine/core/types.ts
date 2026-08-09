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
  | 'spell' // eja/susun huruf jadi kata (dari game Petualangan Pintar)
  | 'path-trace'; // susuri jalan dengan jari (antar kendaraan ke tujuan)

/* ---------- Per-template level payloads ---------- */

/**
 * Geometric shape ids (ported from SHAPES in petualangan-pintar.html). Used
 * by the Labirin Warna world, where cards are colored geometric shapes rendered
 * as SVG — emoji can't cover every shape×color combination.
 */
export type ShapeId =
  | 'lingkaran'
  | 'kotak'
  | 'segitiga'
  | 'bintang'
  | 'hati'
  | 'oval'
  | 'ketupat'
  // Extra bangun datar so the world doesn't keep asking about the same seven.
  | 'persegi-panjang'
  | 'trapesium'
  | 'segilima'
  | 'segienam'
  | 'layang-layang'
  | 'bulan'
  | 'awan';

/** A single colored shape: which shape + its fill color (hex). */
export interface ShapeSpec {
  kind: ShapeId;
  /** Fill color as hex, e.g. "#EF5350". */
  color: string;
}

/**
 * A time on an analog clock face, drawn as SVG by `src/engine/ui/Clock.tsx`.
 * `h` is 1–12 (12-hour face), `m` is 0–59 (only 0 and 30 are used today).
 * The clock-face emoji (🕐–🕧) are NOT an option: they carry no numerals, so
 * a child can't actually read them.
 */
export interface ClockSpec {
  h: number;
  m?: number;
}

export interface TapChoice {
  id: string;
  /** Big visual — emoji for now, later an image asset path. */
  emoji?: string;
  /**
   * Item id from the picture registry (`src/engine/ui/items.ts`) — real art
   * (WebP) on the answer card instead of the device emoji font. `emoji` stays
   * as the fallback if the asset is missing.
   */
  item?: string;
  text?: string;
  /** Colored geometric shape drawn as SVG (Labirin Warna). */
  shape?: ShapeSpec;
  /** Analog clock face with numerals drawn as SVG (Jam Pintar). */
  clock?: ClockSpec;
  correct?: boolean;
}

/** Operator symbols usable between item groups on a picture board. */
export type BoardOp = 'plus' | 'minus' | 'equals' | 'arrow' | 'question';

/**
 * One token of a picture board (`TapAnswerData.boardItems`): either a run of
 * `count` copies of the same item picture, or a single operator symbol.
 */
export type BoardItemToken =
  | { item: string; count: number }
  | { op: BoardOp };

export interface TapAnswerData {
  /**
   * Optional big picture cue shown above the choices — e.g. "🚀" for a
   * "which first letter?" question. Emoji for now, later an image path.
   */
  picture?: string;
  /**
   * Item id (registry `src/engine/ui/items.ts`) drawn as the big picture cue
   * instead of `picture` — real premium art rather than the device emoji
   * font. Falls back to the item's emoji if the image is missing.
   */
  pictureItem?: string;
  /**
   * Render `picture` as a dark silhouette (Pasar Buah "guess the shadow").
   * The child sees only the outline and taps the matching fruit below.
   */
  silhouette?: boolean;
  /**
   * Optional visual board shown above the choices, e.g. a word with a
   * blank ("_OKET"). Plain text/emoji — the config author composes it.
   * For a board of countable *pictures* (animals, fruit…) prefer
   * `boardItems` below, which renders real image assets instead of the
   * device emoji font.
   */
  board?: string;
  /**
   * Structured picture board: each token is either a group of `count`
   * identical item pictures (looked up by `item` id in the item registry,
   * `src/engine/ui/items.ts`, and rendered from `public/assets/items/`) or
   * an `op` symbol for equation boards ("panda ×3  +  panda ×3  =  ?").
   * When present it is rendered instead of `board`. Falls back to the
   * item's emoji if its image is missing, so configs work before art ships.
   */
  boardItems?: BoardItemToken[];
  /**
   * Written sum shown as one line under the picture board ("3 + 3 = ?").
   * Use it on EQUATION boards (addition/subtraction) so the child meets the
   * number symbols next to the pictures they just counted — never on a plain
   * "count these" board, where the numerals would be the answer itself.
   */
  equation?: string;
  /**
   * Optional shape pattern shown above the choices (Labirin Warna "Pola
   * Ajaib"): a repeating ABAB / ABC-ABC sequence where `null` is the empty
   * "?" box the child must fill by picking the next shape.
   */
  sequence?: (ShapeSpec | null)[];
  /**
   * Big analog clock cue shown above the choices (Jam Pintar "pukul berapa
   * ini?"). Drawn with numerals by `Clock.tsx` — see `ClockSpec`.
   */
  clock?: ClockSpec;
  choices: TapChoice[]; // 2–4, exactly one with correct: true
}

export interface DragItem {
  id: string;
  emoji?: string;
  /**
   * Item id from the picture registry (`src/engine/ui/items.ts`) — real art
   * (WebP) instead of the device emoji font. `emoji` stays as the fallback.
   */
  item?: string;
  text?: string;
  /** id of the target this item belongs to */
  targetId: string;
}

export interface DragTarget {
  id: string;
  emoji?: string;
  /** Item id from the picture registry — see `DragItem.item`. */
  item?: string;
  label: string;
}

export interface DragDropData {
  targets: DragTarget[];
  items: DragItem[];
  /**
   * The picture inside each target IS the question — "which word belongs to
   * this cat?" (Pasang Kata) — so it is drawn big, like a tap-answer cue.
   * Leave it off when the target picture is only a label the child reads past,
   * e.g. the colored dot on a Pasar Buah basket: enlarging those would crowd
   * out the basket's name and push a four-basket level off a small phone.
   */
  pictureTargets?: boolean;
}

export interface TracingData {
  /** Single character to trace, e.g. "3" or "A". */
  glyph: string;
}

export interface MemoryPair {
  id: string;
  emoji: string;
  /**
   * Item id from the picture registry (`src/engine/ui/items.ts`). When set the
   * card face shows the real art (WebP) instead of the device emoji font;
   * `emoji` stays as the fallback if the asset is missing.
   */
  item?: string;
}

export interface MemoryData {
  pairs: MemoryPair[]; // 3–6 pairs
}

export interface CountTapData {
  /** How many the child must tap ("Ketuk 4 apel"). */
  ask: number;
  /** `item` = picture-registry id (real art); `emoji` is the fallback. */
  target: { emoji: string; label: string; item?: string };
  /**
   * How many target items to show — MUST be greater than `ask` so the
   * child has to stop counting at the asked number (design rule).
   */
  targetCount: number;
  /** 2–3 decoy item kinds mixed in (design rule: never monotone). */
  decoys: { emoji: string; count: number; item?: string }[];
}

export interface StoryPage {
  emoji?: string;
  /**
   * Item id (registry `src/engine/ui/items.ts`) drawn as the page picture
   * instead of `emoji` — real art instead of the device emoji font. Same rule
   * as everywhere else: if the page is about an ANIMAL and art exists, use it.
   * `emoji` stays as the fallback.
   */
  item?: string;
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
   * Item id (registry `src/engine/ui/items.ts`) drawn as the picture cue
   * instead of `emoji` — real art instead of the device emoji font.
   */
  item?: string;
  /**
   * Decoy letters mixed into the tray (design rule: never monotone — the
   * child must pick the right letters, not just tap everything in sight).
   * Should NOT already appear in `word`.
   */
  decoys: string[];
}

/**
 * Road shapes the `path-trace` template can draw. The geometry lives in the
 * engine (`src/engine/templates/PathTrace.tsx`); a config only names the shape
 * so level data stays plain data.
 */
export type RoadKind =
  | 'lurus' // garis lurus (paling mudah)
  | 'bukit' // bukit-bukit melengkung
  | 'gelombang' // ombak naik-turun
  | 'zigzag' // patah-patah tajam
  | 'tangga' // anak tangga (belok siku)
  | 'lengkung' // huruf U
  | 'ess'; // huruf S

export interface RoadSpec {
  kind: RoadKind;
  /**
   * How many repeats for shapes that repeat (bukit, gelombang, zigzag,
   * tangga) — more repeats = jalan lebih panjang & sulit. Default 3.
   */
  steps?: number;
}

export interface PathTraceData {
  road: RoadSpec;
  /** Vehicle emoji driven along the road, e.g. "🚗". */
  vehicle: string;
  /**
   * Item id (registry `src/engine/ui/items.ts`) drawn as the vehicle instead
   * of the emoji — real art when the assets ship. Falls back to `vehicle`.
   */
  vehicleItem?: string;
  /** Emoji at the end of the road (rumah, sekolah, garis finis…). */
  goal?: string;
  /**
   * Item id (registry `src/engine/ui/items.ts`) drawn as the destination
   * instead of the emoji — real art (rumah, sekolah, rumah sakit…). Falls
   * back to `goal`.
   */
  goalItem?: string;
}

export interface LevelDataMap {
  'tap-answer': TapAnswerData;
  'drag-drop': DragDropData;
  tracing: TracingData;
  memory: MemoryData;
  'count-tap': CountTapData;
  'story-choice': StoryChoiceData;
  spell: SpellData;
  'path-trace': PathTraceData;
}

/* ---------- Game config ---------- */

/**
 * How a level shows up on the level picker (see `GameConfig.chooseLevel`).
 * The card needs a SHORT title: `narration` is a full spoken sentence
 * ("Timun Mas. Ayo bantu Timun Mas pulang dengan selamat!") and would not fit.
 */
export interface LevelCard {
  /** Judul pendek di kartu, mis. "Timun Mas". */
  label: string;
  emoji?: string;
  /** Item id (registry `src/engine/ui/items.ts`) — art instead of the emoji. */
  item?: string;
}

/**
 * Turn the game's opening screen into a LEVEL PICKER: every level is shown as
 * a card and the child chooses which one to play (owner's decision 2026-08-09
 * for the story games — the six titles are on screen from the start instead of
 * two being drawn at random).
 *
 * Rules for a game that uses it:
 * - every slot must be ONE level (no variant pools) carrying a `card`,
 * - level ids must be unique — the picker shows the stars earned per level,
 * - `sessionLevels` is ignored: one pick = one level.
 */
export interface LevelPicker {
  /** Ajakan di atas kartu-kartu, mis. "Pilih ceritamu!". */
  title: string;
  /** Tombol di layar selesai. Bawaan: "🔁 Pilih Lagi". */
  again?: string;
}

export interface GameLevel<T extends TemplateId = TemplateId> {
  id: string;
  /** Narrated instruction (TTS/speechSynthesis) — every level must have one. */
  narration: string;
  /** Only for games with `chooseLevel` — how this level looks on the picker. */
  card?: LevelCard;
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
  /**
   * Ordered slots; a slot may be one level or a pool of random variants.
   *
   * NOTE: free/locked status is NOT declared per game any more — it lives in
   * `src/data/access.ts` (`FREE_GAME_IDS` + lock mode) so there is one place
   * to flip. See CLAUDE.md "Sistem Kunci Game".
   */
  levels: LevelSlot<T>[];
  /**
   * Play only this many slots per session, drawn at random (no repeats) and
   * in random order — e.g. a game holding all numbers 1–20 but asking 7 of
   * them each play. Omit (or >= levels.length) to play every slot in order.
   */
  sessionLevels?: number;
  /** Let the child pick the level from a card grid — see `LevelPicker`. */
  chooseLevel?: LevelPicker;
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
    /** See `GameLevel.card` — only used by games with `chooseLevel`. */
    card?: LevelCard;
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
  /** Free/locked status: see `src/data/access.ts` (not declared per game). */
  levels: MixedSlot[];
  /** See `GameConfig.sessionLevels`. */
  sessionLevels?: number;
  /** See `GameConfig.chooseLevel`. */
  chooseLevel?: LevelPicker;
}

/** Either kind of game — what the shell, registry, and pages accept. */
export type AnyGameConfig = GameConfig | MixedGameConfig;

/** Star progress per level, stored per device (Firestore sync in Fase 5). */
export type Stars = 0 | 1 | 2 | 3;
