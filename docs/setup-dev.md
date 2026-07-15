# Menjalankan & Menguji Portal (Fase 1)

## Menjalankan secara lokal

```bash
npm install
npm run dev        # buka http://localhost:5173
```

Portal langsung jalan **tanpa** Firebase: semua halaman tampil, game demo
(`petualangan-pintar.html`) bisa dimainkan. Login/daftar baru aktif setelah
Firebase dikonfigurasi.

## Menghubungkan Firebase

1. Buat project di https://console.firebase.google.com (aktifkan **Authentication
   → Email/Password** dan **Firestore**).
2. Salin `.env.example` menjadi `.env`, isi nilainya dari Project Settings →
   General → Your apps (Web app).
3. Jalankan ulang `npm run dev` — login, daftar, dan area orang tua kini
   tersambung ke Firebase.
4. Deploy rules: `npx firebase-tools deploy --only firestore:rules`.

## Checklist uji manual Fase 1

- [ ] Beranda menampilkan 2 kartu kelompok (TK, SD 1–2).
- [ ] Halaman kelompok TK: "Petualangan Pintar" berbadge **Level 1 GRATIS** dan
      tombol Main membuka game; game lain tampil tergembok.
- [ ] Tombol "Orang Tua" memunculkan gerbang perkalian; jawaban salah ditolak,
      benar → area orang tua terbuka.
- [ ] Daftar akun baru → masuk → keluar → masuk lagi (butuh `.env` terisi).
- [ ] Halaman aktivasi menerima input kode dan menampilkan catatan Fase 5.
- [ ] Semua halaman nyaman dipakai di layar HP (DevTools mode mobile, portrait
      dan landscape).

## Build & deploy

```bash
npm run build      # hasil di dist/
npm run preview    # tes hasil build di http://localhost:4173
npx firebase-tools deploy --only hosting   # rilis resmi (Fase 6)
```

Catatan: situs GitHub Pages (`claude/web-demo-html-wa4dr9`) tetap menyajikan
`petualangan-pintar.html` standalone dan TIDAK terpengaruh oleh portal ini.
Portal React akan dirilis lewat **Firebase Hosting** pada Fase 6.
