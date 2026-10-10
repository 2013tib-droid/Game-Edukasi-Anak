# Alur Deploy: Development dulu, baru Produksi

> Keputusan pemilik 2026-10-07: **setiap fitur/game baru WAJIB lewat jalur development dulu**,
> dicek di HP, baru dibawa ke produksi. Ikuti dokumen ini untuk semua tambahan fitur berikutnya.

## Dua jalur

| | Development | Produksi |
|---|---|---|
| Tombol | Actions → **"Deploy development"** (`.github/workflows/deploy-dev.yml`) | Actions → **"Deploy web"** (`.github/workflows/deploy-web.yml`) |
| Alamat | `https://2013tib-droid.github.io/Game-Edukasi-Anak/development/<nama>/` | `https://petualanganpintar.com` |
| Siapa yang buka | Pemilik / penguji saja | Pembeli |
| Jenis build | Build PENGUJI: **semua game TERBUKA (mode `'buka'`, tanpa gembok)**, saklar 🔓/🔒 hidup, kelompok `draft` (sd2, sd3) tampil, HashRouter, `noindex` | Build RILIS: **mode `'kunci'` (gembok menyala)**, saklar mati total, kelompok `draft` tersembunyi |
| Firebase | Project produksi yang SAMA (akun, kode, bintang = data sungguhan) | Project produksi |
| Boleh dijalankan Claude? | Ya — tidak menyentuh situs pembeli | **Hanya sesudah pemilik bilang "deploy"** (dry run dulu) |

Daftar semua versi development yang sedang hidup: `https://2013tib-droid.github.io/Game-Edukasi-Anak/development/`

## Langkah untuk SETIAP fitur baru

1. **Kerjakan di branch pendek dari `main`** (`claude/<fitur>`), seperti biasa (lihat "Branch & Alur Kerja" di CLAUDE.md).
2. **Uji di sesi** (typecheck, build, headless) seperti biasa.
3. **Deploy ke development dulu** — Actions → "Deploy development" → Run workflow:
   - `ref` = branch fiturnya (mis. `claude/lompat-katak`) — fitur BELUM perlu masuk `main`.
   - `nama` = boleh dikosongkan (diambil dari nama branch, awalan `claude/` dibuang) atau diisi nama pendek (mis. `sd2`).
   - Claude boleh menjalankannya sendiri lewat `actions_run_trigger` (`workflow_id: deploy-dev.yml`, `ref: main`, `inputs: { ref, nama }`).
4. **Kirim link ke pemilik** untuk dicek di HP. Bentuk link:
   - Beranda: `…/development/<nama>/#/portal?test=1`
   - Kelompok tertentu: `…/development/<nama>/#/kelompok/<id>?test=1` (mis. `sd2`)
   - Game tertentu: `…/development/<nama>/#/game/<id>?test=1`
   - Semua game sudah TERBUKA tanpa menekan apa pun (lihat "Development TIDAK BOLEH bergembok" di bawah).
     `?test=1` memunculkan tombol 🔓/🔒 kalau ingin mencoba tampilan terkunci.
   - Halaman butuh ±1–2 menit sesudah workflow hijau; minta pemilik muat ulang kalau masih versi lama.
5. **Pemilik menyetujui** → merge PR ke `main`.
6. **Produksi**: hanya kalau pemilik minta deploy — Actions → "Deploy web" dengan `dry_run: true` dulu, lalu `false`.
7. **Bersihkan** subfolder development yang sudah tak dipakai: "Deploy development" dengan `hapus: true` + `nama` yang sama. (`development/main/` boleh dibiarkan sebagai pratinjau `main` terbaru — jalankan ulang dengan `ref: main` tiap kali `main` berubah.)

## Development TIDAK BOLEH bergembok (keputusan pemilik 2026-10-10)

> *"https://…/development/main/#/portal jangan digembok. Ada beberapa sesi baru pas deploy, jadi ke gembok.
> Gembok diterapkan kalo sudah mau deploy ke production (petualanganpintar.com)."*

- Build development dibangun dengan **`VITE_LOCK_MODE: buka`** di `deploy-dev.yml`. Dulu `kunci`, jadi tiap HP/browser
  yang baru membuka link development (belum pernah menekan 🔓) melihat game bergembok — terutama game baru `sd2`
  yang justru sedang mau dicek.
- **Gembok hanya untuk produksi.** Build "Deploy web" tidak memasang `VITE_LOCK_MODE`, jadi jatuh ke
  `DEFAULT_LOCK_MODE = 'kunci'` di `src/data/access.ts`. **Jangan ubah baris itu** dan jangan pasang `buka` di `deploy-web.yml`.
- Saklar 🔓/🔒 tetap ada di development untuk mencoba tampilan terkunci. Pilihan itu tersimpan per HP di localStorage
  (`pp_lock_mode_v1`) dan MENANG atas bawaan — kalau di HP itu pernah ditekan 🔒, tekan 🔓 sekali untuk kembali terbuka.
- Perubahan ini baru berlaku sesudah "Deploy development" dijalankan ulang (build lama tetap bergembok).

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
