import { useSyncExternalStore } from 'react';
import {
  getLockMode,
  isGameUnlocked,
  isTestMode,
  subscribeAccess,
  type LockMode,
} from '@/data/access';

/** Mode kunci yang berlaku; komponen ikut render ulang saat saklar diubah. */
export function useLockMode(): LockMode {
  return useSyncExternalStore(subscribeAccess, getLockMode, () => getLockMode());
}

/** Apakah game boleh dimainkan sekarang (ikut berubah saat saklar diubah). */
export function useGameUnlocked(gameId: string | undefined): boolean {
  const mode = useLockMode();
  // `mode` cuma pemicu render; keputusan tetap di satu tempat (access.ts).
  void mode;
  return gameId ? isGameUnlocked(gameId) : false;
}

/** Saklar penguji hanya tampil kalau mode penguji aktif. */
export function useTestMode(): boolean {
  return useSyncExternalStore(subscribeAccess, isTestMode, () => isTestMode());
}
