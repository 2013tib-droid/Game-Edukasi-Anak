# Progress Pengerjaan

Catatan kemajuan per fase (lihat CLAUDE.md untuk definisi fase).
Diupdate setiap sesi pengerjaan.

## Status Ringkas

| Fase | Status |
|---|---|
| 1 — Fondasi (Vite + React + Firebase, Auth, portal, rules) | ✅ Selesai (menunggu pemilik isi `.env` Firebase) |
| 2 — Engine + 6 template game | ✅ Selesai (maskot berkembang menyusul di Fase 3) |
| 3 — Migrasi Petualangan Pintar | ⬜ Belum |
| 4 — Konten 10–15 game/kelompok | ⬜ Belum |
| 5 — Monetisasi (QRIS gateway, kode referral/aktivasi, device limit) | ⬜ Belum (rencana: `docs/rencana-kode-referral.md`) |
| 6 — Rilis | ⬜ Belum |

## Log

### 2026-07-16 — Fase 2: engine game + 6 template

Selesai:
- [x] `GameShell` (core): alur intro level → main → popup bintang → level
      berikutnya → layar tamat; hitung kesalahan → bintang 1–3
      (0 salah = ⭐⭐⭐, ≤2 = ⭐⭐, sisanya = ⭐).
- [x] 6 template (masing-masing lazy-loaded, 0,4–2,4 kB):
      `tap-answer`, `count-tap` (sesuai aturan pengecoh pemilik: target
      dilebihkan + item pengecoh), `memory`, `drag-drop` (pointer events,
      tanpa library), `tracing` (canvas, deteksi cakupan glyph ≥60%),
      `story` (cerita interaktif dengan pilihan).
- [x] Audio: narasi Bahasa Indonesia via aset TTS (`audioSrc`) dengan
      fallback speechSynthesis id-ID selama aset belum ada; SFX WebAudio
      (benar/salah/menang) tanpa file; tombol 🔊 ulang instruksi di tiap
      soal. Salah selalu dijawab "Coba lagi, kamu pasti bisa!".
- [x] Progres bintang: localStorage (jalan offline/demo) + mirror ke
      `users/{uid}/progress/{gameId}` saat login.
- [x] Config game dimuat dynamic-import per game (`import.meta.glob`) —
      konten premium TIDAK ter-bundle di JS publik.
- [x] Game contoh gratis `latihan-seru` (TK) memakai keenam template —
      sekaligus referensi cara menulis config game untuk Fase 4.
- [x] Uji otomatis Playwright di ukuran layar HP Android: jawab salah →
      feedback positif, jawab benar → lanjut soal, popup 2 bintang setelah
      1 kesalahan, papan hitung berisi 5 apel (diminta 3) + pengecoh,
      progres tersimpan, tanpa error JS.

Belum (bagian Fase 3–4):
- [ ] Maskot yang berkembang (konsep dari Petualangan Pintar) — digarap
      bersama migrasi Fase 3.
- [ ] Aset gambar AI + audio TTS asli (sementara emoji + speechSynthesis).

### 2026-07-16 — Fase 1: fondasi portal

Selesai:
- [x] Scaffold Vite + React (JavaScript, tanpa library berat; deps: react,
      react-router-dom, firebase).
- [x] Struktur folder sesuai CLAUDE.md: `src/app`, `src/auth`, `src/portal`,
      `src/engine`, `src/games/{tk,sd1}`, `src/data`, `functions/`, `scripts/`.
- [x] Routing: beranda (pilih kelompok) → daftar game per kelompok →
      peluncur game (cek akses) → area orang tua → login/daftar → 404.
- [x] Firebase Auth email+password: `AuthContext` (login, register, logout,
      profil user realtime dari `users/{uid}`, helper `hasAccess(group)`).
- [x] **Mode demo tanpa Firebase**: portal tetap jalan sebelum `.env` diisi;
      login/pembelian dinonaktifkan dengan banner pemberitahuan.
- [x] Gerbang orang tua (soal perkalian) melindungi area orang tua + halaman
      login/daftar; lolos disimpan per sesi browser.
- [x] Registry game awal di `src/data/games.json` (grup TK/SD1, harga, flag
      `freeDemo`) — konten placeholder, diisi nyata di Fase 3–4.
- [x] `firestore.rules` ketat: user hanya baca dokumen sendiri; field
      `access` & `referralRedeemed` tidak bisa diubah client (hanya Cloud
      Functions); koleksi kode & purchases tertutup total dari client.
- [x] `firebase.json` (hosting SPA rewrite + rules), `.env.example`.
- [x] UX anak: tombol/target sentuh ≥64px, mobile-first, responsif
      portrait/landscape, tanpa teks kecil.

Catatan penting:
- `index.html` di branch ini sekarang adalah **entry aplikasi Vite**
  (bukan lagi redirect ke `petualangan-pintar.html`). Redirect lama hanya
  relevan di branch GitHub Pages `claude/web-demo-html-wa4dr9` — JANGAN
  merge branch ini ke sana tanpa menyesuaikan.
- `petualangan-pintar.html` tetap utuh di root sebagai sumber migrasi Fase 3.

Belum / menunggu pemilik proyek:
- [ ] Buat project Firebase + aktifkan Auth (Email/Password) + Firestore,
      lalu isi `.env` (salin dari `.env.example`).
- [ ] Upgrade project ke Blaze plan (untuk Cloud Functions, Fase 5).
- [ ] Daftar akun payment gateway (Tripay/Duitku) — untuk Fase 5.
- [ ] Deploy rules: `firebase deploy --only firestore:rules` (butuh
      Firebase CLI login pemilik).

Berikutnya (Fase 2):
- [ ] Core engine: game loop, scene manager, state.
- [ ] 6 template game (tap-jawab, drag&drop, tracing, memory, hitung&ketuk,
      cerita interaktif).
- [ ] Sistem audio narasi TTS + SFX (lazy load).
- [ ] Progres bintang per level + penyimpanan ke `users/{uid}/progress`.
