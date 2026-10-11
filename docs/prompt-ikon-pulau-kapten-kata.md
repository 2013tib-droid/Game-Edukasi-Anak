# Prompt Ikon Pulau — Kapten Kata (peta laut)

Sasaran: `Stage.art` → berkas `public/assets/islands/<nama>.webp`, satu per pulau.
Ikonnya duduk di TENGAH pulau di peta laut (tampil ±52 px, di atas rumput hijau),
jadi yang dibutuhkan **benda kecil yang langsung terbaca**, bukan adegan.

## Status (2026-10-11)

Sambil menunggu seni ini, enam pulau memakai seni item yang SUDAH ada (`Stage.item`):
Satwa = harimau · Rasa = semangka · Warna = kuas · Barangku = tas · Profesi = koki ·
Kota = bus. **Angka & Aksi masih emoji** (🔢 🏃) — tidak ada seni yang cocok, jadi dua
ini yang paling perlu digambar duluan.

Begitu satu gambar datang: potong (lihat bawah), taruh di `public/assets/islands/`,
lalu tambahkan `art: '<nama>'` di pulau itu di `src/games/sd2/kapten-kata.ts`. `art`
menang atas `item`; `item` & `emoji` tetap cadangan. **Jangan isi `art` sebelum
berkasnya ada** (404 di console).

## Blok gaya (tempel di AWAL tiap prompt)

```
Ikon game anak 3D lembut gaya mainan vinyl, warna cerah tapi lembut, sudut membulat,
garis luar tipis gelap, bayangan halus di bawah. SATU benda saja di tengah, menghadap
depan, tanpa latar (latar putih polos), tanpa tulisan, tanpa huruf, tanpa angka
kecuali yang diminta. Benda berwajah imut kecil (mata bulat, senyum) kalau disebut.
Proporsi gemuk, siluet jelas walau dilihat sangat kecil. Rasio 1:1.
```

## Prompt per pulau

| Berkas | Pulau | Prompt (sesudah blok gaya) |
|---|---|---|
| `satwa.webp` | Satwa | Kepala harimau kecil yang ramah, tersenyum, telinga bulat, belang oranye-hitam lembut. Hanya kepala, bukan badan. |
| `rasa.webp` | Rasa | Satu potong semangka segitiga berwajah imut, kulit hijau, daging merah, biji hitam kecil. |
| `warna.webp` | Warna | Palet cat kayu berbentuk kacang dengan lima tetes cat: merah, kuning, biru, hijau, ungu, dan satu kuas kecil bersandar. Palet berwajah imut. |
| `angka.webp` | Angka | Tiga balok mainan kayu bertumpuk seperti piramida kecil, tiap balok satu angka besar timbul: 1 di kiri bawah, 2 di kanan bawah, 3 di atas. Warna balok merah, biru, kuning. Angkanya putih tebal dan jelas. |
| `barangku.webp` | Barangku | Tas sekolah ransel biru muda berwajah imut, satu pensil kuning menyembul dari kantong depan. |
| `profesi.webp` | Profesi | Topi koki putih tinggi bertumpuk di atas helm kuning pekerja, dua topi saja, tanpa orang. |
| `aksi.webp` | Aksi | Sepasang sepatu lari oranye-putih berwajah imut, sedikit miring seperti sedang melompat, dengan tiga garis gerak lengkung di belakangnya. Tanpa orang. |
| `kota.webp` | Kota | Dua gedung kota kecil berdempetan (satu tinggi biru, satu pendek kuning berjendela), bus merah mungil di depannya. Berwajah imut di gedung tinggi. |

### Kenapa begini
- **Satu benda, siluet gemuk**: di 52 px dan diredupkan saat terkunci, detail kecil hilang.
- **Profesi tanpa orang**: wajah orang di 52 px terbaca sama semua; topi kerja langsung
  terbaca "pekerjaan". Aksi juga tanpa orang karena alasan yang sama.
- **Angka sengaja bertulisan 1-2-3** (satu-satunya yang boleh berangka): itu isinya.
  Cek salah tulis khas AI — angka terbalik atau "4" muncul — sebelum dipakai.
- **Jangan anjing** (aturan proyek), dan hewan di pulau Satwa memang harimau.

## Memotong

Latar putih polos → `python3 scripts/cut-item.py <gambar> public/assets/islands/<nama>.webp 256`.
Latar sudah transparan → `scripts/trim-alpha.py`. Lubang tertutup di dalam benda
(gagang palet, lingkaran tali tas) harus ditembus manual — lihat `--list-holes` /
`--hole` di `scripts/cut-gradient.py`. Selalu tempel hasilnya di atas biru tua dulu.
