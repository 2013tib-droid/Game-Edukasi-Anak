# Fase 6 — yang perlu diuji di HP, dan apa yang tersisa

Catatan kerja per **21 September 2026**. Dibuat supaya bisa dibaca dari HP.

Dokumen pendampingnya: `docs/fase-6-rilis-prompt.md` (rencana lengkap) dan
bagian "Status Pengerjaan" di `CLAUDE.md` (keputusan & jebakan).

---

## 1. Ringkasan: di mana kita sekarang

**Fase 6 Bagian B langkah 2–5 SELESAI dan SUDAH TAYANG.** Yang tersisa cuma
langkah 1 (uji pakai kode asli — butuh HP Anda) lalu langkah 6 (nyalakan
mode terkunci).

Sudah beres dan sudah di web:

- **Bintang ikut dicadangkan ke Firestore.** Ganti HP tidak lagi membuat
  maskot balik ke telur. Bintang dua perangkat digabung dengan mengambil
  yang tertinggi per level — tidak ada yang bisa hilang.
- **Halaman Kebijakan Privasi + Syarat & Ketentuan + aturan refund.**
- **Verifikasi email** jadi syarat menukar kode (bukan syarat main).
- **Penghitung kunjungan** tanpa cookie, tanpa library, nol pelacak di area
  anak.
- **Label "GRATIS"** di kartu game — ternyata selama ini belum pernah ada di
  kode, padahal catatan lama menyebutnya.

Sudah beres di sisi server:

- Provider **Email/Password aktif** (sebelumnya mati — itu yang memblokir
  semuanya).
- Backend ter-deploy: **4 functions** di `asia-southeast2` —
  `redeemActivationCode`, `registerDevice`, `removeDevice`, dan `catatStat`
  yang baru.

---

## 2. TUGAS ANDA: uji kode asli di HP (±5 menit)

Mode kunci masih `'buka'`, jadi semua game terbuka dan gemboknya belum akan
muncul — itu normal, **bukan** yang sedang diuji di sini. Yang diuji: apakah
kode asli benar-benar laku di backend sungguhan.

Buka tautan ini di HP (**muat ulang keras dulu** — HP sering menyimpan versi
lama):

<https://2013tib-droid.github.io/Game-Edukasi-Anak/app/#/daftar>

Lalu:

- [ ] **1. Daftar** pakai email yang benar-benar bisa Anda buka di HP itu.
      Ini kuncinya, karena sekarang ada gerbang verifikasi.
- [ ] **2.** Layar **"Verifikasi email dulu ya"** muncul. Buka emailnya,
      ketuk tautannya. Pengirimnya `noreply@petualangan-pintar.firebaseapp.com`
      — **cek folder spam**, di situ tempat biasanya mendarat.
- [ ] **3.** Balik ke aplikasi, ketuk **"✅ Saya sudah verifikasi"**. Form
      kode harus muncul dengan sendirinya.
- [ ] **4.** Masukkan **satu** kode asli. Harus muncul **"Berhasil!"** yang
      menyebut *Playgroup dan TK*.
- [ ] **5.** Masukkan kode yang **sama** sekali lagi. Harus berbunyi
      **"Sudah aktif!"**, bukan error. Itu bukti kepemilikannya benar-benar
      tertulis di akun Anda.

### Peringatan

- **Pakai SATU kode saja.** Sekali pakai, terikat permanen ke akun yang
  memakainya. Sisakan kode kedua sebagai cadangan.
- Huruf besar/kecil dan tanda hubung tidak masalah saat mengetik kode.
- Kalau salah kode 10× dalam sejam, akun itu direm sementara — itu memang
  rem anti-tebak, bukan kerusakan.

### Yang perlu dilaporkan balik

Cukup sebut nomor langkah yang tidak sesuai, dan apa yang muncul di layar:

- email verifikasi tidak datang sama sekali?
- sudah ketuk tautannya tapi tombol "Saya sudah verifikasi" tidak
  mengubah apa pun?
- kode ditolak? (tempel pesan merahnya apa adanya)
- langkah 5 memberi error, bukan "Sudah aktif!"?

Kalau kelimanya lancar, tulis saja **"lancar semua"**.

---

## 3. Sesudah itu: langkah 6 (tugas Claude)

Hanya setelah nomor 2 di atas lolos:

1. `DEFAULT_LOCK_MODE` di `src/data/access.ts` → `'kunci'`.
2. Build produksi **TANPA** `VITE_ALLOW_TEST_TOGGLE` — kalau ikut terbawa,
   pembeli bisa membuka semua game sendiri.
3. Deploy dengan `SITE_URL=https://<domain>/` supaya gambar pratinjau link
   WhatsApp/TikTok tidak menarik dari domain lama.
4. Verifikasi akhir: `/kelompok/tk` & `/kelompok/sd1` — **masing-masing
   tepat SATU game** tanpa gembok dan berlabel GRATIS: **Hutan Hewan** di TK,
   **Tulis Huruf** di SD.

   Catatan: langkah ini dulu tertulis "hanya Hutan Hewan", yang keliru —
   kalau diikuti apa adanya, SD rilis tanpa demo sama sekali. `FREE_GAME_IDS`
   sudah diisi 2026-09-22, jadi langkah 1 di atas benar-benar satu baris.

---

## 4. Yang masih menunggu keputusan Anda

- **Jangka waktu refund 7 hari** di halaman Syarat & Ketentuan bagian 8 itu
  usulan Claude, **bukan keputusan Anda**. Mohon dibaca sekali. Halamannya
  juga sudah menyatakan terang bahwa isinya bukan nasihat hukum.
- **Landing belum punya tombol beli sama sekali.** Orang tua yang sudah yakin
  mau bayar tidak punya jalan dari halaman itu — harus japri Anda. Ini
  penghalang jualan yang menurut Claude lebih besar daripada mode terkunci.
  Kalau Anda kirim **link produk Lynk.id / Mayar.id untuk TK dan SD**,
  tombolnya dipasang di kartu harga sekalian dihitung kliknya (penghitungnya
  sudah siap, tinggal satu nama peristiwa baru).
- Sisa Fase 6 yang belum disentuh: **build demo itch.io** dan **sanity test
  di Android asli**.

---

## 5. Yang TIDAK bisa diverifikasi dari sesi Claude

Supaya tidak ada yang dikira sudah terbukti padahal belum:

- **Halaman live `github.io` tidak bisa dibuka** dari sesi Claude (diblokir
  kebijakan jaringan, 403). Yang sudah dibuktikan: isi branch Pages lewat
  git, dan uji headless pada build deploy yang sama persis di komputer.
  **Tampilan di HP sungguhan tetap perlu mata Anda.**
- **Alur pembeli dengan kode ASLI belum pernah dijalankan.** Yang sudah
  diuji ujung-ke-ujung adalah Firebase Emulator dengan kode uji buatan
  sendiri — itu membuktikan kodenya benar, bukan bahwa 2 kode asli Anda
  laku. Itulah tugas nomor 2 di atas.
- **Suara dan bunyi tidak bisa dinilai** dari sesi Claude; hanya bisa
  dipastikan berkasnya termuat dan diputar.

---

## 6. Catatan teknis singkat (kalau ada yang penasaran)

- Mode kunci masih `'buka'` **dengan sengaja**. Menyalakannya sebelum kode
  asli terbukti laku berarti mempertaruhkan pembeli mentok di layar gembok
  padahal sudah membayar.
- Verifikasi email diperiksa **di server** (klaim `email_verified` di dalam
  ID token), jadi tidak bisa dilewati dari HP. Dan **sengaja hanya** untuk
  aktivasi kode — bermain dan masuk akun tidak pernah menunggu verifikasi.
- Penghitung kunjungan menyimpan **angka jumlah per hari** saja. Endpoint-nya
  publik, jadi angkanya bisa dinaikkan siapa pun yang tahu URL-nya: ini angka
  penunjuk arah, **bukan data penagihan**.
