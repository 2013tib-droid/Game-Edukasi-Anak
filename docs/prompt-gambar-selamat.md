# Prompt Gambar — Ikon Layar "Selamat!" (pengganti emoji 🎉)

Sasaran: **`public/assets/ui/selamat.webp`** — satu gambar saja.

## Status (2026-09-15) — MENUNGGU GAMBAR PIALA

**Keputusan pemilik 2026-09-15: ikonnya jadi PIALA**, menggantikan terompet pesta yang
terpasang sejak 2026-09-14 (pemilik mengirim mockup layar hasil bertrofi lalu: *"Jadi gini
aja, bikin prompt pialanya"*). Promptnya: **PILIHAN 3** di bawah — itu yang dipakai sekarang,
Pilihan 1 & 2 turun jadi catatan.

Yang terpasang HARI INI masih terompet pesta (`public/assets/ui/selamat.webp`, 289×320,
27 kB, rasio 0,90). Begitu gambar pialanya jadi, **timpa berkas yang sama** — tak ada kode
yang perlu diubah, tak ada nama berkas yang berganti.

Sebelum itu sudah dicek: gambar penggantinya **belum pernah ada di mana pun** — tidak di
`main`, tidak di riwayat commit, dan tidak di branch Pages (`app/assets/ui/` cuma berisi
`tersendat.webp`). Beda dari ikon Puzzle Gambar & Anggota Tubuh (2026-09-08) yang ternyata
nyangkut di branch Pages; kali ini memang tak ada berkas yang bisa dipulihkan.

Dokumen ini disimpan untuk kalau nanti gambarnya diganti lagi — dan karena tahap POTONG-nya
memunculkan satu lubang yang harus ditembus manual (lihat "Setelah gambarnya jadi").

Ini layar hasil `GameShell` (`screen === 'done'`) — layar yang paling sering dilihat anak,
muncul tiap kali satu game tamat, bersamaan dengan lagu kemenangan ±2,7 detik.

## Kenapa emoji 🎉 sebaiknya diganti

- **Emoji digambar berbeda-beda di tiap HP** — di satu HP terompet pesta keemasan miring, di
  HP lain kerucut warna lain dengan confetti yang lain. Seluruh app ini sudah pindah ke
  gambar sendiri justru karena alasan itu (hewan, ikon game, maskot, feedback, layar
  tersendat); layar hasil salah satu sisa terakhir yang masih emoji polos.
- Momennya besar: ini hadiah anak setelah menyelesaikan satu game penuh.

---

## Aturan teknis khusus layar ini (baca dulu — empat hal yang tidak ada di layar lain)

1. **NOL tulisan di dalam gambar.** Kata **"Selamat!"** ditulis HTML tepat di bawah
   gambarnya, dan di bawahnya lagi "Kamu dapat 21 dari 21 bintang!". Tulisan di gambar =
   kalimatnya dobel, dan tidak ikut terbaca pembaca layar. **Ini kebalikan dari overlay
   umpan balik** (`prompt-gambar-feedback.md`), yang kalimatnya memang sengaja digambar KE
   DALAM gambar — jangan tertukar.
2. **JANGAN bintang emas besar, dan jangan angka.** Persis di bawah gambar ada baris
   ⭐⭐⭐ berisi bintang yang benar-benar didapat anak. Bintang menonjol di dalam gambar akan
   terbaca sebagai bintang tambahan dan mengacaukan hitungan yang justru jadi inti layar
   ini. Percikan/kilau kecil pastel boleh; bintang emas sebesar confetti-nya jangan.
3. **Jangan naga, jangan maskot, jangan hewan berperan.** Kartu maskot ada di layar yang
   SAMA, beberapa sentimeter di bawahnya, dan yang tampil di situ adalah tahap maskot anak
   saat itu — bisa masih **telur 🥚**. Naga besar di atas + telur di bawah = dua pesan yang
   bertabrakan. (Alasan yang sama dengan 🐣 di layar tersendat: gambar yang kebetulan sama
   dengan salah satu tahap maskot terbaca seolah berhubungan dengan tahap anak.) Yang
   dicari di sini **benda perayaan**, bukan karakter.
4. **Tingginya dipatok 128px dan tidak boleh lebih.** Layar hasil ini **sudah** melebihi
   tinggi HP kecil (terukur 707px di layar 640px), jadi gambarnya tidak boleh menambah satu
   piksel pun — 128px itu persis 1px lebih pendek dari kotak emoji yang digantikannya.
   Konsekuensinya: **rasio harus mendekati persegi, komposisinya jangan melebar.** Confetti
   yang tersebar lebar membuat gambarnya kena pengaman `max-width` dan dirender lebih
   pendek dari 128px — terompetnya sendiri jadi sekecil kuku. Minta confetti **merapat di
   sekitar** benda utamanya, jangan menyebar ke seluruh bingkai.

---

## Cara pakai

1. Buka chat **baru** di Gemini.
2. **Lampirkan satu ikon kartu game yang sudah ada sebagai contoh gaya** — mis.
   `public/assets/games/pasar-buah.webp` atau `hutan-hewan.webp`. Model jauh lebih patuh
   melihat contohnya daripada membaca deskripsi gayanya.
3. Tempel **BLOK GAYA**, lalu **satu baris prompt** di bawah ini — dan **EKOR PROMPT wajib
   ikut ditempel di pesan itu juga** (blok gaya di awal chat tidak bertahan; ini pelajaran
   kedua di `prompt-ikon-game.md`).

Gayanya mengikuti **`prompt-ikon-game.md`** (stiker kawaii, outline coklat lembut) —
konsisten dengan ikon-ikon kartu game dan dengan overlay feedback. **Bukan** gaya render 3D
lembut maskot (`prompt-maskot-naga.md`); jangan campur dua gaya di satu gambar.

### BLOK GAYA (tempel sekali di awal chat)

> Kamu akan membantuku membuat satu gambar untuk game edukasi anak usia 4–8 tahun.
> Gambarnya HARUS mengikuti aturan gaya ini:
>
> - Gaya kartun **kawaii** yang imut dan ramah anak, sticker style, ilustrasi datar.
> - Warna **PASTEL lembut** (peach, mint, biru muda, kuning krem, ungu muda), shading
>   halus, tanpa gradasi metalik, tanpa tekstur realistis.
> - Outline **tebal tapi lembut berwarna coklat/krem tua** — bukan hitam pekat.
> - Objek utamanya **berwajah imut**: mata besar berkilau, pipi merona, senyum kecil.
> - **Latar putih polos**, tanpa bayangan di lantai, tanpa bingkai, tanpa pola.
> - **Hanya SATU objek utama** di tengah. Hiasan kecil boleh, tapi jangan ramai.
> - **Tanpa teks, tanpa tulisan, tanpa watermark.**
> - Format **persegi (1:1)**, resolusi tinggi.

### PILIHAN 3 — PIALA (DIPILIH PEMILIK 2026-09-15) ✅ pakai ini

**Kenapa piala justru subjek paling aman di layar ini** — ia lulus aturan pemilihan subjek
yang lahir dari penolakan 2026-09-04 (lihat "Riwayat" di bawah) dengan nilai penuh:
**bulat/gemuk, SATU badan, dan mangkuknya bidang datar paling lebar** di antara semua
kandidat — wajah imutnya punya tempat duduk yang jelas, tidak melenceng ke tepi seperti di
corong terompet. Bahasa gambarnya juga paling langsung: "hadiah setelah berusaha", persis
alasan Pilihan 5 (peti harta) dulu diusulkan, tapi siluetnya lebih dikenal anak.

> Buatkan: satu **piala kemenangan** yang imut dan gemuk. Mangkuk pialanya **kuning
> keemasan LEMBUT** (pastel, bukan logam berkilau) dengan dua pegangan melengkung di kiri
> dan kanan, berdiri di atas **alas kayu coklat muda** dengan plakat kuning kecil di
> depannya. **Wajah imutnya digambar BESAR di badan mangkuk pialanya**: dua mata besar
> berkilau, pipi merona, senyum lebar gembira. Di sekeliling piala ada **confetti pastel
> kecil-kecil** (peach, merah muda, mint, biru muda, ungu muda) dan beberapa **percik kilau
> berbentuk permata empat sudut** warna kuning krem — semuanya **merapat di sekitar piala**,
> tidak menyebar jauh ke tepi gambar. Tinggi dan lebar gambarnya kira-kira sama.
>
> Percik kilaunya HARUS berbentuk permata/empat sudut — **jangan bintang bersudut lima yang
> melayang**, jangan bintang emas besar, jangan angka, jangan piala kedua. Plakat di alasnya
> **POLOS tanpa tulisan**; satu bintang kecil TERUKIR di plakat itu boleh. Suasananya
> gembira dan bangga.

**Dua hal yang sengaja beda dari mockup pemilik** — keduanya diukur, bukan selera:

- **Percik kilaunya empat sudut, bukan bintang lima sudut.** Tepat di bawah gambar ada baris
  ⭐⭐⭐ berisi bintang yang benar-benar didapat anak (aturan 2 di atas). Bintang lima sudut
  yang melayang di sekitar piala bentuknya SAMA dengan bintang di baris itu, jadi terbaca
  sebagai bintang tambahan. Permata empat sudut tetap terasa "berkilau" tanpa bentrok.
  Bintang yang TERUKIR di plakat aman — ia jelas bagian dari pialanya, bukan bintang lepas.
- **Confetti-nya lebih merapat.** Di mockup ia menyebar sampai tepi bingkai; setelah dipotong,
  **percikan terluar itulah yang menentukan batas gambar**, jadi pialanya sendiri dirender
  makin kecil di kotak 128px (pelajaran yang sama dengan maskot naga & kembang api).

**Warna emas itu pengecualian yang disadari** dari blok gaya "pastel semua": piala yang
di-pastel-kan sampai pucat berhenti terbaca sebagai piala. Yang dijaga cuma satu hal —
**kuning keemasan LEMBUT dengan shading halus, bukan logam berkilau/metalik** (kalimat yang
sama sudah dipakai di Pilihan 2).

### PILIHAN 1 — terompet pesta yang meletus *(yang terpasang sampai 2026-09-15, digantikan Pilihan 3)*

Paling dekat dengan 🎉 yang dulu, jadi anak yang sudah hafal layar ini tidak merasa ada
yang hilang. "Terompet pesta" = kerucut party popper, benda yang memang digambar emoji itu.

> Buatkan: satu **terompet pesta** (kerucut party popper) berwarna kuning krem bergaris
> ungu muda melingkar, dimiringkan ke atas, **berwajah imut** di badan kerucutnya — mata
> besar berkilau, pipi merona, senyum lebar gembira. Dari mulut kerucutnya menyembur
> **confetti pastel** berupa potongan-potongan kecil warna peach, mint, biru muda, dan ungu
> muda, **merapat di sekitar mulut kerucut** dan tidak menyebar jauh, ditambah dua pita
> serpentin melengkung pendek. Tinggi dan lebar gambarnya kira-kira sama.
>
> Confetti-nya berwarna pastel semua, **jangan ada confetti putih**. Jangan menggambar
> bintang emas, jangan bintang besar, jangan angka. Suasananya gembira dan bangga.

### PILIHAN 2 — terompet tiup dengan not musik

Pakai ini kalau yang dibayangkan pemilik memang **terompet tiup** (alat musik), bukan
kerucut party popper. Bonusnya: layar ini memang memutar lagu kemenangan ±2,7 detik, jadi
not musiknya jujur menggambarkan apa yang terdengar.

> Buatkan: satu **terompet tiup kecil** berwarna kuning krem keemasan lembut (pastel, tidak
> metalik) yang **berwajah imut** di badan terompetnya — mata besar berkilau, pipi merona,
> senyum kecil gembira. Terompetnya dimiringkan ke atas, dan dari mulut corongnya keluar
> **tiga not musik pastel** kecil (mint, peach, ungu muda) beserta beberapa potongan
> confetti pastel kecil, semuanya **merapat di sekitar corong** dan tidak menyebar jauh.
> Tinggi dan lebar gambarnya kira-kira sama.
>
> Jangan ada confetti putih. Jangan menggambar bintang emas, jangan bintang besar, jangan
> angka, jangan garis paranada. Suasananya gembira dan bangga.

### EKOR PROMPT (WAJIB ditempel di pesan yang sama)

> Aturan wajib: format persegi 1:1. Latar putih polos rata, tanpa pemandangan, tanpa
> ruangan, tanpa meja, tanpa blur latar, tanpa bokeh. Tanpa bingkai, tanpa border, tanpa
> sudut membulat di tepi gambar. Tanpa bayangan di lantai, tanpa pantulan, tanpa glitter.
> JANGAN menuliskan kata, huruf, angka, label, judul, atau watermark apa pun di dalam
> gambar. Ilustrasi datar bergaya stiker, bukan foto.

### Kalau hasilnya masih melenceng

Balas di chat yang sama dengan menyebut kesalahannya saja, jangan mengulang seluruh prompt:

> Ulangi gambar yang sama, pertahankan bentuk dan warnanya, tapi perbaiki: ganti latarnya
> jadi PUTIH POLOS rata tanpa ruangan dan tanpa blur, hapus semua tulisan, hapus
> bingkainya, hapus bayangan di lantai, rapatkan confetti-nya supaya tinggi dan lebar
> gambarnya kira-kira sama, dan buat formatnya persegi 1:1.

---

## Setelah gambarnya jadi

1. Simpan hasilnya (mis. `selamat.png`).
2. **Potong latarnya — pilih skripnya sesuai BAHANNYA, jangan asal `cut-item.py`:**

   | Bahan yang datang | Skrip |
   |---|---|
   | Latar **putih polos**, stiker beroutline (yang diminta prompt di atas) | `python3 scripts/cut-item.py <art> public/assets/ui/selamat.webp 320` |
   | Latar **kotak-kotak palsu** (khas Gemini, seolah transparan) | `python3 scripts/cut-checkerboard.py <art> public/assets/ui/selamat.webp 320` |
   | Latarnya **sudah transparan** sungguhan | `python3 scripts/trim-alpha.py <art> public/assets/ui/selamat.webp 320` |
   | Render 3D lembut **tanpa outline** (kalau gaya maskot dipilih) | `python3 scripts/cut-soft.py <art> public/assets/ui/selamat.webp 320` |

   320px cukup: gambarnya tampil 128px, jadi masih ±2,5× untuk layar HP ber-DPR tinggi.
   `cut-item.py` pada berkas yang latarnya sudah transparan **berbahaya** — ia mencari latar
   PUTIH, dan bagian putih di gambar seperti itu justru milik gambarnya.
3. **LUBANG DI DALAM GANTUNGAN TALI harus ditembus manual** (kena di gambar 2026-09-14).
   Tali kecil di ujung bawah kerucut membentuk lingkaran tertutup, jadi latar di dalamnya
   **terkurung** dan tak terjangkau flood-fill: ia tetap **putih opak** (terukur 720 px di
   berkas 1024 px) dan di atas latar krem-merah muda layar hasil terbaca seperti tetesan
   pejal, bukan lubang. Pola yang sama dengan lubang ring kunci pas (Batch 7) dan daftar
   `HOLES` di `cut-item-sheet.py` — **sengaja per gambar, jangan diotomatiskan.**

   Yang ditembus **hanya komponen terang terkurung PALING BESAR**. Bercak terang lainnya
   (132 px & 67 px di daerah wajah) adalah **kilau di mata dan sorot putih di badan
   kerucut** — itu milik gambarnya dan harus selamat:

   **UNTUK PIALA (Pilihan 3): lubangnya ADA DUA, bukan satu — dua pegangan mangkuknya.**
   Snippet di bawah ini menembus komponen terbesar SAJA, jadi kalau dipakai apa adanya satu
   pegangan tetap tersumbat putih dan bentuknya terbaca seperti telinga pejal. Ganti bagian
   pemilihannya jadi "tembus semua komponen terkurung di atas ambang", mis. **≥ 250 px**
   pada berkas 1024 px:

   ```python
   # ganti blok best = (0, None) ... for y, x in best[1]
   MIN_HOLE = 250   # px, pada berkas ±1024 px
   holes = []       # kumpulkan SEMUA komponen, bukan cuma yang terbesar
   # … di dalam loop: holes.append(pts)
   for pts in holes:
       if len(pts) >= MIN_HOLE:
           for y, x in pts:
               bg[y, x] = True
   print('lubang ditembus:', [len(p) for p in holes if len(p) >= MIN_HOLE])
   ```

   **Ambangnya WAJIB diukur dari hasil cetaknya, jangan ditebak**: cetak dulu ukuran semua
   komponen terkurung, lalu pilih angka yang memisahkan dua pegangan (besar) dari kilau mata
   & sorot mangkuk (kecil — di terompet 132 px & 67 px). Kalau kilau matanya ikut terbuang,
   matanya jadi bolong dan itu **langsung terlihat di layar**; kalau pegangannya tak ikut
   ditembus, cacatnya justru cuma kelihatan di atas latar berwarna (lihat langkah 4).

   ```bash
   python3 - <<'EOF'
   import numpy as np
   from PIL import Image
   from collections import deque

   SRC = '<art.png>'          # gambar asli kiriman pemilik
   DST = 'public/assets/ui/selamat.webp'
   a = np.asarray(Image.open(SRC).convert('RGB')).astype(np.int16)
   H, W, _ = a.shape
   lum, sat = a.max(axis=2), a.max(axis=2) - a.min(axis=2)
   light = (lum >= 196) & (sat <= 30)

   # Flood fill dari tepi — sama persis dengan cut-item.py.
   bg = np.zeros((H, W), bool); q = deque()
   for x in range(W):
       for y in (0, H - 1):
           if light[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
   for y in range(H):
       for x in (0, W - 1):
           if light[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
   while q:
       y, x = q.popleft(); base = a[y, x]
       for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
           ny, nx = y + dy, x + dx
           if 0 <= ny < H and 0 <= nx < W and not bg[ny, nx] and light[ny, nx] \
                   and int(np.abs(a[ny, nx] - base).max()) <= 8:
               bg[ny, nx] = True; q.append((ny, nx))

   # Tembus SATU lubang: komponen terang terkurung terbesar (lubang talinya).
   trapped = (~bg) & (lum >= 235) & (sat <= 18)
   seen = np.zeros((H, W), bool); best = (0, None)
   for y0 in range(H):
       for x0 in range(W):
           if trapped[y0, x0] and not seen[y0, x0]:
               dq = deque([(y0, x0)]); seen[y0, x0] = True; pts = []
               while dq:
                   y, x = dq.popleft(); pts.append((y, x))
                   for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                       ny, nx = y + dy, x + dx
                       if 0 <= ny < H and 0 <= nx < W and trapped[ny, nx] and not seen[ny, nx]:
                           seen[ny, nx] = True; dq.append((ny, nx))
               if len(pts) > best[0]: best = (len(pts), pts)
   for y, x in best[1]: bg[y, x] = True
   print('lubang ditembus:', best[0], 'px')

   ys, xs = np.where(~bg)
   y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
   rgba = np.dstack([a[y0:y1, x0:x1].astype(np.uint8),
                     (~bg[y0:y1, x0:x1]).astype(np.uint8) * 255])
   img = Image.fromarray(rgba, 'RGBA')
   s = min(1.0, 320 / max(img.size))
   if s < 1.0:
       img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
   img.save(DST, 'WEBP', quality=92, method=6)
   print(DST, img.size)
   EOF
   ```
4. **Tempel hasilnya di atas latar BERWARNA dan lihat**, jangan percaya angka "latar
   terbuang" yang dicetak skripnya. Dua hal yang sudah diperiksa di gambar 2026-09-14:
   - **Nol potongan confetti hilang.** Yang ikut terbuang cuma halo tipis di tepi (1.072
     serpih, terbesar 74 px, warnanya ±(235,255,255)) — itu pinggiran JPEG, bukan
     confetti. Kalau nanti ada gumpalan terbuang ≥ 100 px, ITU baru confetti yang hilang:
     minta ulang gambarnya dengan pastel yang lebih pekat, **jangan** menaikkan toleransi
     skripnya (itu akan melahap sorot putih di badan kerucut).
   - **Halo pucat di sekeliling confetti & pita memang masih ada**, tapi cuma terlihat di
     atas warna gelap. Layar hasil selalu pastel (`#ffe9a8` → `#ffd1dc`), jadi di app tak
     kelihatan. Jangan "dibersihkan".
5. **Tidak ada kode yang perlu diubah.** `GameShell` (komponen `PartyPic`) sudah menunjuk
   file itu, dengan emoji 🎉 sebagai cadangan otomatis, dan animasi "berpesta"-nya sudah
   berlaku untuk gambar maupun emoji.
6. Deploy seperti biasa; pastikan `dist/assets/ui/` ikut tersalin ke folder `app/` di branch
   Pages. **Jangan menaruh asetnya langsung di branch Pages** — itu yang membuat dua ikon
   kartu game nyaris hilang (2026-09-08). Aset masuk ke `public/assets/**` di `main` dulu.

## Ukuran yang sudah terverifikasi (jangan diubah tanpa mengukur ulang)

Diukur headless di build produksi (`vite preview`), layar hasil Hutan Hewan dimainkan sampai
"Selamat!" — angka "sesudah" di bawah diverifikasi ulang dengan gambar yang sungguhan
terpasang (`naturalWidth` 289, benar-benar termuat, bukan sekadar ada `<img>`):

| Layar | Emoji 🎉 (sebelum) | Gambar 128px (sesudah) |
|---|---|---|
| 320×568 | luber 192px | luber **191px** |
| 360×640 | luber 67px | luber **66px** |
| 380×800 | 0 | **0** |
| 820×1180 | 0 | **0** |

Luber di HP kecil itu **bug lama** layar hasil (sudah tercatat sejak 2026-08-08, isinya 707px
untuk layar 640px) — bukan akibat gambar ini; gambarnya justru 1px lebih pendek. Kalau suatu
saat layar itu dirapikan, yang perlu dikecilkan ikon/kartu maskotnya, bukan gambar ini.

---

## Riwayat: percobaan 2026-09-04 yang DITOLAK (dan kenapa yang ini lolos)

Pekerjaan ini pernah dikerjakan sekali, di branch **`claude/game-end-trumpet-prompt-q1w7gz`**
(3 commit, dokumennya `docs/prompt-gambar-selesai.md`, 254 baris) — dan **tak pernah
ter-merge ke `main`**. Branch itu **DIGANTIKAN oleh dokumen ini**; jangan di-merge, karena
kodenya menunjuk nama berkas lain (`assets/ui/selesai.webp`) dengan tinggi 132px, jadi kalau
dua-duanya masuk `main` ada dua jalur kode dan yang lama menunjuk berkas yang tidak ada.
(Angka 132px-nya juga keliru menurut ukuran: kotak emoji 129px, dan 132px membuat layar
360×640 jadi 710px alih-alih 707px.)

**Yang penting dari branch itu: terompet pesta waktu itu DITOLAK pemilik — "gambarnya
jelek".** Alasan yang ditulis di sana: corong + ledakan berserakan itu subjek yang sulit
untuk model gambar (corongnya jadi logam berkilau berantakan, confettinya taburan acak,
dan wajahnya tak punya bidang datar untuk duduk).

**Kenapa percobaan 2026-09-14 justru diterima** — tiga hal yang berbeda, pakai ini kalau
nanti minta ulang:

- **Confettinya merapat di mulut kerucut**, tidak menyebar ke seluruh bingkai (itu memang
  yang diminta baris promptnya, dan itulah bedanya).
- **Kerucutnya digambar sebagai kertas pastel bergaris, bukan logam berkilau** — jadi
  badannya punya bidang datar lebar, dan wajahnya duduk di situ dengan enak.
- Rasionya jadi **0,90** (mendekati persegi), jadi tak kena pengaman `max-width`.

**Aturan pemilihan subjek dari branch itu tetap berlaku** kalau gambar ini suatu saat
diganti: pilih objek yang **BULAT/GEMUK, SATU BADAN, dan punya bidang datar besar untuk
wajah** — itu yang selalu berhasil di gaya stiker app ini (lihat ikon kartu game: ulat,
balon ucapan, papan target, jam). Hiasan maksimal beberapa butir yang MENEMPEL di badan
objeknya, bukan taburan sepenuh gambar.

## Cadangan kalau gambar ini diganti (dipindahkan dari branch lama)

Gaya & **EKOR PROMPT sama persis** dengan Pilihan 1 di atas — tempel juga di tiap pesan.

**Kotak kado meletus** — kalau terompetnya terasa kurang meriah:

> Buatkan: satu kotak kado besar warna hijau mint dengan pita merah muda, tutupnya
> terlempar terbuka ke atas dan dari dalamnya menyembur confetti kecil-kecil warna pastel
> serta pita-pita melengkung. Kotaknya berwajah imut: mata besar berkilau, pipi merona,
> senyum lebar gembira. Semburannya berkumpul rapat di atas kotak, tidak melayang jauh ke
> tepi gambar. Tinggi dan lebar gambarnya kira-kira sama.

**Balon udara** — paling nyambung dengan nama app ("Petualangan Pintar") dan bentuknya
paling aman digambar model:

> Buatkan: satu balon udara panas yang imut dan gemuk, badan balonnya bergaris-garis lebar
> warna pastel — krem, merah muda, hijau mint, dan biru muda — dengan keranjang rotan kecil
> warna coklat muda menggantung di bawahnya. Wajah imutnya digambar besar di bagian tengah
> bawah badan balon: mata besar berkilau, pipi merona, senyum lebar gembira. Tambahkan
> empat confetti pastel kecil yang menempel dekat keranjangnya. Balon udaranya satu-satunya
> objek, digambar besar memenuhi gambar. Tanpa langit, tanpa awan, tanpa bintang kuning.

**Peti harta karun terbuka** — bahasa "hadiah setelah berusaha", siluet kotak gemuk:

> Buatkan: satu peti harta karun kayu kecil yang imut dan gemuk, warna coklat muda dengan
> ban logam krem, tutupnya terbuka lebar ke belakang. Dari dalam peti keluar cahaya lembut
> kuning krem dan beberapa confetti pastel kecil yang menempel di dekat mulut peti. Wajah
> imutnya digambar besar di badan depan peti: mata besar berkilau, pipi merona, senyum
> lebar gembira. Isinya hanya cahaya dan confetti — tanpa koin, tanpa uang, tanpa
> perhiasan, tanpa mahkota.

**Roket meluncur** — paling "meledak-ledak" tanpa jadi berantakan:

> Buatkan: satu roket mainan gemuk yang imut sedang meluncur ke atas, badannya warna krem
> dengan ujung kerucut merah muda dan tiga sirip biru muda. Di bawahnya ada satu gumpalan
> asap pastel membulat yang padat dan menempel ke ekor roket. Wajah imutnya digambar besar
> di badan roket: mata besar berkilau, pipi merona, senyum lebar gembira. Roketnya tegak
> lurus menghadap ke atas dan jadi satu-satunya objek. Tanpa bintang, tanpa planet, tanpa
> luar angkasa, tanpa api menyembur panjang.

**KEMBANG API SENGAJA TIDAK DIREKOMENDASIKAN** (pernah ditanyakan pemilik 2026-09-04).
Empat sebabnya, semuanya masih berlaku: ia butuh **langit gelap** untuk terbaca sementara
gambar ini ditempel di gradien pastel TERANG · percikan tipis **hilang di 128px**, dan
sesudah dipotong justru percikan terluar yang menentukan batas gambar sehingga inti
ledakannya dirender makin kecil · bentuk **bintang memancar bentrok dengan baris ⭐⭐⭐**
tepat di bawahnya · ledakan tak punya badan untuk wajah imut. Jalan tengahnya: minta
terompet/kotak kado tapi semburannya diganti percikan kembang api kecil **berwarna pekat**
(merah muda tua, ungu, biru, mint — jangan kuning atau putih), tetap rapat di badan objeknya.

**Cara memilih:** minta beberapa di chat yang sama (satu gambar per pesan), lalu bandingkan
bertiga pada ukuran **±128px** — sekitar setinggi ibu jari di layar HP. Yang masih terbaca
di ukuran itu yang menang; jangan menilai dari tampilan besarnya di laptop.
