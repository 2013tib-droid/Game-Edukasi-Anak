# Aset Gambar Hewan — Prompt & Cara Pasang

Panduan untuk mengganti ilustrasi hewan di game **Hutan Hewan** (dan game
lain nanti) dengan gambar AI bergaya imut, seperti pinguin yang sudah dipasang
(`public/assets/items/penguin.webp`).

Engine memuat tiap item dari `public/assets/items/<id>.<ext>`. Registry ada di
`src/engine/ui/items.ts`. Ganti gambar = drop file + set `ext`. Tidak perlu
ubah config game.

---

## 1. Gaya acuan (dari pinguin yang sudah jadi)

Chibi/kawaii: kepala besar bulat, **mata besar hitam berkilau** (ada highlight
putih), **pipi merah muda**, senyum riang, **outline hitam tebal**, shading
lembut (cel-shading), warna pastel, badan penuh, menghadap depan, pose ceria,
**background polos**.

### Base prompt (tempel di depan tiap hewan)
```
cute kawaii baby {ANIMAL}, chibi style, big round head, large sparkly black eyes
with white highlights, small pink blushing cheeks, happy open smile, thick clean
black outline, soft flat cel shading, pastel colors, full body, front-facing,
playful standing pose, centered, plain solid pastel background, sticker style,
2D vector illustration, high quality
```

### Negative prompt
```
text, watermark, signature, border, frame, photorealistic, 3d render, multiple
animals, extra limbs, cropped, blurry, dark, scary
```

> Tips konsisten: pakai **model & seed yang sama** untuk semua hewan, ubah hanya
> bagian `{ANIMAL}` + ciri warnanya. Rasio **1:1 (persegi)**, zoom seragam
> (badan penuh, ada sedikit ruang di tepi).

---

## 2. Prompt per hewan (7 sisa + rumah)

Nama file **wajib** sesuai id (huruf kecil). Ganti `{ANIMAL}` di base prompt
dengan baris berikut:

| id (nama file) | Ganti `{ANIMAL}` dengan |
|---|---|
| `dog` | `golden-brown puppy with long floppy ears and a tiny pink tongue` |
| `cat` | `orange tabby kitten with pointy ears and whiskers` |
| `rabbit` | `fluffy white bunny with long upright ears (pink inner ears)` |
| `panda` | `black and white panda with round black ears and black eye patches` |
| `chick` | `tiny fluffy yellow baby chick with a small orange beak` |
| `duck` | `yellow duckling with a flat wide orange bill, side three-quarter view` |
| `house` | *(bukan hewan — lihat catatan di bawah)* |

**`duck` vs `chick`:** keduanya kuning — biar beda, minta bebek **paruh pipih
lebar** (bukan paruh runcing) dan sudut **3/4 samping**. Kalau masih mirip,
tambah `wearing a tiny blue bow` atau warna badan sedikit lebih oranye.

**`house`** (rumah, gaya sama tapi tanpa wajah):
```
cute cartoon little house, warm cozy, red-orange roof, wooden door, two blue
windows, thick clean black outline, soft flat cel shading, pastel colors,
front view, centered, plain solid pastel background, sticker style,
2D vector illustration, high quality
```

---

## 3. Syarat file

- **Background:** transparan (terbaik) **atau** polos satu warna (nanti dihapus
  otomatis oleh skrip — lihat langkah 4).
- **Format:** PNG atau WebP (transparan). JPG boleh **hanya** jika background
  polos (JPG tidak punya transparansi).
- **Nama:** `dog`, `cat`, `rabbit`, `panda`, `chick`, `duck`, `house`.
- Ukuran bebas (mis. 1024×1024) — skrip mengecilkan ke 400px.

---

## 4. Cara pasang (langkah untuk sesi berikutnya)

Untuk **tiap** gambar:

```bash
# 1) Hapus background + kecilkan + jadikan WebP transparan
python3 scripts/cutout-bg.py <file-download> public/assets/items/<id>.webp
#    contoh: python3 scripts/cutout-bg.py ~/dog.jpg public/assets/items/dog.webp
#    (butuh: pip install Pillow numpy. Kalau sudah transparan, skrip skip hapus bg.
#     Sesuaikan --tol kalau ada sisa/terlalu banyak terhapus.)
```

Lalu di `src/engine/ui/items.ts`, tambahkan `ext: 'webp'` pada item terkait,
mengikuti pola pinguin:
```ts
penguin: { emoji: '🐧', label: 'pinguin', ext: 'webp' },
dog:     { emoji: '🐶', label: 'anjing',  ext: 'webp' },   // <- tambah ext
// ...dst untuk cat, rabbit, panda, chick, duck, house
```
Hapus file SVG lama yang tergantikan (mis. `dog.svg`) biar rapi — engine tetap
punya fallback emoji otomatis kalau suatu file hilang.

### Verifikasi & deploy
```bash
npm run build          # pastikan lolos
# tes cepat: npm run preview lalu buka /game/hutan-hewan

# Deploy ke web (GitHub Pages). Web disajikan dari branch claude/web-demo-html-wa4dr9,
# folder app/ (base + HashRouter). Lihat bagian "Deploy Web" di CLAUDE.md.
DEPLOY_BASE=/Game-Edukasi-Anak/app/ VITE_USE_HASH_ROUTER=1 npm run build
# salin isi dist/ ke app/ pada branch Pages, commit, push (pakai git worktree).
```

URL live: `https://2013tib-droid.github.io/Game-Edukasi-Anak/app/#/game/hutan-hewan`

---

## 5. Setelah semua hewan siap

Prinsip yang sama berlaku untuk game emoji lain (Hitung Buah, Pasar Buah):
tambahkan id buah ke registry + generate gambarnya dengan base prompt yang sama
(ganti `{ANIMAL}` jadi buah, mis. `red apple with a happy face`).
