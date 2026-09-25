/**
 * Link bayar Mayar per kelompok — SATU-SATUNYA tempat link ini ditulis.
 *
 * Dipakai tombol "Beli" di kartu harga landing dan baris "Belum punya kode?"
 * di `/aktivasi`. Keduanya ada di AREA ORANG TUA. JANGAN pernah memasang link
 * ini di area anak (`/portal`, `/kelompok/*`, `/game/*`): standar UX anak
 * melarang pembelian dan link keluar di sana. Layar gembok game menaut ke
 * `/aktivasi`, bukan langsung ke sini.
 *
 * Nilai kosong = tombolnya tidak dirender sama sekali, jadi build tak pernah
 * menampilkan tombol mati.
 *
 * Pakai link PEMBAYARAN (`/pl/…`, langsung ke checkout), bukan halaman katalog
 * (`/catalog/…`): orang tua yang sudah melihat harganya di landing tidak perlu
 * melewati satu halaman produk lagi.
 *
 * Kelompok yang terbuka ditentukan webhook dari NAMA/ID produk di Mayar
 * (`mayarWebhook`), bukan dari link ini — jadi link TK harus menunjuk produk
 * yang namanya memuat "TK"/"Playgroup", link SD produk yang memuat "SD".
 */
export type SaleGroup = 'tk' | 'sd1';

export const purchaseLinks: Record<SaleGroup, string> = {
  tk: 'https://petualanganpintar.myr.id/pl/petualangan-pintar-playgroup-dan-tk',
  sd1: 'https://petualanganpintar.myr.id/pl/petualangan-pintar-sd-kelas-1-2',
};

/** Link bayar kelompok itu, atau null kalau belum diisi. */
export function buyUrl(group: SaleGroup): string | null {
  const url = purchaseLinks[group].trim();
  return url ? url : null;
}
