# Prompt Generasi Aset — Hewan (Game Edukasi Anak)

Dokumen ini melacak **aset gambar hewan** untuk board game (dipakai lewat
`src/engine/ui/items.ts` dan dirender dari `public/assets/items/<id>.<ext>`).
Pemilik proyek mengirim art final (AI-generated) bertahap; dokumen ini mencatat
gaya visual target, prompt per hewan, dan status pengiriman.

## Gaya Visual Target (WAJIB konsisten)

Ditetapkan dari dua aset pertama yang dikirim pemilik (gajah & singa):

- Kartun anak yang **imut/kawaii**, proporsi kepala besar, ekspresi ramah.
- **Outline hitam tebal** mengelilingi seluruh subjek (penting: memudahkan
  potong latar & konsisten di board warna apa pun).
- Warna **flat** dengan shading lembut minimal, pipi merah muda pada hewan lucu.
- **Latar polos** saat generate (putih atau satu warna) — akan dipotong jadi
  transparan.
- Satu hewan per gambar, menghadap depan / tiga-perempat, seluruh tubuh masuk.

### Pipeline pasca-generate (dari JPEG kiriman → aset game)

1. Potong latar jadi transparan (flood-fill dari tepi, dijaga saturasi+brightness
   agar tidak masuk ke badan; berhenti di outline hitam).
2. Autocrop ke bounding box subjek + padding kecil.
3. Resize sisi terpanjang → **512px** (cukup tajam, ringan untuk Android low-end).
4. Ekspor **WebP** (quality 90) transparan.

Skrip referensi: `scripts/` (lihat `process.py` pada handoff) — parameter
saturasi/brightness disetel per gambar karena warna latar berbeda.

**Kasus khusus — PNG sudah ber-alpha / latar gelap.** Bila kiriman berupa PNG
yang sudah punya kanal alpha (mis. panda: siluet sudah terpotong), JANGAN
key-out warna — pakai al-nya langsung. Kadang bagian putih subjek (wajah/perut
panda) ikut transparan karena dirancang untuk halaman putih; isi lubang
tertutup itu dengan putih (flood dari tepi menandai latar asli, sisanya =
lubang → putih). Ini yang dipakai untuk panda karena latarnya hitam dan tubuh
panda juga hitam (tak mungkin dipisah dari warna).

**Kasus khusus — latar checkerboard (JPEG).** Bila kiriman JPEG dengan latar
kotak-kotak transparansi (ter-flatten), latar itu abu-abu **saturasi rendah**
di semua tingkat kecerahan. Buang dengan flood dari tepi memakai gerbang
saturasi saja (`sat < ~20`), lalu ambil **blob terbesar** untuk membuang
coretan garis-gerak / teks ("MEOW!") / daun jatuh, dan isi lubang di dalam
subjek. Dipakai untuk bebek, kura-kura, kelinci, beruang, kucing.

## Registrasi

Setiap aset baru harus didaftarkan di `src/engine/ui/items.ts`:

```ts
elephant: { emoji: '🐘', label: 'gajah', ext: 'webp' },
```

- `id` (kunci) = nama Inggris, dipakai di config game: `{ item: 'elephant', count: 3 }`.
- `label` = Bahasa Indonesia (alt text / narasi).
- `emoji` = fallback bila gambar gagal dimuat.
- `ext: 'webp'` = wajib untuk aset kiriman (default registry adalah `svg`).

## Roster Hewan & Status

| id | Hewan (ID) | Emoji | Status | File |
|---|---|---|---|---|
| giraffe | jerapah | 🦒 | ✅ diterima (dipakai Hutan Hewan l1) | `public/assets/items/giraffe.webp` |
| elephant | gajah | 🐘 | ✅ diterima (dipakai Hutan Hewan l2) | `public/assets/items/elephant.webp` |
| lion | singa | 🦁 | ✅ diterima (dipakai Hutan Hewan l3) | `public/assets/items/lion.webp` |
| panda | panda | 🐼 | ✅ diterima (dipakai Hutan Hewan l5) | `public/assets/items/panda.webp` |
| rabbit | kelinci | 🐰 | ✅ diterima (dipakai Hutan Hewan l4) | `public/assets/items/rabbit.webp` |
| duck | bebek | 🦆 | ✅ diterima (dipakai Hutan Hewan l7) | `public/assets/items/duck.webp` |
| cat | kucing | 🐱 | ✅ diterima | `public/assets/items/cat.webp` |
| bear | beruang | 🐻 | ✅ diterima (dipakai Hutan Hewan l6, ganti anak ayam) | `public/assets/items/bear.webp` |
| turtle | kura-kura | 🐢 | ✅ diterima (dipakai Hutan Hewan l8, level baru) | `public/assets/items/turtle.webp` |

> **Semua aset hewan kini premium WebP** — tidak ada placeholder SVG hewan lagi.
> Sejak 2026-08-04 `house` pun premium (`house.webp`), bersama 7 bangunan &
> tempat tujuan lain (sekolah, rumah sakit, toko, pom bensin, sawah, pohon,
> taman) — placeholder `house.svg` sudah dihapus.
> `dog`/`anjing`, `penguin`/`pinguin`, `chick`/`anak ayam` **dihapus** dari
> registry atas permintaan pemilik: anjing tidak dipakai; anak ayam & pinguin
> digantikan hewan premium (beruang di l6; kura-kura di l8, level baru).
>
> **Pola menambah hewan baru:** tambah level baru di `hutan-hewan.ts` (hitung /
> tambah / kurang) memakai id hewan yang sudah didaftarkan di `items.ts`. Hewan
> berikutnya yang menyusul mengikuti pola ini.

## Prompt per Hewan

Template prompt (isi `<HEWAN>`):

> Cute kawaii cartoon `<HEWAN>` for a children's educational game, full body,
> facing forward / three-quarter view, big friendly eyes, rosy cheeks, thick
> black outline, flat colors with soft minimal shading, plain white background,
> centered, high resolution, sticker style.

| id | Catatan prompt spesifik |
|---|---|
| giraffe | tubuh oranye-tan dengan bercak coklat, perut krem, tanduk (ossicone) kecil, melambai dua tangan. **✅ sesuai referensi.** |
| elephant | badan abu-abu kebiruan, telinga besar merah muda di dalam, melambai. **✅ sesuai referensi.** |
| lion | surai coklat, tubuh emas, ekspresi ceria/mengaum ramah. **✅ sesuai referensi.** |
| panda | hitam-putih, mata besar, pipi pink, memeluk bambu hijau. Latar hitam + tubuh hitam → pakai alpha PNG + isi lubang putih (lihat "Kasus khusus"). **✅ sesuai referensi.** |
| rabbit | putih/krem, telinga panjang, memeluk wortel, bandana biru. **✅ sesuai referensi.** |
| duck | bebek kuning, paruh oranye, bandana biru. **✅ sesuai referensi.** |
| cat | oranye-putih, mata biru, bandana biru. **✅ sesuai referensi.** |
| bear | beruang coklat, perut krem, bandana biru, melambai. **✅ sesuai referensi.** |
| turtle | kura-kura, tempurung hijau, wajah krem, bandana biru. **✅ sesuai referensi.** |

Saat menambah hewan baru di luar daftar ini, ikuti gaya target di atas dan
daftarkan idnya di `items.ts` sebelum dipakai di config game.

## Batch Berikutnya (buah, maskot, kendaraan, benda)

Prompt siap tempel untuk Gemini ada di **`docs/prompt-gambar-gemini.md`**.
Status pengiriman:

| Batch | Status |
|---|---|
| Maskot 6 tahap | ✅ diterima (2026-08-04) → `public/assets/mascot/mascot-1..6.webp` |
| Buah (14) | ✅ diterima (2026-08-04) → `public/assets/items/*.webp` |
| Kendaraan (16) | ✅ LENGKAP (2026-08-04) → `car, bus, truck, pickup, tractor, bicycle, scooter, ambulance, firetruck, police, train, bajaj, taxi, jeep, motorcycle, racecar` |
| Bangunan & tempat tujuan (8) | ✅ diterima (2026-08-04) → `house, school, hospital, shop, gas-station, field, tree, park` |
| Benda sehari-hari (20) | ✅ diterima (2026-08-04) → `public/assets/items/*.webp` |
| **5 — Benda paling sering muncul (25)** | ⬜ **berikutnya** (2026-08-08) |
| 6 — Alat musik (5) | ⬜ menunggu |
| 7 — Profesi & alatnya (13) | ⬜ menunggu |
| 8 — Hewan & rumahnya (8) | ⬜ menunggu |
| 9 — Benda sisa (15) | ⬜ menunggu |

**Yang masih belum digambar:** kendaraan — otoped, papan luncur, truk besar,
mobil antar-jemput, bus listrik, trem/monorel; tujuan — halte, pabrik, kantor,
stasiun, istana, jembatan, pantai.

### Sisa emoji: hasil audit 2026-08-08

Seluruh config game di-bundle lalu data levelnya ditelusuri (**semua varian
tiap slot**, bukan cuma yang keluar satu sesi) untuk mencari setiap field
emoji yang belum punya pasangan id gambar — `emoji`/`item`,
`picture`/`pictureItem`, `vehicle`/`vehicleItem`, `goal`/`goalItem`.

Saat itu: **75 aset sudah ada, ±160 benda masih dirender pakai font emoji HP.**
Batch 5–9 di `prompt-gambar-gemini.md` adalah 66 di antaranya yang benar-benar
layak digambar; sisanya sengaja dibiarkan emoji (lihat "Yang Sengaja TIDAK
Perlu Digambar" di dokumen itu — titik warna keranjang, huruf/angka, simbol,
tujuan hiasan Jalan Kendaraan, adegan cerita).

Cara mengulang audit ini kapan pun (mis. setelah menambah game baru): tiru
`scripts/check-item-ids.mjs` — ia sudah mem-bundle config dan menelusuri
`ID_FIELDS`; yang dibutuhkan cuma membalik logikanya (cari field emoji yang
**tidak** punya id pendamping).

**Yang paling merugikan sekarang bukan "emoji itu jelek", tapi ketidak-
konsistenan**: benda yang sama tampil bergambar di satu game dan emoji di game
lain (ikan, kapal, motor, madu, daun). Di mata anak itu dua benda berbeda.
Karena itu Batch 5 diurutkan berdasarkan **berapa banyak game yang memakainya**,
bukan berdasarkan game mana yang paling penting.

**Konflik nama yang sudah ketahuan & sudah dihindari di daftar batch:**

- `river` (sungai) harus jadi aset sendiri — emoji 🏞️ sekarang dipakai untuk
  "sungai" **dan** sudah terdaftar sebagai `park` (taman). Satu gambar dua
  arti, persis yang dilarang aturan proyek (lihat `teddy` vs `bear`).
- `police-officer` (orang) bukan `police` — id itu sudah dipakai **mobil**
  polisi.
- `glass` (gelas) sengaja ditunda ke Batch 9 dan harus kosong/berisi air
  bening, karena `milk` sudah berupa gelas berisi susu.

**Arah kendaraan — koreksi.** Prompt Batch 3 menulis "menghadap ke KANAN", tapi
aset yang dipakai sekarang menghadap **KIRI** (lihat `car.webp`), dan itu yang
benar: `PathTrace` mencerminkan gambar dengan `scaleX(-1)` sebelum memutarnya
mengikuti arah jalan. Kendaraan baru (motor, kapal, pesawat) **wajib menghadap
kiri** — kalau tidak, di dalam game ia berjalan mundur.

### Pelajaran dari dua batch pertama (BACA sebelum minta batch baru)

- **Minta LATAR PUTIH POLOS.** Latar biru maskot masih bisa dipotong; latar
  **gelap dengan cahaya berwarna** hampir tidak bisa — cahaya di belakang tiap
  buah meniru warna buah yang ada di depannya, jadi flood-fill menembus masuk
  ke dalam subjeknya. Lemon batch pertama hancur total (tersisa cincin kuning
  berlubang) dan harus digambar ulang; kiwi & alpukat baru selamat setelah
  toleransi diperketat ke 3.
- **Satu gambar per file.** Kiriman berupa "papan" berisi 6–14 objek memaksa
  pemotongan manual, dan tiap objek cuma ±190–250px — di bawah kebutuhan
  (kartu jawaban tampil 114px, HP 2× DPI butuh ±230px). Mangga & lemon yang
  dikirim satu-satu keluar 518×715 dan 637×966: jauh lebih tajam.
- **Periksa bingkai tepi.** File mangga punya garis gelap tipis 1–3px di tepi
  gambar; flood dari tepi mati di situ. Pipeline sekarang memotong 6px dulu.
- **Bentuk harus benar, bukan cuma cantik.** Mangga percobaan pertama digambar
  bulat oranye — nyaris kembar dengan jeruk, dan ini game pengenalan buah.
  Versi kedua (lonjong melengkung, hijau-kekuningan) baru dipakai.
- **Lembar bangunan (2026-08-04) kena dua hal yang sama**: latarnya gelap
  bercahaya lagi, dan 8 objek dalam satu lembar → tiap ikon cuma ±256px. Kali
  ini pemotongan selamat karena cahaya latarnya HALUS (gradasi) sementara garis
  luar ikonnya tajam, jadi flood-fill berhenti di tepi. Itu keberuntungan, bukan
  aturan — permintaan tetap: **latar putih polos, satu objek per file.**
- **Warna buah tidak boleh diubah semaunya**: Pasar Buah menyortir buah ke
  keranjang warna, jadi seni yang warnanya menyimpang membuat jawaban benar
  jadi terlihat salah.

### Tambahan dari batch benda sehari-hari (2026-08-04)

- Lembar 20 benda ini **berhasil dipotong otomatis** oleh
  `scripts/cut-item-sheet.py` karena latarnya putih polos dan tiap objek
  ber-outline — bukti bahwa permintaan "latar putih polos" di atas memang
  yang menentukan. Ukurannya tetap kecil (±200px, sesuai keberatan "satu
  gambar per file" di atas); cukup untuk kartu jawaban, tapi kalau nanti ada
  yang dipakai sebagai cue besar, minta versi satuannya.
- **Benda putih perlu perhatian khusus**: telur, awan, nasi, dan susu nyaris
  sewarna kertas. Toleransi flood-fill harus kecil (8) supaya badan benda
  tidak ikut terhapus.
- **Latar yang terkurung** (celah kursi, lubang kepala kunci) tidak terjangkau
  flood-fill dari tepi dan harus ditembus per item — tidak bisa
  diotomatiskan, karena bercak putih bola sepak terlihat sama persis.
- **Jangan memberi nama yang bentrok dengan hewan asli**: boneka beruang jadi
  `teddy`, bukan `bear`.

### Pelajaran dari batch kendaraan (2026-08-04)

- **Arah hadap kendaraan: KIRI, bukan kanan.** `PathTrace` memasang
  `scaleX(-1)` sebelum memutar gambar (aturan warisan dari emoji kendaraan
  yang menghadap kiri). Sumber menghadap kanan akan berjalan MUNDUR di jalan.
  Prompt lama di `prompt-gambar-gemini.md` sempat salah menulis "kanan" —
  sudah diperbaiki di sana.
- **Kendaraan TANPA WAJAH.** Set yang dikirim tidak bermata/bermulut, beda
  dari aturan buah & hewan. Jangan campur dua gaya dalam satu game.
- **JPEG boleh, asal tanpa bayangan lantai.** Bus sekolah dikirim JPEG
  berlatar putih dengan bayangan lembut di bawah roda; bayangan itu netral
  dan terang sehingga lolos dari penghapusan latar biasa dan tertinggal jadi
  noda putih memanjang di atas aspal. Cara benarnya: kenali isi objek dari
  **saturasi tinggi ATAU kegelapan** (bodi berwarna, garis tepi & roda
  hitam), lalu isi lubang supaya sorotan putih di kaca tetap ada.
- **Lembar berisi banyak kendaraan sekaligus TERNYATA aman** untuk kasus ini
  — beda dari pelajaran batch buah. Ke-12 kendaraan datang dalam satu lembar
  4×3 dan komponennya terpisah bersih, jadi bisa dipotong otomatis. Yang
  membuatnya berhasil: latar transparan + jarak antar objek longgar. Tetap
  saja satu file per objek lebih tajam kalau resolusinya jadi pertimbangan.
- **Ukuran aset kendaraan cukup 240px lebar** (bukan 512px seperti hewan):
  di `path-trace` kendaraan tampil maksimal 64px. Dua belas aset = 189 kB.
- **Teks di dalam gambar harus Bahasa Indonesia.** Bus batch pertama
  bertuliskan "SCHOOL BUS" dan harus digambar ulang jadi "BUS SEKOLAH".
  Lebih aman: minta tanpa tulisan sama sekali — walau model tetap suka
  menambahkannya (taksi tetap keluar bertuliskan "TAXI" dua kali berturut-turut
  meski prompt melarangnya).
- **Tulisan pada papan/plakat berwarna rata bisa dihapus tanpa menggambar
  ulang.** Kenali papannya (satu blok warna), ambil lubang di dalamnya
  (`binary_fill_holes` dikurangi papan aslinya) sebagai topeng tulisan,
  lebarkan 2px supaya tepi antialias ikut terangkat, lalu isi tiap baris
  dengan warna papan yang bersih di baris itu (papannya bergradasi vertikal,
  jadi jangan pakai satu warna rata). Dipakai untuk menghapus "TAXI".
- **Prompt teks saja TIDAK cukup mengunci gaya.** Percobaan pertama jip/taksi/
  motor/mobil balap keluar sebagai clipart vektor realistis walau promptnya
  sudah benar. Yang menyelesaikannya: melampirkan `docs/acuan-gaya-kendaraan.png`
  (6 aset yang sudah diterima) + kalimat "ikuti gaya persis seperti acuan ini".
  Percobaan kedua langsung sepadan. Lakukan ini untuk SEMUA batch berikutnya.
