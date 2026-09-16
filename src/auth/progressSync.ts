/**
 * Cadangan bintang ke Firestore (Fase 6, langkah 2).
 *
 * Sebelum ini bintang cuma hidup di `localStorage`, jadi ganti HP = maskot
 * balik ke telur. Untuk produk berbayar dengan tangga maskot sampai 555 ⭐,
 * itu kehilangan yang menyakitkan.
 *
 * TIGA ATURAN YANG MENGIKAT (jangan dilonggarkan tanpa membacanya ulang):
 *
 * 1. **localStorage tetap sumber utama selagi anak main.** Modul ini hanya
 *    MENCADANGKAN. Tak satu pun jalur permainan menunggu jaringan, dan tak
 *    satu pun kegagalan jaringan bisa sampai ke layar anak — semua ditelan
 *    di sini. Anak yang main tanpa sinyal tidak kehilangan apa pun; sinkron
 *    berikutnya yang menyusul.
 *
 * 2. **GABUNGKAN, JANGAN TIMPA.** Bintang itu nilai TERBAIK per level, jadi
 *    penggabungan dua perangkat = ambil yang tertinggi per level (`mergeProgress`
 *    di `progress.ts`). Yang dikirim balik ke server juga hasil gabungan itu,
 *    bukan isi HP ini apa adanya — kalau ditimpa, anak yang main di tablet
 *    lalu di HP kehilangan bintang tabletnya.
 *
 * 3. **Satu akun = satu kumpulan bintang** (keputusan pemilik 2026-09-16).
 *    Satu akun orang tua yang dipakai dua anak berarti bintang & maskotnya
 *    digabung. Profil anak terpisah DITOLAK untuk rilis pertama: butuh layar
 *    pemilih profil di area anak (satu ketukan tambahan sebelum anak bisa
 *    main), progress & sesi dikunci per profil, dan path Firestore per profil.
 *    Kalau nanti diputuskan lain, itu migrasi tersendiri — lihat pola
 *    `migrateMergedStories()` di `progress.ts`.
 *
 * Bentuk datanya sengaja SATU DOKUMEN PER GAME, `users/{uid}/progress/{gameId}`
 * dengan `{ levels: { l1: 3, … } }` — persis path yang sudah diizinkan
 * `firestore.rules` sejak Fase 1 (`match /progress/{gameId}`). Jadi langkah ini
 * TIDAK butuh perubahan rules sama sekali, dan satu game yang ditulis tidak
 * pernah menimpa dokumen game lain.
 */
import { getFirebase, isFirebaseConfigured } from '@/auth/firebase';
import {
  getAllProgress,
  mergeProgress,
  subscribeProgress,
} from '@/engine/core/progress';

/** Jeda sebelum menulis: anak bisa menamatkan beberapa level berturut-turut. */
const PUSH_DELAY_MS = 4000;

type Levels = Record<string, number>;

/**
 * Menyalakan pencadangan untuk satu akun.
 *
 * Mengembalikan fungsi penghenti. Aman dipanggil ulang — pemanggilnya
 * (`<ProgressSync />`) memasang satu saja per uid.
 */
export function startProgressSync(uid: string): () => void {
  if (!isFirebaseConfigured) return () => undefined;

  let stopped = false;
  const dirty = new Set<string>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  /** Tarik cadangan dari server, gabungkan ke HP ini, lalu kirim balik. */
  async function pullThenPush(): Promise<void> {
    const remote = await readRemote(uid);
    if (stopped) return;

    // Gabungkan dulu, supaya yang dikirim balik sudah memuat kedua sisi.
    mergeProgress(remote);
    if (stopped) return;

    const local = getAllProgress();
    for (const [gameId, levels] of Object.entries(local)) {
      // Kirim hanya game yang di HP ini benar-benar lebih tinggi di suatu
      // level — kalau semuanya sama, tak perlu satu pun penulisan.
      if (differsFrom(remote[gameId], levels)) dirty.add(gameId);
    }
    await flush();
  }

  async function flush(): Promise<void> {
    if (stopped || dirty.size === 0) return;
    const games = [...dirty];
    dirty.clear();
    const local = getAllProgress();
    for (const gameId of games) {
      const levels = local[gameId];
      if (!levels) continue;
      try {
        await writeRemote(uid, gameId, levels as Levels);
      } catch {
        // Offline / rules menolak / kuota: kembalikan ke daftar supaya
        // dicoba lagi nanti, dan JANGAN teruskan errornya ke UI.
        if (!stopped) dirty.add(gameId);
        return;
      }
    }
  }

  function schedule(): void {
    if (stopped || timer) return;
    timer = setTimeout(() => {
      timer = null;
      void flush();
    }, PUSH_DELAY_MS);
  }

  const unsubscribe = subscribeProgress((gameId) => {
    dirty.add(gameId);
    schedule();
  });

  // Simpan yang masih tertunda saat orang tua menutup tab / pindah aplikasi.
  // `visibilitychange` (bukan `beforeunload`) — itu satu-satunya yang
  // benar-benar berjalan di browser HP.
  function onHidden(): void {
    if (document.visibilityState === 'hidden') void flush();
  }
  document.addEventListener('visibilitychange', onHidden);

  void pullThenPush().catch(() => undefined);

  return () => {
    stopped = true;
    unsubscribe();
    document.removeEventListener('visibilitychange', onHidden);
    if (timer) clearTimeout(timer);
  };
}

/** Bintang yang sudah tercadang di server, dalam bentuk `ProgressStore`. */
async function readRemote(uid: string): Promise<Record<string, Levels>> {
  try {
    const [{ db }, { collection, getDocs }] = await Promise.all([
      getFirebase(),
      import('firebase/firestore'),
    ]);
    const snap = await getDocs(collection(db, 'users', uid, 'progress'));
    const out: Record<string, Levels> = {};
    snap.docs.forEach((d) => {
      const levels = d.data().levels;
      if (levels && typeof levels === 'object') out[d.id] = levels as Levels;
    });
    return out;
  } catch {
    // Offline saat dibuka: tak ada cadangan yang bisa digabung sekarang.
    // Bukan kesalahan — permainan jalan dari localStorage seperti biasa.
    return {};
  }
}

async function writeRemote(uid: string, gameId: string, levels: Levels): Promise<void> {
  const [{ db }, { doc, serverTimestamp, setDoc }] = await Promise.all([
    getFirebase(),
    import('firebase/firestore'),
  ]);
  // `merge: true` supaya level yang cuma ada di cadangan lama tidak terhapus
  // kalau suatu saat config game berubah. Nilainya sendiri sudah hasil
  // gabungan-maksimum, jadi tak ada angka yang bisa turun.
  await setDoc(
    doc(db, 'users', uid, 'progress', gameId),
    { levels, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

/** Apakah `local` punya level yang lebih tinggi daripada cadangannya? */
function differsFrom(remote: Levels | undefined, local: Levels): boolean {
  for (const [levelId, stars] of Object.entries(local)) {
    if (stars > (remote?.[levelId] ?? 0)) return true;
  }
  return false;
}
