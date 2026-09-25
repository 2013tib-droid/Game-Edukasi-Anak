# Kirim kode aktivasi OTOMATIS setelah bayar di Mayar

Sejak 2026-09-25 ada Cloud Function `mayarWebhook`. Alurnya:

1. Orang tua membayar di Mayar.
2. Mayar memberi tahu function kita (webhook).
3. Function membuat **satu kode baru** untuk pesanan itu, lalu mengirimnya ke
   **email pembeli** dari `petualangsmart@gmail.com`.

Anda tidak perlu mencetak stok kode lagi untuk penjualan lewat Mayar.
`generate-codes.mjs` tetap berguna untuk kode yang Anda bagikan sendiri
(giveaway, penguji, pembeli yang bayar lewat transfer biasa).

Persiapannya **sekali saja**, 7 langkah. Kerjakan berurutan: kalau langkah 3–4
belum selesai, deploy di langkah 5 akan gagal.

---

## 1. Buat App Password Gmail

Function mengirim email lewat akun Gmail `petualangsmart@gmail.com`. Google
tidak mengizinkan kata sandi Gmail biasa dipakai program, jadi yang dipakai
**App Password** (sandi khusus 16 huruf).

1. Masuk ke https://myaccount.google.com dengan akun `petualangsmart@gmail.com`.
2. **Keamanan → Verifikasi 2 Langkah** harus **aktif**. Kalau belum, nyalakan
   dulu. App Password tidak muncul tanpa ini.
3. Buka https://myaccount.google.com/apppasswords, beri nama `Petualangan Pintar`,
   lalu tekan **Buat**.
4. Salin 16 hurufnya. **Jangan ditempel ke chat mana pun**, termasuk ke Claude.

Gmail bisa mengirim sekitar 500 email per hari. Itu jauh di atas kebutuhan
awal; kalau suatu saat terlampaui, kita pindah ke layanan email khusus.

## 2. Buat token rahasia webhook

Token ini memastikan hanya Mayar yang bisa memicu pengiriman kode. Buka
PowerShell, lalu jalankan:

```powershell
[guid]::NewGuid().ToString('N')
```

Hasilnya 32 huruf/angka acak. Simpan sebentar di Notepad. **Jangan ditempel ke
chat.**

## 3. Simpan keduanya di Secret Manager

Repo ini PUBLIK, jadi rahasia tidak boleh ada di kode.

1. Buka https://console.cloud.google.com/security/secret-manager?project=petualangan-pintar
2. Kalau diminta, tekan **Enable** (Secret Manager API).
3. **Create secret**:
   - Name: `MAYAR_WEBHOOK_TOKEN` (persis begitu, huruf besar semua)
   - Secret value: token dari langkah 2
   - Tekan **Create secret**.
4. **Create secret** sekali lagi:
   - Name: `GMAIL_APP_PASSWORD`
   - Secret value: 16 huruf dari langkah 1 (spasi boleh ikut, nanti dibuang
     otomatis)

## 4. Beri izin ke akun deploy

Deploy harus bisa memberi function akses ke kedua secret itu.

1. Buka https://console.cloud.google.com/iam-admin/iam?project=petualangan-pintar
2. Cari service account yang dipakai GitHub Actions (yang JSON-nya ada di
   secret `FIREBASE_SERVICE_ACCOUNT`; biasanya berakhiran
   `@petualangan-pintar.iam.gserviceaccount.com`), lalu tekan ikon pensil.
3. **Add another role → Secret Manager Admin → Save**.

## 5. Deploy backend

GitHub → tab **Actions** → **Deploy backend** → **Run workflow**:
- target: `functions,firestore:rules`
- dry_run: jalankan **centang dulu** (periksa saja), lalu sekali lagi **tanpa
  centang**.

Rules juga ikut di-deploy karena ada dua koleksi baru (`orders`, `config`) yang
ditutup total dari HP.

## 6. Daftarkan URL-nya di Mayar

Syarat: KYC Mayar sudah disetujui.

1. Dasbor Mayar → **Integrasi / Integration → Webhook**.
2. Isi URL (ganti `TOKEN` dengan token dari langkah 2):

   ```
   https://asia-southeast2-petualangan-pintar.cloudfunctions.net/mayarWebhook?t=TOKEN
   ```

3. Simpan, lalu tekan tombol **Test** kalau ada. Hasil yang benar: status
   **200**. Kalau **401**, tokennya tidak sama dengan yang di Secret Manager.

## 7. Nama produk di Mayar

Function menentukan jenjang dari **nama produk**:

| Nama produk harus memuat | Jadi kode untuk |
|---|---|
| `TK` atau `Playgroup` | Playgroup dan TK |
| `SD` | SD Kelas 1 & 2 |

Nama yang disarankan sebelumnya (`Petualangan Pintar: Playgroup dan TK`,
`Petualangan Pintar: SD Kelas 1 & 2`) sudah cocok. **Jangan pakai nama yang
memuat keduanya** (misalnya paket bundel "TK + SD"): pesanan seperti itu
tidak dikirimi kode otomatis dan harus Anda tangani manual.

Kalau suatu saat mau memakai nama lain, buat dokumen di Firebase Console →
Firestore → koleksi `config` → dokumen `mayar_products`, dengan field bernama
**id produk Mayar** dan nilai `tk` atau `sd1`. Pemetaan ini selalu
diutamakan di atas nama produk, dan mengubahnya tidak perlu deploy ulang.

Ganti juga **Catatan** di kedua produk jadi:

> Terima kasih sudah membeli Petualangan Pintar! 🎉
>
> Kode aktivasi dikirim OTOMATIS ke email yang Anda isi saat membayar,
> biasanya dalam beberapa menit. Periksa juga folder Spam/Promosi.
> Belum masuk dalam 1 jam? Hubungi petualangsmart@gmail.com.

---

## Uji sekali dengan uang sungguhan

Beli produk TK sendiri pakai email lain (Rp19.000). Dalam beberapa menit
email berisi kode harus masuk. Tukarkan kodenya di `/aktivasi`, lalu pastikan
yang terbuka memang game TK.

## Memantau & menangani masalah

Semua pesanan tercatat di Firebase Console → Firestore → koleksi **`orders`**
(id dokumen = id transaksi Mayar):

| Isi dokumen | Artinya | Yang dilakukan |
|---|---|---|
| `code` terisi, `emailedAt` terisi | Beres | — |
| `code` terisi, `emailedAt` kosong | Email gagal terkirim; Mayar akan mengulang sendiri | Kalau sampai 1 jam masih kosong, kirim kode di field `code` itu secara manual |
| `problem: produk-tidak-dikenal` | Nama produk tidak memuat TK/SD | Cetak kode dengan `generate-codes.mjs`, kirim manual, lalu betulkan nama produknya |

Pembeli yang salah ketik email tidak akan menerima kodenya. Mereka biasanya
menghubungi lewat WhatsApp. Cari pesanannya di `orders` (misalnya dari nama
atau waktu bayar), lalu kirim kode yang sama dari field `code`. **Jangan buat
kode baru**, supaya satu pembayaran tetap satu kode.

## Kalau token bocor

Buat token baru (langkah 2), tambahkan sebagai **versi baru** di secret
`MAYAR_WEBHOOK_TOKEN`, deploy ulang (langkah 5), lalu ganti URL di Mayar
(langkah 6).
