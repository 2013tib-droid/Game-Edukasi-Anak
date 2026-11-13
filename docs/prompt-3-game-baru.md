# Prompt 3 game baru: satu per tingkatan (TK · SD 1-2 · SD 3-4)

> Dibuat 2026-11-13 atas permintaan pemilik. Tiap prompt di bawah **berdiri
> sendiri**: salin SATU blok (dari "PROMPT" sampai akhir bloknya) ke sesi Claude
> Code BARU, satu game per sesi. Jangan dikerjakan bersamaan di dua sesi:
> ketiganya menyentuh `registry.ts`, `types.ts`, `narration-lines.json`, dan
> `.github/render-request.txt`, jadi akan saling bentrok saat merge.
>
> Urutan yang disarankan: **Timbangan Seimbang (SD 1-2) → Wajah Perasaan (TK) →
> Kurir Kompas (SD 3-4)**. SD 1-2 sudah dijual, dan engine timbangannya paling dekat ke siap.

---

## Aturan bersama (sudah tertanam di tiap prompt, cuma ringkasan untuk pemilik)

- Cabang pendek dari `main` → kerjakan → merge ke `main` → **Deploy development**
  (`ref: main`, `nama: main`) → pemilik cek di HP → baru "Deploy web" kalau
  pemilik bilang.
- Game baru TANPA `draft`, TIDAK masuk `FREE_GAME_IDS`.
- Nol aset gambar wajib (SVG engine + seni item yang sudah ada).
- Narasi tanpa digit, kalimat soal ≤ ±70 karakter, render lewat
  `.github/render-request.txt`.
- Uji headless di 320×568, 360×640, 740×360, 820×1180.
- Catat di `CLAUDE.md` "Status Pengerjaan".

---

## PROMPT 1 — Playgroup & TK: "Wajah Perasaan"

```
Kita buat game BARU untuk kelompok Playgroup & TK (group id `tk`) bernama
"Wajah Perasaan" (id `wajah-perasaan`). Ini game sosial-emosional pertama di
app ini. BACA DULU `CLAUDE.md` sampai habis (terutama "Standar UX Anak",
"Aturan Desain Soal", "Suara Narasi", dan entri game yang paling baru di
"Status Pengerjaan" untuk pola kerja & jebakan yang sudah pernah kena).

## Tujuan belajar
Anak 4–7 tahun mengenali EMPAT perasaan dasar — senang, sedih, marah, takut
(plus "kaget" hanya di slot akhir) — dari (1) wajah, (2) kejadian penyebabnya,
dan (3) tahu hal baik yang bisa dilakukan saat merasakannya / saat teman
merasakannya. Ini bagian kurikulum PAUD (perkembangan sosial-emosional).

## Sebelum menulis kode: TANYA PEMILIK (AskUserQuestion), satu putaran
1. Tokoh wajahnya: (a, rekomendasi) wajah bulat SVG engine "anak ayam" yang
   warnanya senada maskot `mascot-3` — digambar engine supaya alis, mata,
   mulut bisa diatur; (b) wajah anak manusia SVG; (c) hewan berseni
   bergantian (TIDAK BISA berekspresi — seni WebP-nya statis; jelaskan itu).
2. Apakah "marah" ikut? (Rekomendasi: ya — marah perasaan yang sah; yang
   diajarkan cara menenangkannya, BUKAN bahwa marah itu salah.)
3. Judul tetap "Wajah Perasaan"? (Ingat aturan: judul TIDAK BOLEH menyebut
   nama hewan.)
Jangan mulai sebelum dijawab.

## Kenapa template baru
Kartu emoji wajah (😀😢) DILARANG: bentuknya beda di tiap HP, dan anak tak
belajar apa pun dari mencocokkan emoji. Wajahnya harus digambar ENGINE agar
(a) sama di semua HP, (b) bagian wajahnya bisa DIGESER anak. Buat template
engine baru `face-feel`:
- `src/engine/core/feelings.ts` = SATU sumber: `Feeling` union
  (`'senang'|'sedih'|'marah'|'takut'|'kaget'`), `FaceShape` (lengkung mulut
  −1..1, miring alis −1..1, buka mata 0..1, pipi merah 0/1, air mata 0/1),
  `FACE_OF: Record<Feeling, FaceShape>`, `feelingOf(shape)` (pembulatan ke
  perasaan terdekat dengan ambang), `FEEL_LINES` (kalimat tetap template).
  Dipakai template, builder config, pemeriksa CI, DAN
  `scripts/extract-narration.mjs` (pola `maze.ts`, `colorPath.ts`).
- `src/engine/ui/Face.tsx`: SVG wajah dari `FaceShape` (path mulut = kurva
  bezier yang titik tengahnya naik/turun; alis = dua garis yang dimiringkan;
  mata = elips yang tingginya ikut `buka`). Ekspresi harus TERBACA JELAS di
  kartu 90 px — LIHAT hasilnya lewat tangkapan layar tiap perasaan, jangan
  percaya kodenya saja (pelajaran `arc()` glyphStrokes).
- `src/engine/templates/FaceFeel.tsx` + `src/engine/ui/face-feel.css`.

## Mode soal (`FaceTask`), dipakai berselang
1. `pick` — narasi cerita singkat ("Es krim Kelinci jatuh ke tanah.
   Bagaimana perasaannya?"), isyarat gambar kejadian (seni item: kelinci +
   es krim/balon dsb.; hewan WAJIB seni WebP registry), 2–3 kartu WAJAH
   engine. Kartu wajah diberi label nama perasaan kecil di bawah (dibacakan
   saat disentuh, seperti nama kartu di code-quest).
2. `make` — "Buat wajah senang!" Wajah netral besar; anak MENYERET titik
   pegangan di tengah mulut naik/turun dan pegangan alis; perubahan tampil
   langsung (rAF menulis atribut path langsung ke DOM — JANGAN setState per
   pointermove, pelajaran PathTrace). Tombol "✓ Cocok!" menilai lewat
   `feelingOf`. Pegangan min 64 px target sentuh walau titiknya kecil.
3. `cause` — kebalikan `pick`: wajah ditunjukkan, anak memilih KEJADIAN yang
   cocok dari 2–3 kartu gambar (seni item: balon terbang, kado, hujan petir…).
4. `help` — "Teman Kucing sedih karena mainannya rusak. Apa yang bisa kamu
   lakukan?" 2–3 kartu tindakan (gambar + teks pendek ≤ 3 kata):
   memeluk/menghibur, meminjamkan mainan vs pengecoh yang tidak baik tapi
   TIDAK kasar (menertawakan, pergi saja). Marah → "tarik napas", "bilang
   pelan-pelan", "minta peluk".
5. `mirror` (slot akhir) — dua wajah: wajah teman + wajah kosong milik anak;
   "Teman senang dapat hadiah. Ikut senang yuk!" → anak membentuk wajah yang
   sama (empati). Dinilai seperti `make`.

## Aturan isi
- Skenario harus TAK AMBIGU untuk anak Indonesia 4 tahun. Hindari kejadian
  yang bisa dirasakan dua cara (hadiah kejutan = senang ATAU kaget →
  "kaget" hanya muncul di slot terakhir dan TIDAK pernah diadu dengan
  "senang" di soal yang sama). Pasangan yang tak boleh jadi
  jawaban-vs-pengecoh: takut↔kaget, sedih↔takut di skenario gelap/petir.
- Nol kekerasan, nol hukuman dari orang dewasa sebagai penyebab perasaan,
  nol tokoh anak laki+perempuan berduaan (pelajaran cerita payung).
- Tokoh di cerita = hewan berseni registry (kucing, kelinci, bebek, panda,
  beruang, kura-kura, ayam, monyet, gajah…). JANGAN anjing. JANGAN emoji
  hewan.
- Narasi menyebut nama perasaan dengan KATA; tanpa digit.
- Salah = SENYAP (`onWrong(true)`): kartu salah bergoyang; di mode `make`
  wajah memantul sedikit + kalimat "Hmm, wajahnya masih …" (masukkan ke
  `FEEL_LINES`). Bintang tetap dari jumlah salah.
- P2 (`hints: true`): tingkat 1 = kartu wajah yang salah dipudarkan satu /
  di `make` garis bayangan bentuk mulut target muncul samar; tingkat 2 =
  pegangan bergerak sendiri sedikit ke arah benar (animasi petunjuk, tidak
  menyelesaikan).
- Proyek sesi (`project: { title: 'Buku Perasaanku' }`) dengan stempel
  wajah per level.

## Slot (usulan; boleh dirapikan, urutan TETAP — tanpa `sessionLevels`
## yang mengacak urutan; gunakan kolam varian per slot, 6 varian/slot)
l1 pick senang vs sedih · l2 pick 3 perasaan · l3 make senang/sedih ·
l4 cause · l5 make 4 perasaan · l6 help (teman sedih/takut) ·
l7 help (aku marah) · l8 MISI BESAR "Hari Ulang Tahun Panda": pick → make
→ help dalam satu level (pola `steps` seperti misi Bagi Kue).

## Builder & pemeriksa
- `src/games/tk/wajah-perasaan.ts` (config typed). Builder MELEMPAR error
  saat build untuk: jawaban tak ada di pilihan, pilihan kembar, pasangan
  terlarang di atas, digit di narasi, kalimat > 70 karakter, `make` yang
  wajah awalnya sudah = target.
- `scripts/check-face-levels.mjs` (ikut CI di `.github/workflows/ci.yml`):
  bundel config asli (pola `check-maze-levels.mjs`), periksa SEMUA varian:
  tiap `FACE_OF[f]` dibaca `feelingOf` sebagai f sendiri; target `make`
  tercapai dalam rentang pegangan; ukuran pegangan ≥ 64 px di HP 320×568.
- Tambah id field baru yang berisi id item ke `ID_FIELDS` di
  `scripts/check-item-ids.mjs`.
- `extract-narration.mjs` ikut membaca field narasi baru (kalimat tindakan
  di kartu `help` kalau dibacakan saat disentuh, `FEEL_LINES`).

## Daftar & tampilan
- Daftarkan di `src/games/registry.ts` grup `tk` (sesudah game TK terakhir),
  emoji cadangan 🙂 (jangan emoji hewan), tulis prompt ikon seni di akhir
  `docs/prompt-ikon-game.md` (wajah bulat dengan dua ekspresi; JANGAN ungu).
- Latar `Scene` lembut (`rumah` atau `padang`) supaya tidak kosong.
- HP dimiringkan: wajah besar di kiri, kartu di kanan (pola Puzzle/Anggota
  Tubuh).

## Narasi
Jalankan `npm run narasi`, bandingkan `scripts/narration-lines.json`
sebelum/sesudah (nol baris lama pindah scope?). Kalau semua baris baru
scope `wajah-perasaan`, isi `.github/render-request.txt` dengan nomor render
berikutnya + baris `only: wajah-perasaan` di AWAL baris sendiri. Kata
taling/pepet yang ragu: JANGAN didaftarkan di `scripts/pronounce.mjs`.

## Uji (WAJIB sebelum lapor selesai)
`npm ci` dulu (node_modules kosong saat sesi mulai). typecheck, build,
semua `scripts/check-*.mjs`. Headless Chromium (Playwright global sudah ada,
JANGAN `playwright install`) di dev server mode buka, seret & klik sungguhan:
semua varian di 320×568 & 360×640, satu varian per slot di 740×360 &
820×1180 — tiap soal jawaban salah dulu, `make` diseret salah dulu lalu
benar, P2 terbukti muncul. Nol scroll tegak/mendatar, nol error console,
pegangan ≥ 64 px. Lihat tangkapan layar keempat wajah. Penjaga pertama
tiap ukuran: `innerWidth` = yang diminta & `#root` punya anak.

## Penutup
Tulis entri di `CLAUDE.md` "Status Pengerjaan" (format entri game lain:
keputusan pemilik, template, aturan, jebakan yang kena, angka uji, "BELUM
diuji di HP asli"). Tambah template ke daftar "Engine & Template Game".
Commit kecil, merge ke `main`, lalu jalankan Actions "Deploy development"
(`ref: main`, `nama: main`) dan kirim link
`https://2013tib-droid.github.io/Game-Edukasi-Anak/development/main/` ke
saya. JANGAN "Deploy web". Jangan tambah pengumuman lonceng tanpa tanya.
```

---

## PROMPT 2 — SD Kelas 1 & 2: "Timbangan Seimbang"

```
Kita buat game BARU untuk kelompok SD Kelas 1 & 2 (group id `sd1`) bernama
"Timbangan Seimbang" (id `timbangan-seimbang`). BACA DULU `CLAUDE.md` sampai
habis — terutama "BATAS BILANGAN 30", "ANGKA DI NARASI DITULIS DENGAN KATA",
"Aturan Desain Soal", dan entri game terbaru di "Status Pengerjaan".

## Tujuan belajar
Makna tanda "=" sebagai SEIMBANG / sama nilainya (bukan "tulis hasilnya di
sini") — dasar aljabar: 5 + 3 = ? + 2, 4 + ? = 9, 7 = 3 + ?. Anak MERASAKAN
persamaan lewat timbangan dua lengan yang miring sungguhan.

## Sebelum menulis kode: TANYA PEMILIK (AskUserQuestion), satu putaran
1. Kapan timbangan bereaksi? (a, rekomendasi) slot awal: miring LANGSUNG
   tiap balok ditaruh (eksplorasi); slot lanjut: timbangan DIKUNCI PASAK —
   anak menyusun dulu lalu menekan "Lepas pasak!", baru timbangan miring
   (memaksa berpikir, bukan coba-coba). (b) selalu langsung. (c) selalu pasak.
2. Ikut slot "timbangan gambar" (pra-aljabar: 1 semangka = 2 nanas, dua
   timbangan → simpulkan berat)? Rekomendasi: ya, jadi MISI BESAR.
3. Pemandu: hewan berseni (rekomendasi gajah `elephant` — "si penimbang
   pasar") atau tanpa pemandu.
Jangan mulai sebelum dijawab.

## Template engine baru `balance-scale`
- `src/engine/core/balance.ts` = SATU sumber: `sideSum`, `tiltOf(left,
  right)` → sudut (dibatasi ±14°, proporsional selisih lalu dijepit, selisih
  1 tetap terlihat miring ≥ 4°), `isBalanced`, `BALANCE_LINES`. Dipakai
  template, builder, pemeriksa CI, `extract-narration.mjs`.
- `src/engine/ui/BalanceArt.tsx`: timbangan dua piring SVG besar (tiang,
  lengan, dua piring tergantung yang TETAP tegak saat lengan miring, pasak
  merah yang bisa dicabut). Boleh melihat `src/engine/ui/Scale.tsx`
  (`Balance` milik Ukur Yuk) sebagai rujukan, tapi itu gambar diam — ini
  interaktif, jadi komponen baru.
- `src/engine/templates/BalanceScale.tsx` + `src/engine/ui/balance-scale.css`.
- Balok angka = kotak berwarna per nilai (warna tetap per angka, tanpa ungu,
  angka besar di tengah) yang TINGGINYA sedikit naik dengan nilainya
  (supaya "lebih berat" juga terlihat). Balok tetap di piring = terkunci
  (bergaris), balok dari baki = bisa dipindah.
- Seret ATAU ketuk-lalu-ketuk ke piring (pola baki Puzzle/Cashier, pointer
  event + listener di `window`). Balok di piring disentuh = kembali ke baki.
- Miringnya dianimasikan rAF (pegas teredam, ±0,6 dtk), menulis `transform`
  langsung ke DOM — jangan state React per frame. Piring ikut naik/turun.
- Seimbang = lengan mendatar, percikan (`sparkleAt`), bunyi `sfx('correct')`.
- Juice P1 sudah otomatis dari `GameShell`; `prefers-reduced-motion` =
  miring tanpa ayunan.

## Mode soal (`BalanceTask`)
1. `fill` — satu sisi tetap (mis. kiri 5 + 3), sisi lain kosong/sebagian;
   baki berisi beberapa balok TERMASUK pengecoh (Aturan Desain Soal: selalu
   ada pengecoh). Benar kalau seimbang.
2. `fewest` — "Seimbangkan dengan DUA balok saja" / "balok paling sedikit".
3. `equation` — sesudah seimbang, kartu tap-answer kecil di bawah: pilih
   kalimat matematika yang cocok ("5 + 3 = 6 + 2" vs "5 + 3 = 8 + 2"),
   persamaan ditulis besar (angka di layar boleh, di narasi TIDAK).
4. `missing` — persamaan dengan "?" tampil di atas timbangan
   ("4 + ? = 9"); anak mengisi "?" dengan menaruh balok di tempat
   bertanda ? di piring.
5. `picture` (misi) — balok GAMBAR (seni item buah: `watermelon`,
   `pineapple`, `apple`…) tanpa angka; timbangan pertama sudah seimbang
   (1 semangka = 2 nanas), anak menyeimbangkan timbangan kedua (semangka di
   kiri, isi kanan dengan apel/nanas). Berat buah tak pernah dibacakan.

## Aturan isi
- **Semua bilangan & jumlah sisi ≤ 30** (keputusan pemilik 2026-08-01),
  termasuk balok pengecoh. Builder MELEMPAR error kalau lewat.
- Tiap soal punya TEPAT jawaban yang diharapkan kalau mode `fewest`/
  `missing`; di `fill` boleh banyak susunan benar (justru bagus) — builder
  memastikan minimal satu susunan dari baki seimbang, dan baki ≤ 6 balok.
- Salah (menekan "Lepas pasak!" lalu tidak seimbang, atau kartu persamaan
  salah) = SENYAP `onWrong(true)`: timbangan miring ke sisi yang berat,
  kalimat `BALANCE_LINES` "Masih berat sebelah! Sisi mana yang terlalu
  berat?" (sekali per level), pasak terpasang lagi, balok TETAP di piring.
  Di mode tanpa pasak, miring biasa TIDAK dihitung salah.
- P2 (`hints: true`): tingkat 1 = total tiap sisi muncul samar di bawah
  piring; tingkat 2 = selisihnya tertulis di sisi yang ringan ("kurang 3")
  dan balok yang pas di baki berdenyut.
- Proyek sesi `project: { title: 'Kios Timbang' }` (stempel buah/benda).
- Narasi tanpa digit; kalimat ≤ ±70 karakter; satu kalimat dipakai ulang
  lintas varian (angka sudah ada di layar), seperti Toko Kembalian.
- Jangan mengulang isi Hitung Hebat (tambah/kurang biasa): tiap soal WAJIB
  tentang keseimbangan dua sisi.

## Slot (usulan, 9 slot × 6 varian, urutan tetap, tanpa `sessionLevels`)
l1 fill satu balok (langsung miring) · l2 fill dua balok · l3 fill dua sisi
berisi · l4 fewest · l5 missing "a + ? = b" (mulai pasak) · l6 missing
"a = b + ?" (dibaca dari kanan!) · l7 equation (pilih kalimat) · l8 dua sisi
dua suku "a + b = c + ?" · l9 MISI BESAR timbangan gambar (2–3 langkah).

## Builder & pemeriksa
- `src/games/sd1/timbangan-seimbang.ts`.
- `scripts/check-balance-levels.mjs` (ikut CI): coba SEMUA himpunan bagian
  baki per varian → minimal satu seimbang; mode `fewest` → banyak balok
  minimum benar sama dengan yang diminta narasi; `missing` → tepat satu
  balok baki mengisi "?"; semua angka ≤ 30; balok terkecil ≥ 56 px dan
  piring ≥ 64 px di HP 320×568.
- Daftarkan field id item baru ke `scripts/check-item-ids.mjs`.

## Daftar & tampilan
- Registry grup `sd1`, emoji cadangan ⚖️, prompt ikon seni di akhir
  `docs/prompt-ikon-game.md` (timbangan berwajah, dua piring berisi balok
  angka pastel, TANPA ungu).
- Latar `Scene` `kota` (sama tema daftar game SD 1-2) atau pasar.
- HP dimiringkan: timbangan kiri, baki kanan.
- Update `docs/kurikulum-sd1-2.md`: tunjuk bab yang dipenuhi (kesamaan /
  bilangan yang hilang).

## Narasi, uji, penutup
Sama persis polanya dengan game lain: `npm run narasi` → bandingkan
`narration-lines.json` → `.github/render-request.txt` nomor berikutnya +
`only: timbangan-seimbang` (di awal baris sendiri) kalau nol pindah scope.
`npm ci`, typecheck, build, semua `scripts/check-*.mjs`, headless Chromium
dev server mode buka dengan SERET sungguhan: semua varian di 320×568 &
360×640 (tiap varian salah dulu: pasak dilepas saat berat sebelah), satu per
slot di 740×360 & 820×1180, P2 terbukti, nol scroll, nol error console.
Penjaga alat ukur dulu (`innerWidth`, `#root`). Entri `CLAUDE.md`, merge ke
`main`, "Deploy development" (`ref: main`, `nama: main`), kirim link ke
saya. JANGAN "Deploy web". Tanpa pengumuman lonceng kecuali saya minta.
```

---

## PROMPT 3 — SD Kelas 3 & 4: "Kurir Kompas" (IPAS)

```
Kita buat game BARU untuk kelompok SD Kelas 3 & 4 (group id `sd2`, mapel
IPAS → `subject: 'ipas'`) bernama "Kurir Kompas" (id `kurir-kompas`). BACA
DULU `CLAUDE.md` sampai habis — terutama entri Kode Kelinci/Misi Kode &
Petak Ajaib (template papan berpetak), "Aturan Desain Soal", "ANGKA DI
NARASI", dan larangan warna ungu.

## Tujuan belajar (IPAS kelas 3–4: peta & arah)
1. Empat arah mata angin utama (utara, timur, selatan, barat) lalu delapan
   (timur laut, tenggara, barat daya, barat laut).
2. Membaca MAWAR ANGIN / kompas di peta — utara TIDAK selalu di atas.
3. Legenda/simbol peta.
4. Skala sederhana (1 petak = 100 meter) → jarak sebenarnya, maks 1.000 m
   (batas bilangan `sd2` = 1.000).

## BEDAKAN dari Kode Kelinci & Misi Kode (WAJIB)
Di game coding, arah = atas/kanan/bawah/kiri LAYAR dan anak menyusun
program. Di sini arah = MATA ANGIN yang menempel pada PETA, dan petanya bisa
diputar 90°/180° sehingga "utara" bisa ke kanan layar. Tidak ada kartu panah
layar, tidak ada tombol Jalankan program. Anak menggerakkan kurir LANGSUNG
(seret/ketuk petak), atau menjawab pertanyaan arah.

## Sebelum menulis kode: TANYA PEMILIK (AskUserQuestion), satu putaran
1. Kurirnya: (a, rekomendasi) sepeda `bicycle` / skuter `scooter` berseni,
   tanpa nama orang; (b) hewan berseni (kura-kura dsb.).
2. Bangunan di peta memakai seni item yang ADA (`school`, `hospital`,
   `shop`, `park`, `gas-station`, `field`, `house`, `barn`, `tree`) + emoji
   untuk yang belum berseni (kantor pos 🏤, stasiun 🚉)? Rekomendasi: ya.
   (Hindari rumah ibadah agama tertentu.)
3. Delapan arah ikut (kelas 4)? Rekomendasi: ya, slot belakang.
Jangan mulai sebelum dijawab.

## Template engine baru `compass-map`
- `src/engine/core/compass.ts` = SATU sumber: `Dir8`
  (`'u'|'tl'|'t'|'tg'|'s'|'bd'|'b'|'bl'`), `DIR_NAME` ("utara", "timur
  laut"…), `ROT` (0/90/180/270 — putaran peta), `screenVec(dir, rot)`,
  `dirBetween(a, b)` (arah dari petak a ke b, 8 arah), `parseTown(rows)`
  (papan string: `.` jalan, `#` blok rumah/pohon tak bisa dilewati, huruf =
  bangunan), `routeOk`, `shortest`, `COMPASS_LINES`. Dipakai template,
  builder, pemeriksa CI, `extract-narration.mjs`. Bisa memakai ulang pola
  `parseBoard` dari `src/engine/core/codeQuest.ts`, tapi file sendiri.
- `src/engine/ui/TownMap.tsx`: peta kota SVG gaya peta kertas (jalan krem,
  blok hijau, sungai biru), MAWAR ANGIN besar di pojok (U merah menonjol)
  yang ikut berputar dengan peta, legenda simbol di bawah. Seluruh peta
  diputar sebagai satu grup, TAPI ikon bangunan & huruf tetap tegak.
- `src/engine/templates/CompassMap.tsx` + `src/engine/ui/compass-map.css`.
- Gerak kurir: seret di jalan ATAU ketuk petak segaris (pola Taman
  Labirin `Maze.tsx` — lihat cara ia menangani jari & jejak). Jejak kuning.

## Mode soal (`CompassTask`)
1. `follow` — instruksi dibacakan & tertulis ("Dua blok ke utara, lalu tiga
   blok ke timur."), anak menggerakkan kurir; dinilai saat menekan
   "✓ Sampai!" (bukan otomatis — supaya anak tak bisa asal geser sampai
   menang). Benar = posisi akhir sama dengan tujuan instruksi.
2. `where` — "Pasar ada di sebelah mana sekolah?" → kartu arah (4 lalu 8
   arah). Kartu = tulisan arah + panah kecil yang SUDAH mengikuti putaran
   peta? TIDAK — kartu hanya tulisan, supaya anak benar-benar membaca mawar
   angin.
3. `rotated` — `follow`/`where` dengan peta diputar (90/180/270).
   Narasi pembuka: "Lihat mawar anginnya dulu! Utara ada di mana?"
4. `legend` — "Sentuh simbol rumah sakit di peta" / "Simbol ini artinya
   apa?" (kartu).
5. `scale` — "Satu kotak seratus meter. Berapa jauh dari rumah ke
   sekolah?" (kartu meter, jalur ditunjukkan); jarak dihitung sepanjang
   JALAN, bukan garis lurus — pengecoh: garis lurus, lupa satu blok,
   kali sepuluh.
6. `deliver` (MISI BESAR) — tiga paket, tujuan disebut dengan arah relatif
   ("ke bangunan di sebelah barat taman"), kurir mengantar berurutan;
   lencana "⭐ Rute hemat!" kalau langkah ≤ jalur terpendek (pujian saja).

## Aturan isi
- Petak terkecil ≥ 40 px di HP 320×568 → papan maks 6×6 (6×7 kalau muat).
- Narasi tanpa digit ("dua blok", "tiga ratus meter"); angka meter boleh di
  kartu jawaban ("300 m").
- Kalimat soal ≤ ±70 karakter; instruksi `follow` maks dua belokan per
  kalimat.
- Satu gambar satu arti: tiap bangunan muncul sekali per peta.
- Salah = SENYAP (`onWrong(true)`): `follow` salah → kurir bergoyang,
  petak tujuan yang BENAR tidak dibocorkan, kalimat "Coba cek mawar
  anginnya lagi!" (sekali per level), kurir kembali ke mulai. Kartu salah
  bergoyang.
- P2 (`hints: true`): tingkat 1 = mawar angin berdenyut + panah utara
  ditarik melintasi peta; tingkat 2 = jejak kaki langkah pertama yang benar
  / satu kartu salah dipudarkan.
- Proyek sesi `project: { title: 'Peta Kurir' }` (stempel bangunan).

## Slot (usulan, 9 slot × 6 varian, urutan tetap, tanpa `sessionLevels`)
Kelas 3: l1 follow 4 arah satu belokan · l2 where 4 arah · l3 legend ·
l4 follow dua belokan · l5 rotated (90°) where & follow.
Kelas 4: l6 where 8 arah · l7 rotated 180°/270° · l8 scale ·
l9 MISI BESAR deliver (peta diputar).
Varian = rancangan peta yang dicerminkan/diputar (narasi ikut berubah, jadi
narasi DIBANGUN builder dari arah, bukan ditulis tangan per varian —
`DIR_NAME` dari `compass.ts`).

## Builder & pemeriksa
- `src/games/sd2/kurir-kompas.ts`, `subject: 'ipas'`.
- `scripts/check-compass-levels.mjs` (ikut CI): untuk SEMUA varian —
  instruksi `follow` bisa dijalani lewat jalan (tak menabrak blok) dan
  berakhir tepat di tujuan; `where` jawabannya `dirBetween` & tepat satu
  kartu benar; peta diputar → teks arah tetap konsisten dengan `ROT`;
  `scale` jarak = jalur terpendek × 100, ≤ 1.000; tiap bangunan unik;
  petak ≥ 40 px di 320×568. Kalau gagal: ubah rancangan peta, JANGAN
  longgarkan pemeriksa.
- `extract-narration.mjs` menelusuri narasi hasil builder; daftarkan field
  id item ke `scripts/check-item-ids.mjs`.

## Daftar & tampilan
- Registry grup `sd2`, `subject: 'ipas'` (IPAS jadi 5 game → daftar game
  mapel muncul; cek `/kelompok/sd2/ipas`). Emoji cadangan 🧭. Prompt ikon
  seni di akhir `docs/prompt-ikon-game.md` (kompas berwajah di atas peta
  lipat, JANGAN ungu). Perbarui deskripsi IPAS `sd2` di `src/data/subjects.ts`
  (sebut peta & arah).
- HP dimiringkan: peta kiri, kalimat + kartu kanan.

## Narasi, uji, penutup
`npm run narasi` → bandingkan `narration-lines.json` → render request
nomor berikutnya (`only: kurir-kompas` kalau nol pindah scope; kalimat yang
SAMA PERSIS dengan game lain akan naik ke `shared` — kalau begitu render
TANPA `only:`). Lafal: "barat daya", "tenggara" biasanya aman; JANGAN
mendaftarkan kata yang ragu. `npm ci`, typecheck, build, semua
`scripts/check-*.mjs`, headless Chromium dev server mode buka dengan seret &
ketuk sungguhan: semua varian 320×568 & 360×640 (tiap varian salah dulu),
satu per slot 740×360 & 820×1180, P2 terbukti, peta terputar DILIHAT lewat
tangkapan layar (ikon tetap tegak, U menunjuk benar). Nol scroll, nol error
console. Entri `CLAUDE.md`, template ke daftar "Engine & Template Game",
merge ke `main`, "Deploy development" (`ref: main`, `nama: main`), kirim
link ke saya. JANGAN "Deploy web". Tanpa pengumuman lonceng kecuali saya
minta.
```
