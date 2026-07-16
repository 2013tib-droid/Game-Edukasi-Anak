# Engine Game

Prinsip: menambah game baru = menulis config + aset, bukan kode baru.

## Struktur

- `core/GameShell.jsx` — orkestrator game: alur level, skor bintang,
  simpan progres, layar intro/menang/tamat.
- `core/progress.js` — bintang per level: localStorage + Firestore
  (`users/{uid}/progress/{gameId}`) saat login.
- `audio/audioManager.js` — narasi (aset TTS via `audioSrc`, fallback
  speechSynthesis id-ID) + SFX WebAudio tanpa file.
- `ui/` — PromptBar (instruksi + tombol 🔊), ProgressBar, FeedbackFlash.
- `templates/` — 6 template, lazy-loaded per game.

## Cara membuat game baru

1. Buat `src/games/<group>/<id>/config.js` yang meng-export default
   `{ levels: [...] }` — contoh lengkap: `src/games/tk/latihan-seru/config.js`.
2. Daftarkan game di `src/data/games.json` dengan `status: "ready"`.
3. Selesai — GameLauncher memuat config secara dynamic import (konten tidak
   ikut bundle publik).

## Kontrak template

Setiap template menerima props:

- `level` — objek level dari config (bentuk `rounds`/`pages`/`pairs`
  tergantung template, lihat komentar di masing-masing file).
- `onCorrect()` — panggil tiap jawaban benar (SFX + flash ditangani shell).
- `onWrong()` — panggil tiap kesalahan (dihitung untuk bintang; feedback
  selalu positif).
- `onComplete()` — panggil saat level selesai.

Template ID: `tap-answer`, `count-tap`, `memory`, `drag-drop`, `tracing`,
`story` (registry: `templates/index.js`).

## Aturan desain soal (WAJIB, dari pemilik)

Soal tidak boleh monoton satu jenis item — selalu campur target dengan
pengecoh, dan untuk soal hitung: jumlah target di papan HARUS melebihi
yang diminta (anak harus berhenti menghitung di angka yang benar).
