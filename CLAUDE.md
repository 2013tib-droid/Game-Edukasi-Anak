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
  - Routing (react-router): `/` landing page (orang tua), `/portal` beranda/pemilih kelompok (anak), `/kelompok/:groupId`, `/masuk`, `/daftar`, `/aktivasi` (protected). Semua halaman lazy-load. (CATATAN: route `/` awalnya beranda; sejak landing page ditambahkan, beranda pindah ke `/portal` — lihat bagian "Landing Page & Logo".)
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
- **Fase 3 (Migrasi Petualangan Pintar) — SELESAI** (2026-07-21), 4 dunia ter-porting & teruji headless (viewport HP 380px, tiap game sampai tamat termasuk jalur salah, tanpa error console):
  - **Sistem maskot jadi fitur engine** (`src/engine/core/mascot.ts` + `src/engine/ui/Mascot.tsx`): evolusi 🥚→🐣→🐥→🦉→🦄→🐲 dari **TOTAL bintang semua game** (`getTotalStars()` di `progress.ts`). Kartu maskot + progress bar tampil di beranda portal (`HomePage`) dan layar selesai (`GameShell`).
  - **Template baru `spell`** (`src/engine/templates/Spell.tsx`): susun kata dengan ketuk huruf berurutan; nampan huruf dicampur huruf pengecoh (Aturan Desain Soal). Lazy-load per chunk.
  - **Dukungan game "mixed"**: `MixedGameConfig`/`MixedLevel` di `types.ts` — satu game bisa punya template berbeda per level (dibutuhkan karena tiap dunia sumber mencampur tipe soal). `GameShell` memilih template per-level; homogen tetap pakai `GameConfig<T>`. Backward-compatible.
  - **TapAnswer** punya field opsional `picture` + `board` (papan visual), plus dari dunia Bawah Laut: `shape` (bentuk geometris berwarna via `src/engine/ui/Shape.tsx` — porting `shapeSVG()`), `sequence` (deret pola "Pola Ajaib" dengan kotak "?"), dan `silhouette` (render `picture` sebagai bayangan gelap untuk Pasar Buah "tebak bayangan"). `ShapeId`/`ShapeSpec` di `types.ts`.
  - **4 dunia (kelompok TK)** — semua `freeDemo: true` untuk testing, config = data typed di `src/games/tk/`:
    - `hutan-hewan` (tap-answer: hitung → tambah → kurang, 7 level).
    - `taman-huruf` (mixed: huruf pertama, huruf kecil, susun kata/spell, 7 level).
    - `bawah-laut` (tap-answer + Shape SVG: cari bentuk → cari warna → bentuk&warna → pola ajaib, 7 level). Pengecoh sengaja mirip (kotak/ketupat, merah/oranye/pink).
    - `pasar-buah` (mixed: count-tap "beli buah" → tap-answer "tebak buah"/"tebak bayangan" → drag-drop "keranjang warna" → memory "kartu buah", 7 level). Keranjang warna 1:1 (template drag-drop = satu item per target).
- **Landing page (route `/`) — SELESAI & DIPULIHKAN** (2026-07-24, branch `claude/landing-page-logo-restore-yda7k4`), build + typecheck lolos, render + aset (logo & chunk) teruji lewat `vite preview`:
  - Halaman marketing menghadap orang tua di `src/portal/LandingPage.tsx` + `src/portal/landing.css`: hero + value prop, deret 6 maskot, trust points, showcase 4 dunia (dari game registry, tak bisa "drift" dari yang benar-benar rilis), kartu harga per kelompok (`priceLabel` dari `src/data/groups.json`) + modal beli placeholder, FAQ, footer. Countdown rilis opsional (`LAUNCH_DATE`, default off).
  - Beranda/pemilih kelompok menghadap anak pindah ke `/portal` (`HomePage`); link balik internal (GamePage/GroupPage "Kembali") menunjuk `/portal`.
  - Logo brand di header memakai aset kanonik `public/assets/logo.svg` yang sama dengan favicon (lihat bagian "Landing Page & Logo (FITUR TETAP)").
  - Penyebab hilang sebelumnya: landing dikerjakan di branch `claude/landing-page-review-uxdplg` yang tak ter-merge ke mainline, jadi setiap branch baru kehilangan file-nya. Sekarang didokumentasikan sebagai fitur tetap agar tak terulang.

## Konvensi

- Bahasa UI & narasi: Indonesia. Nama variabel/komentar kode: Inggris.
- Semua konten soal/level di file JSON `src/data/` — jangan hardcode di komponen.
- Commit kecil dan sering, pesan commit deskriptif.
- Jangan tambah library berat tanpa alasan kuat (target device low-end).

## Landing Page & Logo (FITUR TETAP — JANGAN SAMPAI HILANG)

> Landing page berkali-kali "hilang" karena dikerjakan di branch yang tak pernah ter-merge, lalu branch baru dicabang dari mainline yang belum punya file-nya. Bagian ini dibuat agar tidak terulang. **Landing page & logo adalah fitur permanen app — bukan eksperimen.** Jangan pernah menghapus, mem-bypass route-nya, atau mengganti dengan halaman lain tanpa konfirmasi pemilik proyek.

- **Landing page = route `/`** di app React → `src/portal/LandingPage.tsx` (+ styling `src/portal/landing.css`). Ini halaman marketing menghadap orang tua (value prop, dunia yang bisa dimainkan, harga, FAQ, tombol "Coba Demo Gratis"). Group picker menghadap anak pindah ke route **`/portal`** (`src/portal/HomePage.tsx`).
  - Kalau memulai kerjaan baru dari mainline dan file `LandingPage.tsx`/`landing.css` **tidak ada**, atau route `/` di `src/app/App.tsx` menunjuk ke `HomePage` bukan `LandingPage` → berarti landing page hilang lagi: **pulihkan dulu** sebelum lanjut. Referensi terakhir yang teruji ada di branch `claude/landing-page-logo-restore-yda7k4`.
  - Cek cepat masih utuh: `src/app/App.tsx` punya `const LandingPage = lazy(...)` dan `<Route path="/" element={<LandingPage />} />`, `<Route path="/portal" element={<HomePage />} />`.
- **Logo = satu aset kanonik `public/assets/logo.svg`** (anak ayam + pelangi + bintang). Dipakai di **semua** tempat lewat satu file itu — jangan bikin salinan/varian:
  - Favicon di `index.html` (`<link rel="icon" href="/assets/logo.svg">`; Vite otomatis menambah `base` saat build).
  - Logo brand di header landing (`LandingPage.tsx`, di-resolve via `${import.meta.env.BASE_URL}assets/logo.svg` supaya benar di deploy subpath).
  - **Aturan pemilik: kalau logo diganti, ganti aset `public/assets/logo.svg` itu saja — otomatis ikut ganti di landing page, favicon, dan semua turunannya.** Jangan pernah biarkan logo landing beda dari favicon. Kalau menambah tempat baru yang butuh logo, tetap tunjuk ke `public/assets/logo.svg`, jangan hardcode SVG inline.

## Deploy Web (PENTING)

- **GitHub Pages menyajikan situs dari branch `claude/web-demo-html-wa4dr9`** (folder root), BUKAN dari branch default. Perubahan apa pun yang harus tampil di web WAJIB di-build lalu di-push ke branch itu — push ke branch lain tidak memicu build Pages.
- **Struktur branch Pages (per 2026-07-24):** landing page adalah bagian dari app React di route `/` dan disajikan di subfolder **`app/`**. Root `index.html` bukan landing statis, melainkan **redirect ke `./app/`** — satu landing kanonik, tidak dobel. `404.html` juga redirect ke `app/` (app pakai HashRouter jadi tak butuh SPA path-restore). Di branch pengembangan app, `index.html` root tetap entry Vite — jangan saling menimpa saat merge.
- **Cara deploy app ke Pages:** build dengan `DEPLOY_BASE=/Game-Edukasi-Anak/app/ VITE_USE_HASH_ROUTER=1 npm run build`, lalu ganti isi folder `app/` di branch Pages dengan hasil `dist/` (termasuk `dist/assets/logo.svg`). Produksi nanti (Firebase Hosting) pakai `base` default `/` + BrowserRouter.
- `petualangan-pintar.html` tetap ada sebagai game standalone/sumber (Fase 3), tapi tidak lagi ditaut dari root sejak landing pindah ke app.
- URL live: `https://2013tib-droid.github.io/Game-Edukasi-Anak/` (redirect ke `/app/`). Setelah push, build Pages butuh ±1–2 menit; browser HP sering menyimpan cache versi lama.

## Aturan Desain Soal (dari pemilik proyek)

- **Soal tidak boleh monoton satu jenis item.** Contoh: soal "ketuk N buah" harus selalu mencampur buah target dengan 2–3 jenis buah pengecoh, dan jumlah buah target dilebihkan dari yang diminta — anak harus mengenali item yang benar DAN berhenti menghitung di angka yang diminta. Terapkan prinsip campuran/pengecoh yang sama saat membuat tipe soal baru agar tetap menantang.

## File Sumber yang Tersedia dari Pemilik Proyek

- `petualangan-pintar.html` — game standalone yang sudah jadi (vanilla JS, localStorage): sumber untuk Fase 3.
- (Opsional) versi React component dari game yang sama.
- Folder aset AI (gambar) & audio TTS akan ditambahkan bertahap di `public/assets/`.
