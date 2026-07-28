import type { AnyGameConfig, Stars } from '@/engine/core/types';

/**
 * "Lanjutkan permainan": the point a child stopped at inside one game, so
 * coming back the next day resumes at that level instead of restarting from
 * level 1. Stored per device (Firestore sync lands with the rest of the
 * progress data in Fase 5).
 *
 * Only the *picks* are stored, never whole level objects: a pick is
 * `{ s: slot index in config.levels, v: variant index inside that slot }`.
 * Rebuilding levels from the config keeps saved sessions tiny and means an
 * updated config never resurrects stale question data.
 */

const KEY = 'pp_session_v1';

/** One resolved slot of a playthrough. */
export interface LevelPick {
  /** Index into `config.levels`. */
  s: number;
  /** Index into the slot's variant pool (0 for a single-level slot). */
  v: number;
}

export interface SavedSession {
  /** The level list of the interrupted playthrough, in play order. */
  picks: LevelPick[];
  /** Which level to resume at (always >= 1: nothing to resume at level 1). */
  index: number;
  /** Stars already earned in this playthrough, one per finished level. */
  earned: Stars[];
  /** Saved-at timestamp (ms) — for "terakhir main" copy later. */
  at: number;
}

interface SessionStore {
  [gameId: string]: SavedSession;
}

function load(): SessionStore {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as SessionStore;
  } catch {
    return {};
  }
}

function save(store: SessionStore): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Storage full or blocked (private mode): resuming is a bonus, never fatal.
  }
}

/** Does this pick list still make sense for the config as it is today? */
function isValid(config: AnyGameConfig, session: SavedSession | undefined): session is SavedSession {
  if (!session || !Array.isArray(session.picks) || session.picks.length === 0) return false;
  if (!Number.isInteger(session.index)) return false;
  if (session.index < 1 || session.index >= session.picks.length) return false;
  if (!Array.isArray(session.earned)) return false;
  return session.picks.every((p) => {
    const slot = (config.levels as unknown[])[p?.s ?? -1];
    if (!slot) return false;
    const size = Array.isArray(slot) ? slot.length : 1;
    return Number.isInteger(p.v) && p.v >= 0 && p.v < size;
  });
}

/**
 * The saved mid-game state for this game, or null when there is nothing to
 * resume (never played, already finished, or the config changed underneath).
 */
export function getSession(config: AnyGameConfig): SavedSession | null {
  const session = load()[config.id];
  if (!isValid(config, session)) return null;
  return session;
}

export function saveSession(gameId: string, session: Omit<SavedSession, 'at'>): void {
  const store = load();
  store[gameId] = { ...session, at: Date.now() };
  save(store);
}

/** Drop the saved point — the game was finished or restarted from the top. */
export function clearSession(gameId: string): void {
  const store = load();
  if (!(gameId in store)) return;
  delete store[gameId];
  save(store);
}
