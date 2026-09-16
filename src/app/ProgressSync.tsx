import { useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { startProgressSync } from '@/auth/progressSync';

/**
 * Komponen tanpa tampilan: menyalakan pencadangan bintang selama ada akun
 * yang masuk (Fase 6 langkah 2).
 *
 * Dipasang di `App` di dalam `<AuthProvider>`, BUKAN di dalam `GameShell`:
 * cadangannya harus ikut berjalan saat orang tua cuma membuka portal, dan
 * tidak boleh mati begitu anak keluar dari satu game.
 *
 * Tidak merender apa pun, dan sengaja tidak punya state: kalau pencadangan
 * gagal, yang benar adalah anak tidak pernah tahu (lihat aturan di
 * `src/auth/progressSync.ts`).
 */
export default function ProgressSync() {
  const { user } = useAuth();
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return;
    return startProgressSync(uid);
  }, [uid]);

  return null;
}
