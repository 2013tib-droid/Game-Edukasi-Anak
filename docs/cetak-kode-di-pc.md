# Mencetak kode aktivasi di komputer sendiri (Windows)

> **Kenapa tidak lewat tombol Actions lagi?** Repo ini **publik**. Log workflow
> (tersimpan 90 hari) dan artifact (7 hari) di repo publik bisa diunduh **siapa
> saja tanpa login** — jadi tiap batch yang dicetak lewat Actions sama saja
> dibagikan gratis. Itu sudah pernah kejadian (2026-09-23, 100 kode dibatalkan).
> Tombol Actions sekarang aman untuk **`dry_run` saja**.
>
> Kode aktivasi itu **barang jualan**. Jangan pernah menempelkannya ke chat,
> ke issue, ke commit, atau ke mana pun selain file CSV di komputer sendiri.

Semua perintah di bawah dijalankan di **PowerShell**, bukan Git Bash.
Alasannya: Git Bash (MSYS) menerjemahkan nilai yang berbentuk path, jadi
`GOOGLE_APPLICATION_CREDENTIALS=kunci.json` bisa diam-diam berubah jadi
`C:/Program Files/Git/kunci.json` — dan skripnya gagal dengan pesan yang
membingungkan. (Jebakan yang sama dengan `DEPLOY_BASE` di "Deploy Web".)

Buka PowerShell: tombol **Start** → ketik `powershell` → Enter.

---

## Sekali saja (persiapan)

### 1. Pasang Node.js

Cek dulu — mungkin sudah ada:

```powershell
node -v
```

- Muncul angka seperti `v20.11.0` atau lebih tinggi → **lanjut ke langkah 2.**
- Muncul `bukan dikenali sebagai perintah` / `is not recognized` → unduh
  **Node.js LTS** dari <https://nodejs.org> (tombol besar sebelah kiri),
  pasang dengan klik Next sampai selesai, lalu **tutup PowerShell dan buka
  lagi** (PATH baru terbaca setelah jendela baru), lalu `node -v` lagi.

### 2. Ambil salinan repo

**Cek dulu — mungkin sudah ada:**

```powershell
Test-Path $HOME\Documents\Game-Edukasi-Anak
```

- `True` → sudah ada, cukup perbarui:
  ```powershell
  cd $HOME\Documents\Game-Edukasi-Anak
  git checkout main
  git pull
  ```
- `False` → **unduh dulu** (±67 MB; `--depth 1` supaya riwayat commit-nya tidak ikut):
  ```powershell
  cd $HOME\Documents
  git clone --depth 1 https://github.com/2013tib-droid/Game-Edukasi-Anak.git
  ```

**Kalau `git` belum terpasang** (`git : The term 'git' is not recognized`), unduh ZIP-nya saja —
repo ini publik, jadi tidak perlu login:

```powershell
cd $HOME\Documents
Invoke-WebRequest "https://github.com/2013tib-droid/Game-Edukasi-Anak/archive/refs/heads/main.zip" -OutFile repo.zip
Expand-Archive repo.zip -DestinationPath .
Rename-Item Game-Edukasi-Anak-main Game-Edukasi-Anak
Remove-Item repo.zip
```

**Pastikan berhasil** sebelum lanjut — perintah ini harus menjawab `True`:

```powershell
Test-Path $HOME\Documents\Game-Edukasi-Anak\functions\scripts\generate-codes.mjs
```

> Catat path foldernya — semua perintah berikutnya dimulai dari situ.

### 3. Pasang paket yang dibutuhkan skripnya

```powershell
cd $HOME\Documents\Game-Edukasi-Anak\functions
npm ci
```

Perlu beberapa menit sekali ini saja. Kalau `npm ci` mengeluh
`package-lock.json` tidak ada, pakai `npm install`.

### 4. Ambil kunci service account Firebase

Kunci ini yang memberi izin skripnya menulis ke Firestore.

1. Buka <https://console.firebase.google.com> → project **petualangan-pintar**
2. Klik gerigi ⚙️ di kiri atas → **Project settings**
3. Tab **Service accounts**
4. Tombol **Generate new private key** → **Generate key**
5. Browser mengunduh file `.json` bernama panjang
   (`petualangan-pintar-firebase-adminsdk-xxxxx.json`)
6. **Ganti namanya jadi `kunci.json`**, lalu pindahkan ke folder
   `Game-Edukasi-Anak\functions\`

> ⚠️ **File ini kunci admin penuh** — siapa pun yang memilikinya bisa membaca
> dan menulis seluruh Firestore, termasuk semua kode aktivasi. Jangan pernah
> di-commit, jangan dikirim lewat chat, jangan ditaruh di Drive publik.
> Repo sudah diatur mengabaikan nama `kunci*.json` dan `kode*.csv`, jadi
> `git add .` tidak akan menyeretnya ikut — tapi jangan diandalkan sebagai
> satu-satunya penjaga.

---

## Tiap kali mau cetak kode baru

Selalu dari folder `functions`:

```powershell
cd $HOME\Documents\Game-Edukasi-Anak\functions
$env:GOOGLE_APPLICATION_CREDENTIALS = 'kunci.json'
```

**Kalau `cd` menjawab `Cannot find path ... because it does not exist`, BERHENTI** —
repo-nya belum diunduh (persiapan langkah 2). Jangan lanjut mengetik perintah
berikutnya: `$env:` akan berhasil di folder mana pun, lalu `node` gagal dengan
`Cannot find module` dan errornya terlihat seperti masalah lain.

Pastikan sudah di tempat yang benar — harus menjawab `True`:

```powershell
Test-Path scripts\generate-codes.mjs
```

Baris `$env:` itu berlaku **selama jendela PowerShell itu terbuka**. Kalau
jendelanya ditutup, ketik lagi sebelum menjalankan skripnya.

### Langkah 1 — coba dulu tanpa menyimpan

```powershell
node scripts/generate-codes.mjs --group=tk --count=5 --dry-run
```

`--dry-run` memperlihatkan bentuk kodenya **tanpa menulis apa pun ke
Firestore**. Pastikan bentuknya seperti `K7P-M4X` (enam karakter, satu tanda
hubung di tengah).

### Langkah 2 — cetak sungguhan

Playgroup dan TK:

```powershell
node scripts/generate-codes.mjs --group=tk --count=50 --batch=jual-01 --out=kode-tk.csv
```

SD Kelas 1 & 2:

```powershell
node scripts/generate-codes.mjs --group=sd1 --count=50 --batch=jual-01 --out=kode-sd1.csv
```

Arti tiap pilihan:

| Pilihan | Arti |
|---|---|
| `--group=tk` / `--group=sd1` | kelompok yang dibuka kode ini (**wajib**) |
| `--count=50` | berapa kode dibuat (wajib, maksimal 500 sekali jalan) |
| `--batch=jual-01` | penanda batch, untuk pembukuan **dan** untuk membatalkannya nanti kalau bocor. Pakai nama yang berbeda tiap kali cetak. |
| `--out=kode-tk.csv` | file hasilnya |
| `--dry-run` | cuma contoh, tidak menulis ke Firestore |

Skripnya **tidak mencetak kodenya ke layar** — itu disengaja, supaya kode tak
pernah nyangkut di log. Yang muncul cuma jumlahnya.

### Langkah 3 — buka hasilnya

```powershell
ii kode-tk.csv
```

(`ii` = `Invoke-Item`, membuka file dengan program bawaannya — biasanya Excel.)

Isinya tiga kolom: `code`, `group`, `batch`. Kolom `code` itu yang ditempel ke
Lynk.id / Mayar.id sebagai "produk digital".

### Langkah 4 — simpan CSV-nya baik-baik

- Pindahkan ke folder arsip sendiri (bukan di dalam folder repo, biar tidak
  pernah ikut ter-commit karena salah pengaturan di kemudian hari).
- **Ini satu-satunya salinan kodenya.** Firestore menyimpan kodenya juga, tapi
  tidak ada cara mengeluarkannya lagi jadi CSV lewat skrip ini.
- File `kunci.json` boleh dibiarkan di tempatnya untuk pencetakan berikutnya.
  Kalau komputernya dipakai orang lain, hapus saja — tinggal ambil kunci baru
  dari Console kapan-kapan (langkah 4 persiapan).

---

## Kalau ada batch yang bocor

Misalnya CSV-nya terlanjur terkirim ke grup yang salah:

```powershell
cd $HOME\Documents\Game-Edukasi-Anak\functions
$env:GOOGLE_APPLICATION_CREDENTIALS = 'kunci.json'
node scripts/revoke-codes.mjs --batch=jual-01 --dry-run
node scripts/revoke-codes.mjs --batch=jual-01
```

Jalankan `--dry-run` dulu untuk melihat berapa yang akan kena.

Kode yang **sudah ditukar pembeli tidak disentuh** — pembeli yang sudah bayar
tidak kehilangan apa pun. Sisanya ditandai terpakai (bukan dihapus: dokumen
yang dihapus bisa dibuat ulang generator dengan kode acak yang sama persis,
dan itu justru menghidupkan kembali kode yang sudah beredar).

---

## Kalau ada pesan error

| Pesan | Artinya |
|---|---|
| `node : The term 'node' is not recognized` | Node.js belum terpasang, atau PowerShell belum dibuka ulang sesudah memasangnya (persiapan langkah 1) |
| `cd : Cannot find path ...` | Repo-nya belum diunduh — kerjakan persiapan langkah 2 dulu |
| `Cannot find module '...generate-codes.mjs'` | PowerShell-nya tidak sedang di folder `functions`. Cek dengan `Test-Path scripts\generate-codes.mjs` |
| `Cannot find module 'firebase-admin'` | `npm ci` belum dijalankan di folder `functions` (persiapan langkah 3) |
| `Could not load the default credentials` | `$env:GOOGLE_APPLICATION_CREDENTIALS` belum diketik di jendela itu, atau `kunci.json` tidak ada di folder `functions` |
| `--group harus salah satu dari: tk, sd1` | `--group=tk` atau `--group=sd1` kelewat atau salah ketik |
| `PERMISSION_DENIED` | kunci yang dipakai dari project lain, atau sudah dicabut di Console — ambil kunci baru |
