import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  getLockMode,
  isGameUnlocked,
  isTestMode,
  subscribeAccess,
  type LockMode,
} from '@/data/access';
import { useAuth } from '@/auth/AuthContext';
import { isFirebaseConfigured } from '@/auth/firebase';
import { fetchOwnedGroups } from '@/auth/entitlements';

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

/**
 * Kelompok yang sudah dibeli akun ini — dipakai untuk menentukan gembok di
 * daftar game. Kalau gagal dibaca (offline), kembalikan daftar kosong: lebih
 * baik gemboknya terlihat padahal sudah dibeli (satu ketukan lagi akan
 * memeriksa ulang di `GamePage`) daripada menjanjikan game yang tak terbuka.
 */
export function useOwnedGroups(): readonly string[] {
  const { user, loading } = useAuth();
  const [groups, setGroups] = useState<readonly string[]>([]);

  useEffect(() => {
    if (loading || !user || !isFirebaseConfigured) {
      setGroups([]);
      return;
    }
    let cancelled = false;
    void fetchOwnedGroups(user.uid)
      .then((owned) => {
        if (!cancelled) setGroups(owned);
      })
      .catch(() => {
        if (!cancelled) setGroups([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  return groups;
}
