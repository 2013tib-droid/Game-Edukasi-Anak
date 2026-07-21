import type { Stars } from '@/engine/core/types';

/**
 * Star progress, stored locally per device for now.
 * Fase 5 syncs this to users/{uid}/progress in Firestore.
 */

const KEY = 'pp_progress_v1';

interface ProgressStore {
  [gameId: string]: { [levelId: string]: Stars };
}

function load(): ProgressStore {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as ProgressStore;
  } catch {
    return {};
  }
}

export function getLevelStars(gameId: string, levelId: string): Stars {
  return load()[gameId]?.[levelId] ?? 0;
}

export function getGameStars(gameId: string): number {
  const game = load()[gameId] ?? {};
  return Object.values(game).reduce<number>((sum, s) => sum + s, 0);
}

export function saveLevelStars(gameId: string, levelId: string, stars: Stars): void {
  const store = load();
  const game = store[gameId] ?? {};
  // Keep the best result — replaying never lowers a score.
  if (stars > (game[levelId] ?? 0)) {
    game[levelId] = stars;
    store[gameId] = game;
    localStorage.setItem(KEY, JSON.stringify(store));
  }
}
