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
| Demo gratis | Saat launching: **hanya "Hutan Hewan" (TK) yang gratis**, sisanya wajib login (lihat "Rencana Akses Saat Launching") |
| Aset | Gambar AI-generated + narasi TTS Bahasa Indonesia |
| Harga | Naik per jenjang: TK Rp39rb (perkenalan Rp19rb), SD Awal Rp49rb (selalu < Rp50rb) |
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

## Rencana Akses Saat Launching (KEPUTUSAN PEMILIK — 2026-07-26)

- **Sekarang (pra-rilis): SEMUA game dibuka** (`freeDemo: true` di semua config + `src/games/registry.ts`) supaya pemilik & penguji bisa mencoba semuanya tanpa login. Ini kondisi SEMENTARA, bukan keputusan produk.
- **Saat launching: hanya `hutan-hewan` (Hutan Hewan, TK) yang GRATIS.** Semua game lain — TK maupun SD Awal — wajib **login + kode aktivasi** (`freeDemo: false`).
- Cara mengeksekusi nanti (satu langkah, jangan lupa dua tempat): set `freeDemo: false` di **config game** `src/games/**` DAN di entri game yang sama di **`src/games/registry.ts`**; hanya `hutan-hewan` yang tetap `true`. Verifikasi: buka `/kelompok/tk` & `/kelompok/sd1` — hanya Hutan Hewan yang berlabel "GRATIS", game lain menampilkan layar terkunci + ajakan aktivasi.

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
4. **Fase 4 — Konten:** produksi 10–15 game per kelompok via config + aset. Saat rilis hanya `hutan-hewan` yang `freeDemo: true` (lihat "Rencana Akses Saat Launching").
5. **Fase 5 — Monetisasi:** Cloud Function validasi kode, script generator kode, device limit, halaman aktivasi.
6. **Fase 6 — Rilis:** deploy Firebase Hosting, build versi demo untuk itch.io, sanity test di Android asli.

Kerjakan bertahap, satu fase selesai & teruji dulu sebelum lanjut. Selalu tanyakan konfirmasi sebelum keputusan arsitektur besar di luar dokumen ini.

## Status Pengerjaan

- **Fase 1 (Fondasi) — SELESAI** di branch `claude/mini-game-programming-language-vlle4b` (2026-07-20):
  - Vite + React 18 + TypeScript strict; alias import `@/` → `src/`.
  - Routing (react-router): `/` landing page orang tua, `/portal` beranda/pemilih kelompok anak, `/kelompok/:groupId`, `/masuk`, `/daftar`, `/aktivasi` (protected). Semua halaman lazy-load. (Lihat "Landing Page & Logo".)
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
  - 7 game contoh: TK = hitung-buah (count-tap; **sudah dilebur ke Pasar Buah, 2026-07-26**), kenal-huruf (tap-answer), tulis-angka (tracing), kartu-kembar (memory); SD1 = pasang-kata (drag-drop), cerita-kancil (story-choice), tambah-tangkas (tap-answer). CATATAN: flag `freeDemo` saat ini semua `true` untuk pengujian; komposisi gratis/berbayar saat rilis ada di "Rencana Akses Saat Launching".
- **Deploy testing:** build ter-deploy ke branch Pages folder `app/` → `https://2013tib-droid.github.io/Game-Edukasi-Anak/app/` (HashRouter + base via env `DEPLOY_BASE` & `VITE_USE_HASH_ROUTER`; produksi nanti Firebase Hosting pakai default).
- **Fase 3 (Migrasi Petualangan Pintar) — SELESAI** (2026-07-21), 4 dunia ter-porting & teruji headless (viewport HP 380px, tiap game sampai tamat termasuk jalur salah, tanpa error console):
  - **Sistem maskot jadi fitur engine** (`src/engine/core/mascot.ts` + `src/engine/ui/Mascot.tsx`): evolusi 🥚→🐣→🐥→🦉→🦄→🐲 dari **TOTAL bintang semua game** (`getTotalStars()` di `progress.ts`). Kartu maskot + progress bar tampil di beranda portal (`HomePage`) dan layar selesai (`GameShell`).
  - **Template baru `spell`** (`src/engine/templates/Spell.tsx`): susun kata dengan ketuk huruf berurutan; nampan huruf dicampur huruf pengecoh (Aturan Desain Soal). Lazy-load per chunk.
  - **Dukungan game "mixed"**: `MixedGameConfig`/`MixedLevel` di `types.ts` — satu game bisa punya template berbeda per level (dibutuhkan karena tiap dunia sumber mencampur tipe soal). `GameShell` memilih template per-level; homogen tetap pakai `GameConfig<T>`. Backward-compatible.
  - **TapAnswer** punya field opsional `picture` + `board` (papan visual: hewan dihitung, papan penjumlahan, kata berhuruf hilang), plus dari dunia Labirin Warna (dulu "Bawah Laut"): `shape` (bentuk geometris berwarna via `src/engine/ui/Shape.tsx` — porting `shapeSVG()`), `sequence` (deret pola "Pola Ajaib" dengan kotak "?"), dan `silhouette` (render `picture` sebagai bayangan gelap untuk Pasar Buah "tebak bayangan"). `ShapeId`/`ShapeSpec` di `types.ts`. Teks jawaban huruf/angka tanpa emoji dibesarkan (`.choice-text--main`, clamp 48–68px; warna kartu diset eksplisit, dulu ikut biru default UA).
  - **Variasi soal anti-bosan (fitur engine)**: `LevelSlot`/`MixedSlot` di `types.ts` — tiap "slot" boleh berisi POOL varian; `GameShell` mengacak 1 varian per slot tiap main & tiap "Main Lagi" (`resolveSlots` + `playNonce`). Semua varian tetap data typed. Bintang per-slot (varian dalam slot berbagi `id`) supaya total bintang/maskot tak membengkak.
  - **4 dunia (kelompok TK)** — semua `freeDemo: true` untuk testing, config = data typed di `src/games/tk/`:
    - `hutan-hewan` (tap-answer: hitung → tambah → kurang, **8 slot** × ~6 varian hewan favorit — kuda/pinguin/panda/koala dll, TANPA anjing). Hewan dengan seni AI premium (singa, gajah, jerapah, panda, kelinci, bebek, kucing, beruang, kura-kura) dirender sebagai **gambar WebP** lewat `boardItems` + registry `src/engine/ui/items.ts` (sama di semua HP, tak bergantung font emoji); sisanya fallback emoji. Slot 8 = pengurangan "pulang ke rumah" (termasuk kura-kura).
    - `taman-huruf` (mixed: huruf pertama, huruf kecil, susun kata/spell, 7 slot × ~6 varian kata/huruf).
    - `labirin-warna` (tap-answer + Shape SVG; **dulu bernama "Bawah Laut"**, diganti karena isinya bangun datar & warna, bukan laut). 10 slot × pool varian (~70 soal): cari bentuk → cari warna → **yang beda sendiri** → bentuk&warna → **tiga level pola ajaib** (AB, lalu AAB/ABB, lalu ABC — 25 varian; deret selalu 6 sel supaya muat satu baris di HP kecil). Pengecoh BENTUK sengaja mirip (kotak/ketupat, lingkaran/oval, bintang/hati); pengecoh WARNA justru harus kontras — **oranye dihapus dari palet** (kuning vs oranye tak terbaca di HP) dan merah/pink tak pernah diadu dalam soal warna. Bentuk di kartu jawaban mengisi kotak (`.choice-shape`, 92% lebar kartu).
    - `pasar-buah` (mixed: count-tap "beli buah" → tap-answer "tebak buah"/"tebak bayangan" → drag-drop "keranjang warna" → memory "kartu buah", 7 level). Keranjang warna 1:1 (template drag-drop = satu item per target). **Diperluas 2026-07-26** — lihat "Pasar Buah + Hitung Buah dilebur" di bawah.
- **Konsolidasi ke trunk `main` — SELESAI** (2026-07-24), typecheck + build + render teruji (`vite preview`):
  - Menyatukan dua jalur yang tadinya terpisah & saling menimpa saat deploy: **landing page baru + engine variant-slots** (dari `petualangan-pintar-fase-3`) dan **seni hewan WebP premium + l8 kura-kura** (dari `asset-generation-prompts`).
  - Engine hasil merge = superset: `board` (emoji) + `boardItems` (gambar) + Shape/sequence/silhouette + variant-slots, semua hidup berdampingan. Hutan Hewan direkonsiliasi: pool varian (anti-bosan) yang merender WebP untuk hewan ber-seni, emoji untuk sisanya.
  - Landing lama (278 baris, dari `landing-page-review`) DIGANTI landing baru (`TopBar` + hero simpel + harga perkenalan). Branch-branch lama ditinggalkan; lihat "Branch & Alur Kerja".
- **Gambar soal jadi besar + seni premium untuk cue tunggal** (2026-07-25), teruji headless 380×800 & 360×640 (tanpa scroll, tanpa error console):
  - Komponen `ItemPic` (`src/engine/ui/ItemPic.tsx`) = satu-satunya perender gambar item (registry `items.ts` + fallback emoji). Dipakai papan tap-answer (`boardItems`), cue tunggal, dan Spell.
  - Field baru: `TapAnswerData.pictureItem` & `SpellData.item` — id item registry untuk cue besar (gambar WebP, bukan font emoji HP). `picture`/`emoji` tetap jadi fallback.
  - Ukuran cue dinaikkan ±2× (`.ta-picture`, `.spell-picture` + varian `--img`) agar anak tertarik; berlaku untuk semua soal ber-cue (Taman Huruf, Pasar Buah).
  - Aset baru `public/assets/items/sun.webp` & `cap.webp` (dari pemilik proyek). Taman Huruf: Topi & Matahari pakai gambar itu; Gajah/Jerapah/Kuda/Sapi/Bebek/Panda pakai seni hewan yang sudah ada; soal "Teleskop" (asing untuk anak TK) diganti "Boneka".
- **Tulis Angka 1–20 acak, 7 soal per sesi** (2026-07-26), teruji headless 380×800 (tanpa error console):
  - Fitur engine baru `sessionLevels` (opsional, di `GameConfig`/`MixedGameConfig`): kolam soal boleh besar, tapi tiap sesi main hanya mengambil N slot **acak tanpa pengulangan & urutan acak** (`resolveSlots` di `GameShell` — shuffle + slice, di-roll ulang tiap "Main Lagi"). Game tanpa field ini tetap main semua slot berurutan seperti dulu.
  - `tulis-angka` kini punya 20 level (angka 1–20, narasi "satu"…"dua puluh"), `sessionLevels: 7`. Id level tetap `l1`…`l20` supaya bintang lama tidak hilang.
  - `Tracing` mengecilkan font panduan untuk glyph 2 digit (`glyphFont()`, 0.75→0.5 × kanvas) supaya angka 10–20 muat penuh di kanvas HP.
- **Semua game dibuka (pra-rilis) + Pasar Buah & Hitung Buah dilebur** (2026-07-26), teruji headless 380×800 & 360×640 (4× tamat + "Main Lagi", tanpa scroll horizontal/vertikal, tanpa error console):
  - **Semua game `freeDemo: true`** (config + `registry.ts`) supaya bisa dicoba bebas tanpa login. Komposisi gratis/berbayar saat rilis: lihat "Rencana Akses Saat Launching" — hanya Hutan Hewan yang gratis.
  - **`hitung-buah` DIHAPUS, dilebur ke `pasar-buah`.** Soal hitung buahnya jadi varian slot count-tap di Pasar Buah, jadi satu dunia buah dengan referensi jauh lebih banyak. Route lama `/game/hitung-buah` otomatis menampilkan "Game tidak ditemukan" (bukan error).
  - `pasar-buah` kini **8 slot × pool varian** (14 jenis buah, ±40 varian), semua slot bertipe pool ala Hutan Hewan: 3 slot count-tap "beli buah" (ketuk 2–3 → 4 → 5–6) → tap-answer "tebak buah" → tap-answer "tebak bayangan" → 2 slot drag-drop "keranjang warna" (3 lalu 4 keranjang) → memory "kartu buah". Slot hitung ketiga memakai id `l8` (di luar urutan) supaya bintang lama di `l1`–`l7` tidak hilang.
  - Config pakai builder typed (`buy`/`guess`/`shadow`/`baskets`/`cards` + `slot()`), tetap data murni. Aturan warna: keranjang kuning & oranye tak pernah muncul di level yang sama (di HP kecil dua warna itu terbaca sama).
- **Kartu maskot bukan tombol** (2026-07-26): dulu kartu "Telur Ajaib" memakai gaya `.btn` persis (kartu putih + bayangan bawah terangkat) sehingga tampak bisa diketuk seperti tombol kelompok di bawahnya. Sekarang jadi **panel status**: `src/engine/ui/mascot.css` (kelas `.mascot-panel*`) — latar krem hangat, bingkai putus-putus, bayangan ke DALAM (bukan terangkat), avatar bulat, label "TEMAN BELAJARMU" + total ⭐ di kanan, chip "Level N", tanpa efek tekan. Berlaku di beranda portal & layar selesai game. Style pindah dari inline ke CSS file (chunk `Mascot`).

## Branch & Alur Kerja (WAJIB — biar fitur tak "hilang" lagi)

> Riwayat proyek ini kacau karena tiap sesi bikin branch `claude/xxx` baru, kerja di situ, lalu tak pernah digabung — akibatnya landing page & fitur berulang kali "hilang" dan deploy saling menimpa. Aturan di bawah menghentikan itu. **Ada SATU trunk: `main`.**

- **`main` = satu-satunya sumber kebenaran.** Semua fitur yang sudah jadi ADA di `main`: landing page baru, engine (6 template + variant-slots anti-bosan + papan gambar `boardItems`), 4 dunia TK, seni hewan WebP. `main` dibentuk (2026-07-24) dari konsolidasi branch `petualangan-pintar-fase-3` (landing baru + variant engine) + `asset-generation-prompts` (seni hewan WebP + l8).
- **Mulai kerjaan baru = cabang PENDEK dari `main`** (`git checkout main && git pull && git checkout -b claude/<fitur>`), kerjakan satu hal, lalu **merge balik ke `main`** dan hapus branch-nya. Jangan biarkan branch fitur hidup lama & menyimpang.
- **Sebelum mulai, selalu `git checkout main` dulu** — jangan mencabang dari branch `claude/xxx` lama yang mungkin ketinggalan fitur. Kalau ragu apakah `main` punya fitur X, cek dulu, jangan asal bikin ulang.
- Branch lama (`landing-page-*`, `asset-generation-prompts`, `add-level-4-worlds`, `audio-smoothness-lag`, dll.) sudah **usang/terkonsolidasi** — jangan lanjutkan kerja di sana. (`audio-smoothness-lag` = fork lama tak kompatibel; ide-nya — audio queue player, cegah narasi berulang — di-reimplement ulang di engine `main` kalau dibutuhkan, bukan di-merge.)

## Konvensi

- Bahasa UI & narasi: Indonesia. Nama variabel/komentar kode: Inggris.
- Semua konten soal/level di file `.ts` typed `src/games/**` (bukan hardcode di komponen).
- Commit kecil dan sering, pesan commit deskriptif.
- Jangan tambah library berat tanpa alasan kuat (target device low-end).

## Landing Page & Logo (FITUR TETAP — JANGAN SAMPAI HILANG)

> Landing page berkali-kali "hilang" karena dikerjakan di branch yang tak pernah ter-merge. **Landing page & logo adalah fitur permanen app — bukan eksperimen.** Jangan hapus, bypass route-nya, atau ganti tanpa konfirmasi pemilik.

- **Landing page = route `/`** → `src/portal/LandingPage.tsx` (+ `src/portal/landing.css`). Halaman marketing menghadap orang tua: hero "Petualangan Pintar" + logo, tombol **🎮 Main Sekarang**, chip 4 dunia, kartu harga perkenalan (TK Rp19.000 coret Rp39.000, SD "Segera Hadir"), akses orang tua lewat **`TopBar`** (`src/portal/TopBar.tsx`, tombol "Orang Tua" → `/masuk`). Pemilih kelompok anak pindah ke **`/portal`** (`src/portal/HomePage.tsx`).
  - Cek cepat masih utuh: `src/app/App.tsx` punya `<Route path="/" element={<LandingPage />} />` dan `<Route path="/portal" element={<HomePage />} />`. Kalau `/` menunjuk `HomePage` atau `LandingPage.tsx` hilang → **pulihkan dari `main` dulu**.
- **Logo = satu aset kanonik `public/assets/logo.svg`** (anak ayam + pelangi + bintang). Dipakai di **semua** tempat lewat file itu — jangan bikin salinan/varian inline:
  - Favicon di `index.html` (`<link rel="icon" href="/assets/logo.svg">`; Vite tambah `base` saat build).
  - Logo header landing (`LandingPage.tsx`, via `${import.meta.env.BASE_URL}assets/logo.svg`).
  - **Kalau logo diganti, ganti aset `public/assets/logo.svg` itu saja — otomatis ikut di landing + favicon.** Jangan biarkan logo landing beda dari favicon.

## Deploy Web (PENTING)

- **GitHub Pages menyajikan situs dari branch `claude/web-demo-html-wa4dr9`** (folder root), BUKAN dari branch default. Yang harus tampil di web WAJIB di-build lalu di-push ke branch itu — push ke branch lain tidak memicu build Pages.
- **Deploy HANYA dari `main`.** Build `app/` selalu dari `main` (yang pasti punya landing page + semua fitur). JANGAN pernah deploy `app/` dari branch fitur yang belum punya landing page — itulah penyebab landing page berulang ketimpa. Cek cepat landing (di atas) sebelum build.
- **Struktur branch Pages:** app React (landing di route `/`) disajikan di subfolder **`app/`**. Root `index.html` = **redirect ke `./app/`** (bukan landing statis; satu landing kanonik). `404.html` juga redirect ke `app/` (app pakai HashRouter). `petualangan-pintar.html` tetap ada sebagai sumber standalone, tak ditaut dari root.
- **Cara deploy:** `DEPLOY_BASE=/Game-Edukasi-Anak/app/ VITE_USE_HASH_ROUTER=1 npm run build`, lalu ganti isi folder `app/` di branch Pages dengan hasil `dist/` (termasuk `dist/assets/logo.svg` & `dist/assets/items/*.webp`). Produksi nanti (Firebase Hosting) pakai `base` default `/` + BrowserRouter.
- URL live: `https://2013tib-droid.github.io/Game-Edukasi-Anak/` (redirect ke `/app/`). Setelah push, build Pages butuh ±1–2 menit; browser HP sering menyimpan cache versi lama (hard-refresh).

## Aturan Desain Soal (dari pemilik proyek)

- **Soal tidak boleh monoton satu jenis item.** Contoh: soal "ketuk N buah" harus selalu mencampur buah target dengan 2–3 jenis buah pengecoh, dan jumlah buah target dilebihkan dari yang diminta — anak harus mengenali item yang benar DAN berhenti menghitung di angka yang diminta. Terapkan prinsip campuran/pengecoh yang sama saat membuat tipe soal baru agar tetap menantang.

## File Sumber yang Tersedia dari Pemilik Proyek

- `petualangan-pintar.html` — game standalone yang sudah jadi (vanilla JS, localStorage): sumber untuk Fase 3.
- (Opsional) versi React component dari game yang sama.
- Folder aset AI (gambar) & audio TTS akan ditambahkan bertahap di `public/assets/`.
