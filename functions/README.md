# Cloud Functions (Fase 5)

Berisi function `redeemActivationCode`:

1. Terima `{ code }` dari client (user harus login).
2. Cari dokumen di `activation_codes`; tolak jika tidak ada / `used == true`.
3. Dalam satu transaksi: tandai `used`, `usedBy`, `usedAt`, lalu tambahkan
   kelompok ke `users/{uid}.groups`.

Belum diimplementasikan — menunggu Fase 5 (setelah engine & konten jalan).
