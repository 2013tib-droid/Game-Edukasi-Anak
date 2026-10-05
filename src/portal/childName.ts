/**
 * Nama sapaan anak — OPSIONAL, diisi orang tua di menu Akun (`/aktivasi`),
 * dipakai sapaan "Halo, <nama>!" di layar mata pelajaran. Kosong = "Halo,
 * Petualang!" (keputusan pemilik 2026-10-05).
 *
 * SENGAJA HANYA DI HP INI (localStorage), TIDAK dikirim ke Firestore: Kebijakan
 * Privasi berjanji tidak ada data anak yang masuk server kami, dan nama sapaan
 * tidak butuh server untuk berguna. Konsekuensinya: ganti HP = isi lagi.
 * Kalau suatu saat ingin ikut tersinkron, halaman privasi WAJIB diubah di
 * commit yang sama.
 *
 * Dihapus saat orang tua menekan "Keluar" — HP yang dipakai berdua tidak boleh
 * menyapa anak orang lain.
 */
const KEY = 'pp_child_name_v1';
export const CHILD_NAME_MAX = 20;

/** Rapikan masukan: spasi berlebih dibuang, dipotong ke batas panjang. */
export function cleanChildName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, CHILD_NAME_MAX).trim();
}

export function readChildName(): string {
  try {
    return cleanChildName(localStorage.getItem(KEY) ?? '');
  } catch {
    return '';
  }
}

export function writeChildName(name: string): void {
  try {
    const clean = cleanChildName(name);
    if (clean) localStorage.setItem(KEY, clean);
    else localStorage.removeItem(KEY);
  } catch {
    /* mode privat / penyimpanan penuh — sapaan cuma kemudahan */
  }
}

/** Kalimat sapaan yang tampil di layar anak. */
export function greeting(): string {
  return `Halo, ${readChildName() || 'Petualang'}!`;
}
