/**
 * Penghitung kunjungan seadanya — TANPA library apa pun (Fase 6 langkah 5,
 * keputusan pemilik 2026-09-16).
 *
 * Tanpa ini tidak akan ketahuan berapa yang membuka landing dan berapa yang
 * menekan tombolnya. Yang dikirim cuma NAMA PERISTIWA; yang bertambah di
 * server cuma angka jumlah per hari.
 *
 * ATURAN YANG MENGIKAT:
 *
 * 1. **`countVisit` JANGAN PERNAH dipanggil dari area anak** (`/portal`,
 *    `/kelompok/*`, `/game/*`); pemakainya cuma `LandingPage`. SATU-SATUNYA
 *    pengecualian adalah `countFreePlay` di bawah (keputusan pemilik
 *    2026-11-04: ingin tahu berapa yang berminat pada game gratis): hanya
 *    untuk game di `FREE_GAME_IDS`, hanya dua angka (dibuka / ditamatkan),
 *    sekali per browser per hari per game, dan Kebijakan Privasi
 *    menyebutnya. Jangan tambah penghitung lain di area anak tanpa
 *    keputusan pemilik + ubah halaman privasi di commit yang sama.
 * 2. **Nol cookie, nol pengenal pengunjung.** Tidak ada id yang dibuat, dan
 *    tidak ada apa pun tentang perangkat yang dikirim.
 * 3. **Tidak boleh pernah terasa.** `sendBeacon` menyerahkan pengiriman ke
 *    browser lalu langsung kembali; tidak ada `await`, tidak ada retry, dan
 *    setiap kegagalan ditelan. Halaman tidak pernah menunggu satu milidetik
 *    pun untuk ini.
 * 4. **Tidak ada satu pun bagian app yang boleh bergantung pada ini.** Kalau
 *    function-nya belum ter-deploy atau dibuang, semuanya tetap jalan.
 *
 * Yang dipakai `navigator.sendBeacon` dengan badan TEKS BIASA: itu permintaan
 * "sederhana" menurut CORS, jadi tidak ada preflight — dan beacon tetap
 * terkirim walaupun halamannya langsung berpindah sesudah tombol diketuk
 * (justru kasus `landing_main_click`). `fetch` biasa akan dibatalkan di situ.
 */
import { FUNCTIONS_REGION } from '@/auth/firebase';
import { FREE_GAME_IDS } from '@/data/access';

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;

/** Peristiwa yang dikenal server. Daftarnya juga ada di `functions/src/index.ts`. */
export type StatEvent =
  | 'landing_view'
  | 'landing_main_click'
  | 'landing_parent_click'
  | 'landing_buy_tk'
  | 'landing_buy_sd1'
  | 'landing_buy_sd2'
  /** Game gratis dibuka / ditamatkan — hanya lewat `countFreePlay`. */
  | `main_${string}`
  | `tamat_${string}`;

/**
 * Satu kali per browser per hari, per peristiwa.
 *
 * Bukan cuma soal hemat: yang berguna bagi pemilik adalah "berapa ORANG",
 * dan tanpa ini satu orang yang me-reload sepuluh kali terhitung sepuluh.
 * Sekalian memotong jumlah penulisan Firestore secara besar-besaran.
 *
 * Yang disimpan cuma penanda bertanggal — BUKAN pengenal pengunjung, dan
 * tidak pernah dikirim ke mana pun.
 */
function firstTimeToday(event: StatEvent): boolean {
  const key = `pp_stat_${event}`;
  const today = new Date().toISOString().slice(0, 10);
  try {
    if (localStorage.getItem(key) === today) return false;
    localStorage.setItem(key, today);
    return true;
  } catch {
    // Mode privat / storage dimatikan: biarkan terkirim. Lebih baik satu
    // angka kelebihan daripada halaman yang berhenti karena penghitung.
    return true;
  }
}

/**
 * Catat satu peristiwa. Selalu kembali seketika, dan tidak pernah melempar.
 */
export function countVisit(event: StatEvent): void {
  if (!projectId) return;
  if (!firstTimeToday(event)) return;
  try {
    const url = `https://${FUNCTIONS_REGION}-${projectId}.cloudfunctions.net/catatStat`;
    navigator.sendBeacon?.(url, new Blob([event], { type: 'text/plain;charset=UTF-8' }));
  } catch {
    // Pemblokir iklan, mode privat, offline, function belum ter-deploy —
    // semuanya tidak boleh terasa sedikit pun oleh pengunjung.
  }
}

/**
 * Minat pada game GRATIS: `main_<id>` saat game dibuka, `tamat_<id>` saat
 * ditamatkan. Sekali per browser per hari per game, tanpa pengenal apa pun —
 * aturan yang sama persis dengan `countVisit`. Game yang bukan gratis
 * diabaikan diam-diam, jadi pemanggil tak perlu memeriksanya.
 *
 * Nama peristiwanya juga harus ada di `ALLOWED_EVENTS` functions; kalau
 * `FREE_GAME_IDS` berubah, ubah daftar itu juga (lalu deploy backend) —
 * nama yang tak dikenal dibuang server tanpa efek apa pun.
 */
export function countFreePlay(gameId: string, what: 'main' | 'tamat'): void {
  if (!FREE_GAME_IDS.includes(gameId)) return;
  countVisit(`${what}_${gameId}`);
}
