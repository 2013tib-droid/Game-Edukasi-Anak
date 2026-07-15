# Skema Akun Demo & Akses Level

Status: **FINAL** — diputuskan pemilik proyek (Juli 2026), sudah tercermin di CLAUDE.md.
Keputusan: **1 game demo per kelompok**. Level 1 game demo gratis dan **soalnya
diperbanyak** (lebih panjang dari level biasa, supaya anak benar-benar merasakan
serunya), masuk level 2 harus beli. Semua game lain terkunci penuh (`demo: 0`).

---

## 1. Prinsip

- **Demo bukan jenis akun.** Tidak ada field `isDemo`, tidak ada koleksi terpisah.
  "Akun demo" = pengunjung tanpa login, atau user login yang `access`-nya kosong.
- **Demo tanpa login.** Jangan pasang layar login sebelum anak sempat bermain.
  Progress demo disimpan di `localStorage`, dimigrasikan ke Firestore saat aktivasi.
- Aturan akses satu baris: `boleh main(level) = levelIndex < game.demo || user.access[game.group] ada`.

## 2. Skema dokumen user (tidak berubah)

```
users/{uid}
├── email: "ortu@gmail.com"
├── createdAt: <timestamp>
├── access: {
│     tk: { activatedAt: <ts>, codeId: "TK-XXXX", source: "purchase" | "trial",
│           expiresAt: <ts | null> }   // null = beli sekali (default saat ini)
│   }
├── progress: { <gameId>: { stars, levelDone, ... } }
└── devices/ (subkoleksi, maks 3 device fingerprint)
```

- `access` kosong = akun demo.
- `expiresAt` disiapkan untuk kode trial/reviewer atau model langganan di masa depan;
  model harga saat ini tetap **beli sekali per kelompok**.

## 3. Field `demo` di config game

Mengganti flag lama `freeDemo: boolean`:

```json
{
  "id": "beli-buah",
  "group": "tk",
  "title": "Beli Buah",
  "template": "hitung-ketuk",
  "demo": 1,
  "levels": ["..."]
}
```

| Nilai `demo` | Arti | Dipakai untuk |
|---|---|---|
| `1` (angka) | N level pertama gratis | **Game demo** (1 per kelompok), dengan level 1 berisi soal diperbanyak |
| `0` | Terkunci total | Semua game lain |
| `"full"` | Seluruh game gratis | Cadangan (tidak dipakai di rilis pertama) |

## 4. Pemisahan konten (anti-pembajakan)

Karena level 1 semua game gratis, hanya konten demo yang boleh ada di bundle publik:

- **Level demo** → JSON di `src/data/` + aset di `public/assets/` (boleh publik).
- **Level premium (level 2+)** → koleksi Firestore `premium_levels/{gameId}/levels/{n}`,
  aset premium di path Storage yang di-gate. Security rules: hanya bisa dibaca jika
  `request.auth != null && get(users/$(uid)).data.access[group] != null`
  (dan `expiresAt` belum lewat, jika ada).
- Validasi tetap **saat game diluncurkan** (online check), bukan hanya saat login.

## 5. Desain konversi (demo → beli)

1. **Level 1 = kualitas penuh dan LEBIH GEMUK dari level biasa.** Soal
   diperbanyak (mis. level premium 8–10 soal → level 1 demo 15–20 soal dengan
   variasi pengecoh sesuai aturan desain soal), lengkap dengan narasi TTS,
   konfeti, bintang 3, maskot menari. Puncak keseruan ditaruh di akhir level 1.
2. **Cliffhanger visual.** Setelah menang, peta level menampilkan level 2–3
   *terlihat* (thumbnail berwarna, item misterius "?") tetapi tergembok — jangan
   disembunyikan. Game lain yang terkunci juga tampil di portal sebagai kartu
   tergembok yang menggoda.
3. **Teaser maskot.** Siluet evolusi maskot berikutnya hanya terbuka di versi penuh.
4. **CTA lewat gerbang orang tua.** Di area anak hanya "Minta bantuan Ayah/Bunda 🔒".
   Harga, tombol beli, dan link Lynk.id/Mayar.id hanya muncul setelah gerbang
   orang tua. Tidak ada harga/link beli di layar anak.

## 6. Akun demo full-access (reviewer / konten TikTok)

Tidak ada jenis akun baru. Generate kode aktivasi bertipe trial di
`activation_codes`:

```
activation_codes/{codeId}
├── code: "TRIAL-XXXX"
├── group: "tk"
├── type: "purchase" | "trial"
├── expiresAt: <ts>          // hanya untuk trial
├── used: false
├── usedBy / usedAt
```

Cloud Function yang sama memproses semuanya; untuk trial ia menulis
`access.tk = { source: "trial", expiresAt }`. Pengecekan saat peluncuran game
menolak entry yang `expiresAt`-nya sudah lewat.
