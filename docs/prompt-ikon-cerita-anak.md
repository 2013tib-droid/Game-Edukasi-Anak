# Prompt Gambar — Ganti Gambar "Cerita Anak" (SD)

Sasaran: game **Cerita Anak** (`src/games/sd1/cerita-kancil.ts`, kelompok SD 1 & 2).

**Dokumen ini TIDAK berdiri sendiri.** Aturan gayanya sudah ada dan sudah teruji:

- Ikon game → **`prompt-ikon-game.md`**: pakai BLOK GAYA + **EKOR PROMPT** di sana.
- Item hewan → **`prompt-gambar-gemini.md`**: pakai BLOK GAYA di sana.

Yang ditambahkan di sini cuma baris prompt untuk empat gambar Cerita Anak,
plus jebakan khusus batch ini.

---

## Kenapa diganti

`prompt-ikon-game.md` sudah mencatatnya di "Temuan sampingan": ikon
`cerita-kancil.webp` **memuat tulisan bahasa Inggris** di dalam gambarnya —
*"My Story Adventures"* dan *"Every chapter is an adventure!"*. App-nya
berbahasa Indonesia untuk anak yang **baru belajar membaca**, dan aturan gaya
melarang teks di dalam ikon. Dari 18 ikon, cuma yang ini bertulisan.

Dua hal lain yang ikut kelihatan saat membandingkannya:

1. **Ikon itu satu-satunya yang bukan "satu objek berwajah".** Ikon lain = satu
   benda dengan mata + pipi merona. Yang ini pemandangan lengkap di dalam buku
   terbuka: pohon, jalan setapak, awan, bunga, empat bintang. Di kartu portal
   tingginya cuma 72 px — semua detail itu jadi bubur.
2. **Kartu pemilih cerita di dalamnya memakai TIGA bahasa gambar sekaligus:**

   | Cerita | Yang tampil sekarang | Masalah |
   |---|---|---|
   | Kancil dan Pak Tani | emoji 🦌 | bukan gambar; bentuknya beda tiap HP |
   | Jalak dan Kerbau | `items/jalak.webp` | **burung realistis gelap**, gaya ilustrasi dewasa |
   | Kancil dan Gajah | `items/elephant.webp` | sudah benar (kawaii, outline tebal) |

   Rusa emoji, burung realistis, dan gajah kartun berjajar dalam satu layar.

Yang **tidak** diganti: `elephant` sudah sesuai gaya, dan tiga ilustrasi adegan
di `public/assets/story/` (jalak-kerbau) tetap dipakai.

---

## Empat gambar, DUA sistem seni yang berbeda

| # | File tujuan | Muncul di | Ikuti gaya |
|---|---|---|---|
| 1 | `public/assets/games/cerita-kancil.webp` | kartu portal + layar intro | `prompt-ikon-game.md` |
| 2 | `public/assets/items/kancil.webp` (baru) | kartu cerita "Kancil dan Pak Tani" | `prompt-gambar-gemini.md` |
| 3 | `public/assets/items/jalak.webp` (menimpa) | kartu cerita "Jalak dan Kerbau" | `prompt-gambar-gemini.md` |
| 4 | `public/assets/items/kerbau.webp` (baru) | halaman cerita (kini emoji 🐃, 2×) | `prompt-gambar-gemini.md` |

**Jangan digenerate di chat Gemini yang sama.** Ikon game itu pastel dengan
outline coklat lembut; item hewan itu warna cerah dengan **outline hitam
tebal**. Satu chat = satu gaya, kalau tidak aturannya saling menimpa.

Ingat pelajaran ke-2 di `prompt-ikon-game.md`: **blok gaya di awal chat tidak
bertahan.** Tempel EKOR PROMPT di **setiap** pesan.

---

## 1. Ikon game — chat "gaya ikon"

Blok gaya + ekor prompt: ambil dari `prompt-ikon-game.md`. Baris objeknya:

`file: cerita-kancil.png` — **pilih SATU**

**Pilihan 1 (disarankan)**

> Buatkan: satu buku terbuka menghadap depan bersampul kuning muda, halaman
> krem POLOS tanpa judul dan tanpa tulisan apa pun, dan seekor kancil kecil
> (pelanduk) berwarna coklat muda menyembul dari balik halaman sambil
> tersenyum, berwajah imut dengan mata besar berkilau dan pipi merona.
> Tambahkan tiga bintang kecil pastel di sekitarnya.

**Pilihan 2**

> Buatkan: seekor kancil kecil (pelanduk) berwarna coklat muda berwajah imut
> sedang memeluk satu buku tertutup bersampul kuning muda, sampulnya POLOS
> tanpa judul dan tanpa tulisan apa pun. Tambahkan tiga bintang kecil pastel
> di sekitarnya.

Catatan yang menentukan hasilnya:

- **"POLOS tanpa judul" wajib ada di barisnya sendiri.** `prompt-ikon-game.md`
  sudah mencatat sampul buku sebagai magnet tulisan — dan ikon yang sekarang
  adalah buktinya. Kalau hasilnya masih bertulisan, jangan ulang seluruh
  prompt; balas di chat yang sama seperti contoh di dokumen itu.
- **Kancilnya menempel pada bukunya, jangan berdiri di sebelahnya.** Pelajaran
  ke-5: `GameIcon` mengukur lewat TINGGI dan kotak kartu portal cuma ±116 px di
  HP 360 px, jadi komposisi melebar (rasio > ±1,5) meluber. Menyembul dari balik
  halaman aman; berjajar bersebelahan tidak.
- **Kenapa harus ada kancilnya, bukan buku saja.** `cerita-nusantara.webp` sudah
  buku tosca bermotif batik. Dua ikon buku bersebelahan di daftar SD akan
  tertukar — dan dokumen ikon sudah menulis aturan itu ke arah sebaliknya
  ("buku terbuka sudah dipakai cerita-kancil"). Begitu ikon ini diganti,
  pembedanya pindah ke kancilnya.

---

## 2–4. Kartu cerita & hewan — chat "gaya item"

Blok gaya: ambil dari `prompt-gambar-gemini.md` (outline hitam tebal, warna
flat cerah, latar putih polos, satu objek, persegi 1:1).

| file | hewan | Baris prompt |
|---|---|---|
| `kancil.png` | kancil | Buatkan: seekor kancil (pelanduk, mouse-deer Indonesia) berdiri menghadap depan — badan mungil ramping warna coklat muda, perut dan dagu putih, kaki kecil ramping, telinga bulat sedang, mata bulat besar, tersenyum. Tanpa tanduk, tanpa ranggah. |
| `jalak.png` | jalak kerbau | Buatkan: seekor burung jalak kerbau menghadap tiga perempat — badan bulat gemuk warna abu-abu gelap, paruh dan kaki kuning oranye cerah, garis putih di sayapnya dan ujung ekor putih, jambul kecil di dahi, mata bulat besar ramah, tersenyum. |
| `kerbau.png` | kerbau | Buatkan: seekor kerbau menghadap depan — badan gempal warna abu-abu kecoklatan, sepasang tanduk melengkung lebar ke samping seperti bulan sabit, moncong lebar, mata bulat besar, tersenyum ramah. |

- **`jalak.webp` akan menimpa file lama.** Yang sekarang burung realistis gelap
  ala buku panduan burung. Garis putih sayap dan paruh kuning **wajib disebut**:
  itu yang membuat anak mengenalinya sebagai jalak, bukan burung gelap generik
  (`items.ts` mencatat emoji 🐦 ditolak justru karena burung biru generik).
- **`kerbau` bukan `cow`.** Registry sudah punya `cow` (sapi hitam-putih).
  Kerbau: abu-abu, tanduk sabit lebar. Ciri pembedanya ditulis **positif**,
  bukan sebagai larangan "bukan sapi" — pelajaran dari `tulis-huruf`: kata benda
  di dalam larangan sering justru ikut digambar.
- **Kancil paling sering gagal jadi rusa bertanduk.** Kalau tanduknya muncul,
  balas: *"ulangi, kepalanya tanpa tanduk sama sekali"*.

### Boleh menyusul (opsional)

Halaman cerita yang masih emoji. Bukan ikon, tidak mendesak:

| file | prompt |
|---|---|
| `buaya.png` | Buatkan: seekor buaya menghadap tiga perempat — badan hijau, perut kuning muda, moncong panjang dengan gigi kecil tumpul yang tidak menakutkan, mata bulat besar, tersenyum ramah. |
| `ular.png` | Buatkan: seekor ular melingkar rapi menghadap depan — badan hijau dengan pola belang kuning muda, kepala bulat, mata bulat besar, lidah kecil, ekspresi ramah dan tidak menyeramkan. |

Sengaja **tidak** ada prompt untuk Pak Tani. Aturan di CLAUDE.md: game ini
bertokoh **hewan saja**, percobaan memakai tokoh manusia sudah pernah ditolak.
Emoji 👨‍🌾 di satu halaman itu biarkan.

---

## Sebelum mengirim hasilnya

1. **Ada tulisan tidak?** Zoom ke sampul dan halaman buku. Satu huruf pun = ulangi.
2. **Kecilkan sampai setinggi ±72 px.** Masih kenal itu benda apa?
3. **Lebarnya tidak lebih dari ±1,5× tingginya** (khusus ikon game).
4. **Latarnya putih polos atau kotak-kotak transparansi?** Dua-duanya bisa
   dipotong. Yang tidak bisa: latar berwarna, bergradasi, atau ada bayangan lantai.

## Setelah gambarnya sampai — bagian saya

1. Potong + ekspor: ikon game `cut-checkerboard.py … 320`, item `cut-item.py … 512`.
2. **Tempel hasilnya di atas latar berwarna dan lihat** (pelajaran ke-4): bagian
   terang milik gambar — perut putih kancil, garis putih sayap jalak — paling
   rawan ikut terpotong, dan latar putih yang terkurung artwork tetap buram.
3. Daftarkan `kancil` & `kerbau` di `src/engine/ui/items.ts` (`ext: 'webp'` +
   emoji cadangan + label Indonesia).
4. `src/games/sd1/cerita-kancil.ts`: kartu `emoji: '🦌'` → `item: 'kancil'`,
   halaman 🐃 → `pic('kerbau', …)`.
5. `node scripts/check-item-ids.mjs` — id salah **tidak kelihatan saat main**,
   diam-diam jatuh ke emoji.
6. Build + deploy ke branch Pages.
