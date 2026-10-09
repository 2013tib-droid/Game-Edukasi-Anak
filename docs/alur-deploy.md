# Alur Deploy: Development dulu, baru Produksi

> Keputusan pemilik 2026-10-07: **setiap fitur/game baru WAJIB lewat jalur development dulu**,
> dicek di HP, baru dibawa ke produksi. Ikuti dokumen ini untuk semua tambahan fitur berikutnya.

## Dua jalur

| | Development | Produksi |
|---|---|---|
| Tombol | Actions → **"Deploy development"** (`.github/workflows/deploy-dev.yml`) | Actions → **"Deploy web"** (`.github/workflows/deploy-web.yml`) |
| Alamat | `https://2013tib-droid.github.io/Game-Edukasi-Anak/development/<nama>/` | `https://petualanganpintar.com` |
| Siapa yang buka | Pemilik / penguji saja | Pembeli |
| Jenis build | Build PENGUJI: saklar 🔓/🔒 hidup, kelompok `draft` (sd2, sd3) tampil, HashRouter, `noindex` | Build RILIS: saklar mati total, kelompok `draft` tersembunyi |
| Firebase | Project produksi yang SAMA (akun, kode, bintang = data sungguhan) | Project produksi |
| Boleh dijalankan Claude? | Ya — tidak menyentuh situs pembeli | **Hanya sesudah pemilik bilang "deploy"** (dry run dulu) |

Daftar semua versi development yang sedang hidup: `https://2013tib-droid.github.io/Game-Edukasi-Anak/development/`

## SATU ALAMAT SAJA: `/development/main/` (keputusan pemilik 2026-10-09)

> *"Semua di main aja… biar ga bingung kalo ada update game."*

- **Setiap** "Deploy development" memakai **`nama: main`**, apa pun `ref`-nya. Pemilik cukup membuka satu link:
  `https://2013tib-droid.github.io/Game-Edukasi-Anak/development/main/`
- Fitur yang belum di-merge tetap di-deploy dari branch-nya (`ref: claude/<fitur>`) **ke folder `main`** — jadi isi
  `/development/main/` = versi TERBARU yang sedang dicek, bisa lebih maju dari branch `main`. Itu disengaja.
- **JEBAKAN: dua branch fitur yang belum di-merge saling menimpa** di folder yang sama. Deploy branch B sesudah
  branch A = game dari A hilang dari link itu. Kalau dua fitur sedang dicek bersamaan, gabungkan dulu ke satu branch,
  atau merge yang sudah disetujui ke `main` lalu cabangkan yang berikutnya dari `main` terbaru.
- Sesudah merge ke `main`, deploy ulang `ref: main` ke `nama: main` supaya isinya kembali = `main`.
- Subfolder lain (`/development/<nama>/`) tidak dipakai lagi; yang lama boleh dihapus dengan `hapus: true`.

## Langkah untuk SETIAP fitur baru

1. **Kerjakan di branch pendek dari `main`** (`claude/<fitur>`), seperti biasa (lihat "Branch & Alur Kerja" di CLAUDE.md).
2. **Uji di sesi** (typecheck, build, headless) seperti biasa.
3. **Deploy ke development dulu** — Actions → "Deploy development" → Run workflow:
   - `ref` = branch fiturnya (mis. `claude/lompat-katak`) — fitur BELUM perlu masuk `main`.
   - `nama` = **selalu `main`** (keputusan pemilik 2026-10-09, lihat di atas).
   - Claude boleh menjalankannya sendiri lewat `actions_run_trigger` (`workflow_id: deploy-dev.yml`, `ref: main`, `inputs: { ref, nama }`).
4. **Kirim link ke pemilik** untuk dicek di HP. Bentuk link:
   - Beranda: `…/development/<nama>/#/portal?test=1`
   - Kelompok tertentu: `…/development/<nama>/#/kelompok/<id>?test=1` (mis. `sd2`)
   - Game tertentu: `…/development/<nama>/#/game/<id>?test=1`
   - `?test=1` memunculkan tombol 🔓/🔒; tekan 🔓 supaya semua game terbuka tanpa beli.
   - Halaman butuh ±1–2 menit sesudah workflow hijau; minta pemilik muat ulang kalau masih versi lama.
5. **Pemilik menyetujui** → merge PR ke `main`.
6. **Produksi**: hanya kalau pemilik minta deploy — Actions → "Deploy web" dengan `dry_run: true` dulu, lalu `false`.
7. **Bersihkan** subfolder development yang sudah tak dipakai: "Deploy development" dengan `hapus: true` + `nama` yang sama. (`development/main/` boleh dibiarkan sebagai pratinjau `main` terbaru — jalankan ulang dengan `ref: main` tiap kali `main` berubah.)

## Pengganti build `uji-*` lama

Build penguji manual ke folder `uji-<nama>/` (salin `dist/` sendiri ke branch Pages) **tidak dipakai lagi** —
gunakan "Deploy development". `guardTesterBuild` masih menerima base `/uji-…/` hanya supaya build lama tidak rusak.

## Penjaga yang membuat dua jalur tak bisa tertukar

- `guardTesterBuild()` (`vite.config.ts`): build penguji hanya boleh berbase `/uji-…/` atau `/development/<nama>/`.
- `scripts/check-release-build.mjs`: menolak build ber-base `/development/` atau `/uji-` dan build yang memuat `pp_test_mode_v1`.
  Workflow "Deploy web" menjalankannya; workflow "Deploy development" justru GAGAL kalau pemeriksa ini meloloskan build dev.
- Akibatnya: build development yang tersalin ke produksi akan **rusak (aset 404)**, bukan membuka semua game gratis.

## Hal yang perlu diingat

- Halaman development **PUBLIK**: siapa pun yang tahu URL-nya bisa membuka semua game lewat 🔓. Jangan sebarkan ke pembeli.
- Login/aktivasi di development memakai data **sungguhan** — jangan menukar kode aktivasi jualan di sana untuk coba-coba.
- Domain `2013tib-droid.github.io` harus ada di Firebase → Authentication → **Authorized domains** supaya "Masuk dengan Google" jalan di development.
- Sesi Claude tidak bisa membuka `github.io` (403); verifikasi dari sesi = workflow hijau + berkasnya ada di branch Pages
  (`claude/web-demo-html-wa4dr9`, folder `development/<nama>/`). Konfirmasi tampilan tetap di HP pemilik.
- Riwayat: jalur ini dibuat di PR #97 (2026-10-06); run pertama "Deploy development" #1 sukses 2026-10-07 (`development/main/`).
