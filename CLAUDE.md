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
| Harga | Naik per jenjang: Playgroup & TK Rp39rb (perkenalan Rp19rb), SD Kelas 1 & 2 Rp49rb (perkenalan Rp29rb) — selalu < Rp50rb |
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

  **Kapan dirilis (~~KEPUTUSAN PEMILIK 2026-07-30~~ → DIGANTI 2026-08-07)**
  - ~~SD baru dirilis setelah Playgroup & TK sukses launching.~~ **DIBATALKAN: SD dijual BARENG TK sejak hari pertama** (keputusan pemilik 2026-08-07 — lihat entri "SD Kelas 1 & 2 ikut dijual sejak launching" di bawah).
  - **Tidak ada yang perlu diubah di `src/data/access.ts`**: tak satu pun game SD masuk `FREE_GAME_IDS`, jadi begitu mode `'kunci'` dinyalakan saat launching, semua game SD ikut terkunci & minta kode aktivasi — persis yang dibutuhkan kelompok berbayar.

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

- **Tulisan di kartu drag & drop dibesarkan** (2026-08-02, keluhan pemilik dari tangkapan layar Pasang Kata: *"anak SD awal masih suka tulisan yang gede"*), teruji headless 360×640, 380×800 & 820×1180 (29 varian Pasang Kata/Pasangan Pintar + level keranjang Pasar Buah, tanpa scroll & tanpa error console):
  - **Kartu kata (tanpa gambar) 20px → 27–34px** lewat `wordClass()` di `DragDrop.tsx` + kelas `.dd-word/--md/--sm`: ≤6 huruf paling besar, 7–8 huruf turun satu tingkat ("matahari"), 9+ huruf dua tingkat ("layang-layang"). Polanya sama dengan `mainTextClass()` di TapAnswer — **jangan menambal dengan CSS baru saat menambah kata panjang**, ukurannya sudah otomatis.
  - **Kata yang menemani gambar di kartu (`.dd-text`) 20px → 22–27px**: di slot "hewan & makanannya" (Pasang Kata) dan Pasangan Pintar, kartunya bergambar TAPI katanya tetap harus dibaca. Naiknya lebih kecil karena harus berbagi kartu dengan gambar.
  - **Kata yang sudah ditaruh di kotak tetap besar**: dulu kata pindah ke `.dd-label` (17px) begitu dijatuhkan, jadi tiba-tiba mengecil. Sekarang kartu kata polos memakai `wordClass()` yang sama di dalam kotak; `.dd-label` sendiri naik 17px → 20px (nama keranjang Pasar Buah ikut lebih terbaca).
  - **`.dd-targets` margin-bawah 24px → 16px.** Tulisan yang lebih besar menambah tinggi; di HP 360×640 (Pasangan Pintar, kartu bergambar + nama) layar sempat scroll 5px. Tinggi itu diambil dari jarak antar-blok, bukan dengan mengecilkan tulisan lagi.

- **Jam Pintar: muka jam digambar sendiri, LENGKAP DENGAN ANGKA 1–12** (2026-08-01, keluhan pemilik dari tangkapan layar "jamnya gaada angkanya"), teruji headless 360×640, 380×800 & 820×1180 (8 slot dimainkan sampai "Selamat!", tanpa scroll & tanpa error console):
  - Dulu jam dirender pakai **emoji muka jam** (🕐–🕧). Emoji itu **tidak punya angka sama sekali** — anak cuma bisa membandingkan sudut jarum, bukan membaca jam — dan di sebagian HP jarumnya nyaris tak terlihat (lihat tangkapan layar pemilik). **JANGAN dipakai lagi.**
  - Sekarang ada komponen engine **`src/engine/ui/Clock.tsx`**: muka jam SVG dengan **angka 1–12**, titik penanda jam, dan dua jarum yang sengaja dibedakan — **jarum pendek gemuk biru tua** vs **jarum panjang tipis merah**, supaya "jarum pendek/panjang" jelas di layar HP. Tampilannya sama persis di semua perangkat (tidak bergantung font emoji), pola yang sama dengan `Shape.tsx`.
  - Jarum pendek **ikut bergeser mengikuti menit** (`hourDeg = jam*30 + menit*0.5`), jadi pukul setengah benar-benar terlihat di ANTARA dua angka — inilah yang membuat soal "setengah" bisa dibaca.
  - Field data baru: **`TapAnswerData.clock`** (jam besar sebagai cue soal) dan **`TapChoice.clock`** (jam di kartu jawaban), keduanya `ClockSpec { h: 1–12, m?: 0–59 }` di `types.ts`. Config cukup menyebut waktunya; bentuk jamnya urusan engine.
  - Kartu jawaban berisi jam ikut memakai **grid lebar 2 kolom** (`choice-grid--pics`) — angka di muka jam baru terbaca kalau kartunya lebar. Terukur: kartu 153px di HP 380px, cue 213px; tablet 820px cue 260px.
  - **`.choice-text--md` diturunkan ke `clamp(26px, 7.6vw, 44px)`**: jawaban jam "10.30" (5 karakter tanpa spasi) dulu patah dua baris jadi "10.3 / 0" di kartu 3 kolom HP 380px. Ini melengkapi `mainTextClass()` — ukurannya tetap otomatis, jangan menambal dengan CSS baru.
  - `Clock.tsx` menandai tiap SVG dengan `data-clock="H:MM"` supaya tes headless bisa memeriksa jam yang benar-benar tampil.
  - **Ikon kartu game ikut diganti** (2026-08-02, keluhan pemilik dari tangkapan layar daftar game SD): kartu Jam Pintar dulu memakai emoji 🕒 yang di HP tampil seperti piringan abu-abu polos tanpa angka. Sekarang kartunya memakai muka jam SVG yang sama pada **pukul 10.10** (posisi jarum paling seimbang, langsung terbaca "jam"). **Ikon dideklarasikan di SATU tempat: `GameMeta.iconClock` di `src/games/registry.ts`** — `GamePage` meneruskannya ke `GameShell` untuk layar intro, jadi kartu portal & layar intro tak pernah berbeda. Jangan menyalin nilai ikon ke config game.
  - **Pasangan Pintar: 🧠 → 🤝** (keputusan pemilik di sesi yang sama). Otak mentah bukan gambar yang ramah untuk anak dan tak menggambarkan isi game; jabat tangan = "berpasangan", sesuai isinya (profesi↔alat, hewan↔rumah, lawan kata).

- **Cerita interaktif: pilihan berlabel A/B + semuanya dibacakan** (2026-08-03, permintaan pemilik dari tangkapan layar Cerita Nusantara: *"anak kelas 1-2 masih belum begitu bisa baca banyak"*), teruji headless 360×640, 380×800 & 820×1180 + 6 sesi ulang di 380×800 (tiap cerita dimainkan sampai "Selamat!" termasuk menekan SEMUA pilihan yang salah dulu, tanpa scroll & tanpa error console):
  - Berlaku untuk **seluruh template `story-choice`** (Cerita Nusantara & Cerita Si Kancil), bukan satu game saja — perubahannya di `src/engine/templates/StoryChoice.tsx`.
  - **Tiap pilihan punya lencana huruf A/B/C** (`.story-choice__letter`) supaya anak punya pegangan yang bukan bacaan ("pilih B"), dan **tombol 🔊 sendiri di kanan kartu** yang membacakan pilihan itu saja. Tombol suara pakai `<span role="button">`, BUKAN `<button>` — kartunya sendiri sudah `<button>` dan tombol bersarang itu HTML tak sah; klik-nya `stopPropagation` supaya mendengarkan tidak dihitung memilih.
  - **Semua pilihan dibacakan otomatis** sesudah teks halaman ("Pilihan A. …", "Pilihan B. …"), dan **dibacakan ulang setelah pilihan yang kurang tepat** supaya anak bisa mencoba lagi dengan telinga, bukan dengan ingatan.
  - Fungsi audio baru `speakNext(...texts)` di `src/engine/audio/sound.ts`: mengantre di belakang narasi yang sedang berjalan (**tanpa `cancel`**). `speak()` yang lama selalu memotong narasi sebelumnya — kalau dipakai untuk daftar pilihan, yang terdengar cuma pilihan terakhir. Halaman pertama cerita ikut memakai ini: teksnya dulu TIDAK pernah dibacakan (GameShell cuma membacakan judul cerita), sekarang diantre di belakang judul.
  - **Urutan pilihan diacak di engine.** `ask()` di config selalu menulis jawaban yang baik paling depan, jadi begitu hurufnya tampil anak bisa menang dengan selalu menekan A tanpa mendengarkan. `StoryChoice` mengacak sekali per halaman (`useMemo`), jadi acakannya tetap sama selama anak masih mencoba di halaman itu. **Jangan mengandalkan urutan config saat menulis cerita baru** — dan jangan menulis pilihan yang menyebut posisinya ("pilihan pertama").
  - Narasi ulang di-jaga `narratedPage` (useRef): StrictMode menjalankan efek dua kali di dev, dan baris yang mengantre akan menumpuk (bukan saling memotong seperti `speak`).

- **Maskot 6 tahap jadi seni premium** (2026-08-04), teruji headless 380×800 keenam tahap (semua WebP termuat, tanpa scroll horizontal, nol error console):
  - `MASCOTS` di `src/engine/core/mascot.ts` dapat field `pic` + helper `mascotImageUrl()`; aset di `public/assets/mascot/mascot-1..6.webp` (transparan, total 62 kB). `emoji` TETAP ada sebagai cadangan — `MascotPic` di `Mascot.tsx` jatuh ke emoji lewat `onError`, kontrak sama dengan `ItemPic`.
  - Dipakai untuk avatar besar DAN pratinjau tahap berikutnya di baris petunjuk ("25 ⭐ lagi jadi 🐲 Naga Jenius").
  - `.mascot-panel__img` WAJIB `object-fit: contain` — tanpa itu ujung sayap burung hantu (gambar paling lebar) terpotong lingkaran avatar.
  - Aset **sengaja tidak di-upscale**: avatar tampil 72px, jadi ukuran asli (±250px) sudah cukup dan file tetap ringan.

- **14 buah Pasar Buah jadi seni premium** (2026-08-04), teruji headless 380×800, 360×640 & 820×1180 (8 slot dimainkan, keempat tipe soal — beli buah, tebak buah, tebak bayangan, keranjang warna — tanpa scroll & nol error console; keempat belas WebP terlihat tampil):
  - Aset `public/assets/items/{apple,banana,orange,grapes,strawberry,watermelon,mango,pineapple,pear,kiwi,melon,cherry,lemon,avocado}.webp`, terdaftar di `items.ts`.
  - **Warna buah itu load-bearing**: Pasar Buah menyortir buah ke keranjang warna, jadi seni buah baru WAJIB mempertahankan warna yang dipakai config-nya. Sudah diverifikasi ke-13 pasangan warna cocok.
  - `Fruit` di `pasar-buah.ts` dapat field `i` (id registry) yang diteruskan kelima builder (`buy`/`guess`/`shadow`/`baskets`/`cards`). Emoji `e` tetap jadi cadangan.
  - **Bayangan (`shadow`) harus memakai `pictureItem`, bukan cuma `picture`** — anak mencocokkan garis luar bayangan dengan kartu jawaban, jadi keduanya harus gambar yang SAMA. Kalau bayangannya emoji dan jawabannya seni, bentuknya beda dan soalnya jadi menyesatkan.
  - Field engine baru supaya ini mungkin: `TapChoice.item` (kartu jawaban) dan `CountTapData.target.item` / `decoys[].item` (papan hitung). Dirender `ItemPic` di `TapAnswer.tsx` & `CountTap.tsx`.
  - **JEBAKAN 1: `<img>` pengganti emoji harus dikotakkan PERSEGI.** Percobaan pertama memakai `height: auto` — buah lonjong (anggur, rasio 0,8) jadi 25% lebih tinggi dari emoji yang digantikannya, dan layar 360×640 di soal "tebak bayangan" ikut scroll 79px. Sekarang `.choice-img` `width` = `height` (78cqw, 60cqw kalau berteks, 88cqw di `.count-cell`) + `object-fit: contain` — persis meniru kotak em milik emoji, sekaligus mencegah pisang tergencet jadi persegi.
  - **JEBAKAN 2: cue besar hanya boleh di atas kartu jawaban KECIL.** Sisa 57px scroll di layar yang sama datang dari cue `pictureItem` (64vw = 230px di HP 360) — ukuran itu dirancang untuk soal Taman Huruf yang kartunya cuma huruf. Di soal bayangan kartunya kartu bergambar lebar (2 kolom), jadi tiga kartu memakan dua baris tinggi. Sekarang `TapAnswer` memasang `.ta-picture--compact` (48vw) **otomatis kalau SEMUA jawabannya gambar** — aturan engine, bukan tambalan khusus Pasar Buah. Kalau nanti menambah soal ber-cue besar, jangan menambal dengan CSS baru; ukurannya sudah menyesuaikan.
  - Taman Huruf (cue huruf pertama) & Pasang Kata (slot buah + pisang di "hewan & makanannya") ikut memakai seni yang sama — jangan biarkan apel emoji berdampingan dengan apel bergambar. Sisa emoji buah di Suku Kata & Ejaan Jitu (SD) menyusul.

- **8 bangunan & tempat tujuan jadi seni premium** (2026-08-04), teruji headless 380×800 & 360×640 (Jalan Kendaraan dimainkan berulang — tujuan bergambar & tujuan emoji, tanpa scroll & nol error console; papan pengurangan Hutan Hewan dengan rumah baru ikut dicek):
  - Aset `public/assets/items/{house,school,hospital,shop,gas-station,field,tree,park}.webp` (±94 kB), terdaftar di `items.ts`. **`house` naik dari placeholder SVG ke WebP** — `house.svg` dihapus; Hutan Hewan (papan "pulang ke rumah"), Pasang Kata & Hitung Hebat ikut terangkat tanpa perubahan config.
  - Field engine baru **`PathTraceData.goalItem`** (id item registry) untuk tujuan di ujung jalan; `goal` emoji tetap jadi cadangan. Trip di `jalan-kendaraan.ts` yang tujuannya punya seni (rumah, sekolah, rumah sakit, toko/warung, pom bensin, sawah/ladang/kebun bunga, taman, pohon) sekarang menyebut `goalItem`; sisanya (halte, pabrik, istana…) tetap emoji sampai asetnya ada.
  - **`.road-marker-img` dikotakkan PERSEGI** (`width` = `height` + `object-fit: contain`, clamp 48–76px): sawah & taman gambarnya lebar (rasio 2–2,3), kalau tingginya `auto` mereka melebar keluar panggung jalan. Aturan yang sama dengan `.choice-img` — jangan pakai `height: auto` untuk gambar pengganti emoji.
  - Sumbernya satu lembar gambar dari pemilik; latarnya dipotong dengan flood-fill dari tepi (tetangga-toleransi), bukan ambang kecerahan — glow latarnya lebih terang dari garis luar ikonnya.

- **20 benda sehari-hari jadi seni premium (BATCH 4)** (2026-08-04), teruji headless 380×800 & 360×640 (Taman Huruf, Suku Kata, Ejaan Jitu, Pasangan Pintar, Pasang Kata, Hitung Hebat dimainkan sampai "Selamat!") + skrip validasi yang menelusuri SELURUH config: 75 id item yang dirujuk semuanya terdaftar & asetnya ada:
  - Aset `public/assets/items/{ball,book,pencil,backpack,key,umbrella,shoe,chair,door,milk,egg,bread,rice,balloon,teddy,flower,moon,cloud,carrot,corn}.webp` (188 kB), terdaftar di `items.ts`.
  - **`teddy`, BUKAN `doll`/`bear`** — `bear` sudah dipakai untuk beruang asli di Hutan Hewan. Boneka beruang dan beruang hewan tidak boleh saling menggantikan (aturan lama "satu gambar tidak boleh punya dua arti").
  - Ke-20 benda ini memang sudah dipakai sebagai emoji di config, jadi penggantiannya cuma mengisi id item: **Taman Huruf** (isyarat huruf pertama + susun kata), **Pasang Kata**, **Suku Kata**, **Ejaan Jitu**, **Pasangan Pintar** (target, kartu tarik & kartu ingatan), **Hitung Hebat** (papan hitung bola & pensil). Sekalian diisi juga id seni yang SUDAH ada tapi belum dipakai di config-config itu (hewan, kendaraan, buah, bangunan) — jangan biarkan benda yang sama tampil emoji di satu game dan bergambar di game lain.
  - Field baru di config (engine tidak berubah, semuanya sudah didukung): `Word.item` + helper `wi()` di `suku-kata.ts`, parameter `item` di `word()` `ejaan-jitu.ts`, `Pair.targetItem`/`itemItem` + `card(..., item)` di `pasangan-pintar.ts`, `target.item` di `count()` `hitung-hebat.ts`, `foodItem` di `pasang-kata.ts`.
  - **Wortel & jagung sengaja TIDAK masuk Pasar Buah**: itu sayur, dan di sana warna itu load-bearing (keranjang kuning & oranye tak boleh satu level).
  - Pemotongannya (`scripts/cut-item-sheet.py`): flood-fill dari tepi, gate "terang & tak berwarna" + toleransi tetangga **8** (percobaan pertama pakai 14 dan memakan badan TELUR yang memang nyaris putih — batas telur ke latar cuma beda 14). Latar yang TERKURUNG (celah antara sandaran & dudukan kursi, lubang kepala kunci) tak terjangkau flood-fill, jadi ditembus terpisah lewat daftar `HOLES` — **sengaja per item, jangan diotomatiskan**: bercak putih bola sepak terbaca persis sama oleh aturan otomatis apa pun.

- **Harga perkenalan SD Kelas 1 & 2 dipasang: Rp29.000 dari Rp49.000** (2026-08-07, keputusan pemilik), teruji headless 360×640 & 380×800 (kedua kartu harga terbaca utuh, tanpa scroll horizontal & nol error console):
  - Kartu SD di landing dulu cuma menampilkan satu angka abu-abu redup (`pc-now--soon` Rp49.000) karena kelompoknya belum dijual. Sekarang formatnya **sama persis dengan kartu TK**: harga lama dicoret (`pc-was`) + harga perkenalan merah besar (`pc-now`) + chip diskon (`pc-off`). (Badge "Segera Hadir" sempat dipertahankan di sesi ini, lalu ikut dicabut — lihat entri berikutnya.)
  - **Chip tertulis −40%, padahal potongan aslinya 40,8%** (49→29). Sengaja **dibulatkan KE BAWAH**: potongan yang diterima pembeli tak boleh kurang dari yang tertulis di landing. Terapkan aturan yang sama kalau nanti mengubah harga — jangan bulatkan ke atas.
  - `priceLabel` `sd1` di `src/data/groups.json` ikut jadi `Rp29.000`. Field itu belum dipakai komponen mana pun, tapi jangan biarkan dua angka harga berbeda hidup di repo — yang berikutnya membaca file itu akan memakai angka yang salah.
  - Kelas `.pc-now--soon` (abu-abu redup) di `landing.css` jadi tak terpakai; dibiarkan untuk kelompok "segera hadir" berikutnya yang harganya belum diputuskan.

- **SD Kelas 1 & 2 ikut dijual sejak launching — "Segera Hadir" dicabut** (2026-08-07, KEPUTUSAN PEMILIK yang MEMBATALKAN keputusan 2026-07-30 "SD menyusul setelah TK sukses"), teruji headless 360×640, 380×800 & 820×1180 (nol badge tersisa, kedua kartu setara, tanpa scroll horizontal & nol error console):
  - **Dua kelompok dijual bersamaan sejak hari pertama.** Kartu SD di landing kini identik strukturnya dengan kartu TK: tanpa badge `pc-badge--soon`, tanpa kelas `pcard--soon`, dan sub-teks "Soal lebih menantang — menyusul!" diganti **"Buka semua game SD Kelas 1 & 2 · sekali bayar, main selamanya"** (pola kalimat yang sama dengan kartu TK).
  - **Daftar "Petualangan seru menanti" wajib memuat KEDUA kelompok.** Dulu isinya 4 dunia TK saja — itu tak apa selagi SD belum dijual, tapi begitu SD ikut dijual, memajang nol game SD berarti menjual sesuatu yang tak pernah diperlihatkan. Sekarang 8 chip: baris 1 = TK (Hutan Hewan, Taman Huruf, Labirin Warna, Pasar Buah), baris 2 = SD (Hitung Hebat, Ejaan Jitu, Jam Pintar, Cerita Nusantara) + 4 kelas warna baru `w-count`/`w-spell`/`w-clock`/`w-story` di `landing.css`. Grid `repeat(4, 1fr)` yang lama otomatis jadi dua baris — CSS-nya tak perlu diubah.
  - **Jam Pintar di chip landing pakai ⏰ (jam weker), BUKAN 🕒.** Alasannya sama dengan penggantian ikon kartu game 2026-08-02: 🕒 tampil seperti piringan abu-abu polos di HP. (Muka jam SVG `Clock.tsx` sengaja tidak dipakai di sini — chip landing itu emoji dalam lingkaran pastel, bukan komponen game.)
  - **Mode kunci TETAP `'buka'`.** Yang berubah cuma halaman jualan; `DEFAULT_LOCK_MODE` di `src/data/access.ts` tidak disentuh, jadi semua game masih bisa dicoba bebas.
  - **PENGHALANG LAUNCHING YANG MASIH ADA (bukan soal SD saja):** Fase 5 belum dikerjakan — `functions/` masih README kosong dan `ActivationPage.tsx` masih stub yang menjawab *"Validasi kode belum aktif — menunggu Cloud Function (Fase 5)."* **Jangan nyalakan mode `'kunci'` sebelum itu jadi**: pembeli akan mentok di layar gembok karena kode aktivasinya tak divalidasi apa pun.

- **Landing: bagian "Segera hadir" — SD Kelas 3 & 4 dan SD Kelas 5 & 6** (2026-08-07, permintaan pemilik), teruji headless 360×640, 380×800 & 820×1180 (kedua kartu terbaca utuh, urutan harga → segera hadir → FAQ, tanpa scroll horizontal & nol error console):
  - Bagian baru `<section className="soon">` di `LandingPage.tsx`, **sesudah kartu harga & sebelum FAQ**: orang tua melihat dulu apa yang bisa dibeli hari ini, baru peta jalannya. Isinya data di konstanta `soonGroups` — menambah jenjang berikutnya = menambah satu entri, tidak menyentuh markup.
  - **TANPA harga sama sekali** (bukan angka abu-abu, bukan angka dicoret). Harga kedua jenjang itu belum diputuskan, dan angka apa pun di kartu yang belum dijual terbaca sebagai penawaran. Kelas `.pc-now--soon` yang dulu disiapkan untuk ini tetap tak terpakai.
  - **Tampilannya sengaja lebih ringan dari kartu harga**: bingkai putus-putus ungu, latar setengah bening, tanpa bayangan terangkat. Kartu harga (putih pekat + bayangan) harus tetap yang paling menonjol — ini pelengkap, bukan saingan.
  - **SEMUA kartu di landing rata TENGAH, dan geometrinya menyalin `.pcard`** (radius 22px, padding 14–15px 18px, `flex-direction: column` + `align-items: center`, nama 15px/800, sub-teks 12,5px/700 opacity 0,7). Percobaan pertama membuat `.soon-item` rata kiri dengan padding & radius sendiri — hasilnya kelihatan seperti komponen dari halaman lain yang nyasar, dan **ditolak pemilik**. Satu-satunya yang boleh membedakan kartu "segera hadir" dari kartu harga adalah bingkai putus-putus + tanpa bayangan; sisanya harus sama supaya keempat kartu terbaca satu keluarga. (Rata kiri di landing hanya milik `.faq`, karena itu teks bacaan panjang, bukan kartu.)
  - `.soon-desc` memakai `text-wrap: balance`: teks rata tengah yang turun baris menyisakan satu kata yatim di baris kedua. Browser Android lawas mengabaikannya dan tetap membungkus normal — aman.
  - **Isi kartu (revisi pemilik di sesi yang sama):** nama ditulis **"Kelompok SD Kelas 3 & 4"** — sama persis polanya dengan kartu harga di atasnya ("Kelompok SD Kelas 1 & 2"), supaya keempat kartu terbaca satu keluarga. Deskripsinya **hanya materi**: "Perkalian, pembagian, membaca cerita" / "Pecahan, bangun ruang, soal cerita".
  - **TANPA umur & TANPA badge "Segera Hadir" di kartu** (percobaan pertama memakai keduanya, ditolak pemilik):
    - Umur sengaja dilepas di sini. Ini **pengecualian yang disadari** dari "Penamaan Kelompok" (yang mewajibkan umur jadi bagian pertama deskripsi) — aturan itu untuk `groups.json`, tempat orang tua sedang memilih kelompok yang akan dimainkan anaknya. Di kartu peta jalan, yang perlu diketahui cuma "materinya apa".
    - Badge per-kartu dihapus karena **judul bagiannya sudah "SEGERA HADIR"** — badge di tiap kartu cuma mengulang kalimat yang sama dua baris di bawahnya. `.soon-badge` & `.soon-head` ikut dihapus dari CSS; jangan dihidupkan lagi.
  - **Chip "Petualangan seru menanti" TIDAK ditambah** untuk kedua jenjang ini: satu pun game-nya belum ada, dan aturan yang dipakai saat SD Kelas 1 & 2 mulai dijual (2026-08-07) adalah memajang dunia yang benar-benar bisa dimainkan. Chip baru menyusul kalau gamenya sudah jadi.
  - Tak ada yang berubah di `src/data/groups.json`, `registry.ts`, maupun `access.ts` — ini murni halaman jualan, belum ada kelompok baru yang bisa dibuka.

- **Tracing: angka 9 tidak lagi diterima sebagai angka 6** (2026-08-07, laporan pemilik lewat tangkapan layar Tulis Angka), teruji headless:

  **Kenapa dulu lolos**
  - Penilaian lama cuma menghitung **luas**: berapa persen area glyph yang tersentuh jari + berapa persen coretan yang keluar glyph. 6 dan 9 itu bentuk yang sama diputar 180°, jadi 9 yang digambar di atas panduan 6 menyapu hampir semua piksel yang sama → lolos. **Persentase total tidak akan pernah bisa membedakan keduanya** — jangan coba memperbaikinya dengan menaikkan ambang persen.

  **Cara barunya (`src/engine/templates/traceScore.ts`, dipisah dari `Tracing.tsx` supaya bisa diuji headless)**
  1. Glyph dikuliti jadi **GARIS TENGAH** (skeleton Zhang-Suen), lalu yang dinilai: bagian garis mana yang diikuti jari. Mengukur ke area terisi salah di dua arah — jari anak yang melenceng ke satu sisi coretan tebal meninggalkan separuh area tak tersentuh, sementara angka yang salah tapi kebetulan bertumpuk dapat area gratis.
  2. Yang menentukan lulus adalah **potongan garis TERPUTUS TERPANJANG yang terlewat**, bukan totalnya. Jari yang goyang meninggalkan lubang-lubang kecil tersebar; glyph yang salah meninggalkan **satu anggota badan utuh** tak tersentuh (9 di atas 6 tak pernah mendekati sisi kiri lingkaran bawah). Total yang terlewat justru lebih besar pada coretan benar-tapi-goyang — makanya persentase total menyesatkan.
  3. Aturan ketiga yang longgar (jari harus tetap di sekitar tinta) menolak coretan asal-asalan yang cuma melintasi glyph.
  - **Toleransi diukur dalam SATUAN TEBAL CORETAN, bukan piksel** (`coverK` × setengah tebal coretan glyph itu sendiri, diukur lewat distance transform) + lantai piksel `coverFloor`. Alasannya: app meminta font `Fredoka` tapi **tak pernah memuatnya**, jadi HP merender panduan dengan font sistemnya sendiri (Roboto di Android) — tebal coretannya beda-beda. Lantai pikselnya perlu karena tangan anak goyang sejauh jarak nyata, bukan sepersekian tebal coretan.

  **Angka kalibrasi (jangan diubah tanpa mengukur ulang)**
  - Coretan BENAR (jari goyang ±14px, cuma 85–90% garis digambar): celah terbesar **≤ 0,022** dan cakupan ≥ 0,96.
  - Glyph SALAH di atas panduan: celah **≥ 0,06** — 9 di atas 6 = **0,090** (Fredoka) / **0,116** (Roboto Bold).
  - `maxGap: 0.05` duduk di antara keduanya dengan ruang di kedua sisi.
  - Diuji di **dua font sungguhan**: Fredoka (yang diminta config) dan Roboto Bold (yang benar-benar dirender HP Android). 2592 percobaan coretan benar × 72 glyph (angka 1–20, A–Z, a–z): **2591 diterima** (satu-satunya yang ditolak: "14" dengan goyangan maksimal DAN cuma 90% digambar). 1680 pasangan glyph-salah diuji.

  **JEBAKAN yang sudah kena — jangan diulang**
  - **JANGAN kalibrasi lewat font bawaan container/CI.** Percobaan pertama "berhasil" padahal font fallback-nya merender 6 dan 9 nyaris sebagai bentuk yang sama (100% garis 6 berjarak <30px dari garis 9) — hasil kalibrasinya sama sekali tidak berlaku di font sungguhan. Pasang dulu Fredoka & Roboto Bold ke `~/.fonts` sebelum mengukur apa pun.
  - **Model "jari goyang" harus goyangan LAMBAT (tangan mengembara), bukan derau per-titik.** Derau per-titik menggemukkan coretan jadi pita lebar sehingga bentuk salah apa pun ikut lulus — kalibrasi jadi terlalu longgar.
  - **Ambang cakupan total & keluar-glyph nyaris tak berpengaruh**; yang menentukan cuma aturan celah. Keduanya tetap dipasang sebagai jaring pengaman, bukan alat pembeda.
  - Loop thinning **tidak boleh mengalokasi** (dulu bikin array 8 tetangga per piksel): 48ms untuk huruf "W" di desktop = tersendat saat level dibuka di HP murah. Versi tanpa alokasi: 19ms desktop, **54–120ms di CPU yang di-throttle 6×** — sekali per level, terjadi saat transisi level yang memang sudah 1,3 detik.

  **BATAS YANG DISADARI (jangan "diperbaiki" dengan mengetatkan angka)**
  - Kalau glyph yang digambar melewati **SELURUH** garis panduan — 8 di atas 3, 6 di atas 5, "16" di atas "10" — tak ada aturan di sini yang bisa protes, karena panduannya memang benar-benar tertelusuri. Membedakannya butuh bentuk coretan anak dicocokkan balik ke bentuk panduan; itu perubahan yang jauh lebih besar dari yang diminta bug ini. Mengetatkan ambang demi kasus-kasus itu akan mulai menolak coretan yang BENAR — dan anak yang jawabannya benar lalu disuruh mengulang jauh lebih merugikan daripada angka salah yang lolos.

  **Ikut terangkat**
  - Jalur jari sekarang **diambil ulang tiap 4px** (`pathStep`), jadi penilaian tak lagi bergantung pada seberapa sering HP mengirim event pointer — dulu coretan cepat mendaftarkan sedikit titik dan bisa melompati bagian glyph.
  - `up()` mengabaikan pointer-up yang tak diawali pointer-down di kanvas (dulu `onPointerLeave` mengosongkan titik terakhir meski anak tak sedang menggambar).

- **Panduan angka digambar sendiri sebagai goresan tulisan tangan** (2026-08-07, KEPUTUSAN PEMILIK setelah menulis batang tegak di panduan "1" ditolak), teruji headless 380×800 (kasus pemilik + 9↔6 di game sungguhan, nol error console, tanpa scroll horizontal):

  **Kenapa panduan font itu salah untuk game menulis**
  - Dulu panduan = TEKS yang digambar pakai font HP. App menyebut `Fredoka` di CSS tapi **tak pernah memuatnya**, jadi tiap HP menggambar bentuk yang berbeda: di iPhone pemilik "1" punya **bendera balok** hampir separuh lebar angkanya, font lain menambahkan tumit serif. Alasan yang sama persis dengan hewan pakai WebP, bukan emoji.
  - Huruf cetak bukan tulisan tangan. Tak ada anak yang diajari menulis "1" dengan bendera + tumit; di sekolah Indonesia itu satu goresan turun. Menyuruh anak menelusuri hiasan tipografi = **mengajarkan bentuk yang salah**, dan menolak anak yang menulisnya dengan benar.
  - **Tak ada ambang yang bisa menambal ini** (sudah diukur, jangan diulang): bendera "1" = 21,5% dari garis, sedangkan ekor 6 = 7,6% dan ekor 9 = 8,3%. Melonggarkan sampai bendera dimaafkan otomatis memaafkan ekor 6 & 9 → angka 9 lolos lagi sebagai 6. Masalahnya di BENTUK PANDUAN, bukan di angka ambang.

  **Cara barunya (`src/engine/templates/glyphStrokes.ts`)**
  - Angka 0–9 ditulis sebagai **goresan** dalam kotak 0..1 (helper `poly`/`arc`/`join`), lalu `handwriting(glyph, size)` menaruhnya di kanvas. Angka dua digit (10–20) otomatis dua kotak bersebelahan yang lebih kecil.
  - **"1" = satu garis tegak polos.** Itu inti seluruh perubahan ini — jangan tambahkan bendera "biar mirip cetakan".
  - `drawGlyph` menggores path itu (bukan `fillText`), dan penilai memakai **garis tengah yang sudah pasti** — tak perlu ditebak ulang lewat skeleton. Thinning cuma jalan untuk glyph yang masih pakai font.
  - **Huruf belum punya data goresan** → `strokesFor` mengembalikan null dan jatuh ke font seperti dulu. Menambah huruf nanti = menambah entri di file itu, tak ada yang lain berubah.

  **Angka kalibrasi (diukur ulang; bentuk baru = angka baru)**
  - `maxGap` untuk panduan goresan = **0,11**; `maxGapFont` untuk huruf tetap **0,05**. Dua angka karena huruf cetak jauh lebih saling tumpang tindih — ruang antara "benar tapi goyang" dan "huruf lain" jauh lebih sempit di font.
  - Coretan benar: **0 dari 360** ditolak (penuh & 95% digambar), 4 dari 180 ditolak kalau berhenti 10% lebih awal. Total **6 dari 720**.
  - 9 di atas 6 = celah **0,338**; 6 di atas 9 = 0,381; 0 di atas 6 = 0,239 — semua ditolak dengan margin 2–3×.
  - **0,09 dan 0,11 menangkap angka salah yang PERSIS SAMA** (8 dari 90 pasangan satu-angka), tapi 0,09 menolak 38 dari 180 coretan yang berhenti sedikit lebih awal. Jadi 0,11 itu kelonggaran gratis — jangan diturunkan lagi tanpa mengukur ulang.
  - Huruf tak berubah: 624/624 coretan benar diterima.

  **JEBAKAN**
  - **Sudut busur di `arc()` bertambah SEARAH JARUM JAM** (y ke bawah): 0 = kanan, 90 = bawah, 180 = kiri, 270 = atas. Percobaan pertama untuk 2, 3, 5, dan 6 melengkung ke arah sebaliknya dan hasilnya bentuk aneh — **lihat dulu hasil gambarnya** sebelum percaya, jangan hanya membaca kodenya.
  - Ujung tiap potongan busur harus **bertemu** dengan awal potongan berikutnya (`join` cuma menyambung; celah akan tergambar sebagai garis lurus).
  - Batas yang tersisa tetap sama: glyph yang melewati SELURUH garis panduan (8 di atas 3, 8 di atas 5) masih lolos.
- **ANGKA DI NARASI DITULIS DENGAN KATA — jangan pernah pakai digit** (2026-08-07, laporan pemilik dari tangkapan layar Hutan Hewan: *"kok suaranya ada six singa, harusnya enam singa"*), teruji headless 380×800 & 360×640 — **Hutan Hewan, Tambah Tangkas & Jam Pintar** dimainkan sampai "Selamat!" (nol angka di kalimat soal, papan persamaannya tetap berangka, tanpa scroll & nol error console); **Hitung Hebat** diperiksa lewat `npm run narasi` (53 baris, semua varian) karena level count-tap & kartu ingatannya tak bisa diselesaikan penelusur otomatis:
  - Sebabnya: `narration` itu **satu string untuk dua hal** — dicetak di layar DAN diserahkan ke mesin suara. Digit adalah satu-satunya hal yang dibaca tiap mesin suara **dalam bahasanya sendiri**: baris "Ada 6 singa" kembali dari Azure sebagai "Ada **six** singa", dan HP yang jatuh ke `speechSynthesis` tanpa suara id-ID melakukan hal yang sama. Kata tidak bisa salah dibaca begitu.
  - **`src/games/numbers.ts` = satu-satunya sumber**: `terbilang(n)` (0–999.999, "enam" · "dua belas" · "dua puluh lima" · "lima belas ribu"), `rupiahWords(n)` ("lima belas ribu rupiah"), `capitalize()` untuk kalimat yang diawali bilangan. Tabel `WORDS` lama di `hutan-hewan.ts` (cuma 0–8) dihapus, `say` sekarang alias `terbilang`.
  - **Angkanya tetap di PAPAN, bukan di narasi**: `equation` ("6 − 2 = ?"), kartu angka, papan uang ("Rp15.000 + Rp3.000"). Justru itu pasangannya — anak MELIHAT lambangnya sambil MENDENGAR katanya. Jadi ini tidak mengurangi latihan membaca lambang bilangan untuk anak SD.
  - Yang ikut diperbaiki: Hutan Hewan (soal pengurangan; sekalian huruf besar setelah titik — dulu "Ada 6 singa. **d**ua singa pulang"), Hitung Hebat (tambah/kurang bergambar, perkalian, "Ketuk 6 bola", uang), Tambah Tangkas (semua soal + 8 soal cerita), Jam Pintar (arah jarum: "di angka dua … di angka dua belas").
  - **Penjaga permanen di `scripts/extract-narration.mjs`**: kalau ada digit di narasi, `npm run narasi` **berhenti dengan kode 1** dan mencetak baris-baris yang salah. Skrip itu jalan di workflow render SEBELUM Azure dipanggil, jadi baris berangka tak akan pernah jadi file suara lagi. Sudah diuji dengan sengaja mengembalikan satu digit (exit 1) lalu memulihkannya (exit 0).
  - **162 baris berganti kalimat = 162 file suara baru** (7.410 karakter, 1,5% kuota gratis). 162 file lama jadi yatim — render dijalankan dengan `--prune` supaya ikut terbuang. Hasilnya: **723/723 baris punya rekaman, 723 file di disk, nol entri manifest tanpa file, nol kalimat berangka tersisa**. Teruji main sungguhan (380×800): Hutan Hewan & Tambah Tangkas memutar file rekaman, **nol** baris jatuh ke suara HP.

## Suara Narasi: file TTS neural, bukan suara bawaan HP (2026-08-07)

> Suara `speechSynthesis` bawaan HP itu undian: sebagian Android punya suara Indonesia yang hangat, sebagian robotik, sebagian **tidak punya suara id-ID sama sekali** dan membaca narasi dengan logat Inggris — atau diam. Padahal anak yang belum bisa membaca bergantung PENUH pada narasi. Jadi narasi dirender sekali jadi file audio, alasan yang sama persis dengan hewan pakai WebP alih-alih font emoji HP.

**Penyedia: Azure Speech (KEPUTUSAN PEMILIK 2026-08-07)**
- **Dua suara** — dipilih pemilik dengan mendengarkan contoh, bukan dari spesifikasi:
  - **`id-ID-Gadis:DragonHDLatestNeural` (HD), `rate="-15%"`** untuk semua narasi soal — 599 baris. Gadis versi neural biasa **ditolak pemilik: "masih cempreng"**. Menurunkan pitch-nya (dicoba -8%, -15%, -22%) tidak dipilih; yang menjawab keluhan itu justru model HD, karena karakter suaranya memang beda, bukan suara yang sama digeser.
  - **`id-ID-ArdiNeural`, `rate="-8%"`** khusus **cerita interaktif** — Cerita Kancil & Cerita Nusantara, 124 baris — supaya cerita terasa dibacakan pendongeng, bukan guru soal. Disetujui apa adanya pada percobaan pertama.
- **JANGAN "merapikan" -15% dan -8% jadi angka yang sama.** Dua model itu punya kecepatan bawaan berbeda: HD bicara ±2× lebih ringkas dari neural biasa (kalimat uji yang sama: 15,9 kB vs 28,9 kB), jadi angka yang sama BUKAN tempo yang sama. Keduanya dipilih dengan telinga.
- **Azure punya 6 suara Indonesia, bukan 2** (`voices/list`): Gadis & Ardi neural, versi `DragonHDLatest` keduanya, plus Sari & Cahya `MAI-Voice-2-Flash`. **Suara MAI menjawab 502** lewat endpoint REST TTS ini — jangan dicoba lagi tanpa cara panggil yang berbeda. Cek daftarnya dengan `scripts/sample-voices.mjs` sebelum menganggap pilihannya sedikit.
- **Suara HD menerima `rate`** (terukur: 0% → -45% memanjangkan file 15,9 → 24,6 kB). Ini tidak bisa diasumsikan — model HD di banyak layanan mengabaikan prosody, jadi kalau nanti ganti suara HD lain, **uji dulu** dengan `sample-voices.mjs`.
- Pembagiannya otomatis di skrip ekstraksi: level bertemplate `story-choice` → Ardi, sisanya Gadis. **Satu baris = satu file audio**, jadi kalimat yang dipakai cerita DAN game lain terpaksa memakai suara netral (Gadis) — sekarang tidak ada kasus begitu, tapi jangan kaget kalau muncul nanti.
- **Bayar sekali pakai, bukan langganan** — Azure itu pay-as-you-go. Free tier F0 = 500rb karakter/bulan; seluruh narasi app **30.935 karakter (723 baris unik)** = 6,2% kuota, jadi **Rp0** dan masih muat ±16× render ulang untuk revisi. Kalau kuota jebol pun cuma ±Rp19.000 ($15/1 juta karakter).
- ElevenLabs sengaja TIDAK dipakai untuk narasi umum: lisensi komersialnya nempel di langganan aktif $22/bulan. Boleh dipertimbangkan khusus 6 cerita nanti (di situ ekspresi berbayar), bukan untuk soal.
- `edge-tts` (suara Gadis yang sama, gratis tanpa kunci) hanya untuk render coba-coba di komputer pemilik — endpoint tak resmi, jangan dipakai untuk produk berbayar.

**Alur: ekstrak → render → putar**
1. **`npm run narasi`** (`scripts/extract-narration.mjs`) mengumpulkan SEMUA kalimat yang bisa diucapkan ke `scripts/narration-lines.json`. Narasi tidak bisa di-grep — dibangun builder typed per varian, satu slot bisa berisi puluhan varian — jadi skripnya **mem-bundle config aslinya** (pola sama dengan `check-item-ids.mjs`) lalu menelusuri data level yang sudah jadi: **semua varian tiap slot**, bukan cuma yang terambil satu sesi. Ikut terkumpul: teks halaman cerita, umpan balik pilihan, dan kalimat tetap engine ("Hebat! Kamu benar!" dst).
   - **Kalimat pilihan cerita dirender untuk SEMUA huruf yang mungkin** (A, B, dan C). `StoryChoice` mengacak urutan pilihan tiap halaman — kalau cuma "Pilihan A" yang ada, cerita yang teracak jatuh balik ke suara robot di tengah jalan.
   - `key` tiap baris = hash isi kalimatnya. **Kalimat yang tidak diubah tidak perlu dirender ulang**; mengubah satu kata = key baru = satu file baru.
   - `scope` menentukan folder audionya supaya tiap game cuma mengunduh suaranya sendiri: id game · `_shared` (dipakai beberapa game) · `_engine` (kalimat shell di semua game).
2. **`npm run suara`** (`scripts/render-narration.mjs`) merender tiap baris lewat Azure Speech ke `public/assets/voice/<scope>/<key>.mp3` lalu menulis `manifest.json`. Kunci dari `.env` (`AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`) — **tanpa awalan `VITE_`**, karena env ber-awalan itu ikut ter-bundle ke JS publik.
   - **Dijalankan lewat GitHub Actions, bukan dari sesi Claude**: lingkungan sesi memblokir host Azure (403 di CONNECT). Workflow `.github/workflows/render-narasi.yml` — picu dengan mengubah `.github/render-request.txt` (baris `only: <bagian>` untuk satu game saja), atau tombol Run workflow di tab Actions. Kunci disimpan sebagai repository secret `AZURE_SPEECH_KEY`. Pemilik tidak perlu memasang Node.js.
   - **Ganti suara/tempo TIDAK memicu render ulang**: `key` berasal dari isi kalimat, bukan dari setelan suaranya. Hapus dulu folder audio yang terdampak (mis. semua kecuali `cerita-*` kalau yang berubah suara Gadis), baru jalankan lagi.
   - `scripts/sample-voices.mjs` + `.github/workflows/contoh-suara.yml` (picu: `.github/sample-request.txt`) merender beberapa kalimat uji dalam beberapa setelan ke folder `sample-suara/` **di luar `public/`**, untuk dipilih dengan telinga sebelum membakar 723 baris. Hapus foldernya setelah diputuskan.
   - **File yang sudah ada dilewati**, jadi skrip aman diulang kalau koneksi putus dan tidak memakan kuota dua kali. Ubah satu kalimat = key baru = hanya satu file yang dirender ulang.
   - **Bawaannya 20 permintaan/menit** karena itu batas tier gratis F0; skripnya mengatur jeda sendiri supaya tidak kena 429 sama sekali (kalau tetap kena, ia menunggu sesuai `Retry-After`). Tier bayar: `-- --rpm=100`.
   - **Kunci salah (401) / SSML salah (400) TIDAK diulang** — cuma membuang kuota. Yang diulang hanya 429 & 5xx.
   - **Manifest disusun dari file yang BENAR-BENAR ada di disk**, bukan dari daftar yang niatnya dirender: entri yang menunjuk file tak ada bikin app memuat 404 lalu jatuh ke suara HP (tetap terdengar, tapi console jadi kotor).
   - Coba satu game dulu (`-- --only=hutan-hewan`) dan **dengarkan** sebelum merender semuanya.
3. **Putar** → `src/engine/audio/voice.ts` + antrean di `sound.ts`. **Call site tidak berubah**: `speak()`/`speakNext()` tetap sama di GameShell & StoryChoice.

**Aturan & jebakan pemutar (`voice.ts` + `sound.ts`)**
- **Manifest dikunci TEKS, bukan hash** (`{ "Ayo hitung! Ada berapa kuda?": "hutan-hewan/3f2a1c9d4b70.mp3" }`): lookup-nya sinkron (tanpa `crypto.subtle` yang async) dan hashing skrip tak mungkin diam-diam menyimpang dari hashing app. Nilainya **memuat ekstensi file** supaya format audio bisa diganti tanpa mengubah app.
- **`spokenText()` di `voice.ts` WAJIB identik dengan `spoken()` di skrip ekstraksi.** Config merekatkan ruas persamaan dengan NBSP supaya "= ?" tak turun baris di HP — itu trik layout, dan file suaranya dirender dari spasi biasa. Beda satu karakter = lookup meleset = jatuh ke suara robot.
- **SATU antrean untuk kedua sumber.** Selama render bertahap, satu layar bisa campur: halaman cerita punya rekaman, pilihannya belum. Dua pemutar terpisah akan bicara bersamaan — antrean tunggal menjaga urutan yang diminta call site.
- **SATU elemen `<audio>` dipakai ulang untuk semua klip.** Browser mobile memberi izin putar **per elemen**, jadi elemen yang sudah "dibuka" sentuhan pertama anak tetap boleh berbunyi; elemen baru tiap baris bisa diblokir di tengah permainan. Elemen itu juga dihangatkan dengan WAV senyap pada `pointerdown` pertama — tanpa itu klip level 1 bisa ditolak kebijakan autoplay dan anak mendengar suara robot untuk satu baris itu.
- **Tiga jalur jatuh ke suara HP, semuanya sengaja**: baris belum punya rekaman · file rekamannya hilang (deploy setengah jadi) · `play()` ditolak. Anak harus tetap mendengar kalimatnya — **jangan pernah membuat narasi bisa hilang total.**
- **`public/assets/voice/manifest.json` berisi `{}` sampai render pertama.** Sengaja ada supaya `fetch` tidak 404 dan console tetap bersih. **Jangan dihapus.**
- **Hasil render pertama (2026-08-07): 723/723 baris, 18,2 MB, nol kegagalan.** Terbesar per game: Cerita Nusantara 2,9 MB · Taman Huruf 2,4 MB · Ejaan Jitu 1,6 MB — dan tiap game hanya mengunduh bagiannya sendiri.
- Manifest diambil sekali saat chunk game dimuat, dengan **batas tunggu 2 detik** — jaringan HP yang tersendat tidak boleh membuat game bisu.
- Teruji headless (Chromium, 380×800): baris berekaman memutar file & tidak memakai suara HP · baris tanpa rekaman jatuh ke suara HP · file hilang tetap terdengar · antrean campur file+suara HP berurutan tanpa tumpang tindih · `speak()` memotong antrean lama · `stopSpeaking()` membungkam semuanya · Hutan Hewan dimainkan sungguhan dengan & tanpa manifest, nol error console.
- Setelah render penuh, diuji ulang dengan aset sungguhan: **Hutan Hewan, Cerita Kancil, Pasar Buah & Tulis Angka** dimainkan di 380×800 — keempatnya memutar file rekaman, **nol** yang jatuh ke suara HP, nol error console, tanpa scroll horizontal.
- **Ter-deploy 2026-08-07** ke branch Pages (`app/assets/voice/`, 723 file). Terverifikasi lewat GitHub API bahwa filenya sampai di branch; **halaman live-nya sendiri TIDAK bisa dicek dari sesi Claude** — lihat catatan di "Deploy Web".

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

- **Landing page = route `/`** → `src/portal/LandingPage.tsx` (+ `src/portal/landing.css`). Halaman marketing menghadap orang tua: hero "Petualangan Pintar" + logo, tombol **🎮 Main Sekarang**, chip 8 dunia (4 TK + 4 SD), kartu harga perkenalan dua kelompok setara (TK Rp19.000 coret Rp39.000 −50%, SD Rp29.000 coret Rp49.000 −40%), akses orang tua lewat **`TopBar`** (`src/portal/TopBar.tsx`, tombol "Orang Tua" → `/masuk`). Pemilih kelompok anak pindah ke **`/portal`** (`src/portal/HomePage.tsx`).
  - Cek cepat masih utuh: `src/app/App.tsx` punya `<Route path="/" element={<LandingPage />} />` dan `<Route path="/portal" element={<HomePage />} />`. Kalau `/` menunjuk `HomePage` atau `LandingPage.tsx` hilang → **pulihkan dari `main` dulu**.
- **Logo = satu aset kanonik `public/assets/logo.svg`** (anak ayam + pelangi + bintang). Dipakai di **semua** tempat lewat file itu — jangan bikin salinan/varian inline:
  - Favicon di `index.html` (`<link rel="icon" href="/assets/logo.svg">`; Vite tambah `base` saat build).
  - Logo header landing (`LandingPage.tsx`, via `${import.meta.env.BASE_URL}assets/logo.svg`).
  - **Kalau logo diganti, ganti aset `public/assets/logo.svg` itu saja — otomatis ikut di landing + favicon.** Jangan biarkan logo landing beda dari favicon.

## Deploy Web (PENTING)

- **GitHub Pages menyajikan situs dari branch `claude/web-demo-html-wa4dr9`** (folder root), BUKAN dari branch default. Yang harus tampil di web WAJIB di-build lalu di-push ke branch itu — push ke branch lain tidak memicu build Pages.
- **Deploy HANYA dari `main`.** Build `app/` selalu dari `main` (yang pasti punya landing page + semua fitur). JANGAN pernah deploy `app/` dari branch fitur yang belum punya landing page — itulah penyebab landing page berulang ketimpa. Cek cepat landing (di atas) sebelum build.
- **Struktur branch Pages:** app React (landing di route `/`) disajikan di subfolder **`app/`**. Root `index.html` = **redirect ke `./app/`** (bukan landing statis; satu landing kanonik). `404.html` juga redirect ke `app/` (app pakai HashRouter). `petualangan-pintar.html` tetap ada sebagai sumber standalone, tak ditaut dari root.
- **Cara deploy:** `DEPLOY_BASE=/Game-Edukasi-Anak/app/ VITE_USE_HASH_ROUTER=1 npm run build`, lalu ganti isi folder `app/` di branch Pages dengan hasil `dist/` (termasuk `dist/assets/logo.svg`, `dist/assets/items/*.webp` & `dist/assets/voice/`). Produksi nanti (Firebase Hosting) pakai `base` default `/` + BrowserRouter.
- URL live: `https://2013tib-droid.github.io/Game-Edukasi-Anak/` (redirect ke `/app/`). Setelah push, build Pages butuh ±1–2 menit; browser HP sering menyimpan cache versi lama (hard-refresh).
- **Sesi Claude TIDAK bisa membuka URL live-nya** — kebijakan jaringan sesi memblokir `github.io` (403 di CONNECT), sama seperti host Azure. Jadi setelah deploy, **jangan mengaku situsnya sudah terverifikasi**. Yang BISA diverifikasi dari sesi: isi branch Pages lewat GitHub API (`/contents/app/...`) dan pengujian headless terhadap `npm run dev`/`vite preview` lokal. Konfirmasi akhir di HP asli tetap tugas pemilik.

## Aturan Desain Soal (dari pemilik proyek)

- **Soal tidak boleh monoton satu jenis item.** Contoh: soal "ketuk N buah" harus selalu mencampur buah target dengan 2–3 jenis buah pengecoh, dan jumlah buah target dilebihkan dari yang diminta — anak harus mengenali item yang benar DAN berhenti menghitung di angka yang diminta. Terapkan prinsip campuran/pengecoh yang sama saat membuat tipe soal baru agar tetap menantang.

## File Sumber yang Tersedia dari Pemilik Proyek

- `petualangan-pintar.html` — game standalone yang sudah jadi (vanilla JS, localStorage): sumber untuk Fase 3.
- (Opsional) versi React component dari game yang sama.
- Folder aset AI (gambar) & audio TTS akan ditambahkan bertahap di `public/assets/`.
