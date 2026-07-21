# CLAUDE.md — Platform Game Edukasi Anak Indonesia

## Ringkasan Proyek

Platform web berbayar berisi kumpulan mini-game edukasi untuk anak Indonesia, dijual per kelompok jenjang. Dibuat oleh kreator individu (solo dev), target pasar B2C: orang tua di Indonesia yang mengakses lewat **HP Android dan tablet**.

**Peran Claude Code:** membangun SEMUANYA — portal web + auth, migrasi game yang sudah ada, dan template/engine game agar penambahan konten cepat.

## Keputusan Produk (SUDAH FINAL — jangan diubah tanpa konfirmasi)

| Aspek | Keputusan |
|---|---|
| Scope rilis pertama | 2 kelompok: **TK (5–7 th)** dan **SD Awal (kelas 1–2)** |
| Jumlah game | 10–15 mini-game per kelompok (kualitas premium) |
| Platform | Web app: **React (Vite) + TypeScript + Firebase** (Auth, Firestore, Hosting) |
| Bahasa pemrograman | **TypeScript strict** untuk seluruh app & engine — config game type-safe (typo field ketahuan saat build, bukan saat anak main). Game lama `petualangan-pintar.html` tetap vanilla JS sampai Fase 3 |
| Perangkat target | HP Android & tablet — mobile-first, touch-first |
| Demo gratis | 1–2 game gratis PENUH per kelompok (tanpa login) |
| Aset | Gambar AI-generated + narasi TTS Bahasa Indonesia |
| Harga | Naik per jenjang: TK ± Rp29rb, SD Awal ± Rp39rb (selalu < Rp50rb) |
| Update | Beli sekali = bugfix gratis; konten besar baru = ekspansi berbayar |
| Penjualan | Lynk.id / Mayar.id (QRIS, e-wallet) + itch.io untuk showcase demo |
| Promosi | TikTok/Reels organik |

## Sistem Akses (Anti-Pembajakan)

Prinsip: **jual AKSES, bukan file.** Game hanya bisa dimainkan setelah login dan validasi online.

Alur pembeli:
1. Beli kelompok di Lynk.id/Mayar.id → menerima **kode aktivasi unik** (dikirim otomatis oleh platform penjualan sebagai "produk digital" berupa kode).
2. Buka portal → daftar/login dengan **Firebase Auth (email + password)**.
3. Masukkan kode aktivasi → Cloud Function memvalidasi kode di Firestore → tandai kode terpakai → set klaim akses kelompok di dokumen user.
4. Game kelompok itu terbuka untuk akun tersebut.

Aturan teknis:
- Kode aktivasi: sekali pakai, disimpan di koleksi `activation_codes` (field: `code`, `group`, `used`, `usedBy`, `usedAt`). Generate batch kode via script.
- **Batas perangkat: maksimal 3 device** per akun (simpan device fingerprint sederhana di `users/{uid}/devices`).
- Validasi akses dilakukan **saat game diluncurkan** (online check), bukan hanya saat login.
- Konten game premium TIDAK boleh ter-bundle di JS publik. Lazy-load per game, dan gate di level route + Firestore security rules.
- Firestore Security Rules wajib ketat: user hanya bisa baca dokumen miliknya; kode aktivasi hanya bisa diproses lewat Cloud Function.

## Arsitektur & Struktur Folder

```
/
├── CLAUDE.md
├── src/
│   ├── app/                  # routing, layout, splash
│   ├── auth/                 # login, register, aktivasi kode, device limit
│   ├── portal/               # beranda, pilih kelompok, pilih game, progress anak
│   ├── engine/               # ENGINE GAME REUSABLE (lihat bawah)
│   │   ├── core/             # game loop, scene manager, state
│   │   ├── ui/               # tombol besar, popup bintang, progress bar
│   │   ├── audio/            # manajer narasi TTS + SFX (lazy load)
│   │   └── templates/        # template tipe game (lihat daftar)
│   ├── games/
│   │   ├── tk/               # 10–15 game TK (tiap game = 1 folder, config + assets)
│   │   └── sd1/              # 10–15 game SD Awal
│   └── data/                 # konfigurasi soal/level per game (JSON)
├── functions/                # Cloud Functions: validasi kode, klaim akses
├── scripts/                  # generator kode aktivasi, pipeline aset
└── public/assets/            # gambar AI, audio TTS (terorganisir per game)
```

## Engine & Template Game

Buat engine sehingga **menambah game baru = menulis file config JSON + aset**, bukan menulis kode dari nol. Template tipe game yang dibutuhkan:

1. **Tap-jawab** (pilih jawaban benar dari 2–4 gambar/angka/huruf)
2. **Drag & drop** (pasangkan, urutkan, kelompokkan)
3. **Tracing** (menulis huruf/angka dengan jari)
4. **Memory/mencocokkan kartu**
5. **Hitung & ketuk** (counting objek)
6. **Cerita interaktif** (narasi + pilihan)

Setiap game dideklarasikan lewat config: `{ id, group, title, template, freeDemo (bool), levels[], assets{} }`.

## Standar UX Anak (WAJIB)

- Tombol besar (min 64px), target sentuh lega, tanpa teks kecil.
- **Semua instruksi dinarasikan audio Bahasa Indonesia** (anak TK belum lancar membaca). Teks hanya pendamping.
- Feedback positif selalu: salah = "Coba lagi, kamu pasti bisa!" — tidak ada hukuman.
- Progresi: bintang per level + maskot yang berkembang (lanjutkan konsep dari game "Petualangan Pintar" yang sudah ada).
- Tidak ada iklan, tidak ada link keluar, tidak ada pembelian di dalam area anak. Area orang tua (akun, pembelian) dipisah di balik "gerbang orang tua" (mis. soal matematika sederhana).
- Performa: harus mulus di Android low-mid end. Bundle kecil, lazy-load aset per game, gambar WebP, audio terkompresi.
- Responsif portrait & landscape untuk HP + tablet.

## Fase Pengerjaan

1. **Fase 1 — Fondasi:** setup Vite + React + TS + Firebase, routing, Auth, halaman portal dasar, Firestore rules. ✅ **SELESAI** (lihat "Status Pengerjaan" di bawah)
2. **Fase 2 — Engine:** core engine + 6 template game + sistem audio/narasi + progress bintang. ✅ **SELESAI**
3. **Fase 3 — Migrasi:** porting game "Petualangan Pintar" (HTML standalone yang sudah ada) ke format engine sebagai game pertama kelompok TK.
4. **Fase 4 — Konten:** produksi 10–15 game per kelompok via config + aset. Tandai 1–2 game per kelompok sebagai `freeDemo: true`.
5. **Fase 5 — Monetisasi:** Cloud Function validasi kode, script generator kode, device limit, halaman aktivasi.
6. **Fase 6 — Rilis:** deploy Firebase Hosting, build versi demo untuk itch.io, sanity test di Android asli.

Kerjakan bertahap, satu fase selesai & teruji dulu sebelum lanjut. Selalu tanyakan konfirmasi sebelum keputusan arsitektur besar di luar dokumen ini.

## Status Pengerjaan

- **Fase 1 (Fondasi) — SELESAI** di branch `claude/mini-game-programming-language-vlle4b` (2026-07-20):
  - Vite + React 18 + TypeScript strict; alias import `@/` → `src/`.
  - Routing (react-router): `/` beranda, `/kelompok/:groupId`, `/masuk`, `/daftar`, `/aktivasi` (protected). Semua halaman lazy-load.
  - Firebase **lazy-load via `getFirebase()`** (`src/auth/firebase.ts`) — SDK tidak ikut bundle awal (entry ±56 kB gzip). App tetap jalan tanpa `.env` (tampilkan notice "belum dikonfigurasi"); isi kunci dari `.env.example` saat project Firebase dibuat.
  - `firestore.rules` ketat: `activation_codes` tertutup dari client; field `users/{uid}.groups` hanya bisa diubah Cloud Function; default deny.
  - Kontrak config game type-safe di `src/engine/core/types.ts` (`GameConfig`, `TemplateId`, dst.) — fondasi Fase 2.
  - `functions/` & `scripts/` masih README placeholder (diimplementasi Fase 5).
  - Perintah: `npm run dev` / `npm run build` / `npm run typecheck`.
- **Fase 2 (Engine) — SELESAI** (2026-07-21), teruji headless-browser semua template:
  - `GameShell` (`src/engine/core/GameShell.tsx`): intro → level → selesai; feedback positif ("Coba lagi, kamu pasti bisa!"), bintang per level (0 salah = 3⭐), remount template per attempt.
  - **6 template** di `src/engine/templates/`: TapAnswer, DragDrop (pointer events, bukan HTML5 DnD — HTML5 DnD rusak di mobile), Tracing (canvas + cek coverage glyph), Memory, CountTap (pengecoh + target dilebihkan sesuai Aturan Desain Soal), StoryChoice. Semua lazy-load per chunk.
  - Audio (`src/engine/audio/sound.ts`): narasi `speechSynthesis` id-ID (nanti otomatis diganti file TTS saat aset tersedia) + SFX WebAudio tanpa aset.
  - Progress bintang: localStorage (`src/engine/core/progress.ts`); sinkron Firestore menyusul Fase 5.
  - Registry game (`src/games/registry.ts`) + route `/game/:gameId` dengan gerbang akses (premium → layar terkunci + ajakan aktivasi).
  - **Config game = file `.ts` typed** (`src/games/tk/*.ts`, `src/games/sd1/*.ts`) dengan `GameConfig<T>` — sengaja .ts, bukan JSON, karena JSON tidak bisa dicek TypeScript secara literal. Ini pemenuhan niat "konten di file data terpisah": tetap data murni, tapi typo ketahuan saat build.
  - 7 game contoh: TK = hitung-buah (count-tap), kenal-huruf (tap-answer), tulis-angka (tracing), kartu-kembar (memory, 🔒 premium); SD1 = pasang-kata (drag-drop), cerita-kancil (story-choice), tambah-tangkas (tap-answer, 🔒 premium). CATATAN: flag `freeDemo` saat ini untuk keperluan testing; batas final 1–2 demo/kelompok ditetapkan di Fase 4.
- **Deploy testing:** build ter-deploy ke branch Pages folder `app/` → `https://2013tib-droid.github.io/Game-Edukasi-Anak/app/` (HashRouter + base via env `DEPLOY_BASE` & `VITE_USE_HASH_ROUTER`; produksi nanti Firebase Hosting pakai default).
- **Fase 3 (Migrasi Petualangan Pintar) — SEBAGIAN** (2026-07-21), 2 dunia pertama ter-porting & teruji headless (viewport HP, sampai tamat termasuk jalur salah):
  - **Sistem maskot jadi fitur engine** (`src/engine/core/mascot.ts` + `src/engine/ui/Mascot.tsx`): evolusi 🥚→🐣→🐥→🦉→🦄→🐲 dari **TOTAL bintang semua game** (`getTotalStars()` di `progress.ts`). Kartu maskot + progress bar tampil di beranda portal (`HomePage`) dan layar selesai (`GameShell`).
  - **Template baru `spell`** (`src/engine/templates/Spell.tsx`): susun kata dengan ketuk huruf berurutan; nampan huruf dicampur huruf pengecoh (Aturan Desain Soal). Lazy-load per chunk.
  - **Dukungan game "mixed"**: `MixedGameConfig`/`MixedLevel` di `types.ts` — satu game bisa punya template berbeda per level (dibutuhkan karena tiap dunia sumber mencampur tipe soal). `GameShell` memilih template per-level; homogen tetap pakai `GameConfig<T>`. Backward-compatible.
  - **TapAnswer** kini punya field opsional `picture` + `board` (papan visual: hewan yang dihitung, papan penjumlahan, atau kata berhuruf hilang) — dipakai porting soal berhitung/huruf.
  - **2 dunia baru (kelompok TK)**: `hutan-hewan` (tap-answer: hitung → tambah → kurang, 7 level) & `taman-huruf` (mixed: huruf pertama, huruf kecil, lalu susun kata/spell, 7 level). Config = data typed di `src/games/tk/`. Keduanya `freeDemo: true` untuk testing.
  - **Variasi soal anti-bosan (fitur engine)**: `LevelSlot`/`MixedSlot` di `types.ts` — tiap "slot" boleh berisi POOL varian; `GameShell` mengacak 1 varian per slot tiap main & tiap "Main Lagi" (`resolveSlots` + `playNonce`). Semua varian tetap data typed. Bintang disimpan per-slot (semua varian 1 slot berbagi `id`) supaya ekonomi bintang tak membengkak. hutan-hewan & taman-huruf kini punya ±6 varian/slot (hewan/kata/huruf berbeda; TANPA anjing).
  - **Pilihan jawaban tap-answer diperbesar**: teks huruf/angka tanpa emoji jadi besar (`.choice-text--main`, clamp 48–68px) + warna teks kartu diset eksplisit (dulu ikut biru default UA).
  - **Sisa dunia (Bawah Laut warna/bentuk, Pasar Buah) — BELUM**; berikutnya (Pasar Buah butuh game mixed count-tap + tap-answer + drag-drop + memory).

## Konvensi

- Bahasa UI & narasi: Indonesia. Nama variabel/komentar kode: Inggris.
- Semua konten soal/level di file JSON `src/data/` — jangan hardcode di komponen.
- Commit kecil dan sering, pesan commit deskriptif.
- Jangan tambah library berat tanpa alasan kuat (target device low-end).

## Deploy Web (PENTING)

- **GitHub Pages menyajikan situs dari branch `claude/web-demo-html-wa4dr9`** (folder root), BUKAN dari branch default. Perubahan apa pun yang harus tampil di web WAJIB di-merge dan di-push ke branch itu — push ke branch lain tidak memicu build Pages.
- Di branch Pages itu, `index.html` adalah landing page statis yang menaut ke `petualangan-pintar.html` (satu-satunya file game; jangan buat salinan duplikat). Di branch pengembangan app, `index.html` root adalah entry Vite — dua hal berbeda, jangan saling menimpa saat merge.
- URL live: `https://2013tib-droid.github.io/Game-Edukasi-Anak/`. Setelah push, build Pages butuh ±1–2 menit; browser HP sering menyimpan cache versi lama.

## Aturan Desain Soal (dari pemilik proyek)

- **Soal tidak boleh monoton satu jenis item.** Contoh: soal "ketuk N buah" harus selalu mencampur buah target dengan 2–3 jenis buah pengecoh, dan jumlah buah target dilebihkan dari yang diminta — anak harus mengenali item yang benar DAN berhenti menghitung di angka yang diminta. Terapkan prinsip campuran/pengecoh yang sama saat membuat tipe soal baru agar tetap menantang.

## File Sumber yang Tersedia dari Pemilik Proyek

- `petualangan-pintar.html` — game standalone yang sudah jadi (vanilla JS, localStorage): sumber untuk Fase 3.
- (Opsional) versi React component dari game yang sama.
- Folder aset AI (gambar) & audio TTS akan ditambahkan bertahap di `public/assets/`.
