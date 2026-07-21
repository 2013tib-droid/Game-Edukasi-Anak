# Prompt — Fase 3 Lanjutan (Bawah Laut + Pasar Buah)

> Salin seluruh blok di bawah ini ke session baru sebagai instruksi tugas.

---

Lanjutkan **Fase 3**: porting 2 dunia terakhir game "Petualangan Pintar"
(`petualangan-pintar.html`) ke engine portal — **Bawah Laut** (Warna &
Bentuk) dan **Pasar Buah** (Kenali Buah). Dua dunia pertama (Hutan Hewan +
Taman Huruf) sudah selesai & teruji.

## PENTING SEBELUM MULAI
- Baca `CLAUDE.md`, patuhi semua — terutama "Status Pengerjaan", "Aturan
  Desain Soal", dan "Deploy Web".
- **Mulai dari branch `claude/petualangan-pintar-fase-3-qle75v`** — di sana
  ada seluruh source Fase 1+2+3-sebagian (engine, template, maskot, 2 dunia
  pertama). Branch default TIDAK berisi source.
- `petualangan-pintar.html` JANGAN diubah/dihapus — itu sumber acuan.
- Kembangkan di branch dev-mu sendiri; commit kecil-kecil, pesan deskriptif.

## Yang SUDAH ada (pakai ulang, jangan bikin dari nol)
- **Engine mixed-template**: `MixedGameConfig` / `MixedLevel` di
  `src/engine/core/types.ts` — satu game boleh beda template per level.
  `GameShell` memilih template per-level lewat `templateFor()`. Lihat
  `src/games/tk/taman-huruf.ts` sebagai contoh game mixed.
- **6+1 template** di `src/engine/templates/`: `tap-answer`, `drag-drop`,
  `tracing`, `memory`, `count-tap`, `story-choice`, `spell`. Semua
  lazy-load, pointer/touch-first, narasi lewat `speak()`.
- **TapAnswer** punya field opsional `picture` (gambar besar) & `board`
  (papan visual; token dipisah spasi biasa, operator dilem ke grupnya pakai
  non-breaking space ` ` supaya tidak patah di tengah).
- **Maskot** sudah jadi fitur engine (`getTotalStars()` + `MascotCard`) —
  tidak perlu disentuh.
- **Registry** game: `src/games/registry.ts`. Tambah entri baru di sini
  (field `template` boleh `'mixed'`).
- Pola config = file `.ts` typed di `src/games/tk/` (data murni, bukan JSON).

## Cakupan

### A. Bawah Laut 🐠 — "Warna & Bentuk" (butuh sedikit kerja engine)
Sumber (fungsi `makeQuestion`, cabang `w==="ocean"` / default di
`petualangan-pintar.html`) punya 4 tipe level, semuanya "pilih 1 kartu
benar" = cocok dengan **tap-answer**, TAPI kartunya **bentuk geometris
berwarna (SVG)**, bukan emoji:
1. **Cari Bentuk** — semua kartu 1 warna sama, beda bentuk; pilih bentuk
   yang diminta (mis. "Sentuh Segitiga").
2. **Cari Warna** — semua kartu 1 bentuk sama, beda warna; pilih warna yang
   diminta.
3. **Bentuk & Warna** (combo) — pilih kartu yang cocok bentuk DAN warna.
4. **Pola Ajaib** (pattern) — deret pola ABAB / ABC-ABC, pilih bentuk
   berikutnya (ada papan deret + kotak "?").

**Kerja engine yang dibutuhkan** (rekomendasi, konfirmasi kalau mau ubah
pendekatan): tambah dukungan **render bentuk SVG**, jangan pakai emoji
(emoji tak punya semua kombinasi bentuk×warna).
- Buat `src/engine/ui/Shape.tsx` — porting fungsi `shapeSVG(shape,color)`
  dari sumber (bentuk: lingkaran, kotak, segitiga, bintang, hati, oval,
  belah ketupat; warna: hex dari konstanta `COLORS` di sumber).
- Extend `TapChoice` di `types.ts` dengan field opsional
  `shape?: { kind: ShapeId; color: string }`; render di `TapAnswer` bila
  ada (selain emoji/text).
- Untuk **Pola Ajaib**: tambah field opsional di `TapAnswerData` untuk
  **deret bentuk** (mis. `sequence?: ({shape,color}|null)[]`, `null` =
  kotak "?") yang dirender di atas pilihan. Atau, kalau lebih bersih, bikin
  template khusus `shape-tap` — pertimbangkan mana yang paling rapi.
- Semua 4 level tetap 1 game tap-answer/mixed. Terapkan **Aturan Desain
  Soal**: pengecoh yang mirip (bentuk beda tipis / warna berdekatan).

### B. Pasar Buah 🍉 — "Kenali Buah" (murni config, TANPA template baru)
Sumber (`w==="fruit"`) mencampur 4 tipe — semuanya sudah punya template:
1. **Beli Buah** → **count-tap** ("Ketuk N buah"; pengecoh 2–3 jenis buah
   lain, target dilebihkan — persis pola `src/games/tk/hitung-buah.ts`).
2. **Tebak Buah** → **tap-answer** (pilih buah sesuai nama; opsi: varian
   "bayangan/siluet" — kalau mau, tambah flag siluet yang render emoji
   `picture` dengan filter gelap. Boleh dilewati bila menambah kerumitan).
3. **Keranjang Warna** → **drag-drop** (seret buah ke keranjang warnanya;
   target = keranjang per warna, item = buah dengan `targetId` = warna).
4. **Kartu Buah** → **memory** (cocokkan pasangan buah).

Jadi Pasar Buah = **1 game mixed** (`count-tap` + `tap-answer` + `drag-drop`
+ `memory`) — cukup tulis config typed, tak perlu sentuh engine. Ambil data
buah (nama, emoji, warna) dari konstanta `FRUITS` di sumber.

## Urutan kerja & verifikasi (WAJIB)
1. Kerjakan **Bawah Laut dulu** (ada kerja engine), verifikasi, baru
   **Pasar Buah**.
2. Tambah `freeDemo: true` untuk testing (batas final demo ditetapkan
   Fase 4).
3. `npm run build` harus lolos. Smoke-test headless Chromium viewport HP
   (mis. 360–390 px lebar) tiap game baru **sampai tamat termasuk jalur
   salah** (klik jawaban salah → muncul "Coba lagi"). Cek tak ada error
   console. (Pola smoke-test: `playwright-core` + Chromium di
   `/opt/pw-browsers/`, drive lewat `vite preview`.)
4. Update bagian **Status Pengerjaan** di `CLAUDE.md`.
5. Deploy build testing ke branch Pages `claude/web-demo-html-wa4dr9`
   folder `app/` (base `/Game-Edukasi-Anak/app/`, `VITE_USE_HASH_ROUTER=1`;
   ganti HANYA isi `app/`, jangan sentuh file lain). Cara & URL ada di
   `CLAUDE.md` bagian "Deploy Web".
6. Di akhir: laporkan URL testing + daftar game baru yang bisa dicoba di HP.

## Catatan
- Progress anak game lama tidak perlu diimpor.
- Jaga bundle kecil & lazy-load per game (target Android low-end).
- Narasi Bahasa Indonesia tiap level; feedback selalu positif.
