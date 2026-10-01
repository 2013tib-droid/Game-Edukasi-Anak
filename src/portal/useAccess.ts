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
import { fetchOwnedGroups, readOwnedHint as readHint, writeOwnedHint as writeHint } from '@/auth/entitlements';

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
 *
 * PETUNJUK TERSIMPAN (2026-10-01, laporan pemilik "gemboknya muncul 1–2 detik
 * lalu hilang"): jawaban terakhir disimpan di localStorage bersama uid-nya,
 * dan dipakai sejak gambar PERTAMA — selama Firebase masih dimuat dan
 * Firestore belum menjawab. Ini cuma TAMPILAN: gerbang sungguhan tetap di
 * `GamePage` (`useGameAccess` membaca Firestore tiap game diluncurkan), jadi
 * petunjuk yang dipalsukan dari browser tak membuka apa pun. Dihapus begitu
 * terbukti tidak ada yang masuk, dan diabaikan kalau uid-nya beda.
 */
export function useOwnedGroups(): readonly string[] {
  const { user, loading } = useAuth();
  const [groups, setGroups] = useState<readonly string[]>(() => {
    // Selagi akun belum diketahui, anggap pemilik petunjuk yang sama.
    const hint = readHint();
    if (!hint) return [];
    if (user && user.uid !== hint.uid) return [];
    return hint.groups;
  });

  useEffect(() => {
    if (loading) return; // pertahankan petunjuk sampai akun diketahui
    if (!user || !isFirebaseConfigured) {
      writeHint(null);
      setGroups([]);
      return;
    }
    const hint = readHint();
    setGroups(hint && hint.uid === user.uid ? hint.groups : []);
    let cancelled = false;
    void fetchOwnedGroups(user.uid)
      .then((owned) => {
        writeHint({ uid: user.uid, groups: owned });
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
