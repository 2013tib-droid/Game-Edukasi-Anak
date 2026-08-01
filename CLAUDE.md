# CLAUDE.md — Platform Game Edukasi Anak Indonesia

## Ringkasan Proyek

Platform web berbayar berisi kumpulan mini-game edukasi untuk anak Indonesia, dijual per kelompok jenjang. Dibuat oleh kreator individu (solo dev), target pasar B2C: orang tua di Indonesia yang mengakses lewat **HP Android dan tablet**.

**Peran Claude Code:** membangun SEMUANYA — portal web + auth, migrasi game yang sudah ada, dan template/engine game agar penambahan konten cepat.

## Keputusan Produk (SUDAH FINAL — jangan diubah tanpa konfirmasi)

| Aspek | Keputusan |
|---|---|
| Scope rilis pertama | 2 kelompok: **Playgroup dan TK (4–7 th)** dan **SD Kelas 1 & 2** (lihat "Penamaan Kelompok") |
| Jumlah game | 10–15 mini-game per kelompok (kualitas premium) |
| Platform | Web app: **React (Vite) + TypeScript + Firebase** (Auth, Firestore, Hosting) |
| Bahasa pemrograman | **TypeScript strict** untuk seluruh app & engine — config game type-safe (typo field ketahuan saat build, bukan saat anak main). Game lama `petualangan-pintar.html` tetap vanilla JS sampai Fase 3 |
| Perangkat target | HP Android & tablet — mobile-first, touch-first |
| Demo gratis | Saat launching: **hanya "Hutan Hewan" (TK) yang gratis**, sisanya wajib login (lihat "Rencana Akses Saat Launching") |
| Aset | Gambar AI-generated + narasi TTS Bahasa Indonesia |
| Harga | Naik per jenjang: Playgroup & TK Rp39rb (perkenalan Rp19rb), SD Kelas 1 & 2 Rp49rb (selalu < Rp50rb) |
| Update | Beli sekali = bugfix gratis; konten besar baru = ekspansi berbayar |
| Penjualan | Lynk.id / Mayar.id (QRIS, e-wallet) + itch.io untuk showcase demo |
| Promosi | TikTok/Reels organik |

## Penamaan Kelompok (KEPUTUSAN PEMILIK — 2026-07-29)

Judul kelompok menyebut **jenjang sekolah**, umur/kelas pindah ke awal deskripsi. Data ada di `src/data/groups.json` (dipakai `HomePage` & `GroupPage`); label harga di landing (`LandingPage.tsx`) harus ikut sama.

| id | title | description |
|---|---|---|
| `tk` | Playgroup dan TK | Usia 4–7 tahun · Berhitung, mengenal huruf, warna & bentuk |
| `sd1` | SD Kelas 1 & 2 | Usia 6–8 tahun · Membaca, berhitung lanjut, logika sederhana |

- **"SD Awal" DIPENSIUNKAN.** SD akan punya 3 tahap, dan "SD Awal/Tengah/Akhir" bukan istilah yang dipakai orang tua Indonesia. Pola resminya: **"SD Kelas 1 & 2" → "SD Kelas 3 & 4" → "SD Kelas 5 & 6"** — orang tua tahu persis anaknya kelas berapa, tanpa perlu menerjemahkan istilah.
- **Id kelompok TIDAK ikut berubah** (`tk`, `sd1`) supaya route `/kelompok/:groupId`, registry game, dan progress lama tetap jalan. Tahap SD berikutnya nanti pakai id baru (`sd2`, `sd3`), bukan mengubah `sd1`.
- Judul jangan memuat umur/kelas lagi (dulu "TK (5–7 tahun)"): umur selalu jadi bagian PERTAMA deskripsi, dipisah "·".

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

- **Sekarang (pra-rilis): SEMUA game dibuka** supaya pemilik & penguji bisa mencoba semuanya tanpa login. Ini kondisi SEMENTARA, bukan keputusan produk.
- **Saat launching: hanya `hutan-hewan` (Hutan Hewan, TK) yang GRATIS.** Semua game lain — TK maupun SD Kelas 1 & 2 — wajib **login + kode aktivasi**.
- Cara mengeksekusinya sekarang **satu baris saja** — lihat "Sistem Kunci Game" di bawah (dulu harus mengubah `freeDemo` di 11 config + registry; field itu sudah DIHAPUS).

## Sistem Kunci Game (SAKLAR BUKA/TUTUP — 2026-07-29)

> Dulu status gratis/berbayar ditulis dua kali per game (`freeDemo` di config + di `registry.ts`) — 22 tempat yang gampang tidak sinkron. Sekarang **satu sumber**: `src/data/access.ts`.

- **`src/data/access.ts` = satu-satunya sumber kebenaran.**
  - `FREE_GAME_IDS = ['hutan-hewan']` — daftar game yang tetap gratis saat terkunci.
  - `DEFAULT_LOCK_MODE` — `'buka'` (semua game terbuka, kondisi pra-rilis) atau `'kunci'` (hanya `FREE_GAME_IDS` yang terbuka).
  - `isGameUnlocked(id)` dipakai `GroupPage` (gembok + label GRATIS) dan `GamePage` (gerbang akses). **Jangan menaruh keputusan akses di tempat lain.**
  - Field `freeDemo` sudah dihapus dari `GameConfig`/`MixedGameConfig` dan dari `GameMeta` — jangan dihidupkan lagi.
- **Tiga cara mengubah mode** (prioritas dari atas):
  1. **Saklar di layar (untuk testing)** — tombol 🔓 Terbuka / 🔒 Terkunci di `TopBar` (landing & portal) dan di bawah daftar game (`/kelompok/:id`). Sekali ketuk, langsung berubah tanpa reload & tanpa build ulang; tersimpan di `localStorage` (`pp_lock_mode_v1`) per perangkat.
  2. **Env saat build**: `VITE_LOCK_MODE=kunci npm run build`.
  3. **Kode**: ubah `DEFAULT_LOCK_MODE` di `access.ts` — **inilah yang dilakukan saat launching**.
- **Saklar hanya tampil di mode penguji**, supaya orang tua pembeli tak pernah melihatnya: aktif di dev server, atau setelah membuka URL berakhiran **`?test=1`** (di build HashRouter: `.../app/#/portal?test=1`). Matikan lagi dengan `?test=0`. Statusnya tersimpan di `localStorage` (`pp_test_mode_v1`).
- Verifikasi cepat: buka `/kelompok/tk` & `/kelompok/sd1` saat mode `kunci` — hanya Hutan Hewan tanpa gembok & berlabel "GRATIS"; game lain menampilkan layar 🔒 + ajakan aktivasi. Sudah teruji headless 380×800 (buka↔kunci, persist setelah reload, TK & SD, layar gembok, Hutan Hewan tetap bisa dimainkan, nol error console).

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
7. **Spell** (susun kata dengan mengetuk huruf berurutan)
8. **Path-trace** (susuri jalan dengan jari — antar kendaraan ke tujuan)

Setiap game dideklarasikan lewat config: `{ id, group, title, template, levels[], assets{} }`. Status gratis/terkunci TIDAK di sini — lihat "Sistem Kunci Game".

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
4. **Fase 4 — Konten:** produksi 10–15 game per kelompok via config + aset. Saat rilis hanya `hutan-hewan` yang gratis (lihat "Sistem Kunci Game").
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
  - 7 game contoh: TK = hitung-buah (count-tap; **sudah dilebur ke Pasar Buah, 2026-07-26**), kenal-huruf (tap-answer), tulis-angka (tracing), kartu-kembar (memory); SD1 = pasang-kata (drag-drop), cerita-kancil (story-choice), tambah-tangkas (tap-answer). CATATAN: status gratis/terkunci sekarang diatur terpusat di `src/data/access.ts` (lihat "Sistem Kunci Game").
- **Deploy testing:** build ter-deploy ke branch Pages folder `app/` → `https://2013tib-droid.github.io/Game-Edukasi-Anak/app/` (HashRouter + base via env `DEPLOY_BASE` & `VITE_USE_HASH_ROUTER`; produksi nanti Firebase Hosting pakai default).
- **Fase 3 (Migrasi Petualangan Pintar) — SELESAI** (2026-07-21), 4 dunia ter-porting & teruji headless (viewport HP 380px, tiap game sampai tamat termasuk jalur salah, tanpa error console):
  - **Sistem maskot jadi fitur engine** (`src/engine/core/mascot.ts` + `src/engine/ui/Mascot.tsx`): evolusi 🥚→🐣→🐥→🦉→🦄→🐲 dari **TOTAL bintang semua game** (`getTotalStars()` di `progress.ts`). Kartu maskot + progress bar tampil di beranda portal (`HomePage`) dan layar selesai (`GameShell`).
  - **Template baru `spell`** (`src/engine/templates/Spell.tsx`): susun kata dengan ketuk huruf berurutan; nampan huruf dicampur huruf pengecoh (Aturan Desain Soal). Lazy-load per chunk.
  - **Dukungan game "mixed"**: `MixedGameConfig`/`MixedLevel` di `types.ts` — satu game bisa punya template berbeda per level (dibutuhkan karena tiap dunia sumber mencampur tipe soal). `GameShell` memilih template per-level; homogen tetap pakai `GameConfig<T>`. Backward-compatible.
  - **TapAnswer** punya field opsional `picture` + `board` (papan visual: hewan dihitung, papan penjumlahan, kata berhuruf hilang), plus dari dunia Labirin Warna (dulu "Bawah Laut"): `shape` (bentuk geometris berwarna via `src/engine/ui/Shape.tsx` — porting `shapeSVG()`), `sequence` (deret pola "Pola Ajaib" dengan kotak "?"), dan `silhouette` (render `picture` sebagai bayangan gelap untuk Pasar Buah "tebak bayangan"). `ShapeId`/`ShapeSpec` di `types.ts`. Teks jawaban huruf/angka tanpa emoji dibesarkan (`.choice-text--main`, clamp 48–68px; warna kartu diset eksplisit, dulu ikut biru default UA).
  - **Variasi soal anti-bosan (fitur engine)**: `LevelSlot`/`MixedSlot` di `types.ts` — tiap "slot" boleh berisi POOL varian; `GameShell` mengacak 1 varian per slot tiap main & tiap "Main Lagi" (`resolveSlots` + `playNonce`). Semua varian tetap data typed. Bintang per-slot (varian dalam slot berbagi `id`) supaya total bintang/maskot tak membengkak.
  - **4 dunia (kelompok TK)** — config = data typed di `src/games/tk/`:
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
  - **Semua game dibuka** supaya bisa dicoba bebas tanpa login (sejak 2026-07-29 lewat mode kunci `'buka'` di `src/data/access.ts`). Komposisi gratis/berbayar saat rilis: lihat "Sistem Kunci Game" — hanya Hutan Hewan yang gratis.
  - **`hitung-buah` DIHAPUS, dilebur ke `pasar-buah`.** Soal hitung buahnya jadi varian slot count-tap di Pasar Buah, jadi satu dunia buah dengan referensi jauh lebih banyak. Route lama `/game/hitung-buah` otomatis menampilkan "Game tidak ditemukan" (bukan error).
  - `pasar-buah` kini **8 slot × pool varian** (14 jenis buah, ±40 varian), semua slot bertipe pool ala Hutan Hewan: 3 slot count-tap "beli buah" (ketuk 2–3 → 4 → 5–6) → tap-answer "tebak buah" → tap-answer "tebak bayangan" → 2 slot drag-drop "keranjang warna" (3 lalu 4 keranjang) → memory "kartu buah". Slot hitung ketiga memakai id `l8` (di luar urutan) supaya bintang lama di `l1`–`l7` tidak hilang.
  - Config pakai builder typed (`buy`/`guess`/`shadow`/`baskets`/`cards` + `slot()`), tetap data murni. Aturan warna: keranjang kuning & oranye tak pernah muncul di level yang sama (di HP kecil dua warna itu terbaca sama).
- **Kartu maskot bukan tombol** (2026-07-26): dulu kartu "Telur Ajaib" memakai gaya `.btn` persis (kartu putih + bayangan bawah terangkat) sehingga tampak bisa diketuk seperti tombol kelompok di bawahnya. Sekarang jadi **panel status**: `src/engine/ui/mascot.css` (kelas `.mascot-panel*`) — latar krem hangat, bingkai putus-putus, bayangan ke DALAM (bukan terangkat), avatar bulat, label "TEMAN BELAJARMU" + total ⭐ di kanan, chip "Level N", tanpa efek tekan. Berlaku di beranda portal & layar selesai game. Style pindah dari inline ke CSS file (chunk `Mascot`).
- **Pembagian tugas Kenal Huruf vs Taman Huruf** (2026-07-27), teruji headless 380×800 (tiap game dimainkan sampai tamat, tanpa error console & tanpa scroll horizontal):
  - **Kenal Huruf = soal pasangan huruf besar↔kecil**, 26 slot (A–Z) × 2 tipe varian: besar→kecil ("Ini huruf besar F. Mana huruf kecilnya?") dan kecil→besar. `sessionLevels: 8` → 8 huruf acak per sesi, tanpa pengulangan huruf. Id slot `h{L}`, kecuali A/B/M/S/E memakai id lama `l1`–`l5` supaya bintang lama tetap terpakai.
  - **JANGAN buat soal tipe "Mana huruf F?"** (keputusan pemilik, 2026-07-27): huruf jawabannya ikut tertulis di kalimat soal tepat di atas kartu, jadi anak tinggal mencocokkan bentuk tanpa mengenal hurufnya. Prinsip umum: teks/narasi soal tidak boleh memuat jawabannya — tunjukkan satu bentuk huruf sebagai gambar, tanyakan bentuk lainnya.
  - **Taman Huruf = soal benda saja** (lihat gambar → huruf pertama, lalu susun kata). Slot "cocokkan huruf besar/kecil" DIPINDAH ke Kenal Huruf. 7 slot: benda sehari-hari, hewan, makanan & buah, alam & rumah, kendaraan & mainan, susun kata 4 huruf, susun kata 5 huruf — masing-masing 8–12 varian.
  - Tabel huruf mirip + `letterChoices()` + `cap()` pindah ke modul bersama `src/games/tk/letters.ts` (dipakai kedua game). Dua tabel pengecoh: `LOOK` untuk kartu HURUF BESAR (B/D/P, M/N/W) dan `LOOK_LOWER` untuk kartu huruf kecil (b/d/p/q, a/e/o, n/m/r) — pasangan yang tertukar memang beda per bentuk. Default 3 kartu supaya muat satu baris di HP.
- **Labirin Warna: soal warna menyebut bentuknya + 7 bangun datar baru** (2026-07-27), teruji headless 380×800 (dimainkan sampai tamat, tanpa error console & tanpa scroll horizontal):
  - **Soal warna WAJIB menyebut nama bentuknya.** Dulu "Semua bentuknya sama. Sentuh warna merah!" — anak tidak tahu sedang melihat benda apa. Sekarang `warnaQ(bentuk, warna)` → **"Semua bentuknya sama. Sentuh bintang warna merah!"** (keputusan pemilik). Terapkan prinsip yang sama kalau membuat tipe soal warna baru: sebut bentuk + warnanya.
  - **`ShapeId` bertambah 7 bangun datar**: `persegi-panjang`, `trapesium`, `segilima`, `segienam`, `layang-layang`, `bulan` (bulan sabit), `awan` — total 14 bentuk, SVG-nya di `src/engine/ui/Shape.tsx`. Alasannya referensi bentuk terasa itu-itu saja.
  - Pool varian Labirin Warna diperbanyak memakai bentuk baru itu (±110 varian di 10 slot; id slot `l1`–`l10` tidak berubah, jadi bintang lama aman). Pasangan pengecoh mirip yang baru: kotak/persegi panjang, segilima/segienam, bulan/awan. (Pasangan ketupat/layang-layang dibatalkan — lihat catatan 2026-07-28 di bawah.)

- **Bentuk yang tak familiar DIHAPUS dari Labirin Warna** (2026-07-28, keputusan pemilik), teruji headless 380×800 (6× main = 60 soal, nol bentuk terlarang, tanpa scroll horizontal & tanpa error console) + skrip validasi config (10 slot, 109 varian, nol kartu kembar tak sengaja, tiap deret pola tetap 6 sel):
  - **Belah ketupat dihapus** karena (1) di samping layang-layang keduanya tak terbedakan tanpa mengukur panjang sisi, (2) bentuknya sendiri **kurang familiar untuk anak TK**. Semua ±20 varian yang memakainya diganti bentuk yang lebih dikenal anak (lingkaran, kotak, segitiga, bintang, hati, oval, persegi panjang, bulan sabit, awan) — termasuk dua soal warna, satu soal "cari bentuk", soal "yang beda sendiri", "bentuk & warna", dan kartu pengecoh Pola Ajaib.
  - **Trapesium, segilima & segienam ikut dihapus** (keputusan pemilik di sesi yang sama): nama-nama itu materi SD, bukan TK. Tersisa **10 bentuk yang akrab untuk anak**: lingkaran, oval, kotak, persegi panjang, segitiga, bintang, hati, bulan sabit, awan, layang-layang.
  - `ShapeId` untuk keempat bentuk itu tetap ada di engine (`types.ts` + `Shape.tsx`) tapi tak dipakai game mana pun — **jangan dipakai lagi di varian baru**; aturan ini juga ditulis di komentar kepala `src/games/tk/labirin-warna.ts`.
  - Pasangan pengecoh mirip yang dipakai sekarang: kotak/persegi panjang, lingkaran/oval, bintang/hati, bulan/awan, segitiga/layang-layang.
  - `Shape.tsx` kini menandai tiap SVG dengan `data-shape="<kind>"` supaya tes headless bisa memeriksa bentuk yang tampil di layar.

- **Gambar di kartu memory mengisi kartu** (2026-07-28), teruji headless 380×800, 360×640 & 820×1180 (Pasar Buah "kartu buah" + Kartu Kembar, tanpa scroll & tanpa error console):
  - Dulu emoji buah dipatok `clamp(36px, 9vw, 56px)` — kartunya besar tapi buahnya kecil di tengah (keluhan pemilik). Sekarang `.memory-card` jadi **container** (`container-type: inline-size`) dan isinya diukur dengan `cqw`: `.memory-face` = `88cqw`, punggung kartu `44cqw`. Ukuran ikut lebar kartu, jadi otomatis pas di 3 kolom (6 kartu) maupun 4 kolom (8 kartu) dan di HP maupun tablet. Terukur di HP 380px: 36px → **60px**; tablet: → 135px.
  - **`cqw` harus dipasang di ISI kartu, bukan di `.memory-card` sendiri** — pada elemen container-nya sendiri `cqw` mengacu ke container ancestor (viewport), percobaan pertama menghasilkan font 296px dan layar melebar.
  - Ada fallback `clamp()` di luar `@supports (container-type: inline-size)` untuk browser Android lawas tanpa container query.
  - Grid memory pakai kelas sendiri `.memory-grid` (gap 9px, lebih rapat dari `.choice-grid` 14px) supaya 4 kartu sebaris di HP jadi selebar mungkin.
  - Kartu ber-seni WebP (`memory-face__img`, mis. Kartu Kembar) tidak berubah — sudah 88% kartu sejak awal.

- **Buah di Pasar Buah dibesarkan ±2× di SEMUA tipe soal** (2026-07-29, keluhan pemilik "gambar buahnya masih kelihatan kecil"), teruji headless 380×800, 360×640 & 820×1180 (8 slot dimainkan sampai tamat: beli buah → tebak buah → tebak bayangan → keranjang warna → kartu buah; tanpa scroll horizontal/vertikal & tanpa error console):
  - Prinsipnya: **layar punya sisa tinggi, yang menentukan besar gambar adalah LEBAR kartu.** Jadi solusinya bukan sekadar menaikkan `font-size`, tapi mengurangi jumlah kolom + mengukur gambar dengan `cqw` (container query) seperti kartu memory.
  - **`.choice-card` jadi container** (`container-type: inline-size`) dan emoji jawaban dibungkus `.choice-emoji` = `72cqw` (`56cqw` kalau kartunya juga berteks). Terukur di HP 380px: 44px → **114px**.
  - **JEBAKAN: `<button>` punya padding bawaan UA (1px 6px)** dan container query mengukur CONTENT box — padding itu diam-diam mengecilkan tiap gambar. Sekarang `.choice-card` memasang `padding: 4px` sendiri (count-cell `2px`). Kalau angka `cqw` terasa meleset, cek padding kartunya dulu.
  - **Kartu jawaban bergambar jadi 2 kolom** (`.choice-grid--pics`, `minmax(150px, 1fr)`): dipakai `TapAnswer` hanya kalau SEMUA pilihan murni gambar (tanpa teks/bentuk) — jadi Hutan Hewan (angka), Kenal Huruf/Taman Huruf (huruf) & Labirin Warna (bentuk) tetap pakai grid rapat seperti dulu.
  - **Papan "Beli Buah" (count-tap) pakai 3 kolom kalau isinya ≤ 9 sel**, 4 kolom kalau lebih (kalau selalu 3 kolom, papan 10+ sel jadi terlalu tinggi untuk HP 640px). Sel jadi kotak (`aspect-ratio: 1`), gap 8px, emoji `84cqw` → 44px menjadi **90px** (papan 3 kolom) / **65px** (papan 4 kolom).
  - **Kartu memory 3 kolom sampai 9 kartu** (dulu ≤6): papan 8 kartu jadi 3+3+2 dengan kartu lebih lebar, bukan dua baris berisi 4 kartu sempit. Aturan `88cqw` di `.memory-face` tidak diubah.
  - **Drag & drop**: buahnya (`.dd-emoji`) `clamp(62px, 18vw, 88px)`, chip `clamp(92px, 25vw, 128px)`. Titik warna di keranjang kosong (`.dd-emoji--target`) sengaja TIDAK dibesarkan — itu label, bukan subjek soal. **`.dd-target` harus tetap `min-height: 110px`**: level 4 keranjang + sebaris chip buah pas-pasan di 360×640, versi 118px membuat layar ikut scroll.

- **Persamaan angka di bawah papan gambar (penjumlahan & pengurangan)** (2026-07-27), teruji headless 380×800 (5 soal matematika Hutan Hewan, tanpa scroll & tanpa error console):
  - Field engine baru `TapAnswerData.equation` (opsional, string): satu baris persamaan **"1 + 4 = ?"** / **"7 − 3 = ?"** di bawah papan gambar, supaya anak menghubungkan "sebanyak ini" dengan lambang bilangannya. Render `.ta-equation` di `TapAnswer.tsx` + `engine.css` (varian `--dense` untuk papan padat).
  - Bentuknya **persamaan utuh, bukan angka kecil di bawah tiap kelompok** (keputusan pemilik 2026-07-27 — percobaan pertama pakai angka per-kelompok, ditolak).
  - Papan gambar penjumlahan sekarang cukup `gambar + gambar` (op `equals`/`question` dilepas) karena baris persamaan sudah membawa "= ?"; papan pengurangan tetap `hewan → rumah`.
  - **Hanya untuk soal persamaan** (`add()`/`sub()` di `hutan-hewan.ts`). JANGAN pasang di soal "ayo hitung" biasa — angkanya jadi jawaban soal itu sendiri.

- **Template baru `path-trace` + game "Jalan Kendaraan" (TK)** (2026-07-28), teruji headless 360×640, 380×800 & 820×1180 (6 level sampai tamat + "Main Lagi", 8 bentuk jalan tercek, tanpa scroll & tanpa error console):
  - `src/engine/templates/PathTrace.tsx` — anak menyusuri **jalan raya** dengan satu jari sambil mengantar kendaraan ke tujuan (latihan motorik/pra-menulis, saudara dari template `tracing` tapi mengikuti jalan, bukan huruf). Jalan digambar SVG: pinggir oranye + aspal abu + garis putus-putus putih; bagian yang sudah dilewati jadi **kuning**; kendaraan berputar mengikuti arah jalan (emoji di-`scaleX(-1)` dulu karena emoji kendaraan menghadap kiri).
  - Aturan ramah anak: kemajuan **hanya maju** (lepas jari tidak mengulang dari awal), goyang sedikit di pinggir jalan tidak dihitung salah; **keluar jauh dari jalan** = satu kali salah → kendaraan balik ke start + "Coba lagi, kamu pasti bisa!". Sentuhan harus dimulai di kendaraannya.
  - Geometri jalan ada di ENGINE (`roadPath()`), config cuma menyebut namanya: `RoadKind` = `lurus`, `bukit`, `gelombang`, `zigzag`, `tangga`, `lengkung` (U), `ess` (S) + `steps` (jumlah kelokan). Data level: `PathTraceData { road, vehicle, vehicleItem?, goal? }`.
  - `src/games/tk/jalan-kendaraan.ts` — 10 slot × kolam varian (kendaraan + tujuan berbeda: mobil→rumah, ambulans→rumah sakit, traktor→sawah, dll.), `sessionLevels: 6` jadi tiap main 6 jalan acak. Urutan sulit: lurus → bukit → gelombang → zigzag → tangga → lengkung → S → zigzag panjang.
  - Pakai **kendaraan darat** saja di config (emoji menghadap samping); pesawat/helikopter/roket terlihat aneh saat diputar mengikuti jalan.
  - **Gerakan digerakkan rAF, BUKAN state React** (perbaikan 2026-07-28 "kurang smooth"): pointer event hanya mencatat posisi jari; satu loop `requestAnimationFrame` meng-ease posisi + arah kendaraan lalu menulis `transform` & `stroke-dashoffset` langsung ke DOM. Tidak ada render ulang React selama jari menempel. JANGAN kembalikan posisi kendaraan ke `useState` dan jangan pasang `transition` di `.road-done` — dua hal itu sumber tersendatnya. Terukur 60fps stabil (median frame 16,7 ms) di Chromium dengan CPU di-throttle 4×.
  - Kolam perjalanan **±50 kombinasi kendaraan+tujuan** dalam 6 tema (`KOTA`, `PENOLONG`, `DESA`, `MAIN`, `KERETA`, `PETUALANG`); tema berbeda dipasang di slot berbeda supaya satu sesi tidak mengulang kendaraan yang sama. Terukur: 5× main = 22 perjalanan berbeda dari 30 level.

- **Lanjutkan permainan (save state per game)** (2026-07-28), teruji headless 380×800 (Hutan Hewan & Kenal Huruf: main 3 level → keluar → buka lagi → lanjut level 4 dengan soal yang sama persis, lalu tamat, tanpa error console):
  - Dulu tiap masuk game selalu mulai dari level 1. Sekarang posisi main tersimpan: `src/engine/core/session.ts` (localStorage `pp_session_v1`, per gameId) menyimpan **picks** (`{s: indeks slot, v: indeks varian}`) + `index` level berjalan + bintang yang sudah didapat.
  - Yang disimpan hanya indeks, BUKAN objek level — jadi kalau config game diubah, sesi lama divalidasi (`getSession` mengecek indeks masih dalam jangkauan) dan otomatis dibuang kalau tak cocok, bukan menampilkan soal basi.
  - Karena picks ikut tersimpan, anak melanjutkan dengan **soal yang sama** (varian & — untuk game ber-`sessionLevels` — subset acak yang sama), bukan soal baru.
  - Layar intro: kalau ada sesi tersimpan tampil **"▶️ Lanjut Level N"** (utama) + **"🔄 Mulai dari Awal"**; kalau tidak ada, tetap satu tombol "▶️ Mulai Main".
  - Sesi disimpan tiap kali naik level, dan DIHAPUS saat game tamat atau saat pilih "Mulai dari Awal"/"Main Lagi" (main lagi selalu roll varian baru dari level 1).
  - Bintang tetap terpisah di `progress.ts` (nilai terbaik per level) — sesi hanya soal "sampai mana", tidak menurunkan bintang.

- **Lonceng notifikasi (pengumuman & update)** (2026-07-28, dua sasaran pembaca ditambahkan 2026-07-29), teruji headless 380×800, 360×640 & 820×1180 (buka/tutup, badge, persist setelah reload, filter pengunjung vs pembeli, tanpa scroll horizontal & tanpa error console):

  **Tempat & isi**
  - Lonceng ada di **`TopBar`**, jadi otomatis muncul di **landing (`/`) dan portal (`/portal`)** — dua tempat yang dilihat orang tua. Prop `bell` (default `true`) untuk mematikannya di layar khusus anak nanti.
  - Isi pengumuman = data typed di **`src/data/announcements.ts`** (`{ id, date, tag, title, body, audience? }`, terbaru di atas). Menambah kabar = menambah satu entri di file itu, tidak menyentuh komponen. 4 tag berwarna: `baru` (hijau), `update` (biru), `info` (ungu), `promo` (oranye).
  - **`id` wajib unik & TIDAK boleh diubah** — status sudah-dibaca disimpan per id (`localStorage` `pp_notif_read_v1`, helper di `src/portal/notifications.ts`). Ganti id = pengumuman lama muncul lagi sebagai baru.

  **Siapa yang melihat (KEPUTUSAN PEMILIK 2026-07-29)**
  - Field opsional `audience`: **`'semua'`** (bawaan kalau tidak ditulis) dan **`'pembeli'`**. Yang `'pembeli'` disembunyikan dari pengunjung yang belum login, **termasuk tidak dihitung di badge**. Filternya satu tempat: `announcementsFor(isBuyer)`.
  - Bahasa pemilik saat minta pengumuman baru: *"ada update baru: …"* = untuk semua; *"ada update **khusus pembeli**: …"* = `audience: 'pembeli'`. Kalau tidak disebut, anggap **semua**.
  - Kabar yang menarik orang kembali (game baru, promo) HARUS `'semua'` — yang paling perlu mendengarnya justru yang belum beli. `'pembeli'` hanya untuk hal yang tak bisa ditindaklanjuti pengunjung. Kalau pemilik menandai kabar promosi sebagai khusus pembeli, konfirmasi dulu.
  - **Sementara `isBuyer` = "sudah login"** (`user !== null` di `NotificationBell`), karena status pembelian baru ada di Fase 5. Saat kode aktivasi jadi, ganti argumen itu dengan kepemilikan kelompok yang sebenarnya — `announcementsFor` tak perlu diubah.
  - **`markAllRead` HANYA menandai pengumuman yang TERLIHAT** (`markAllRead(visible)`), tidak pernah seluruh daftar. Kalau menandai semua, pengumuman khusus pembeli ikut tertandai terbaca saat panel dibuka pengunjung, lalu **tidak pernah muncul sebagai baru** setelah orang tua login — kabarnya hilang diam-diam. Teruji: pengunjung buka panel (badge 0) → login → badge kembali 1 hanya untuk item khusus.

  **UI & jebakan CSS**
  - `src/portal/NotificationBell.tsx` + `notifications.css`: tombol lonceng 42px senada `.topbar__btn`, badge merah berisi jumlah belum dibaca (`9+` kalau lebih), lonceng bergoyang halus 2× saat ada kabar baru (dimatikan oleh `prefers-reduced-motion`). Panel ala dropdown: header "Pengumuman", daftar bisa di-scroll, item baru bertanda rel oranye + latar krem. Membuka panel = yang terlihat ditandai terbaca (badge hilang), tapi sorotan item baru tetap tampil selama panel terbuka.
  - Tutup: tombol ✕, tombol Escape, atau ketuk di luar panel. **JANGAN pakai elemen backdrop `position: fixed`** — `.topbar` punya `backdrop-filter`, jadi elemen fixed di dalamnya hanya menutupi header, bukan layar; karena itu pakai listener `pointerdown` di document.
  - **Panel di-anchor ke `.topbar` (yang `sticky`), bukan ke tombol loncengnya** (`.notif` sengaja `position: static`). Kalau di-anchor ke lonceng, panel selebar 360px terdorong keluar layar kiri di HP karena lonceng bukan elemen paling kanan.
  - Header sempit: sejak ada `LockToggle` (mode penguji) isinya bisa 4 tombol. `.topbar__btn` `white-space: nowrap` + padding/gap dirapatkan di `@media (max-width: 400px)` supaya tidak saling tabrak di HP 360px.

- **Isi kelompok SD Kelas 1 & 2: 7 game baru** (2026-07-30), teruji headless 380×800 & 360×640 (tiap game dimainkan sampai layar "Selamat!", tanpa scroll & tanpa error console) + skrip validasi config (306 varian: jumlah pilihan, jawaban benar tepat satu, kartu kembar tak sengaja, pengecoh, pasangan drag-drop 1:1):

  **Kapan dirilis (KEPUTUSAN PEMILIK 2026-07-30)**
  - SD **baru dirilis setelah Playgroup & TK sukses launching.** Sekarang statusnya bahan uji coba: dibuat lengkap supaya bisa dicoba & direvisi lebih dulu, bukan untuk dijual dulu.
  - **Tidak ada yang perlu diubah di `src/data/access.ts`**: tak satu pun game SD masuk `FREE_GAME_IDS`, jadi begitu mode `'kunci'` dinyalakan saat launching TK, semua game SD otomatis terkunci. Landing page juga sudah menandai kelompok SD **"🚀 Segera Hadir"**.

  **Daftar game (semua di `src/games/sd1/`, terdaftar di `registry.ts`)**
  | id | template | isi | slot × varian |
  |---|---|---|---|
  | `hitung-hebat` | mixed | tambah/kurang bergambar → bilangan dua digit → hitung benda → membandingkan → bilangan hilang → perkalian → uang rupiah | 10 × 70 |
  | `suku-kata` | tap-answer | melengkapi suku kata yang hilang (BU-__), menghitung suku kata, memilih tulisan yang benar | 8 × 56 |
  | `ejaan-jitu` | spell | menyusun kata 3–6 huruf dari 8 tema | 8 × 50 |
  | `pasangan-pintar` | mixed | profesi↔alat, hewan↔rumah, lawan kata, soal↔hasil, benda↔tempat + kartu ingatan | 7 × 24 |
  | `jam-pintar` | tap-answer | jam tepat, setengah jam, sebutan "setengah ...", arah jarum, jam kegiatan | 8 × 48 |
  | `tulis-huruf` | tracing | menulis A–Z, tiap huruf punya varian besar & kecil | 26 × 52 |
  | `cerita-nusantara` | story-choice | 6 cerita rakyat/fabel, masing-masing 2 titik pilihan | 3 × 6 |

  **Yang membedakannya dari game TK (jangan disamakan lagi)**
  - **Hitung Hebat vs Hutan Hewan**: di TK gambar yang dihitung; di SD **lambang bilangan** yang jadi soal — gambar cuma jembatan di dua slot pertama.
  - **Suku Kata vs Taman Huruf**: TK mencari HURUF pertama, SD membaca POTONGAN KATA.
  - **Ejaan Jitu vs slot "susun kata" Taman Huruf**: narasi TK mengejakan hurufnya satu-satu ("R, O, K, E, T"); di SD narasi **hanya menyebut bendanya** — anak sendiri yang harus tahu ejaannya. Skrip validasi menolak narasi yang mengejakan huruf.
  - **Pasangan Pintar vs Pasang Kata**: Pasang Kata memasangkan kata dengan gambar bendanya; Pasangan Pintar mencari HUBUNGAN (profesi–alat, hewan–rumah, lawan kata).

  **Jebakan yang sudah kena & sudah diperbaiki — jangan diulang**
  - **Jawaban teks panjang melebarkan layar.** `.choice-text--main` (clamp 48–68px) dirancang untuk SATU huruf/angka. Jawaban seperti "Rp15.000" atau suku kata "SANG" tidak punya spasi, jadi tidak bisa turun baris dan mendorong kartu melebihi kolom grid. Sekarang `mainTextClass()` di `TapAnswer.tsx` menurunkan ukuran bertahap: ≤3 huruf tetap besar, 4–6 huruf `--md` (30–44px), 7+ huruf `--sm` (20–28px), plus `overflow-wrap: anywhere`. **Kalau menambah jawaban teks panjang, jangan menambal dengan CSS baru — ukurannya sudah otomatis.**
  - **Papan teks `board` dipecah di SPASI BIASA.** Persamaan "8 + 7 = ?" harus direkatkan pakai NBSP per ruas (lihat `equationBoard()` di `hitung-hebat.ts`) supaya barisnya tidak patah di tengah bilangan dan tandanya. Deret bilangan (soal "bilangan yang hilang") justru sengaja pakai spasi biasa supaya boleh turun baris di HP kecil.
  - **Drag & drop menampilkan kartu dalam urutan config**, jadi kalau kartu ditulis sejajar dengan targetnya anak bisa menebak dari POSISI tanpa membaca. `match()` di `pasangan-pintar.ts` sengaja menggeser urutan kartu satu posisi; validasi ikut memeriksanya.
  - **Soal "arah jarum jam" hanya untuk jam tepat.** Pada pukul setengah, jarum pendek ada di ANTARA dua angka — kalimat "jarum pendek di angka 2" akan mengajarkan hal yang keliru. Sebutan "setengah" ala Indonesia (07.30 = "setengah **delapan**", setengah jalan MENUJU jam berikutnya) ada di `halfToward()`.
  - **Emoji isyarat tidak boleh dipakai dua arti.** Sempat ada 🪑 untuk "meja" sekaligus "kursi" dan 🥛 untuk "susu" sekaligus "gelas" — membingungkan anak yang harus menebak bendanya.
  - **Pengecoh tidak boleh sama dengan jawaban.** Sempat ada soal KUR-SI dengan pengecoh "KUR" (= jawabannya sendiri). Validasi sekarang menolak kartu kembar di satu soal.

  **Bonus: satu bug LAMA ikut ketahuan & diperbaiki**
  - Papan gambar berisi **tepat 6 gambar + baris `equation`** membuat layar HP 360×640 scroll — terukur **+112px di Hutan Hewan (TK)**, jadi ini bug engine yang sudah ada sejak fitur `equation` (2026-07-27), bukan bawaan game SD. Penyebabnya `denseBoard` di `TapAnswer.tsx` hanya melihat jumlah gambar (`> 6`) dan tidak menghitung baris persamaan yang memakan satu baris tambahan.
  - Sekarang: `boardItemCount > 6 || (equation && boardItemCount > 5)`. Ambangnya digeser **hanya untuk papan berpersamaan** — papan 6 gambar TANPA persamaan (mis. soal "ayo hitung" di Hutan Hewan) tetap tampil besar seperti dulu. Teruji ulang: seluruh papan Hutan Hewan (2–11 gambar) muat di 360×640.

- **Tambah Tangkas dirombak: persamaan tampil di layar + 7 soal per sesi + kolam varian** (2026-08-01, permintaan pemilik dari tangkapan layar "Berapa 4 tambah 4?" yang tengahnya kosong), teruji headless 360×640, 380×800 & 820×1180 (12 sesi × 7 soal dimainkan sampai "Selamat!", 59 soal berbeda terlihat, tanpa scroll horizontal/vertikal & tanpa error console):
  - **Tiap soal sekarang menampilkan persamaannya** (`equation`: "4 + 4 = ?"), bukan cuma dinarasikan. Anak kelas 1–2 sedang belajar MEMBACA lambang bilangan & tanda +, jadi kalimat matematikanya harus terlihat. Ini sekaligus mengisi ruang tengah layar yang dulu kosong.
  - **`equation` boleh dipakai TANPA papan gambar** (dulu hanya di bawah `boardItems`). Aturan lama tetap berlaku: jangan di soal "ayo hitung" bergambar — di sana angkanya jadi jawaban soal itu sendiri.
  - `tambah-tangkas.ts` dari 4 level tetap → **10 slot × kolam varian (87 varian)** + `sessionLevels: 7`: jumlah kecil → sampai 10 → dobel → tambah 10/puluhan → melewati sepuluh → puluhan+puluhan → dua digit+satu digit → tiga bilangan → suku yang hilang ("5 + ? = 9") → soal cerita. Id slot `l1`–`l4` dipertahankan supaya bintang lama tidak hilang.
  - **BATAS BILANGAN 30 untuk SD Kelas 1 & 2 (KEPUTUSAN PEMILIK 2026-08-01).** Percobaan pertama sempat memuat "48 + 6 = 54" dan "50 + 50" — terlalu besar. Aturannya sekarang: **tidak ada bilangan MAUPUN hasil yang lebih dari 30**, termasuk angka di kartu pengecoh dan angka di dalam kalimat soal cerita. Berlaku untuk `tambah-tangkas` DAN `hitung-hebat` (slot dua digit, membandingkan bilangan, bilangan hilang ikut diturunkan). **Satu-satunya pengecualian: slot UANG di Hitung Hebat** — nominal rupiah asli (Rp1.000–Rp15.000) tak bisa dipaksa ke skala 30. Aturan ini ditulis juga di komentar kepala kedua file config; kalau nanti anak dinilai sudah siap, naikkan batasnya di satu tempat itu.
  - **Perbaikan engine: persamaan panjang mengecil sendiri.** `.ta-equation` itu `white-space: nowrap` (persamaan yang patah dua baris berhenti terbaca sebagai satu kalimat), jadi "10 + 5 + 3 = ?" dulu MELEBARKAN layar 380px (391px). Sekarang `equationClass()` di `TapAnswer.tsx` menurunkan ukuran per panjang teks: ≤11 karakter tetap besar, ≤15 `--long`, lebih dari itu `--xlong`. **Kalau menambah persamaan panjang, jangan menambal dengan CSS baru** — ukurannya sudah otomatis (pola yang sama dengan `mainTextClass()`).

- **Pasang Kata: gambar hewan pakai seni impor + gambar dibesarkan** (2026-08-01, keluhan pemilik "itu terlalu kecil"), teruji headless 360×640, 380×800 & 820×1180 (3 level dimainkan sampai "Selamat!", semua WebP termuat, tanpa scroll & tanpa error console):
  - **Aturan: kalau soalnya memuat HEWAN, pakai seni yang sudah diimpor** (id item registry `src/engine/ui/items.ts` → `public/assets/items/*.webp`), jangan emoji. Berlaku untuk game mana pun, bukan cuma Pasang Kata — emoji hewan beda bentuk di tiap HP.
  - Engine drag-drop menyusul template lain: `DragTarget.item` & `DragItem.item` (id registry, dirender `ItemPic`, fallback ke `emoji` kalau asetnya belum ada). Kucing/kelinci/monyet/kambing/rumah/matahari di Pasang Kata kini seni WebP; bola/buku/mobil/pohon masih emoji sampai asetnya dibuat — tinggal isi `item`.
  - Field baru `DragDropData.pictureTargets` (opsional): "gambar di kotak tujuan itu SOALNYA" → kotak lebih tinggi + gambar ±2× (terukur di HP 360: 40px → **85px**). **Keranjang warna Pasar Buah sengaja TIDAK memakainya** — di sana titik warna cuma label, dan kotak yang lebih tinggi membuat level 4 keranjang tak muat di 360×640 (aturan `min-height: 110px` yang lama tetap berlaku, sudah diverifikasi ulang).
  - **JEBAKAN CSS: aturan gambar di kotak KOSONG (`.dd-img--target`) harus ditulis SESUDAH aturan gambar di kotak terisi (`.dd-img`)** — specificity-nya sama (dua kelas), jadi kalau dibalik yang menang justru aturan umum dan cue-nya mengecil. Percobaan pertama kena ini: gambar kucing 58px, bukan 83px.
  - Anjing di level "hewan & makanannya" diganti **kambing → rumput**: tak ada seni anjing, dan proyek ini memang tidak memakai anjing (lihat Hutan Hewan).
  - Kartu kata dapat `padding: 4px 10px`: kata panjang ("matahari", "kambing") dulu persis selebar kartu sehingga hurufnya menempel di tepi putih.

- **Pasang Kata diperbanyak: 3 level tetap → 9 slot × kolam varian, 6 soal per sesi** (2026-08-01), teruji headless 360×640, 380×800 & 820×1180 (10 sesi × 6 level = 60 level dimainkan sampai "Selamat!", 32 kombinasi soal berbeda, semua WebP termuat, tanpa scroll & tanpa error console):
  - 9 tema: hewan berkaki empat (seni WebP) · benda di sekitar rumah · hewan & makanannya · hewan air & unggas (seni WebP) · buah · kendaraan · benda sekolah · makanan & minuman · alat musik & mainan. **36 varian**, `sessionLevels: 6`. Id slot `l1`–`l3` dipertahankan supaya bintang lama tidak hilang.
  - **Kartu kata sengaja DIGESER satu posisi dari kotaknya** (`words()`/`food()` di config): kalau kata ke-i selalu sejajar dengan gambar ke-i, anak bisa menebak dari POSISI tanpa membaca — pelajaran yang sama seperti `match()` di Pasangan Pintar.
  - **Identitas game dijaga**: Pasang Kata = kata ↔ gambar bendanya (latihan membaca). Slot "hewan & makanannya" tetap boleh karena kartunya masih kata hewan yang harus dibaca. Soal HUBUNGAN lain (profesi–alat, lawan kata) tetap milik Pasangan Pintar — jangan dipindah ke sini.
  - Emoji tak boleh dipakai dengan dua arti berbeda (aturan lama): percobaan pertama sempat memberi label "seruling" pada 🎺 (terompet) dan "papan tulis" pada 📋 — keduanya sudah diganti.

- **Jam Pintar: muka jam digambar sendiri, LENGKAP DENGAN ANGKA 1–12** (2026-08-01, keluhan pemilik dari tangkapan layar "jamnya gaada angkanya"), teruji headless 360×640, 380×800 & 820×1180 (8 slot dimainkan sampai "Selamat!", tanpa scroll & tanpa error console):
  - Dulu jam dirender pakai **emoji muka jam** (🕐–🕧). Emoji itu **tidak punya angka sama sekali** — anak cuma bisa membandingkan sudut jarum, bukan membaca jam — dan di sebagian HP jarumnya nyaris tak terlihat (lihat tangkapan layar pemilik). **JANGAN dipakai lagi.**
  - Sekarang ada komponen engine **`src/engine/ui/Clock.tsx`**: muka jam SVG dengan **angka 1–12**, titik penanda jam, dan dua jarum yang sengaja dibedakan — **jarum pendek gemuk biru tua** vs **jarum panjang tipis merah**, supaya "jarum pendek/panjang" jelas di layar HP. Tampilannya sama persis di semua perangkat (tidak bergantung font emoji), pola yang sama dengan `Shape.tsx`.
  - Jarum pendek **ikut bergeser mengikuti menit** (`hourDeg = jam*30 + menit*0.5`), jadi pukul setengah benar-benar terlihat di ANTARA dua angka — inilah yang membuat soal "setengah" bisa dibaca.
  - Field data baru: **`TapAnswerData.clock`** (jam besar sebagai cue soal) dan **`TapChoice.clock`** (jam di kartu jawaban), keduanya `ClockSpec { h: 1–12, m?: 0–59 }` di `types.ts`. Config cukup menyebut waktunya; bentuk jamnya urusan engine.
  - Kartu jawaban berisi jam ikut memakai **grid lebar 2 kolom** (`choice-grid--pics`) — angka di muka jam baru terbaca kalau kartunya lebar. Terukur: kartu 153px di HP 380px, cue 213px; tablet 820px cue 260px.
  - **`.choice-text--md` diturunkan ke `clamp(26px, 7.6vw, 44px)`**: jawaban jam "10.30" (5 karakter tanpa spasi) dulu patah dua baris jadi "10.3 / 0" di kartu 3 kolom HP 380px. Ini melengkapi `mainTextClass()` — ukurannya tetap otomatis, jangan menambal dengan CSS baru.
  - `Clock.tsx` menandai tiap SVG dengan `data-clock="H:MM"` supaya tes headless bisa memeriksa jam yang benar-benar tampil.

## Saluran Kontak "Hubungi Kami" (KEPUTUSAN PEMILIK — 2026-07-29)

- **WhatsApp = saluran utama, email = cadangan.** Orang tua Indonesia sudah hidup di WA (hambatan paling kecil); email tetap ada untuk pesan panjang + lampiran dan untuk yang enggan chat langsung. Keduanya cuma link — tanpa backend, tanpa data yang disimpan, tanpa moderasi. (Form dalam app ditolak: butuh Cloud Function + rules + anti-spam, dan pemilik tak bisa membalas.)
- **Kontak diisi di satu file: `src/data/contact.ts`** (`contact.whatsapp` = format internasional digit saja mis. `62812…`, `contact.email`). `whatsappUrl()`/`emailUrl()` menyusun link + pesan pembuka. Email sekarang masih alamat pribadi pemilik (`2013.tib@gmail.com`), ditandai `Temporary` di komentar.
- **Nilai kosong = seluruh bagian TIDAK dirender** (`FeedbackSection` mengembalikan `null`). Jadi aman ter-deploy sebelum kontak diisi — tak pernah ada tombol mati.
- Nomor & email itu **PUBLIK** begitu ter-deploy (ada di JS yang dikirim ke browser). Sebaiknya nomor WhatsApp Business, bukan pribadi.
- **Nada bicara (revisi pemilik 2026-07-29):** judul **"Hubungi Kami"** (bukan "Ada kritik atau saran?"), pengantar satu baris *"Ada pertanyaan lebih lanjut? Silakan hubungi lewat:"*. Pesan otomatis WA/email cukup **satu kalimat** — *"Halo, saya mau bertanya tentang Petualangan Pintar."* JANGAN kembalikan format laporan masukan (kolom "Masukan saya", merek HP, browser) — sudah ditolak. JANGAN menjanjikan waktu balasan.
- **Tombolnya sengaja kecil**: dua chip 40px selebar tulisannya ("WhatsApp", "Email"), putih + bingkai tipis, warna merek hanya di ikon. Ini pelengkap di kaki halaman, tidak boleh bersaing dengan tombol "Main Sekarang". Percobaan pertama (blok penuh 54px hijau solid) ditolak pemilik karena terlalu menonjol.
- Komponen: `src/portal/FeedbackSection.tsx` + `feedback.css` (stylesheet sendiri supaya bisa dipakai ulang di halaman orang tua lain). Tampil di **landing (`/`) saja**, setelah FAQ.
- **JANGAN pasang di area anak** (`/portal`, `/kelompok/*`, `/game/*`): standar UX anak melarang link keluar dari area anak.

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
