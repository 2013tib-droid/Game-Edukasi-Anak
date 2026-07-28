# Cloud Functions (Fase 5)

Region **`asia-southeast2` (Jakarta)** — harus sama dengan `FUNCTIONS_REGION`
di `src/auth/firebase.ts`, kalau beda semua callable 404.

## Isi

### `redeemActivationCode({ code })`

Menukar kode aktivasi jadi akses kelompok pada akun yang sedang masuk.

1. Wajib login (`unauthenticated` kalau tidak).
2. Cek format + checksum lewat `verifyCode` — kode salah ketik ditolak
   **tanpa** menyentuh Firestore.
3. Rate limit 10 percobaan / 10 menit per akun (`redeem_attempts/{uid}`).
4. Satu transaksi: tolak kalau kode tidak ada / sudah dipakai akun lain,
   lalu tandai `used`, `usedBy`, `usedAt` + `arrayUnion` grup ke
   `users/{uid}.groups`.

**Idempotent untuk pemiliknya**: menukar ulang kode yang sudah dipakai akun
yang sama mengembalikan `alreadyOwned: true`, bukan error — orang tua sering
menekan tombol dua kali. Kode milik akun lain selalu ditolak.

### `verifyAccess({ deviceId })`

Cek akses online, dipanggil saat login **dan saat game premium diluncurkan**
(CLAUDE.md mewajibkan pengecekan saat peluncuran, bukan cuma saat login).
Sekalian mendaftarkan perangkat: maksimal 3 per akun. Perangkat yang sudah
terdaftar hanya diperbarui `lastSeenAt`-nya, jadi HP yang sama tidak pernah
memakan kuota. Mengembalikan `{ groups, deviceCount, maxDevices }`.

## `src/activation-code.ts` — satu-satunya sumber format kode

Alfabet, checksum, dan format `TK-XXXX-XXXX` ada di sini. File ini berada di
`functions/` karena Firebase hanya mengunggah folder ini saat deploy, dan
`scripts/generate-codes.mjs` meng-import-nya (Node melepas tipenya sendiri,
tanpa build step). **Jangan pernah menyalin algoritmanya ke tempat lain** —
dua salinan pasti menyimpang, dan kode yang sudah dijual jadi tidak valid.

## Menjalankan & menguji tanpa project Firebase

Emulator menerima project id berawalan `demo-`, jadi tidak perlu akun,
billing, atau kredensial apa pun:

```bash
npm --prefix functions install
npm --prefix functions run build
npm run emulators        # auth 9099, firestore 8080, functions 5001, UI 4000
npm run test:emulator    # di terminal lain
```

`test/access.test.mjs` (29 assertion) menguji kedua callable termasuk jalur
gagalnya; `test/rules.test.mjs` (13 assertion) menguji `firestore.rules` dari
sisi browser — termasuk percobaan memberi diri sendiri akses grup dan
menghapus perangkat untuk melewati batas 3.

Untuk mencoba lewat UI: isi `.env` dengan nilai demo di `.env.example`
(`VITE_USE_EMULATOR=1`), jalankan emulator + `npm run dev`, lalu seed satu
kode ke koleksi `activation_codes` via Emulator UI.

## Deploy (nanti, butuh Blaze)

```bash
firebase deploy --only functions,firestore:rules
```

`firebase.json` sudah memasang `predeploy` yang menjalankan build.
