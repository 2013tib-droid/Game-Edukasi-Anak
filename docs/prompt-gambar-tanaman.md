# Prompt Gambar — Tanaman Kebun Ilmu (`tap-picture` figur `tanaman`)

Sasaran: **`public/assets/plant/tanaman.webp`** — satu gambar, menggantikan SVG buatan engine
di `src/engine/ui/Plant.tsx` (keluhan pemilik 2026-10-12: *"kurang profesional"*).

Dipakai di soal SENTUH tanaman Kebun Ilmu (`sd2`): "Mana yang menyimpan biji?", "Sentuh
akarnya!", dst. Anak menyentuh BAGIAN tanaman di gambar, jadi **letak tiap bagian di
gambar itu mengikat** — bukan cuma soal cantik.

## Status (2026-10-12) — SELESAI

Gambar percobaan pertama langsung dipasang (629×900, 81 kB). Titik sentuh sudah diukur ulang.

## Aturan yang tidak boleh dilanggar (kenapa prompt-nya kaku)

1. **Rasio 4:5 tegak (≈ 0,78)** — sama dengan kotak gambar di HP terkecil (100×128 satuan).
2. **Lima bagian WAJIB terpisah jelas**, tidak saling tumpuk: bunga, dua daun, batang, buah,
   akar. Daerah sentuh tiap bagian = setengah jarak ke bagian terdekat; kalau bunga menempel
   ke daun, daerah sentuhnya menciut di bawah 60 px dan `check-body-parts.mjs` menolaknya.
3. **Tata letak mengikuti tabel di bawah.** Kalau gambarnya meleset sedikit tidak apa —
   titik sentuhnya diukur ulang SEKALI (pola gambar anak 2026-09-08) — tapi susunannya
   (bunga atas-tengah, daun kiri lebih rendah, buah kanan bawah, akar di bawah tanah) harus sama.
4. **Pojok kanan atas KOSONG** — di situ isyarat benda (wortel/apel) ditempel engine.
5. **Batang harus terlihat polos** di antara daun terbawah dan tanah (titik sentuh "batang").
6. **Tanpa tulisan, tanpa label, tanpa panah, tanpa pot.** Nama bagian ditulis app sesudah benar.
7. **Satu buah saja**, merah, menggantung — kalau dua, anak bingung yang mana.

| Bagian | Posisi kira-kira (dari kiri, dari atas) |
|---|---|
| Bunga (mekar, menghadap depan) | 50%, 13% |
| Daun kiri | 23%, 41% |
| Daun kanan | 76%, 45% |
| Batang polos | 50%, 62% |
| Buah tomat | 74%, 65% |
| Garis tanah | 70% dari atas |
| Akar (menyebar) | 46%, 86% |

## PROMPT (tempel ke Gemini / ChatGPT)

```
A professional children's educational book illustration of a single tomato plant, shown
as a clean science diagram for elementary school kids. Vertical 4:5 composition, plain
pure white background.

Layout (very important, keep exactly):
- The plant stands in the center. The bottom 30% of the image is a neat cross-section of
  rich brown garden soil with a thin strip of green grass on top, cut as a clean rectangle
  with softly rounded bottom corners, so the roots are clearly visible underground.
- Roots: a clear, well-spread fibrous root system in light cream color, centered under the
  stem, filling the soil section but not touching its edges.
- Stem: one sturdy green stem rising straight up from the middle of the soil. A plain,
  clearly visible section of bare stem between the lowest leaf and the ground.
- Leaves: exactly two large, healthy green leaves with visible veins — one on the LEFT at
  about 40% height, one on the RIGHT slightly lower at about 45% height. Leaves spread
  outward, clearly separated from the flower, the fruit and each other.
- Flower: one single open pink flower with a yellow center at the very top of the stem,
  facing the viewer, about 13% from the top, centered.
- Fruit: one single round red tomato with a small green calyx, hanging on a short side
  branch on the RIGHT side, at about 65% height, just above the soil, clearly separated
  from the right leaf.
- Keep the TOP-RIGHT corner of the image completely empty white.

Style: polished modern flat vector illustration with soft gradients and gentle shading,
crisp clean edges, subtle highlights, harmonious natural colors (fresh greens, warm brown
soil, soft pink, tomato red), like a premium kids' science textbook or educational app.
Friendly and clear, not cartoonish-silly, no face on the plant.

No text, no labels, no arrows, no numbers, no pot, no extra flowers, no extra fruits,
no insects, no sun, no background scenery, no shadow on the floor, no border, no watermark.
```

**Cadangan kalau hasil pertama kurang rapi:** tambahkan di akhir
`"Every part must be clearly separated with white space between them, like a labeled diagram without labels."`

## Sesudah gambarnya datang

1. Potong: latar putih polos → `python3 scripts/cut-item.py <gambar> public/assets/plant/tanaman.webp`
   (tempel hasilnya di atas warna gelap dulu; tanah persegi itu bagian gambar, harus utuh).
2. `PlantArt` di `Plant.tsx` diganti `<image>` berkas itu, lalu `PLANT_PARTS` diukur ulang
   dari gambarnya (kisi bersatuan viewBox di atas gambar + render ulang lingkaran sentuhnya).
3. `node scripts/check-body-parts.mjs` harus lulus (daerah sentuh terkecil ≥ 60 px di HP 320).
4. Nol kalimat narasi berubah → nol render Azure.
