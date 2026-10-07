# Prompt gambar: Detektif Kucing (game "Detektif Bacaan", SD Kelas 3 & 4)

Tokoh pemandu game **Detektif Bacaan** (`sd2`, rancangan premium "Kasus
Detektif Kucing" di `docs/rencana-game-sd-kelas-3-4.md` bagian 2b.3 no. 5).
Detektif Kucing yang membawa kasus ("Siapa yang mengambil mangga…?"), dan anak
membantunya mencari bukti di dalam teks.

Tempat gambarnya tampil:
- **di samping gelembung kasus** di atas teks bacaan (±56–64 px, seperti Raja
  Singa di Istana Bilangan) — jadi siluetnya harus terbaca di ukuran kecil;
- **layar "Kasus Terpecahkan!"** di akhir sesi (lebih besar, ±128 px).

---

## ⚠️ Harus BEDA dari dua kucing yang sudah ada di app

| Sudah dipakai | Rupanya | Dipakai untuk |
|---|---|---|
| `items/cat.webp` | krem-cokelat, **bandana biru** | jawaban soal "kucing" di banyak game |
| `feedback/coba-lagi.webp` | **putih**, baju kuning | layar "Coba lagi, kamu pasti bisa!" |

Kalau Detektif Kucing mirip salah satunya, anak mengira itu kucing yang sama
(aturan "satu gambar satu arti"). Karena itu warnanya **ABU-ABU BELANG**,
matanya **hijau**, dan ia selalu memakai **topi detektif + jubah pendek
cokelat**. Jangan putih, jangan krem/oranye, jangan bandana.

---

## Blok gaya (tempel sekali di awal chat Gemini)

Sama dengan `docs/prompt-gambar-gemini.md` — gaya stiker, supaya ia berdiri
rukun di samping seni hewan yang sudah ada (singa, katak, monyet…).

> Kamu akan membantuku membuat ilustrasi untuk game edukasi anak usia 8–10
> tahun. Semua gambar HARUS mengikuti aturan gaya yang sama persis:
>
> - Gaya kartun kawaii yang imut dan ramah anak, sticker style.
> - **Outline hitam tebal** mengelilingi seluruh tokoh.
> - Warna **flat dan cerah**, shading lembut seminimal mungkin.
> - **Latar putih polos**, tanpa bayangan di lantai, tanpa bingkai, tanpa pola.
> - **Hanya SATU tokoh per gambar**, di tengah, seluruh badan masuk penuh
>   dengan sedikit ruang kosong di tepi.
> - **Tanpa teks, tanpa huruf, tanpa angka, tanpa watermark.**
> - Format **persegi (1:1)**, resolusi tinggi.
>
> Balas "siap" saja, lalu tunggu aku menyebutkan gambarnya satu per satu.

---

## Gambar 1 — WAJIB: `detektif-kucing.png`

> Buatkan: seekor **kucing detektif** berdiri tegak dengan dua kaki seperti
> tokoh kartun, **bulu abu-abu dengan belang abu-abu tua**, perut & moncong
> putih krem kecil, **mata hijau besar berbinar**, senyum percaya diri yang
> ramah. Memakai **topi detektif kotak-kotak cokelat** (deerstalker) dan
> **jubah pendek cokelat muda** sebatas pinggang. Tangan kanan memegang
> **kaca pembesar** bergagang cokelat di samping badan (BUKAN di depan wajah),
> **lensanya biru muda pucat**. Badan sedikit menghadap ke KANAN. Ekor terlihat
> di belakang. Seluruh badan dari ujung topi sampai kaki masuk penuh.

Versi Inggris (kalau tempel lengkap tanpa blok gaya):

> Cute kawaii cartoon detective cat for a children's educational game, one
> single character, standing upright on two legs, grey fur with darker grey
> tabby stripes, small cream belly and muzzle, big sparkling green eyes,
> friendly confident smile, brown plaid deerstalker hat, short light-brown
> cape to the waist, holding a magnifying glass with a brown handle beside
> its body (not in front of the face), pale light-blue lens, body turned
> slightly to the right, tail visible, full body visible from hat to feet,
> thick black outline, flat bright colors with minimal soft shading, plain
> white background, no shadow, no text, square 1:1, sticker style, high
> resolution.

## Gambar 2 — opsional: `detektif-kucing-pikir.png`

Untuk saat petunjuk bertingkat (P2) muncul: tokoh yang sama sedang berpikir.

> Tokoh yang SAMA persis (kucing detektif abu-abu belang, mata hijau, topi
> kotak-kotak cokelat, jubah cokelat muda), **sedang berpikir**: satu cakar
> menyentuh dagu, mata melirik ke atas, kaca pembesar di tangan lain di samping
> badan. Ekspresi penasaran, bukan bingung atau sedih.

## Gambar 3 — opsional: `detektif-kucing-senang.png`

Untuk layar "Kasus Terpecahkan!".

> Tokoh yang SAMA persis, **melompat gembira** dengan satu tangan mengangkat
> kaca pembesar tinggi-tinggi, mata tertutup senyum lebar. Tanpa confetti,
> tanpa bintang, tanpa benda lain di sekitarnya.

Kalau Gemini mengubah rupanya di gambar 2 & 3, kirim gambar 1 bersama
permintaannya ("buat tokoh ini dengan pose …") supaya tokohnya tetap sama.

---

## Yang DILARANG di gambar ini (dan kenapa)

- **Pipa / cerutu** — atribut detektif klasik yang paling sering ditambahkan AI.
  Mutlak tidak boleh di game anak. Kalau muncul, minta ulang.
- **Borgol, pistol, tongkat polisi, seragam polisi** — "pelaku" di kasus game
  ini cuma hewan yang lupa atau salah ambil; nuansa tangkap-hukum tidak cocok
  dengan aturan "tanpa hukuman".
- **Tulisan apa pun** (di topi, lencana, jubah) — salah eja khas AI, dan tak
  terbaca di 56 px.
- **Kaca pembesar menutupi mata** — wajah harus terlihat utuh di ukuran kecil.
- **Lensa putih** — lihat bagian potong di bawah.
- **Lengan yang membentuk lingkaran tertutup dengan badan** (tangan di
  pinggang) — celah putih di dalamnya tak bisa dibuang otomatis.

---

## Tokoh di dalam kasus: pakai hewan yang SUDAH ada gambarnya

Kasus-kasusnya (teks bacaan) akan memakai hewan yang seninya sudah ada di
`items.ts`, jadi **tak perlu gambar tambahan**: singa, gajah, jerapah, panda,
kelinci, bebek, beruang, kura-kura, pinguin, kuda, ayam, zebra, kambing,
koala, sapi, harimau, monyet, katak, burung jalak.

Yang **belum** ada seninya dan karena itu dihindari dulu di kasus: kerbau,
tikus, burung hantu, ikan, semut. (Contoh di dokumen rencana menyebut "mangga
Pak Kerbau" — itu akan diganti hewan yang ada, mis. "mangga Pak Beruang".)
Kalau kamu ingin salah satunya ikut tampil, buat dengan blok gaya yang sama
dan beri nama sesuai id-nya (mis. `buffalo.png`).

Benda bukti (mangga, payung, kunci, sepatu, buku, dsb.) juga memakai seni
item yang sudah ada.

---

## Kirim ke sesi Claude

1. Unduh dengan nama persis seperti di judul (`detektif-kucing.png`, dst.) —
   PNG/JPEG latar putih apa adanya, jangan dipotong sendiri.
2. Dipotong dengan **`scripts/cut-item.py`** (stiker berlatar putih), ekspor
   WebP ±320 px sisi terpanjang ke **`public/assets/ui/detektif-kucing.webp`**,
   lalu isi konstanta `GUIDE = 'detektif-kucing'` di
   `src/games/sd2/detektif-bacaan.ts` (game-nya sudah jadi sejak 2026-10-07 dan
   memakai 🔍 sampai gambar ini ada).
3. Pemeriksaan sebelum dipakai: hasil potong ditempel di atas **warna gelap**
   dulu (celah putih yang terkurung — mis. di antara lengan & badan, atau di
   lengkung ekor — hanya kelihatan di situ), lalu di atas latar pastel app pada
   ukuran 56 px. Lensa biru muda sengaja dipilih supaya tidak terbuang sebagai
   "latar putih" dan tetap terbaca sebagai kaca.

---

## Prompt sesi untuk mengerjakan gamenya

Salin ke sesi Claude Code baru sesudah gambar 1 siap. Gambar 2 & 3 boleh
menyusul: selama belum ada, pose berpikir & gembira memakai gambar 1.

```
Kerjakan game "Detektif Bacaan" untuk SD Kelas 3 & 4 (kelompok sd2), versi
premium "Kasus Detektif Kucing". Patokannya docs/rencana-game-sd-kelas-3-4.md
— baca dulu bagian ⚠️, bagian 0, bagian 2b (2b.3 no. 5), bagian 4, dan
bagian 2 no. 8 (materi & jebakan). Seni tokohnya: docs/prompt-detektif-kucing.md
(gambarnya saya lampirkan).

- Mulai dari branch main yang terbaru.
- sd2 MASIH DEVELOPMENT: draft di groups.json tetap terpasang, jangan
  sentuh FREE_GAME_IDS, backend, landing, atau pengumuman lonceng.
- Template baru read-find (sentuh kalimat bukti di dalam teks) dikerjakan
  sebagai fitur engine, bukan tambalan satu game. Petunjuk bertingkat P2
  dinyalakan (hints: true), proyek sesi P3 dipakai.
- Tanyakan ke saya dulu sebelum menulis kode: daftar slot, tema kasus,
  apakah papan bukti & kaca pembesar ikut di versi pertama, dan subject
  registry (bahasa-indonesia).
- Uji headless di 360×640 dan 320×568 (plus 740×360 & 820×1180) pakai build
  penguji, ukur SEMUA varian, tiap soal dijawab sampai "Selamat!", nol
  scroll, nol tulisan terpotong, nol error console.
- Jalankan npm run narasi, pastikan nol digit; perbarui
  .github/render-request.txt kalau ada baris baru (cek tak ada yang pindah
  scope ke shared).
- Sesudah selesai, perbarui tabel Status di dokumen rencana dan catat di
  CLAUDE.md, lalu push ke branch claude/<fitur> dan buat PR.
```
