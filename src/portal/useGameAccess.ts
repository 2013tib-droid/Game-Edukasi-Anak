import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { isFirebaseConfigured } from '@/auth/firebase';
import {
  errorCode,
  errorDetails,
  fetchDevices,
  fetchOwnedGroups,
  getDeviceId,
  registerDevice,
  type DeviceInfo,
} from '@/auth/entitlements';
import { isGameUnlocked } from '@/data/access';

export type GameAccess =
  | { status: 'memeriksa' }
  | { status: 'boleh' }
  | { status: 'perlu-masuk' }
  | { status: 'perlu-aktivasi' }
  | { status: 'perangkat-penuh'; devices: DeviceInfo[]; max: number }
  | { status: 'gagal'; message: string };

/** Perangkat yang sudah terlihat hari ini tidak perlu didaftarkan ulang. */
const SEEN_KEY = 'pp_device_seen_v1';
const SEEN_TTL_MS = 24 * 60 * 60 * 1000;

function seenRecently(): boolean {
  try {
    const at = Number(localStorage.getItem(SEEN_KEY));
    return Number.isFinite(at) && Date.now() - at < SEEN_TTL_MS;
  } catch {
    return false;
  }
}

function markSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, String(Date.now()));
  } catch {
    /* mode privat — tidak apa-apa, cuma mendaftar ulang lebih sering */
  }
}

/**
 * Pemeriksaan akses SAAT GAME DILUNCURKAN (bukan cuma saat login) — ini yang
 * diminta CLAUDE.md, supaya akses yang dicabut langsung terasa.
 *
 * Game gratis dan masa pra-rilis (mode 'buka') tidak menyentuh jaringan sama
 * sekali: anak yang membuka Hutan Hewan tidak boleh menunggu satu pun
 * permintaan online.
 */
export function useGameAccess(gameId: string | undefined, group: string | undefined): {
  access: GameAccess;
  recheck: () => void;
} {
  const { user, loading } = useAuth();
  const [access, setAccess] = useState<GameAccess>({ status: 'memeriksa' });
  const [attempt, setAttempt] = useState(0);

  const recheck = useCallback(() => {
    setAccess({ status: 'memeriksa' });
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!gameId || !group) return;

    // Terbuka untuk semua: tanpa login, tanpa jaringan.
    if (isGameUnlocked(gameId)) {
      setAccess({ status: 'boleh' });
      return;
    }

    if (!isFirebaseConfigured) {
      setAccess({
        status: 'gagal',
        message: 'Aplikasi belum tersambung ke server. Coba lagi nanti ya.',
      });
      return;
    }

    if (loading) {
      setAccess({ status: 'memeriksa' });
      return;
    }

    if (!user) {
      setAccess({ status: 'perlu-masuk' });
      return;
    }

    let cancelled = false;
    setAccess({ status: 'memeriksa' });

    void (async () => {
      try {
        const owned = await fetchOwnedGroups(user.uid);
        if (cancelled) return;

        if (!owned.includes(group)) {
          setAccess({ status: 'perlu-aktivasi' });
          return;
        }

        // Kelompoknya dimiliki — tinggal pastikan perangkat ini termasuk yang
        // terdaftar. Dibaca dulu (murah) supaya peluncuran game tidak selalu
        // menunggu panggilan Cloud Function.
        const devices = await fetchDevices(user.uid);
        if (cancelled) return;
        const mine = devices.some((d) => d.id === getDeviceId());

        if (mine) {
          setAccess({ status: 'boleh' });
          // Perbarui "terakhir dipakai" di latar, jangan ditunggu — itu cuma
          // untuk membantu orang tua memilih perangkat mana yang dilepas.
          if (!seenRecently()) {
            void registerDevice()
              .then(markSeen)
              .catch(() => undefined);
          }
          return;
        }

        await registerDevice();
        if (cancelled) return;
        markSeen();
        setAccess({ status: 'boleh' });
      } catch (e) {
        if (cancelled) return;
        if (errorCode(e) === 'functions/resource-exhausted') {
          const details = errorDetails<{ devices?: DeviceInfo[]; max?: number }>(e);
          setAccess({
            status: 'perangkat-penuh',
            devices: details?.devices ?? [],
            max: details?.max ?? 3,
          });
          return;
        }
        setAccess({
          status: 'gagal',
          message: 'Tidak bisa memeriksa akses. Periksa koneksi internetnya ya.',
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [gameId, group, user, loading, attempt]);

  return { access, recheck };
}
