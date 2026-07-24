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
| elephant | gajah | 🐘 | ✅ diterima | `public/assets/items/elephant.webp` |
| lion | singa | 🦁 | ✅ diterima | `public/assets/items/lion.webp` |
| dog | anjing | 🐶 | ⏳ placeholder SVG | `dog.svg` |
| cat | kucing | 🐱 | ⏳ placeholder SVG | `cat.svg` |
| rabbit | kelinci | 🐰 | ⏳ placeholder SVG | `rabbit.svg` |
| panda | panda | 🐼 | ⏳ placeholder SVG | `panda.svg` |
| penguin | pinguin | 🐧 | ⏳ placeholder SVG | `penguin.svg` |
| chick | anak ayam | 🐥 | ⏳ placeholder SVG | `chick.svg` |
| duck | bebek | 🦆 | ⏳ placeholder SVG | `duck.svg` |

> "⏳ placeholder SVG" = flat art sementara dari Fase 3; akan diganti art kartun
> premium bergaya sama begitu pemilik mengirim ("sisa hewannya menyusul").

## Prompt per Hewan

Template prompt (isi `<HEWAN>`):

> Cute kawaii cartoon `<HEWAN>` for a children's educational game, full body,
> facing forward / three-quarter view, big friendly eyes, rosy cheeks, thick
> black outline, flat colors with soft minimal shading, plain white background,
> centered, high resolution, sticker style.

| id | Catatan prompt spesifik |
|---|---|
| elephant | badan abu-abu kebiruan, telinga besar merah muda di dalam, melambai. **✅ sesuai referensi.** |
| lion | surai coklat, tubuh emas, ekspresi ceria/mengaum ramah. **✅ sesuai referensi.** |
| dog | anak anjing, telinga jatuh, lidah kecil |
| cat | anak kucing, telinga runcing |
| rabbit | kelinci, telinga panjang tegak |
| panda | panda, hitam-putih, mata besar |
| penguin | pinguin, perut putih |
| chick | anak ayam kuning, paruh oranye |
| duck | bebek kuning, paruh oranye lebar |

Saat menambah hewan baru di luar daftar ini, ikuti gaya target di atas dan
daftarkan idnya di `items.ts` sebelum dipakai di config game.
